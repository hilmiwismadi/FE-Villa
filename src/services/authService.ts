import { ApiError } from './errors';

const USE_DEV_PROXY = import.meta.env.DEV && import.meta.env.VITE_USE_PROXY === 'true';
const BASE_URL = USE_DEV_PROXY
  ? ''
  : import.meta.env.VITE_AUTH_SERVICE_URL || 'https://rekognizcy.izcy.tech';

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
        errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
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

export async function login(username: string, password: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function getCurrentUser(accessToken: string): Promise<UserInfo> {
  return apiRequest<UserInfo>('/api/v1/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function logout(accessToken: string): Promise<void> {
  try {
    await apiRequest<void>('/api/v1/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Logout is best-effort — don't block on failure
  }
}
