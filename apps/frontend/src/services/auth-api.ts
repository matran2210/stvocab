import { apiClient, rotateSession } from '../api/client';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  isJwtExpired,
  saveAuthSession,
  saveStoredUser,
  type AuthSessionData,
  type AuthenticatedUser,
} from '../utils/auth';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  name: string;
};

export async function loginUser(payload: LoginPayload) {
  const session = await apiClient<AuthSessionData>('/auth/user/login', {
    method: 'POST',
    auth: false,
    retryOnUnauthorized: false,
    body: JSON.stringify(payload),
  });

  saveAuthSession(session);
  return session;
}

export async function registerUser(payload: RegisterPayload) {
  const session = await apiClient<AuthSessionData>('/auth/user/register', {
    method: 'POST',
    auth: false,
    retryOnUnauthorized: false,
    body: JSON.stringify(payload),
  });

  saveAuthSession(session);
  return session;
}

export async function restoreUserSession() {
  const accessToken = getAccessToken();

  if (accessToken && !isJwtExpired(accessToken)) {
    return true;
  }

  if (!getRefreshToken()) {
    clearAuthSession();
    return false;
  }

  return rotateSession();
}

export async function getCurrentUserProfile() {
  const user = await apiClient<AuthenticatedUser>('/auth/user/me');
  saveStoredUser(user);
  return user;
}

export async function logoutUser() {
  try {
    const accessToken = getAccessToken();

    if (accessToken && !isJwtExpired(accessToken)) {
      await apiClient<{ message: string }>('/auth/user/logout', {
        method: 'POST',
      });
    }
  } finally {
    clearAuthSession();
  }
}

export async function changeUserPassword(password: string) {
  return apiClient<{ message: string }>('/auth/user/change-password', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}
