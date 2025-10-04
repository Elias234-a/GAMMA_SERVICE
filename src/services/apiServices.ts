import { apiClient, ApiResponse } from './api';
import { Client, Vehicle, Sale, Appointment, Lead, Invoice } from '@/types';

// Authentication API
export class AuthAPI {
  static async login(email: string, password: string) {
    return apiClient.post<{ token: string; refreshToken: string; user: any }>('/auth/login', {
      email,
      password,
    });
  }

  static async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    return apiClient.post<{ user: any }>('/auth/register', userData);
  }

  static async logout() {
    return apiClient.post('/auth/logout');
  }

  static async refreshToken() {
    return apiClient.post<{ token: string }>('/auth/refresh');
  }

  static async forgotPassword(email: string) {
    return apiClient.post('/auth/forgot-password', { email });
  }

  static async resetPassword(token: string, newPassword: string) {
    return apiClient.post('/auth/reset-password', { token, password: newPassword });
  }
}

// Clients API
export class ClientsAPI {
  static async getClients(params?: { page?: number; limit?: number; search?: string }) {
    return apiClient.get<Client[]>('/clients', { params });
  }

  static async getClient(id: string) {
    return apiClient.get<Client>(`/clients/${id}`);
  }

  static async createClient(clientData: Partial<Client>) {
    return apiClient.post<Client>('/clients', clientData);
  }

  static async updateClient(id: string, clientData: Partial<Client>) {
    return apiClient.put<Client>(`/clients/${id}`, clientData);
  }

  static async deleteClient(id: string) {
    return apiClient.delete(`/clients/${id}`);
  }

  static async searchClients(query: string) {
    return apiClient.get<Client[]>(`/clients/search`, { params: { q: query } });
  }
}

// Vehicles API
export class VehiclesAPI {
  static async getVehicles(params?: { page?: number; limit?: number; search?: string; ownerId?: string }) {
    return apiClient.get<Vehicle[]>('/vehicles', { params });
  }

  static async getVehicle(id: string) {
    return apiClient.get<Vehicle>(`/vehicles/${id}`);
  }

  static async createVehicle(vehicleData: Partial<Vehicle>) {
    return apiClient.post<Vehicle>('/vehicles', vehicleData);
  }

  static async updateVehicle(id: string, vehicleData: Partial<Vehicle>) {
    return apiClient.put<Vehicle>(`/vehicles/${id}`, vehicleData);
  }

  static async deleteVehicle(id: string) {
    return apiClient.delete(`/vehicles/${id}`);
  }

  static async getVehiclesByOwner(ownerId: string) {
    return apiClient.get<Vehicle[]>(`/vehicles/owner/${ownerId}`);
  }

  static async updateVehicleStatus(id: string, status: Vehicle['status']) {
    return apiClient.patch<Vehicle>(`/vehicles/${id}/status`, { status });
  }
}

// Sales API
export class SalesAPI {
  static async getSales(params?: { page?: number; limit?: number; dateFrom?: string; dateTo?: string }) {
    return apiClient.get<Sale[]>('/sales', { params });
  }

  static async getSale(id: string) {
    return apiClient.get<Sale>(`/sales/${id}`);
  }

  static async createSale(saleData: Partial<Sale>) {
    return apiClient.post<Sale>('/sales', saleData);
  }

  static async updateSale(id: string, saleData: Partial<Sale>) {
    return apiClient.put<Sale>(`/sales/${id}`, saleData);
  }

  static async deleteSale(id: string) {
    return apiClient.delete(`/sales/${id}`);
  }

  static async updateSaleStatus(id: string, status: Sale['status']) {
    return apiClient.patch<Sale>(`/sales/${id}/status`, { status });
  }

  static async getSalesByClient(clientId: string) {
    return apiClient.get<Sale[]>(`/sales/client/${clientId}`);
  }

  static async getSalesByDateRange(startDate: string, endDate: string) {
    return apiClient.get<Sale[]>('/sales/date-range', {
      params: { startDate, endDate },
    });
  }
}

// Appointments API
export class AppointmentsAPI {
  static async getAppointments(params?: { page?: number; limit?: number; date?: string; status?: string }) {
    return apiClient.get<Appointment[]>('/appointments', { params });
  }

  static async getAppointment(id: string) {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  }

  static async createAppointment(appointmentData: Partial<Appointment>) {
    return apiClient.post<Appointment>('/appointments', appointmentData);
  }

  static async updateAppointment(id: string, appointmentData: Partial<Appointment>) {
    return apiClient.put<Appointment>(`/appointments/${id}`, appointmentData);
  }

  static async deleteAppointment(id: string) {
    return apiClient.delete(`/appointments/${id}`);
  }

  static async updateAppointmentStatus(id: string, status: Appointment['status']) {
    return apiClient.patch<Appointment>(`/appointments/${id}/status`, { status });
  }

  static async getAppointmentsByClient(clientId: string) {
    return apiClient.get<Appointment[]>(`/appointments/client/${clientId}`);
  }

  static async getAppointmentsByDate(date: string) {
    return apiClient.get<Appointment[]>(`/appointments/date/${date}`);
  }
}

// CRM/Leads API
export class CRMLeadsAPI {
  static async getLeads(params?: { page?: number; limit?: number; status?: string; source?: string }) {
    return apiClient.get<Lead[]>('/leads', { params });
  }

  static async getLead(id: string) {
    return apiClient.get<Lead>(`/leads/${id}`);
  }

  static async createLead(leadData: Partial<Lead>) {
    return apiClient.post<Lead>('/leads', leadData);
  }

  static async updateLead(id: string, leadData: Partial<Lead>) {
    return apiClient.put<Lead>(`/leads/${id}`, leadData);
  }

  static async deleteLead(id: string) {
    return apiClient.delete(`/leads/${id}`);
  }

  static async updateLeadStatus(id: string, status: Lead['status']) {
    return apiClient.patch<Lead>(`/leads/${id}/status`, { status });
  }

  static async assignLead(id: string, assignedTo: string) {
    return apiClient.patch<Lead>(`/leads/${id}/assign`, { assignedTo });
  }

  static async addLeadNote(id: string, note: string) {
    return apiClient.post<Lead>(`/leads/${id}/notes`, { note });
  }
}

// Invoices API
export class InvoicesAPI {
  static async getInvoices(params?: { page?: number; limit?: number; status?: string; clientId?: string }) {
    return apiClient.get<Invoice[]>('/invoices', { params });
  }

  static async getInvoice(id: string) {
    return apiClient.get<Invoice>(`/invoices/${id}`);
  }

  static async createInvoice(invoiceData: Partial<Invoice>) {
    return apiClient.post<Invoice>('/invoices', invoiceData);
  }

  static async updateInvoice(id: string, invoiceData: Partial<Invoice>) {
    return apiClient.put<Invoice>(`/invoices/${id}`, invoiceData);
  }

  static async deleteInvoice(id: string) {
    return apiClient.delete(`/invoices/${id}`);
  }

  static async updateInvoiceStatus(id: string, status: Invoice['status']) {
    return apiClient.patch<Invoice>(`/invoices/${id}/status`, { status });
  }

  static async sendInvoice(id: string, email?: string) {
    return apiClient.post(`/invoices/${id}/send`, { email });
  }

  static async downloadInvoice(id: string) {
    return apiClient.get(`/invoices/${id}/download`);
  }
}

// Reports API
export class ReportsAPI {
  static async getSalesReport(params: { startDate: string; endDate: string; groupBy?: string }) {
    return apiClient.get('/reports/sales', { params });
  }

  static async getInventoryReport() {
    return apiClient.get('/reports/inventory');
  }

  static async getFinancialReport(params: { startDate: string; endDate: string }) {
    return apiClient.get('/reports/financial', { params });
  }

  static async getCustomerReport(params: { startDate: string; endDate: string }) {
    return apiClient.get('/reports/customer', { params });
  }

  static async getServiceReport(params: { startDate: string; endDate: string }) {
    return apiClient.get('/reports/service', { params });
  }
}

// File Upload API
export class FileAPI {
  static async uploadFile(file: File, category: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    return apiClient.post<{ url: string; id: string }>('/files/upload', formData, {
      headers: {
        // Remove Content-Type header to let browser set it with boundary for FormData
      },
    });
  }

  static async deleteFile(fileId: string) {
    return apiClient.delete(`/files/${fileId}`);
  }

  static async getFileUrl(fileId: string) {
    return apiClient.get<{ url: string }>(`/files/${fileId}/url`);
  }
}

// Settings API
export class SettingsAPI {
  static async getSettings() {
    return apiClient.get('/settings');
  }

  static async updateSettings(settings: Record<string, any>) {
    return apiClient.put('/settings', settings);
  }

  static async getCompanyInfo() {
    return apiClient.get('/settings/company');
  }

  static async updateCompanyInfo(companyData: Record<string, any>) {
    return apiClient.put('/settings/company', companyData);
  }
}

// Notifications API
export class NotificationsAPI {
  static async getNotifications(params?: { page?: number; limit?: number; read?: boolean }) {
    return apiClient.get('/notifications', { params });
  }

  static async markAsRead(notificationId: string) {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  }

  static async markAllAsRead() {
    return apiClient.patch('/notifications/read-all');
  }

  static async deleteNotification(notificationId: string) {
    return apiClient.delete(`/notifications/${notificationId}`);
  }
}