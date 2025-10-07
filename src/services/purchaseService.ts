import api from './api';

const purchaseService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/purchases?${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/purchases', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/purchases/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/purchases/${id}`);
    return response.data;
  },

  markAsReceived: async (id: string) => {
    const response = await api.patch(`/purchases/${id}/received`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/purchases/stats');
    return response.data;
  }
};

export default purchaseService;
