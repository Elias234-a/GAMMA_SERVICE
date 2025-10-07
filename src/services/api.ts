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
    // Solo limpiar y redirigir si es un 401 y NO es una petición de login
    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      console.warn('Sesión expirada o no autorizada');
      // Solo limpiar si realmente está autenticado
      const hasToken = localStorage.getItem('authToken');
      if (hasToken) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/';
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
