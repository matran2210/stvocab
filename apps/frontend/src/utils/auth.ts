const ACCESS_TOKEN_KEY = 'stvocab_access_token';
const REFRESH_TOKEN_KEY = 'stvocab_refresh_token';
const AUTH_USER_KEY = 'stvocab_auth_user';

export type AuthenticatedUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  status: string;
  packageLevel: string;
  gold: number;
  learningPoints: number;
  isOnboarded: boolean;
};

export type AuthSessionData = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  user: AuthenticatedUser;
};

export function saveAuthSession(session: AuthSessionData) {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
}

export function saveStoredUser(user: AuthenticatedUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredAuthUser(): AuthenticatedUser | null {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthenticatedUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function isJwtExpired(token: string, skewInSeconds = 30) {
  const payload = parseJwtPayload(token);

  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }

  return payload.exp * 1000 <= Date.now() + skewInSeconds * 1000;
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const base64 = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(window.atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
