import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vehicleService from '../services/vehicleService';

/**
 * Hook para obtener lista de vehículos con caché inteligente
 * 
 * @param filters - Filtros opcionales para la búsqueda
 * @returns Query con data, isLoading, error
 * 
 * @example
 * const { data: vehicles, isLoading } = useVehicles({ status: 'available' });
 */
export function useVehicles(filters = {}) {
  return useQuery({
    queryKey: ['vehicles', filters], // Clave única de caché
    queryFn: () => vehicleService.getAll(filters),
    staleTime: 5 * 60 * 1000, // Datos frescos por 5 minutos
    // Si ya hay datos en caché de los últimos 5 min, NO hace request
  });
}

/**
 * Hook para obtener un vehículo específico por ID
 * 
 * @param id - ID del vehículo
 * @returns Query con data del vehículo
 * 
 * @example
 * const { data: vehicle } = useVehicle('123');
 */
export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleService.getById(id),
    enabled: !!id, // Solo ejecuta si hay ID válido
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener estadísticas de vehículos
 * Usa caché de 10 minutos (stats cambian menos frecuentemente)
 * 
 * @example
 * const { data: stats } = useVehicleStats();
 */
export function useVehicleStats() {
  return useQuery({
    queryKey: ['vehicle-stats'],
    queryFn: () => vehicleService.getStats(),
    staleTime: 10 * 60 * 1000, // Stats se actualizan cada 10 min
  });
}

/**
 * Hook para crear un nuevo vehículo
 * Invalida automáticamente el caché de vehículos al crear
 * 
 * @returns Mutation con mutateAsync para crear vehículo
 * 
 * @example
 * const createVehicle = useCreateVehicle();
 * await createVehicle.mutateAsync(vehicleData);
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => vehicleService.create(data),
    onSuccess: () => {
      // Invalidar caché de vehículos para que se recargue
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
    },
  });
}

/**
 * Hook para actualizar un vehículo existente
 * Invalida caché del vehículo específico y la lista
 * 
 * @example
 * const updateVehicle = useUpdateVehicle();
 * await updateVehicle.mutateAsync({ id: '123', data: updatedData });
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      vehicleService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidar caché específico y lista
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
    },
  });
}

/**
 * Hook para eliminar un vehículo
 * Invalida todo el caché relacionado
 * 
 * @example
 * const deleteVehicle = useDeleteVehicle();
 * await deleteVehicle.mutateAsync('123');
 */
export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => vehicleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
    },
  });
}
