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

export const getApiBaseUrl = (): string => {
  const isBrowser = typeof window !== 'undefined' && Boolean(window.location?.hostname);
  const host = isBrowser ? window.location.hostname : '';
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local');

  const envUrl = (import.meta.env?.VITE_API_BASE_URL as string | undefined) ??
                 (import.meta.env?.VITE_API_URL as string | undefined);

  if (envUrl && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    const envIsLocal = trimmed.includes('localhost') || trimmed.includes('127.0.0.1') || trimmed.includes('0.0.0.0');
    // If running in local browser, prioritize local backend if envUrl points to local, or fallback to port 5000
    if (isBrowser && isLocalHost) {
      if (envIsLocal) {
        return trimmed;
      }
      const protocol = window.location.protocol || 'http:';
      return `${protocol}//${host}:5000/api`;
    }

    // If in a remote/cloud browser session, never let a localhost envUrl override the live backend
    if (!isBrowser || !envIsLocal) {
      return trimmed;
    }
  }

  // Cloud browser runtime (e.g. *.onrender.com, *.vercel.app, custom domains)
  if (isBrowser && !isLocalHost) {
    return 'https://katipuneros-backend.onrender.com/api';
  }

  // Local development runtime
  if (isBrowser && isLocalHost) {
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${host}:5000/api`;
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
  const normalizedPath = path.startsWith('/api/')
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

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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
