import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientService from '../services/clientService';

/**
 * Hook para obtener lista de clientes con caché inteligente
 * 
 * @param filters - Filtros opcionales
 * @returns Query con data, isLoading, error
 * 
 * @example
 * const { data: clients, isLoading } = useClients({ status: 'active' });
 */
export function useClients(filters = {}) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener un cliente específico
 * 
 * @param id - ID del cliente
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener estadísticas de clientes
 */
export function useClientStats() {
  return useQuery({
    queryKey: ['client-stats'],
    queryFn: () => clientService.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para crear un nuevo cliente
 */
export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => clientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
    },
  });
}

/**
 * Hook para actualizar un cliente
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      clientService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
    },
  });
}

/**
 * Hook para eliminar un cliente
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
    },
  });
}
