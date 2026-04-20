import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { TokenResponse, UserInfo } from '../services/authService';
import * as authService from '../services/authService';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<UserInfo>;
  loginWithToken: (accessToken: string, refreshToken: string) => Promise<UserInfo>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const STORAGE_KEY = 'villa-auth';

function loadState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null, refreshToken: null, user: null };
    return JSON.parse(raw);
  } catch {
    return { accessToken: null, refreshToken: null, user: null };
  }
}

function saveState(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(loadState);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, validate the token by fetching user info
  useEffect(() => {
    if (!state.accessToken) {
      setIsLoading(false);
      return;
    }

    authService.getCurrentUser(state.accessToken)
      .then((user) => {
        setState((prev) => {
          const next = { ...prev, user };
          saveState(next);
          return next;
        });
      })
      .catch(() => {
        // Token invalid — clear everything
        clearState();
        setState({ accessToken: null, refreshToken: null, user: null });
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (username: string, password: string): Promise<UserInfo> => {
    const tokens: TokenResponse = await authService.login(username, password);
    const user = await authService.getCurrentUser(tokens.access_token);

    const newState: AuthState = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user,
    };

    saveState(newState);
    setState(newState);
    return user;
  }, []);

  const loginWithToken = useCallback(async (accessToken: string, refreshToken: string): Promise<UserInfo> => {
    const user = await authService.getCurrentUser(accessToken);

    const newState: AuthState = {
      accessToken,
      refreshToken,
      user,
    };

    saveState(newState);
    setState(newState);
    return user;
  }, []);

  const logout = useCallback(() => {
    if (state.accessToken) {
      authService.logout(state.accessToken);
    }
    clearState();
    setState({ accessToken: null, refreshToken: null, user: null });
  }, [state.accessToken]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.accessToken && !!state.user,
        isLoading,
        login,
        loginWithToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
