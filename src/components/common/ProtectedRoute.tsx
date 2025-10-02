import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * Componente de ruta protegida que verifica la autenticación y los roles del usuario.
 * Redirige a la ruta de inicio de sesión si el usuario no está autenticado.
 * Si se especifican roles requeridos, verifica que el usuario tenga al menos uno de ellos.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  redirectTo = '/login',
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Efecto para manejar el foco cuando se carga la ruta protegida
  useEffect(() => {
    // Mover el foco al contenido principal cuando se carga la ruta
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.setAttribute('tabIndex', '-1');
      mainContent.focus();
    }
  }, []);

  if (isLoading) {
    // Muestra un indicador de carga accesible
    return (
      <div 
        role="status" 
        aria-live="polite" 
        aria-busy="true"
        className="flex justify-center items-center min-h-screen"
      >
        <p>Cargando...</p>
        <span className="sr-only">Cargando verificación de autenticación</span>
      </div>
    );
  }

  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    // Guardar la ubicación actual para redirigir después del inicio de sesión
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verificar roles si se especificaron
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => user?.role === role);
    
    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            from: location,
            message: 'No tiene permisos para acceder a esta página.'
          }} 
          replace 
        />
      );
    }
  }

  // Si todo está bien, renderizar los hijos
  return <>{children}</>;
};

export default ProtectedRoute;
