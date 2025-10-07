import api from './api';

const vehicleService = {
  // Obtener todos los vehículos con filtros
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/vehicles?${params}`);
    return response.data;
  },

  // Obtener vehículo por ID
  getById: async (id: string) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // Crear vehículo
  create: async (data: any) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  // Actualizar vehículo
  update: async (id: string, data: any) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  // Eliminar vehículo
  delete: async (id: string) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  // Obtener vehículos disponibles
  getAvailable: async () => {
    const response = await api.get('/vehicles/available');
    return response.data;
  },

  // Marcar como vendido
  markAsSold: async (id: string, clientId: string) => {
    const response = await api.patch(`/vehicles/${id}/sold`, { clientId });
    return response.data;
  },

  // Subir imágenes
  uploadImages: async (id: string, images: Array<{ url: string; isPrimary?: boolean }>) => {
    const response = await api.post(`/vehicles/${id}/images`, { images });
    return response.data;
  },

  // Agregar nota
  addNote: async (id: string, content: string) => {
    const response = await api.post(`/vehicles/${id}/notes`, { content });
    return response.data;
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await api.get('/vehicles/stats');
    return response.data;
  }
};

export default vehicleService;
