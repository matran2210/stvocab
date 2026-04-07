import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
  type AuthSessionData,
} from '../utils/auth';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: unknown
  ) {
    super(message);
  }
}

type ApiClientOptions = RequestInit & {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const fallbackMessage =
      typeof data === 'object' && data !== null && 'message' in data
        ? String(data.message)
        : 'Yeu cau that bai';

    throw new ApiError(fallbackMessage, response.status, data);
  }

  return data as T;
}

async function requestJson<T>(
  endpoint: string,
  options: ApiClientOptions = {},
  attemptRefresh = true
): Promise<T> {
  const { auth = true, retryOnUnauthorized = true, headers, body, ...restOptions } = options;
  const accessToken = auth ? getAccessToken() : null;
  const finalHeaders = new Headers(headers);

  if (!(body instanceof FormData) && body !== undefined && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (auth && accessToken) {
    finalHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...restOptions,
    body,
    headers: finalHeaders,
  });

  if (response.status === 401 && auth && retryOnUnauthorized && attemptRefresh) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return requestJson<T>(endpoint, options, false);
    }
  }

  return parseResponse<T>(response);
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuthSession();
        return false;
      }

      try {
        const session = await requestJson<AuthSessionData>(
          '/auth/user/refresh',
          {
            method: 'POST',
            auth: false,
            retryOnUnauthorized: false,
            body: JSON.stringify({ refreshToken }),
          },
          false
        );

        saveAuthSession(session);
        return true;
      } catch {
        clearAuthSession();
        return false;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export function apiClient<T>(endpoint: string, options: ApiClientOptions = {}) {
  return requestJson<T>(endpoint, options);
}

export function rotateSession() {
  return refreshAccessToken();
}
