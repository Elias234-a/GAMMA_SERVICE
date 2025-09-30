import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { rolePermissions } from './types/auth.types';
import { ClientsModule } from './components/ClientsModule';
import { VehiclesModule } from './components/VehiclesModule';
import { SalesModule } from './components/SalesModule';
import { BillingModule } from './components/BillingModule';
import { PlatesModule } from './components/PlatesModule';
import { ReportsModule } from './components/ReportsModule';
import { FinancingModule } from './components/FinancingModule';
import { InventoryModule } from './components/InventoryModule';
import { CRMModule } from './components/CRMModule';
import { WorkshopModule } from './components/WorkshopModule';
import { PurchasesModule } from './components/PurchasesModule';
import { HRModule } from './components/HRModule';
import { DIANModule } from './components/DIANModule';
import { ClientPortalModule } from './components/ClientPortalModule';
import { UserRolesModule } from './components/UserRolesModule';
import { NotificationSystem } from './components/NotificationSystem';
import { ConfirmDialog } from './components/ConfirmDialog';
import { UserRole } from './types/auth.types';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export * from './components/LoginScreen';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
}

export interface Client {
  id: string;
  name: string;
  identification: string;
  phone: string;
  email: string;
  address: string;
  registrationDate: string;
  status: 'active' | 'inactive';
}

export interface Vehicle {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  color: string;
  status: 'available' | 'sold' | 'reserved';
  price: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  clientId: string;
  vehicleId: string;
  saleDate: string;
  totalPrice: number;
  paymentMethod: 'cash' | 'credit' | 'financing' | 'mixed';
  salesperson: string;
  status: 'pending' | 'completed' | 'cancelled';
  contractGenerated: boolean;
}

export default function App() {
  const [currentModule, setCurrentModule] = useState<string>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('cliente');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  // Global data states
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'María García López',
      identification: '12345678901',
      phone: '+57 300 123 4567',
      email: 'maria.garcia@email.com',
      address: 'Calle 123 #45-67, Bogotá',
      registrationDate: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Carlos Rodríguez Pérez',
      identification: '98765432109',
      phone: '+57 310 987 6543',
      email: 'carlos.rodriguez@email.com',
      address: 'Carrera 45 #12-34, Medellín',
      registrationDate: '2024-01-20',
      status: 'active'
    }
  ]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      clientId: '',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      plate: '',
      vin: 'JT2BF28K123456789',
      color: 'Blanco',
      status: 'available',
      price: 85000000
    },
    {
      id: '2',
      clientId: '',
      brand: 'Chevrolet',
      model: 'Spark',
      year: 2023,
      plate: '',
      vin: 'KL1TD66E987654321',
      color: 'Rojo',
      status: 'available',
      price: 45000000
    }
  ]);

  const [sales, setSales] = useState<Sale[]>([]);

  const showAlert = (type: AlertType, title: string, message: string) => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      type,
      title,
      message
    };
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== newAlert.id));
    }, 5000);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    });
  };

  const handleLogin = (success: boolean, role?: UserRole) => {
    if (success && role) {
      setIsAuthenticated(true);
      setCurrentUserRole(role);
      setCurrentModule('dashboard');
      showAlert('success', 'Acceso exitoso', `Bienvenido a GAMMA Service (${getRoleName(role)})`);
    } else {
      showAlert('error', 'Error de acceso', 'Usuario, contraseña o rol incorrectos');
    }
  };

  const getRoleName = (role: UserRole): string => {
    const roleNames: Record<string, string> = {
      'admin': 'Administrador',
      'ventas': 'Ventas',
      'inventario': 'Inventario',
      'taller': 'Taller',
      'contabilidad': 'Contabilidad',
      'cliente': 'Cliente',
      'Administrador': 'Administrador',
      'Vendedor': 'Vendedor',
      'Mecánico': 'Mecánico',
      'Cliente': 'Cliente'
    };
    return roleNames[role] || 'Usuario';
  };

  const handleLogout = () => {
    showConfirmDialog(
      'Cerrar sesión',
      '¿Está seguro que desea salir del sistema?',
      () => {
        setIsAuthenticated(false);
        setCurrentModule('login');
        showAlert('info', 'Sesión cerrada', 'Ha salido del sistema correctamente');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    );
  };

  // Verificar si el usuario actual tiene permiso para acceder a un módulo
  const hasPermission = (moduleId: string): boolean => {
    // Permitir siempre el módulo de login
    if (moduleId === 'login') return true;
    
    // Si no está autenticado, solo permitir el login
    if (!isAuthenticated) return false;
    
    // Si el rol es administrador, permitir todo
    if (currentUserRole === 'Administrador' || currentUserRole === 'admin') {
      return true;
    }
    
    // Verificar si el módulo está en los permisos del rol del usuario
    const userPermissions = rolePermissions[currentUserRole] || [];
    return userPermissions.includes(moduleId);
  };

  const renderCurrentModule = () => {
    // Verificar permisos antes de renderizar el módulo
    if (currentModule !== 'login' && !hasPermission(currentModule)) {
      // Redirigir al dashboard si no tiene permiso
      setCurrentModule('dashboard');
      showAlert('warning', 'Acceso denegado', 'No tienes permisos para acceder a este módulo.');
      return null;
    }

    switch (currentModule) {
      case 'login':
        return <LoginScreen 
          onLogin={handleLogin} 
          showAlert={showAlert}
        />;
      case 'dashboard':
        return <Dashboard 
          showAlert={showAlert} 
          clients={clients}
          vehicles={vehicles}
          sales={sales}
          onNavigateToModule={setCurrentModule}
        />;
      case 'inventory':
        return <InventoryModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
        />;
      case 'sales':
        return <SalesModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
          sales={sales}
          setSales={setSales}
          clients={clients}
          vehicles={vehicles}
          setVehicles={setVehicles}
        />;
      case 'crm':
        return <CRMModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
        />;
      case 'workshop':
        return <WorkshopModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
        />;
      case 'billing':
        return <BillingModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
          sales={sales}
          clients={clients}
          vehicles={vehicles}
        />;
      case 'clients':
        return <ClientsModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
          clients={clients}
          setClients={setClients}
        />;
      case 'vehicles':
        return <VehiclesModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
          vehicles={vehicles}
          setVehicles={setVehicles}
          clients={clients}
        />;
      case 'purchases':
        return <PurchasesModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
        />;
      case 'hr':
        return <HRModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
        />;
      case 'plates':
        return <PlatesModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
          clients={clients}
          vehicles={vehicles}
        />;
      case 'financing':
        return <FinancingModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
          clients={clients}
          vehicles={vehicles}
        />;
      case 'dian':
        return <DIANModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
        />;
      case 'reports':
        return <ReportsModule 
          showAlert={showAlert}
          sales={sales}
          clients={clients}
          vehicles={vehicles}
        />;
      case 'portal':
        return <ClientPortalModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
        />;
      case 'users':
        return <UserRolesModule 
          showAlert={showAlert} 
          showConfirmDialog={showConfirmDialog}
        />;
      default:
        return <Dashboard 
          showAlert={showAlert} 
          clients={clients}
          vehicles={vehicles}
          sales={sales}
          onNavigateToModule={setCurrentModule}
        />;
    }
  };

  const getModuleTitle = () => {
    const titles = {
      login: 'Acceso al Sistema',
      dashboard: 'Panel Principal',
      inventory: 'Gestión de Inventario',
      sales: 'Ventas y Cotizaciones',
      crm: 'CRM y Atención al Cliente',
      workshop: 'Postventa y Taller',
      billing: 'Finanzas y Contabilidad',
      clients: 'Gestión de Clientes',
      vehicles: 'Gestión de Vehículos',
      purchases: 'Compras y Proveedores',
      hr: 'Recursos Humanos',
      plates: 'Trámites con Tránsito',
      financing: 'Evaluación Financiera',
      dian: 'Facturación Electrónica DIAN',
      reports: 'Reportes y Análisis',
      portal: 'Portal del Cliente',
      users: 'Gestión de Usuarios y Roles'
    };
    return titles[currentModule as keyof typeof titles] || 'GAMMA Service ERP';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen grid-background">
        {renderCurrentModule()}
        <NotificationSystem alerts={alerts} onRemoveAlert={removeAlert} />
      </div>
    );
  }

  return (
    <div className="h-screen flex grid-background">
      {/* Mobile overlay when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        currentModule={currentModule} 
        onModuleChange={(module) => {
          setCurrentModule(module);
          // Solo cerramos automáticamente en móviles (menos de 640px)
          if (window.innerWidth < 640) {
            setIsSidebarOpen(false);
          }
        }}
        isOpen={isSidebarOpen}
        userRole={currentUserRole}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          title={getModuleTitle()} 
          onLogout={handleLogout}
          showAlert={showAlert}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          userRole={currentUserRole}
        />
        
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 grid-background-lg pt-0 custom-scroll">
          {renderCurrentModule()}
        </main>

        <NotificationSystem alerts={alerts} onRemoveAlert={removeAlert} />
        
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      </div>
    </div>
  );
}