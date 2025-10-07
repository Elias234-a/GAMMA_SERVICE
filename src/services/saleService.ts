import api from './api';

const saleService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/sales?${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/sales', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/sales/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },

  confirm: async (id: string) => {
    const response = await api.patch(`/sales/${id}/confirm`);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await api.patch(`/sales/${id}/complete`);
    return response.data;
  },

  cancel: async (id: string, reason: string) => {
    const response = await api.patch(`/sales/${id}/cancel`, { reason });
    return response.data;
  },

  getStats: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/sales/stats?${params}`);
    return response.data;
  },

  getByClient: async (clientId: string) => {
    const response = await api.get(`/sales/client/${clientId}`);
    return response.data;
  }
};

export default saleService;
