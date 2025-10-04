import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/auth.types';
import { apiService } from '@/services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simular datos de usuarios para desarrollo
  const mockUsers: User[] = [
    {
      email: 'admin@empresa.com',
      password: 'admin123',
      role: 'Administrador' as UserRole,
      name: 'Administrador'
    },
    {
      email: 'vendedor@empresa.com',
      password: 'vendedor123',
      role: 'Vendedor' as UserRole,
      name: 'Vendedor'
    },
    {
      email: 'mecanico@empresa.com',
      password: 'mecanico123',
      role: 'Mecánico' as UserRole,
      name: 'Mecánico'
    },
    {
      email: 'cliente@empresa.com',
      password: 'cliente123',
      role: 'Cliente' as UserRole,
      name: 'Cliente'
    }
  ];

  useEffect(() => {
    // Verificar si hay sesión guardada en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Usar datos mock para desarrollo (en producción usar API real)
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData: User = {
          email: foundUser.email,
          role: foundUser.role,
          name: foundUser.name
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Simular token para desarrollo
        const mockToken = 'mock-token-' + Date.now();
        apiService.setToken(mockToken);
        
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    apiService.setToken(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};