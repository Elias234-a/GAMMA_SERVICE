import React from 'react';
import styles from './Sidebar.module.css';
import { 
  Home, 
  Users, 
  Car, 
  ShoppingCart, 
  FileText, 
  ClipboardCheck,
  BarChart3,
  Building2,
  Package,
  MessageSquare,
  Wrench,
  DollarSign,
  UserCheck,
  Globe
} from 'lucide-react';
import { UserRole, rolePermissions } from '../types/auth.types';
import gammaLogo from '../assets/logo_claro.png';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuArea {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  currentModule: string;
  onModuleChange: (module: string) => void;
  isOpen: boolean;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentModule, onModuleChange, isOpen, userRole }) => {
  const menuAreas: MenuArea[] = [
    {
      title: 'PRINCIPAL',
      items: [
        {
          id: 'dashboard',
          label: 'Inicio',
          icon: Home
        }
      ]
    },
    {
      title: 'ÁREA DE VENTAS',
      items: [
        {
          id: 'sales',
          label: 'Proceso de Venta',
          icon: ShoppingCart
        },
        {
          id: 'clients',
          label: 'Clientes',
          icon: Users
        },
        {
          id: 'vehicles',
          label: 'Vehículos',
          icon: Car
        },
        {
          id: 'crm',
          label: 'CRM',
          icon: MessageSquare
        }
      ]
    },
    {
      title: 'POSTVENTA',
      items: [
        {
          id: 'workshop',
          label: 'Taller',
          icon: Wrench
        },
        {
          id: 'billing',
          label: 'Facturación',
          icon: FileText
        },
        {
          id: 'financing',
          label: 'Financiación',
          icon: DollarSign
        },
        {
          id: 'plates',
          label: 'Trámites',
          icon: ClipboardCheck
        }
      ]
    },
    {
      title: 'ADMINISTRACIÓN',
      items: [
        {
          id: 'inventory',
          label: 'Inventario',
          icon: Package
        },
        {
          id: 'purchases',
          label: 'Compras',
          icon: ShoppingCart
        },
        {
          id: 'hr',
          label: 'RRHH',
          icon: UserCheck
        },
        {
          id: 'reports',
          label: 'Reportes',
          icon: BarChart3
        },
        {
          id: 'dian',
          label: 'DIAN',
          icon: Building2
        },
        {
          id: 'portal',
          label: 'Portal Cliente',
          icon: Globe
        },
        {
          id: 'users',
          label: 'Usuarios',
          icon: Users
        }
      ]
    }
  ];

  // Function to check if a module should be visible for the current user role
  const isModuleAllowed = (moduleId: string): boolean => {
    // Always allow dashboard
    if (moduleId === 'dashboard') return true;
    
    // Check if the module is in the user's allowed modules
    return rolePermissions[userRole]?.includes(moduleId) || false;
  };

  const filteredMenuAreas = menuAreas
    .map(area => ({
      ...area,
      items: area.items.filter(item => isModuleAllowed(item.id))
    }))
    .filter(area => area.items.length > 0);

  return (
    <div className={`
      ${isOpen ? 'w-52' : 'w-0 overflow-hidden'} 
      glass-module border-r border-white/10 relative z-30
      flex flex-col h-[calc(100vh-6rem-1.5rem)] fixed top-3 left-3 mb-3
      ${isOpen ? 'block' : 'hidden lg:block'}
      ${isOpen ? 'shadow-2xl' : ''}
      transition-all duration-300 ease-in-out
      rounded-xl overflow-hidden
    `}>
      {/* Logo Section */}
      <div className="pt-4 pb-3 px-4 border-b border-white/10 mt-1 flex justify-center">
        <div className="w-24">
          <div className="flex justify-center">
            <img 
              src={gammaLogo} 
              alt="GAMMA Service" 
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className={`flex-1 py-2 px-2 mx-2 ${styles.sidebarScroll} ${!isOpen ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <div className="space-y-2 pr-1">
          {filteredMenuAreas.map((area, areaIndex) => (
            <div key={areaIndex} className="relative">
              <h3 className="px-3 py-2 text-xs font-semibold text-orange-400 uppercase tracking-wider">
                {area.title}
              </h3>
              <div className="space-y-1">
                {area.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentModule === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onModuleChange(item.id)}
                      className={`
                        group w-full flex items-center px-3 py-2 text-left rounded-md transition-all duration-200 relative overflow-hidden
                        ${isActive 
                          ? 'bg-orange-600 text-white' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }
                      `}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-emerald-400 rounded-r-full"></div>
                      )}
                      
                      {/* Icon with improved spacing and effects */}
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-lg mr-4 transition-all duration-300
                        ${isActive 
                          ? 'bg-orange-600 shadow-glow' 
                          : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-105'
                        }
                      `}>
                        <Icon className={`h-4 w-4 icon-enhanced transition-colors duration-300 ${
                          isActive ? 'text-orange-300' : 'text-gray-300 group-hover:text-white'
                        }`} />
                      </div>
                      
                      {/* Label with better typography */}
                      <span className={`ml-3 text-xs font-medium transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                      
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-emerald-500/0 group-hover:from-orange-500/5 group-hover:to-emerald-500/5 transition-all duration-300 rounded-xl"></div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
      
      {/* Footer with improved styling */}
      <div className="px-4 py-4 border-t border-white/20 mt-auto">
        <div className="glass-content p-3 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-400 to-emerald-400 animate-pulse"></div>
            <p className="text-xs font-semibold text-white">GAMMA Service v2.0</p>
          </div>
          <p className="text-xs text-gray-300">ERP Integral Colombia</p>
          <div className="mt-2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};