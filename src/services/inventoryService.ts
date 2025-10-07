import api from './api';

const inventoryService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/inventory?${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/inventory', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  registerEntry: async (id: string, quantity: number, reason: string, reference?: string, notes?: string) => {
    const response = await api.post(`/inventory/${id}/entry`, { quantity, reason, reference, notes });
    return response.data;
  },

  registerExit: async (id: string, quantity: number, reason: string, reference?: string, notes?: string) => {
    const response = await api.post(`/inventory/${id}/exit`, { quantity, reason, reference, notes });
    return response.data;
  },

  transfer: async (id: string, fromLocation: string, toLocation: string, notes?: string) => {
    const response = await api.post(`/inventory/${id}/transfer`, { fromLocation, toLocation, notes });
    return response.data;
  },

  performAudit: async (id: string, actualQuantity: number, notes?: string) => {
    const response = await api.post(`/inventory/${id}/audit`, { actualQuantity, notes });
    return response.data;
  },

  getLowStock: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },

  getNeedingReorder: async () => {
    const response = await api.get('/inventory/needing-reorder');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/inventory/stats');
    return response.data;
  }
};

export default inventoryService;
