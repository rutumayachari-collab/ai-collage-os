"use client";

import { createContext, useState, useCallback, useEffect, useContext } from "react";
import type { AuthContextValue, User, LoginCredentials, AuthResponse } from "../types/auth";
import { authService } from "../services/auth.service";
import { apiClient } from "../services/api/apiClient";
import { useRoleContext } from "../hooks/useRole";
import { RoleContext } from "./RoleContext";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const TOKEN_STORAGE_KEY = "aicos_auth_token";
const REFRESH_TOKEN_STORAGE_KEY = "aicos_refresh_token";
const USER_STORAGE_KEY = "aicos_user";

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [refreshToken, setRefreshToken] = useState<string | null>(getStoredRefreshToken);
  const [isLoading, setIsLoading] = useState(true);
  const roleContext = useRoleContext(user?.role || null, user?.permissions || []);

  const isAuthenticated = !!user && !!token;

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    const { user: userData, token: accessToken, refreshToken: refresh } = response;
    setUser(userData);
    setToken(accessToken);
    setRefreshToken(refresh);
    apiClient.setTokens(accessToken, refresh);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      apiClient.clearTokens();
      if (typeof window !== "undefined") {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const response = await authService.getCurrentUser();
      const userData = response.data as User;
      setUser(userData);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      }
    } catch {
      await logout();
    }
  }, [token, logout]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(getStoredRefreshToken());
        setUser(storedUser);
        apiClient.setTokens(storedToken, getStoredRefreshToken());
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (!token) return;
    apiClient.setOnTokenRefreshFailed(() => {
      logout();
    });
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      <RoleContext.Provider value={roleContext}>{children}</RoleContext.Provider>
    </AuthContext.Provider>
  );
}
