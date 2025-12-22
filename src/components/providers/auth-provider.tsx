"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authAPI, type User } from "@/lib/apiClients";

const USER_STORAGE_KEY = "storentia_user";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUserData: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount (no API call)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("[AuthProvider] Error loading user from storage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set user data and persist to localStorage
  const setUserData = useCallback((userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  // Refresh session by fetching from API (only call from login/dashboard)
  const refreshSession = useCallback(async () => {
    try {
      console.log("[AuthProvider] Fetching current user...");
      const response = await authAPI.getCurrentUser();
      console.log("[AuthProvider] API response:", response);

      if (response.success && response.data?.user) {
        setUserData(response.data.user);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("[AuthProvider] Error fetching user:", error);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, [setUserData]);

  const logout = async () => {
    try {
      console.log("[AuthProvider] Logging out...");
      await authAPI.logout();
      setUserData(null);
      window.location.href = "/storentia/login";
    } catch (error) {
      console.error("[AuthProvider] Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        refreshSession,
        setUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
