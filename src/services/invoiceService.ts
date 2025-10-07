import api from './api';

const invoiceService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/invoices?${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },

  issue: async (id: string) => {
    const response = await api.patch(`/invoices/${id}/issue`);
    return response.data;
  },

  registerPayment: async (id: string, amount: number, method: string, reference?: string, notes?: string) => {
    const response = await api.post(`/invoices/${id}/payments`, { amount, method, reference, notes });
    return response.data;
  },

  cancel: async (id: string, reason: string) => {
    const response = await api.patch(`/invoices/${id}/cancel`, { reason });
    return response.data;
  },

  sendByEmail: async (id: string) => {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data;
  },

  getStats: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/invoices/stats?${params}`);
    return response.data;
  },

  getOverdue: async () => {
    const response = await api.get('/invoices/overdue');
    return response.data;
  }
};

export default invoiceService;
