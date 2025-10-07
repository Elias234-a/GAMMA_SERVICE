import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { rolePermissions } from './types/auth.types';
import authService from './services/authService';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
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
import vehicleService from './services/vehicleService';
import clientService from './services/clientService';
import saleService from './services/saleService';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export * from './components/LoginScreen';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  read?: boolean;
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

function AppContent() {
  const { colors } = useTheme();
  const [currentModule, setCurrentModule] = useState<string>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('cliente');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  
  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser();
          if (user) {
            setIsAuthenticated(true);
            setCurrentUserRole(user.role);
            setCurrentModule('dashboard');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setIsInitializing(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Load data from backend when authenticated
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || isInitializing) return;
      
      try {
        // Load all data in parallel
        const [vehiclesRes, clientsRes, salesRes] = await Promise.all([
          vehicleService.getAll().catch(() => ({ data: [] })),
          clientService.getAll().catch(() => ({ data: [] })),
          saleService.getAll().catch(() => ({ data: [] }))
        ]);
        
        if (vehiclesRes.data) setVehicles(vehiclesRes.data);
        if (clientsRes.data) setClients(clientsRes.data);
        if (salesRes.data) setSales(salesRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
        // Don't show error alert on initial load, just log it
      }
    };
    
    loadData();
  }, [isAuthenticated, isInitializing]);
  
  // Handle window resize for sidebar - only auto-open on desktop, don't auto-close
  useEffect(() => {
    const handleResize = () => {
      // Solo auto-abrir en desktop, no auto-cerrar
      if (window.innerWidth >= 1024 && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);
  
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
  // Estados sin datos mock - se cargarán del backend
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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

  const handleLogin = (success: boolean, role?: UserRole, userName?: string) => {
    if (success && role) {
      setIsAuthenticated(true);
      setCurrentUserRole(role);
      setCurrentUserName(userName || 'Usuario');
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
      async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          setIsAuthenticated(false);
          setCurrentModule('login');
          showAlert('info', 'Sesión cerrada', 'Ha salido del sistema correctamente');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
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
          onModalStateChange={setIsSalesModalOpen}
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

  // Show loading spinner while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundColor: colors.background.primary,
        backgroundImage: colors.background.grid,
        backgroundSize: '20px 20px'
      }}>
        <LoadingSpinner size="xl" text="Cargando aplicación..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{
        backgroundColor: colors.background.primary,
        backgroundImage: colors.background.grid,
        backgroundSize: '20px 20px'
      }}>
        {renderCurrentModule()}
        <NotificationSystem alerts={alerts} onRemoveAlert={removeAlert} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{
      backgroundColor: colors.background.primary,
      backgroundImage: colors.background.grid,
      backgroundSize: '20px 20px'
    }}>
      {/* Overlay para móviles cuando el sidebar está abierto */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-30 h-screen w-64 p-3 transition-all duration-200 ease-out ${
            isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        <Sidebar 
          currentModule={currentModule} 
          onModuleChange={(module) => {
            setCurrentModule(module);
            // Cerrar automáticamente en móviles al seleccionar un módulo
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
          isOpen={isSidebarOpen}
          userRole={currentUserRole}
        />
      </div>
      
      {/* Contenido principal */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-200 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* TopBar */}
        <div className={`sticky top-0 z-20 ${isSalesModalOpen ? 'hidden' : ''}`}>
          <TopBar 
            title={getModuleTitle()} 
            onLogout={handleLogout}
            showAlert={showAlert}
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            userRole={currentUserRole}
            userName={currentUserName}
          />
        </div>
        
        {/* Contenido */}
        <main className={`flex-1 overflow-auto w-full ${!isSalesModalOpen ? 'p-4 md:p-6' : 'p-0'}`}>
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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}