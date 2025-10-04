import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@/types/auth.types';
import { AuthAPI } from '@/services/apiServices';
import { AuthTokenManager } from '@/services/api';
import { handleApiError, storage } from '@/utils';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = storage.get<User>('user');
        const token = AuthTokenManager.getToken();

        if (storedUser && token) {
          // Verify token is still valid by making a test request
          // In a real app, you might have a /auth/me endpoint
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          // Clean up any stale data
          AuthTokenManager.clearTokens();
          storage.remove('user');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        AuthTokenManager.clearTokens();
        storage.remove('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check if mock data is enabled
      const enableMockData = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

      if (enableMockData) {
        // Mock authentication for development
        const mockUsers = {
          'admin@sistema.com': { 
            id: '1', 
            name: 'Administrador', 
            role: 'Administrador' as UserRole,
            password: 'admin123'
          },
          'cliente@sistema.com': { 
            id: '2', 
            name: 'Cliente Demo', 
            role: 'Cliente' as UserRole,
            password: 'cliente123'
          },
        };

        const mockUser = mockUsers[email as keyof typeof mockUsers];
        
        if (mockUser && mockUser.password === password) {
          const userData: User = {
            id: mockUser.id,
            email,
            name: mockUser.name,
            role: mockUser.role,
          };

          // Mock tokens
          AuthTokenManager.setToken('mock-jwt-token');
          AuthTokenManager.setRefreshToken('mock-refresh-token');
          
          storage.set('user', userData);
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
        return false;
      } else {
        // Real API authentication
        const response = await AuthAPI.login(email, password);
        
        if (response.success && response.data) {
          const { token, refreshToken, user: userData } = response.data;
          
          AuthTokenManager.setToken(token);
          if (refreshToken) {
            AuthTokenManager.setRefreshToken(refreshToken);
          }
          
          storage.set('user', userData);
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    try {
      setIsLoading(true);

      const enableMockData = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

      if (enableMockData) {
        // Mock registration for development
        // In a real app, this would make an API call
        console.log('Mock registration:', userData);
        return true;
      } else {
        // Real API registration
        const response = await AuthAPI.register(userData);
        return response.success;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const enableMockData = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

      if (!enableMockData) {
        // Call API logout endpoint to invalidate tokens on server
        await AuthAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local auth state regardless of API call success
      AuthTokenManager.clearTokens();
      storage.remove('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};