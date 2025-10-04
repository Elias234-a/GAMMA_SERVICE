import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, UserRole } from '@/types/auth.types';

interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  login: (params: { role: UserRole; email?: string; name?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'app_auth_state_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { isAuthenticated: boolean; user: User | null };
        setIsAuthenticated(parsed.isAuthenticated);
        setUser(parsed.user);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isAuthenticated, user })
      );
    } catch {
      // ignore storage errors (e.g., private mode)
    }
  }, [isAuthenticated, user]);

  const login = (params: { role: UserRole; email?: string; name?: string }) => {
    const nextUser: User = {
      email: params.email ?? 'usuario@gamma.local',
      name: params.name ?? 'Usuario',
      role: params.role,
    };
    setUser(nextUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated, user, login, logout }),
    [isAuthenticated, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
