import api from './api';

const plateService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/plates?${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/plates/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/plates', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/plates/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/plates/${id}`);
    return response.data;
  },

  submitToTransito: async (id: string, referenceNumber: string) => {
    const response = await api.post(`/plates/${id}/submit`, { referenceNumber });
    return response.data;
  },

  markAsReady: async (id: string, plateNumber: string) => {
    const response = await api.patch(`/plates/${id}/ready`, { plateNumber });
    return response.data;
  },

  deliver: async (id: string, deliveredTo: string, receivedBy: string) => {
    const response = await api.patch(`/plates/${id}/deliver`, { deliveredTo, receivedBy });
    return response.data;
  },

  cancel: async (id: string, reason: string) => {
    const response = await api.patch(`/plates/${id}/cancel`, { reason });
    return response.data;
  },

  getPending: async () => {
    const response = await api.get('/plates/pending');
    return response.data;
  },

  getOverdue: async () => {
    const response = await api.get('/plates/overdue');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/plates/stats');
    return response.data;
  }
};

export default plateService;
