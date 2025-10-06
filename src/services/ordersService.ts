import api from './api';

export interface OrderItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id?: string;
  client?: string;
  technician?: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  items: OrderItem[];
  scheduledDate: string;
  completionDate?: string;
  totalCost?: number;
  notes?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderFilters {
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class OrdersService {
  /**
   * Get all orders with optional filters
   */
  async getOrders(filters?: OrderFilters) {
    const response = await api.get('/orders', { params: filters });
    return response.data;
  }

  /**
   * Get single order by ID
   */
  async getOrder(id: string) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }

  /**
   * Create new order
   */
  async createOrder(orderData: Order) {
    const response = await api.post('/orders', orderData);
    return response.data;
  }

  /**
   * Update order
   */
  async updateOrder(id: string, orderData: Partial<Order>) {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  }

  /**
   * Delete order
   */
  async deleteOrder(id: string) {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  }

  /**
   * Get order statistics
   */
  async getStatistics(params?: { groupBy?: string; startDate?: string; endDate?: string }) {
    const response = await api.get('/orders/statistics', { params });
    return response.data;
  }

  /**
   * Add note to order
   */
  async addNote(orderId: string, note: { content: string; isInternal?: boolean }) {
    const response = await api.post(`/orders/${orderId}/notes`, note);
    return response.data;
  }
}

export default new OrdersService();