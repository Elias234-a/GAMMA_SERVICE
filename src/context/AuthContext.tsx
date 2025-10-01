import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { UserRole } from '@/types/auth.types';

interface UserData {
  email: string;
  role: UserRole;
  name?: string;
}

type AuthContextType = {
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in (e.g., from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Función para normalizar los roles
  const normalizeRole = (role: string): UserRole => {
    const roleMap: Record<string, UserRole> = {
      'admin': 'Administrador',
      'ventas': 'Vendedor',
      'taller': 'Mecánico',
      'cliente': 'Cliente',
      'Administrador': 'Administrador',
      'Vendedor': 'Vendedor',
      'Mecánico': 'Mecánico',
      'Cliente': 'Cliente'
    };
    
    return roleMap[role] || 'Cliente'; // Por defecto a Cliente si el rol no se reconoce
  };

  const login = (userData: UserData) => {
    const normalizedRole = normalizeRole(userData.role);
    const userInfo = {
      email: userData.email,
      role: normalizedRole,
      name: userData.name || userData.email.split('@')[0]
    };
    
    setUser(userInfo);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userInfo));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
