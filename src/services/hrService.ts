import api from './api';

const hrService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/hr?${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/hr/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/hr', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/hr/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/hr/${id}`);
    return response.data;
  },

  terminate: async (id: string, reason: string) => {
    const response = await api.patch(`/hr/${id}/terminate`, { reason });
    return response.data;
  },

  addPerformanceReview: async (id: string, rating: number, comments: string) => {
    const response = await api.post(`/hr/${id}/reviews`, { rating, comments });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/hr/stats');
    return response.data;
  }
};

export default hrService;
