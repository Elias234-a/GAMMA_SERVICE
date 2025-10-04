import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, AlertColor } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { NotificationSystem } from '@/components/NotificationSystem';
import { LoginScreen } from '@/components/LoginScreen';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import Home from '@/pages/Home';
import About from '@/pages/About';
import { UserRole } from '@/types/auth.types';


// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export interface AlertItem {
  id: string;
  type: AlertColor;
  title: string;
  message: string;
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const App: React.FC = () => {
  // State management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState('home');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Authentication and user data
  const { isAuthenticated, logout, user } = useAuth();
  const defaultUserRole: UserRole = 'Cliente';
  const userRole = user?.role || defaultUserRole;

  // Alert handling
  const displayAlert = useCallback((type: AlertColor, title: string, message: string) => {
    const id = Date.now().toString();
    setAlerts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 5000);
  }, []);

  // Remove alert handler
  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Dialog handling
  const showConfirmDialog = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: onCancel
        ? () => {
            onCancel();
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          }
        : undefined,
    });
  }, []);

  // Handle login
  const handleLogin = useCallback((success: boolean) => {
    if (success) {
      displayAlert('success', 'Inicio de sesión exitoso', '¡Bienvenido de nuevo!');
    }
  }, [displayAlert]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    displayAlert('info', 'Sesión cerrada', 'Has cerrado sesión correctamente');
  }, [logout, displayAlert]);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen grid-background">
        <LoginScreen onLogin={handleLogin} showAlert={displayAlert} />
        <NotificationSystem alerts={alerts} onRemoveAlert={removeAlert} />
      </div>
    );
  }

  // Main app layout
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="h-screen flex grid-background">
          {isSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-20"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          <Sidebar 
            currentModule={currentModule} 
            onModuleChange={(module: string) => {
              setCurrentModule(module);
              // Close on mobile (less than 640px)
              if (window.innerWidth < 640) {
                setIsSidebarOpen(false);
              }
            }}
            isOpen={isSidebarOpen}
            userRole={userRole}
          />
          
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar 
              title={currentModule} 
              onLogout={() => showConfirmDialog(
                'Cerrar sesión', 
                '¿Estás seguro de que quieres cerrar sesión?',
                handleLogout
              )}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
              showAlert={displayAlert}
            />
            
            <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 grid-background-lg pt-0 custom-scroll">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <NotificationSystem alerts={alerts} onRemoveAlert={removeAlert} />
            
            <ConfirmDialog
              isOpen={confirmDialog.isOpen}
              title={confirmDialog.title}
              message={confirmDialog.message}
              onConfirm={confirmDialog.onConfirm}
              onCancel={confirmDialog.onCancel || (() => setConfirmDialog(prev => ({ ...prev, isOpen: false })))}
            />
          </div>
        </div>
      </ThemeProvider>
    </Router>
  );
};

export default App;