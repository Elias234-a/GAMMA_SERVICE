import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, Bell, User, LogOut, Settings } from 'lucide-react';
import type { AlertColor } from '@mui/material';

import { UserRole } from '../types/auth.types';

interface TopBarProps {
  title: string;
  onLogout: () => void;
  showAlert: (type: AlertColor, title: string, message: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  userRole?: UserRole;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  title, 
  onLogout, 
  showAlert, 
  onToggleSidebar, 
  isSidebarOpen,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const handleNotifications = () => {
    showAlert('info', 'Notificaciones', 'Ver todas las notificaciones del sistema');
  };

  return (
    <header className="topbar-container px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="btn-interactive p-3 text-white hover:text-gray-200 hover:bg-white/15 rounded-lg icon-enhanced"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Page Title */}
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-readable">{title}</h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-300" />
            </div>
            <input
              type="text"
              placeholder="Buscar clientes, vehículos, facturas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="form-input block w-full pl-10 pr-3 py-2.5 placeholder-white/60 text-white"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            onClick={handleNotifications}
            className="btn-interactive relative p-2.5 text-white hover:text-gray-200 hover:bg-white/15 rounded-lg icon-enhanced"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            </span>
          </button>
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <div className="flex items-center space-x-4">
              {userRole && (
                <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-gray-700 bg-opacity-50 text-xs font-medium text-white">
                  {userRole}
                </div>
              )}
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-white hover:text-gray-200 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:inline text-sm font-medium">{userRole ? userRole : 'Usuario'}</span>
              </button>
            </div>

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
                          <p className="text-sm font-semibold text-white">Administrador</p>
                          <p className="text-xs text-gray-300">admin@gammaservice.com</p>
                        </div>
                      </div>
                      <div className="mt-3 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-lg border border-orange-500/30">
                        <p className="text-xs text-orange-300 font-medium text-center">🛡️ Acceso Completo</p>
                      </div>
                    </div>
                    
                    {/* Menu Options */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          showAlert('info', 'Perfil', 'Configuración de perfil próximamente');
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors flex items-center space-x-3 group"
                      >
                        <User className="h-4 w-4 text-orange-400 group-hover:text-orange-300" />
                        <span className="group-hover:text-orange-100">Mi Perfil</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          showAlert('info', 'Configuración', 'Panel de configuración próximamente');
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors flex items-center space-x-3 group"
                      >
                        <Settings className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                        <span className="group-hover:text-blue-100">Configuración</span>
                      </button>
                      
                      <div className="h-px bg-white/10 mx-2 my-1" />
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-red-500/20 transition-colors flex items-center space-x-3 group"
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
        <h1 className="text-lg font-semibold text-readable">{title}</h1>
      </div>
    </header>
  );
};