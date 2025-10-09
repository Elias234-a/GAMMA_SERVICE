import axios from 'axios';

// API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Throttle para evitar múltiples eventos del mismo tipo
let lastSessionExpiredEvent = 0;
let lastNetworkErrorEvent = 0;
const EVENT_THROTTLE_MS = 5000; // 5 segundos entre eventos del mismo tipo

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    // Manejo de sesión expirada (401 Unauthorized)
    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      const hasToken = localStorage.getItem('authToken');
      const now = Date.now();
      
      // Solo limpiar si realmente está autenticado y no hemos disparado evento recientemente
      if (hasToken && (now - lastSessionExpiredEvent) > EVENT_THROTTLE_MS) {
        lastSessionExpiredEvent = now;
        console.warn('Sesión expirada o no autorizada');
        
        // Limpiar datos de autenticación
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Disparar evento personalizado SOLO UNA VEZ
        window.dispatchEvent(new CustomEvent('session-expired', {
          detail: { message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' }
        }));
        
        // Redirigir después de un pequeño delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    }
    
    // Manejo de errores de red (throttled para evitar spam)
    if (!error.response && error.request) {
      const now = Date.now();
      
      // Solo disparar evento si ha pasado suficiente tiempo desde el último
      if ((now - lastNetworkErrorEvent) > EVENT_THROTTLE_MS) {
        lastNetworkErrorEvent = now;
        console.error('Error de red: No se pudo conectar con el servidor backend');
        
        window.dispatchEvent(new CustomEvent('network-error', {
          detail: { 
            message: 'No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en el puerto 8001.' 
          }
        }));
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error && error.response) {
    // Server responded with error
    return error.response.data?.message || error.response.data?.error || 'Error en el servidor';
  } else if (error && error.request) {
    // Request made but no response
    return 'No se pudo conectar con el servidor';
  }
  return 'Error desconocido';
};
