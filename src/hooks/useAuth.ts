import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { User } from '@/services/authService';
import apiClient from '@/services/apiClient';

// Usamos NodeJS.Timeout para el tipo de los timeouts
type Timeout = NodeJS.Timeout;

type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const navigate = useNavigate();

  const refreshInterval = useRef<Timeout | null>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Asegurarse de que el token se establezca antes de llamar a getCurrentUser
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Llamar a getCurrentUser sin argumentos ya que no los requiere
          const userData = await (authService.getCurrentUser as () => Promise<User | null>)();
          if (userData) {
            setUser(userData);
            // Configurar intervalo para refrescar el token
            setupTokenRefresh();
          } else {
            // Token inválido o expirado
            localStorage.removeItem('authToken');
            delete apiClient.defaults.headers.common['Authorization'];
          }
        } else {
          setIsInitializing(false);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error al verificar autenticación:', err);
        localStorage.removeItem('authToken');
        delete apiClient.defaults.headers.common['Authorization'];
        setIsInitializing(false);
        setIsLoading(false);
      }
    };

    checkAuth();

    // Limpiar intervalo al desmontar
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  // Configurar el refresco automático del token
  const setupTokenRefresh = useCallback(() => {
    // Limpiar intervalo existente
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }

    // Configurar nuevo intervalo (cada 5 minutos por defecto)
    const interval = Number(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL || 300000);
    
    refreshInterval.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const { valid, user } = await authService.verifyToken(token);
          if (!valid) {
            // Token inválido, forzar cierre de sesión
            await handleLogout();
          } else if (user) {
            setUser(user);
          }
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
      }
    }, interval);
  }, []);

  // Manejar cierre de sesión
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [navigate]);

  /**
   * Inicia sesión con las credenciales proporcionadas
   * @param credentials - Credenciales de inicio de sesión
   * @returns Promise<boolean> - true si el inicio de sesión fue exitoso, false en caso contrario
   * @throws {Error} - Si hay un error durante el proceso de inicio de sesión
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Llamada al servicio de autenticación
      const response = await authService.login(credentials);
      
      // Guardar token y datos del usuario
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
        
        // Configurar refresco de token
        setupTokenRefresh();
        
        // Redirigir al dashboard o ruta protegida
        const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
        localStorage.removeItem('redirectAfterLogin');
        
        // Usar setTimeout para asegurar que el mensaje de éxito se muestre antes de la navegación
        setTimeout(() => {
          navigate(redirectTo);
        }, 100);
        
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      
      // Enfocar el primer campo de entrada en caso de error
      const firstInput = document.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
      
      // Lanzar el error para que pueda ser manejado por el componente que llama
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setupTokenRefresh]);

  const logout = useCallback(async () => {
    await handleLogout();
  }, [handleLogout]);

  // Función para actualizar los datos del usuario
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...userData };
    });
  }, []);

  // Función para verificar roles
  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role;
  }, [user]);

  // Función para verificar permisos (puedes personalizar según tu sistema de permisos)
  const hasPermission = useCallback((_permission: string): boolean => {
    // Implementar lógica de verificación de permisos
    // Por ahora, devolvemos true si el usuario está autenticado
    return !!user;
  }, [user]);

  // Valores y funciones expuestos por el hook
  return {
    // Estado actual del usuario
    user,
    // Estado de carga
    isLoading,
    // Estado de inicialización
    isInitializing,
    // Mensaje de error, si existe
    error,
    // Indica si el usuario está autenticado
    isAuthenticated: !!user,
    
    // Funciones
    login,           // Iniciar sesión
    logout,          // Cerrar sesión
    updateUser,      // Actualizar datos del usuario
    hasRole,         // Verificar rol del usuario
    hasPermission,   // Verificar permiso del usuario
    setError,        // Establecer mensaje de error
    
    // Propiedades para accesibilidad
    a11yProps: {
      // Atributos ARIA para el estado de carga
      loadingProps: {
        'aria-busy': isLoading,
        'aria-live': 'assertive',
        'aria-atomic': 'true'
      },
      // Atributos para mensajes de error
      errorProps: error ? {
        'role': 'alert',
        'aria-live': 'assertive',
        'aria-atomic': 'true'
      } : {}
    }
  };
};
