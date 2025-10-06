import React, { memo } from 'react';
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
  Globe,
  Truck,
  CreditCard,
} from 'lucide-react';
import { UserRole, rolePermissions } from '../types/auth.types';
import gammaLogo from '../assets/logo_claro.png';
import { useTheme } from '../contexts/ThemeContext';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
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

const SidebarComponent: React.FC<SidebarProps> = ({ currentModule, onModuleChange, isOpen, userRole }) => {
  const { colors } = useTheme();

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
          label: 'Gestión de Clientes',
          icon: Users
        },
        {
          id: 'vehicles',
          label: 'Gestión de Vehículos',
          icon: Car
        },
        {
          id: 'inventory',
          label: 'Inventario',
          icon: Package
        },
        {
          id: 'purchases',
          label: 'Compras y Proveedores',
          icon: Truck
        }
      ]
    },
    {
      title: 'ÁREA DE FINANZAS',
      items: [
        {
          id: 'financing',
          label: 'Evaluación Crediticia',
          icon: CreditCard
        },
        {
          id: 'billing',
          label: 'Facturación',
          icon: DollarSign
        },
        {
          id: 'dian',
          label: 'Facturación DIAN',
          icon: FileText
        }
      ]
    },
    {
      title: 'TALLER',
      items: [
        {
          id: 'workshop',
          label: 'Servicios de Taller',
          icon: Wrench
        },
        {
          id: 'plates',
          label: 'Trámites con Tránsito',
          icon: ClipboardCheck
        }
      ]
    },
    {
      title: 'ATENCIÓN AL CLIENTE',
      items: [
        {
          id: 'crm',
          label: 'CRM y Atención',
          icon: MessageSquare
        },
        {
          id: 'portal',
          label: 'Portal del Cliente',
          icon: Globe
        }
      ]
    },
    {
      title: 'REPORTES',
      items: [
        {
          id: 'reports',
          label: 'Reportes y Análisis',
          icon: BarChart3
        },
        {
          id: 'hr',
          label: 'Recursos Humanos',
          icon: UserCheck
        },
        {
          id: 'users',
          label: 'Usuarios y Roles',
          icon: Building2
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

  // No retornar null, siempre renderizar el componente
  return (
    <div className={`h-full w-full backdrop-blur-3xl border rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
      isOpen ? 'pointer-events-auto' : 'pointer-events-none'
    }`} style={{
      backgroundColor: 'var(--background-glass)',
      borderColor: 'var(--border)',
      backdropFilter: 'blur(40px) saturate(180%)'
    }}>
      {/* Logo Section with improved spacing */}
      <div className="p-4 border-b flex-shrink-0 backdrop-blur-md" style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--background-glass)'
      }}>
        <div className="flex items-center justify-center mb-2">
          <div className="relative group">
            <img 
              src={gammaLogo} 
              alt="GAMMA Service" 
              className="h-10 w-auto object-contain icon-glow transition-all duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
        <div className="text-center space-y-0.5">
          <h2 className="text-sm font-semibold tracking-wide text-theme-primary">GAMMA Service</h2>
          <p className="text-[10px] font-medium text-theme-secondary">Sistema ERP/DMS</p>
        </div>
      </div>
      
      {/* Navigation with improved hierarchy and scrolling */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scroll">
        <div className="space-y-0.5">
          {filteredMenuAreas.map((area, areaIndex) => (
            <div key={areaIndex} className="relative">
              {/* Area Title with better visual separation */}
              <div className="mb-0.5 px-2">
                <div className="flex items-center space-x-1.5">
                  <div className="h-0.5 w-0.5 rounded-full bg-orange-400"></div>
                  <h4 className="text-[9px] font-semibold uppercase tracking-wide text-theme-accent">
                    {area.title}
                  </h4>
                  <div className="flex-1 h-px bg-gradient-to-r from-orange-400/40 via-emerald-400/20 to-transparent"></div>
                </div>
              </div>
              
              {/* Area Items with enhanced styling */}
              <div className="space-y-0">
                {area.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentModule === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onModuleChange(item.id)}
                      className={`
                        group w-full flex items-center px-3 py-1.5 text-left rounded-lg transition-all duration-300 relative overflow-hidden
                        ${isActive
                          ? 'border shadow-lg backdrop-blur-sm text-theme-primary'
                          : 'hover:border border-transparent text-theme-secondary hover:text-theme-primary'
                        }
                      `}
                      style={{
                        backgroundColor: isActive ? 'rgba(249, 115, 22, 0.25)' : 'transparent',
                        borderColor: isActive ? 'rgba(249, 115, 22, 0.4)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--background-glass)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-emerald-400 rounded-r-full"></div>
                      )}
                      
                      {/* Icon with improved spacing and effects */}
                      <div className={`
                        flex items-center justify-center w-6 h-6 rounded-lg mr-2.5 transition-all duration-300 flex-shrink-0
                        ${isActive 
                          ? 'bg-orange-500/30 shadow-glow' 
                          : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-105'
                        }
                      `}>
                        <Icon className={`h-3.5 w-3.5 icon-enhanced transition-colors duration-300 ${
                          isActive ? 'text-theme-accent' : 'text-theme-secondary'
                        }`} />
                      </div>
                      
                      {/* Label with better typography */}
                      <span className={`text-xs font-medium transition-colors duration-300 ${
                        isActive ? 'text-theme-primary' : 'text-theme-secondary'
                      }`}>
                        {item.label}
                      </span>
                      
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-emerald-500/0 group-hover:from-orange-500/5 group-hover:to-emerald-500/5 transition-all duration-300 rounded-lg"></div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
      
      {/* Footer with improved styling */}
      <div className="p-4 border-t backdrop-blur-md flex-shrink-0" style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--background-glass)'
      }}>
        <div className="glass-content p-1.5 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-1.5 mb-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-orange-400 to-emerald-400 animate-pulse"></div>
            <p className="text-[9px] font-semibold text-theme-primary">GAMMA Service v2.0</p>
          </div>
          <p className="text-[8px] text-theme-secondary">ERP Integral Colombia</p>
        </div>
      </div>
    </div>
  );
};

export const Sidebar = memo(SidebarComponent);