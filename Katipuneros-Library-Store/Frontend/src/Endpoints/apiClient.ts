// [Layer: Endpoints]
// apiClient.ts -- Global HTTP client infrastructure communicating with .NET 10 Web API.
// Manages baseUrl, JSON serializations, authorization headers, and ApiResponse envelope unwrapping.
// DO NOT put UI rendering, business rules, or component state here.

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

const isLocalHostName = (host: string): boolean =>
  host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local');

const isLocalUrl = (url: string): boolean =>
  url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0');

const normalizeApiUrl = (raw: string): string => {
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed.replace(/\/api$/i, '/api');
};

export const getApiBaseUrl = (): string => {
  const isBrowser = typeof window !== 'undefined' && Boolean(window.location?.hostname);
  const host = isBrowser ? window.location.hostname : '';
  const isLocalHost = isLocalHostName(host);

  const envCandidates = [
    import.meta.env?.VITE_API_URL as string | undefined,
    import.meta.env?.VITE_API_BASE_URL as string | undefined,
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map(normalizeApiUrl);

  if (isBrowser && isLocalHost) {
    const localCandidate = envCandidates.find(isLocalUrl);
    if (localCandidate) {
      return localCandidate;
    }
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${host}:5000/api`;
  }

  if (isBrowser && !isLocalHost) {
    const cloudCandidate = envCandidates.find((url) => !isLocalUrl(url));
    if (cloudCandidate) {
      return cloudCandidate;
    }
    return 'https://katipuneros-backend.onrender.com/api';
  }

  if (envCandidates.length > 0) {
    return envCandidates[0];
  }

  return 'https://katipuneros-backend.onrender.com/api';
};

export const API_BASE_URL: string = getApiBaseUrl();

export const AUTH_TOKEN_KEY = 'katipuneros_token';
export const USER_INFO_KEY = 'katipuneros_user';

export const getPortSuffix = (): string => {
  if (typeof window !== 'undefined' && window.location?.port) {
    return `_${window.location.port}`;
  }
  return '';
};

export const getAuthTokenKey = (): string => `katipuneros_token${getPortSuffix()}`;
export const getUserInfoKey = (): string => `katipuneros_user${getPortSuffix()}`;
export const getStoredUserKey = (): string => `katipuneros_user_data${getPortSuffix()}`;

export const isTokenValid = (token: string | null | undefined): boolean => {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload) as { exp?: number };
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false; // Token is expired
    }
    return true;
  } catch {
    // Malformed token
    return false;
  }
};

export const getAuthToken = (): string | null => {
  try {
    const partitioned = localStorage.getItem(getAuthTokenKey());
    if (partitioned) return partitioned;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(getAuthTokenKey(), token);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // Ignore storage exceptions
  }
};

export const clearAuthSession = (): void => {
  try {
    localStorage.removeItem(getAuthTokenKey());
    localStorage.removeItem(getUserInfoKey());
    localStorage.removeItem(getStoredUserKey());
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    localStorage.removeItem('katipuneros_user_data');
  } catch {
    // Ignore storage exceptions
  }
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.toLowerCase().startsWith('/api/')
    ? path.slice(4)
    : path.startsWith('/')
      ? path
      : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const authHeader = headers['Authorization'] ?? headers['authorization'] ?? '';
  const sentBearerAuth = authHeader.toLowerCase().startsWith('bearer ');
  const lowerPath = normalizedPath.toLowerCase();
  const isAuthEndpoint = lowerPath.startsWith('/auth/login') || lowerPath.startsWith('/auth/register');

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const text = await response.text();
    let json: ApiResponse<T>;

    try {
      const parsed = JSON.parse(text);
      if (parsed !== null && typeof parsed === 'object' && ('data' in parsed || 'success' in parsed || 'error' in parsed)) {
        json = parsed as ApiResponse<T>;
        if (!json.message && (parsed.error || parsed.details?.[0] || parsed.errors?.[0])) {
          json.message = parsed.error || parsed.details?.[0] || parsed.errors?.[0];
        }
      } else {
        json = {
          success: response.ok,
          message: response.statusText || 'Success',
          data: parsed as T,
        };
      }
    } catch {
      json = {
        success: response.ok,
        message: response.statusText || 'Server error',
        data: null as unknown as T,
        errors: [text || 'Unrecognized response format from server.'],
      };
    }

    if (!response.ok) {
      json.success = false;
      if (response.status === 401 && sentBearerAuth && !isAuthEndpoint) {
        clearAuthSession();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('katipuneros-auth-changed', { detail: null }));
        }
      }
      if (response.status === 429) {
        json.message = json.message || 'Rate limit exceeded (HTTP 429). Please wait 60 seconds before retrying.';
      }
    }

    return json;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network connection failed';
    return {
      success: false,
      message: 'Unable to communicate with the Katipuneros Library server. Please verify your connection or ensure backend is running.',
      data: null as unknown as T,
      errors: [message],
    };
  }
};

const parseFilenameFromDisposition = (disposition: string | null, fallbackFilename: string): string => {
  if (!disposition) return fallbackFilename;
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;\n]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }
  const asciiMatch = disposition.match(/filename="?([^";\n]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1].trim();
  }
  return fallbackFilename;
};

export const downloadAuthenticatedFile = async (url: string, fallbackFilename: string): Promise<void> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearAuthSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('katipuneros-auth-changed', { detail: null }));
      }
    }
    throw new Error(`Failed to download file (HTTP ${response.status}).`);
  }

  const filename = parseFilenameFromDisposition(response.headers.get('Content-Disposition'), fallbackFilename);
  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);

  try {
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    window.URL.revokeObjectURL(objectUrl);
  }
};
