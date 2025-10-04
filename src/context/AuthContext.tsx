import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/auth.types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try to use backend API if available
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          const authenticatedUser: User = {
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          };
          
          setUser(authenticatedUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify({ ...authenticatedUser, token: data.token }));
          return true;
        }
      } catch (apiError) {
        console.warn('Backend API not available, falling back to mock authentication:', apiError);
      }

      // Fallback to mock authentication if backend is not available
      const mockUsers: Record<string, { password: string; name: string; role: UserRole }> = {
        'admin@sistema.com': { password: 'admin123', name: 'Administrador', role: 'Administrador' },
        'ventas@sistema.com': { password: 'ventas123', name: 'Vendedor', role: 'Vendedor' },
        'mecanico@sistema.com': { password: 'mecanico123', name: 'Mecánico', role: 'Mecánico' },
        'cliente@sistema.com': { password: 'cliente123', name: 'Cliente', role: 'Cliente' },
      };

      const userCredentials = mockUsers[email.toLowerCase()];
      
      if (userCredentials && userCredentials.password === password) {
        const authenticatedUser: User = {
          email,
          name: userCredentials.name,
          role: userCredentials.role,
        };
        
        setUser(authenticatedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
