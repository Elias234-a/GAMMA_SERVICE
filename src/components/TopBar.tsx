import React, { useState, useEffect, useRef, memo } from 'react';
import { Menu, X, Search, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { AlertType } from '../App';
import { NotificationCenter } from './NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';
import { UserRole } from '../types/auth.types';
import { useTheme } from '../contexts/ThemeContext';

interface TopBarProps {
  title: string;
  onLogout: () => void;
  showAlert: (type: AlertType, title: string, message: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  userRole?: UserRole;
  userName?: string;
}

const TopBarComponent: React.FC<TopBarProps> = ({
  title,
  onLogout,
  showAlert,
  onToggleSidebar,
  isSidebarOpen,
  userRole,
  userName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme, colors } = useTheme();
  
  // Use notifications hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications(true);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      showAlert('info', 'Búsqueda', `Buscando: "${searchTerm}"`);
    }
  };

  const handleRemoveNotification = (id: string) => {
    deleteNotification(id);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    showAlert('info', 'Tema', isDark ? 'Modo claro activado' : 'Modo oscuro activado');
  };

  return (
    <header className="topbar-container px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => {
              console.log('Toggle sidebar clicked, current state:', isSidebarOpen);
              onToggleSidebar();
            }}
            className="btn-interactive p-3 hover:bg-white/15 rounded-lg icon-enhanced relative z-50 text-theme-primary"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Page Title */}
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-theme-primary">{title}</h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-theme-secondary" />
            </div>
            <input
              type="text"
              placeholder="Buscar clientes, vehículos, facturas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="form-input block w-full pl-10 pr-3 py-2.5 text-theme-primary"
              style={{
                backgroundColor: 'var(--background-secondary)'
              }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <NotificationCenter
            alerts={notifications}
            onRemoveAlert={handleRemoveNotification}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
          
          {/* Theme Toggle */}
          <button
            onClick={handleToggleTheme}
            className="btn-interactive p-3 hover:bg-white/15 rounded-lg icon-enhanced transition-all duration-300 text-theme-primary"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 hover:bg-white/10 rounded-lg transition-colors focus:outline-none text-theme-primary"
            >
              <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              {userName && (
                <span className="hidden md:inline text-sm font-medium">{userName}</span>
              )}
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <>
                {/* Backdrop overlay - Much stronger blur */}
                <div 
                  className="fixed top-16 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-xl z-[9998] transition-all duration-300"
                  onClick={() => setShowUserMenu(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border z-[9999] animate-in slide-in-from-top-2 duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(40, 44, 52, 0.95) 0%, rgba(30, 33, 40, 0.98) 100%)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  {/* Profile Header */}
                  <div className="px-5 py-4 border-b border-white/10">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        {/* Online indicator */}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-800"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-white">
                          {userName || 'Administrador'}
                        </p>
                        <p className="text-xs text-gray-400">admin@gammaservice.com</p>
                      </div>
                    </div>
                    {/* Access Badge */}
                    <div className="px-3 py-2 rounded-lg" 
                      style={{
                        background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.3) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(236, 72, 153, 0.3) 100%)',
                        border: '1px solid rgba(249, 115, 22, 0.3)'
                      }}
                    >
                      <p className="text-xs font-semibold text-center text-white flex items-center justify-center gap-2">
                        <span>🔥</span>
                        Acceso Completo al Sistema
                        <span>✨</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Menu Options */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        showAlert('info', 'Perfil', 'Configuración de perfil próximamente');
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-white/5 transition-all duration-200 flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">Mi Perfil</p>
                        <p className="text-xs text-gray-400">Ver y editar información</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        showAlert('info', 'Configuración', 'Panel de configuración próximamente');
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-white/5 transition-all duration-200 flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Settings className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">Configuración</p>
                        <p className="text-xs text-gray-400">Preferencias del sistema</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-red-500/10 transition-all duration-200 flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <LogOut className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-red-100">Cerrar Sesión</p>
                        <p className="text-xs text-gray-400">Salir del sistema</p>
                      </div>
                    </button>
                  </div>

                  {/* Footer - Last activity */}
                  <div className="px-5 py-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Última actividad</span>
                      <span className="text-cyan-400 font-medium">Hace 2 min</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Page Title */}
      <div className="sm:hidden pb-3">
        <h1 className="text-lg font-semibold text-theme-primary">{title}</h1>
      </div>
    </header>
  );
};

export const TopBar = memo(TopBarComponent);