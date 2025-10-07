import api from './api';

const financingService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/financing?${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/financing/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/financing', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/financing/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/financing/${id}`);
    return response.data;
  },

  evaluateCredit: async (id: string, score: number, status: string, notes?: string) => {
    const response = await api.post(`/financing/${id}/evaluate`, { score, status, notes });
    return response.data;
  },

  approve: async (id: string, approvedAmount?: number) => {
    const response = await api.patch(`/financing/${id}/approve`, { approvedAmount });
    return response.data;
  },

  reject: async (id: string, reason: string) => {
    const response = await api.patch(`/financing/${id}/reject`, { reason });
    return response.data;
  },

  disburse: async (id: string) => {
    const response = await api.patch(`/financing/${id}/disburse`);
    return response.data;
  },

  generatePaymentSchedule: async (id: string) => {
    const response = await api.post(`/financing/${id}/payment-schedule`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/financing/stats');
    return response.data;
  }
};

export default financingService;
