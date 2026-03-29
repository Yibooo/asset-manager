"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthState {
  token: string | null;
  userId: string | null;
  displayName: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  setAuth: (token: string, userId: string, displayName: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "asset_manager_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    userId: null,
    displayName: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userId = localStorage.getItem("asset_manager_user_id");
    const displayName = localStorage.getItem("asset_manager_display_name");
    setState({ token, userId, displayName, isLoading: false });
  }, []);

  const setAuth = (token: string, userId: string, displayName: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem("asset_manager_user_id", userId);
    localStorage.setItem("asset_manager_display_name", displayName);
    setState({ token, userId, displayName, isLoading: false });
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("asset_manager_user_id");
    localStorage.removeItem("asset_manager_display_name");
    setState({ token: null, userId: null, displayName: null, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
