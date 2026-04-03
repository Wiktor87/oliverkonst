'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { validateToken } from '@/lib/github';

interface AdminContextType {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (pat: string) => Promise<void>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const SESSION_KEY = 'admin_github_token';
const USERNAME_KEY = 'admin_github_username';

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem(SESSION_KEY);
      const storedUsername = sessionStorage.getItem(USERNAME_KEY);
      if (storedToken) {
        setToken(storedToken);
        setUsername(storedUsername);
      }
    } catch {
      // sessionStorage may be unavailable in some contexts
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (pat: string) => {
    const user = await validateToken(pat);
    try {
      sessionStorage.setItem(SESSION_KEY, pat);
      sessionStorage.setItem(USERNAME_KEY, user);
    } catch {
      // ignore
    }
    setToken(pat);
    setUsername(user);
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(USERNAME_KEY);
    } catch {
      // ignore
    }
    setToken(null);
    setUsername(null);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        token,
        username,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
