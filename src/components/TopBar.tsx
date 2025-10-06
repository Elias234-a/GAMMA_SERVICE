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
                {/* Backdrop overlay */}
                <div 
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 glass-card-strong rounded-lg shadow-2xl border border-white/30 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="py-1">
                    {/* Profile Header */}
                    <div className="px-4 py-4 border-b border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-glow">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>Administrador</p>
                          <p className="text-xs" style={{ color: colors.text.secondary }}>admin@gammaservice.com</p>
                        </div>
                      </div>
                      <div className="mt-3 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-lg border border-orange-500/30">
                        <p className="text-xs font-medium text-center" style={{ color: colors.text.accent }}>🛡️ Acceso Completo</p>
                      </div>
                    </div>
                    
                    {/* Menu Options */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          showAlert('info', 'Perfil', 'Configuración de perfil próximamente');
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition-colors flex items-center space-x-3 group"
                        style={{ color: colors.text.primary }}
                      >
                        <User className="h-4 w-4" style={{ color: colors.text.accent }} />
                        <span style={{ color: colors.text.primary }}>Mi Perfil</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          showAlert('info', 'Configuración', 'Panel de configuración próximamente');
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition-colors flex items-center space-x-3 group"
                        style={{ color: colors.text.primary }}
                      >
                        <Settings className="h-4 w-4" style={{ color: colors.text.accent }} />
                        <span style={{ color: colors.text.primary }}>Configuración</span>
                      </button>
                      
                      <div className="h-px bg-white/10 mx-2 my-1" />
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-red-500/20 transition-colors flex items-center space-x-3 group"
                        style={{ color: colors.text.primary }}
                      >
                        <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-300" />
                        <span className="group-hover:text-red-100">Cerrar Sesión</span>
                      </button>
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