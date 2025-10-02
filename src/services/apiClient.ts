import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Crear instancia de Axios con configuración base
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para añadir el token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Puedes modificar la respuesta aquí antes de que llegue a las llamadas
    return response;
  },
  (error: AxiosError) => {
    // Manejo centralizado de errores
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const { status, data } = error.response;
      
      // Manejar diferentes códigos de estado
      switch (status) {
        case 401:
          // Token inválido o expirado
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          // Permisos insuficientes
          toast.error('No tienes permisos para realizar esta acción');
          break;
        case 404:
          // Recurso no encontrado
          toast.error('Recurso no encontrado');
          break;
        case 500:
          // Error del servidor
          toast.error('Error en el servidor. Por favor, inténtalo de nuevo más tarde.');
          break;
        default:
          // Otros errores
          const errorMessage = (data as any)?.message || 'Ha ocurrido un error inesperado';
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      toast.error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      // Algo pasó en la configuración de la solicitud
      console.error('Error en la configuración de la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
