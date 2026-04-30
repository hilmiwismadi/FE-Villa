/**
 * Direct AuthService API Client
 * This service hits the direct BE endpoints without BFF
 * Base URL: https://yutaka-auth.izcy.tech
 */

const BASE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || '/bff';

import { ApiError, extractApiErrorMessage } from './errors';

// Re-export ApiError for convenience
export { ApiError };

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  roles: string[];
  is_active: boolean;
  metadata?: Record<string, unknown>;
}

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        extractApiErrorMessage(errorData, response.status, response.statusText),
        response.status,
        errorData
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error or server unavailable');
  }
}

/**
 * Login with username/email and password
 */
export async function login(usernameOrEmail: string, password: string): Promise<TokenResponse> {
  const body: Record<string, string> = { password };
  if (usernameOrEmail.includes('@')) {
    body.email = usernameOrEmail;
  } else {
    body.username = usernameOrEmail;
  }
  return apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Get current user info
 */
export async function getCurrentUser(accessToken: string): Promise<UserInfo> {
  return apiRequest<UserInfo>('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

/**
 * Logout current user
 */
export async function logout(accessToken: string): Promise<void> {
  try {
    await apiRequest<void>('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Logout is best-effort — don't block on failure
  }
}

/**
 * Verify magic link token
 */
export async function verifyMagicLink(token: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/magic/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
