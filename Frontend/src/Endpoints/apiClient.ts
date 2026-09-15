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

export const API_BASE_URL: string =
  (import.meta.env?.VITE_API_URL as string | undefined) ?? 'http://localhost:5000/api';

export const AUTH_TOKEN_KEY = 'katipuneros_token';
export const USER_INFO_KEY = 'katipuneros_user';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // Ignore storage exceptions
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  } catch {
    // Ignore storage exceptions
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
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
    });

    const text = await response.text();
    let json: ApiResponse<T>;

    try {
      json = JSON.parse(text);
    } catch {
      json = {
        success: response.ok,
        message: response.statusText || 'Server error',
        data: null as unknown as T,
        errors: [text || 'Unrecognized response format from server.'],
      };
    }

    if (!response.ok && json.success) {
      json.success = false;
    }

    return json;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network connection failed';
    return {
      success: false,
      message: 'Failed to communicate with Katipuneros Library Backend API.',
      data: null as unknown as T,
      errors: [message],
    };
  }
}
