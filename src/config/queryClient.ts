import { QueryClient } from '@tanstack/react-query';

// Configuración del cliente de React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración de caché y refetch
      staleTime: 5 * 60 * 1000, // Los datos son "frescos" por 5 minutos
      gcTime: 10 * 60 * 1000, // Garbage collection después de 10 minutos (antes cacheTime)
      retry: 1, // Solo 1 reintento en caso de error
      refetchOnWindowFocus: false, // No refetch al volver al tab
      refetchOnReconnect: true, // Refetch al reconectar internet
      refetchOnMount: true, // Refetch al montar componente si está stale
    },
    mutations: {
      retry: 0, // No reintentar mutaciones automáticamente
    },
  },
});
