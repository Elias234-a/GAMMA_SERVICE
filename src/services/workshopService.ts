import api from './api';

const workshopService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/services?${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/services', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  start: async (id: string, technicianId?: string) => {
    const response = await api.patch(`/services/${id}/start`, { technicianId });
    return response.data;
  },

  complete: async (id: string) => {
    const response = await api.patch(`/services/${id}/complete`);
    return response.data;
  },

  cancel: async (id: string, reason: string) => {
    const response = await api.patch(`/services/${id}/cancel`, { reason });
    return response.data;
  },

  requestApproval: async (id: string, estimatedCost: number) => {
    const response = await api.post(`/services/${id}/request-approval`, { estimatedCost });
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.patch(`/services/${id}/approve`);
    return response.data;
  },

  getStats: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/services/stats?${params}`);
    return response.data;
  },

  getByTechnician: async (technicianId: string) => {
    const response = await api.get(`/services/technician/${technicianId}`);
    return response.data;
  }
};

export default workshopService;
