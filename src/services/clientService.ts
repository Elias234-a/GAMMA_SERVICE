import api from './api';

const clientService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/clients?${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  evaluateCredit: async (id: string, score: number, status: string) => {
    const response = await api.post(`/clients/${id}/evaluate-credit`, { score, status });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/clients/stats');
    return response.data;
  }
};

export default clientService;
