const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
  pagination?: {
    current: number;
    total: number;
    count: number;
  };
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Auth endpoints
  async login(email: string, password: string, role: string) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
    address?: string;
  }) {
    const response = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async verifyToken() {
    return this.request<any>('/auth/verify');
  }

  async logout() {
    const response = await this.request<any>('/auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
    return response;
  }

  // Clients endpoints
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/clients?${queryString}` : '/clients';
    
    return this.request<any[]>(endpoint);
  }

  async getClient(id: number) {
    return this.request<any>(`/clients/${id}`);
  }

  async createClient(clientData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    documentType: string;
    documentNumber: string;
  }) {
    return this.request<any>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: number, clientData: Partial<{
    name: string;
    email: string;
    phone: string;
    address: string;
  }>) {
    return this.request<any>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: number) {
    return this.request<any>(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Vehicles endpoints
  async getVehicles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    brand?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.brand) queryParams.append('brand', params.brand);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/vehicles?${queryString}` : '/vehicles';
    
    return this.request<any[]>(endpoint);
  }

  async getVehicle(id: number) {
    return this.request<any>(`/vehicles/${id}`);
  }

  async createVehicle(vehicleData: {
    brand: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    vin: string;
    engineNumber?: string;
    mileage?: number;
    fuelType?: string;
    transmission?: string;
    price: number;
    cost: number;
    purchaseDate?: string;
  }) {
    return this.request<any>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateVehicle(id: number, vehicleData: Partial<{
    brand: string;
    model: string;
    year: number;
    color: string;
    price: number;
    cost: number;
    status: string;
  }>) {
    return this.request<any>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async deleteVehicle(id: number) {
    return this.request<any>(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  async getVehicleStats() {
    return this.request<any>('/vehicles/stats/overview');
  }

  // Sales endpoints
  async getSales(params?: {
    page?: number;
    limit?: number;
    status?: string;
    clientId?: number;
    vehicleId?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.clientId) queryParams.append('clientId', params.clientId.toString());
    if (params?.vehicleId) queryParams.append('vehicleId', params.vehicleId.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/sales?${queryString}` : '/sales';
    
    return this.request<any[]>(endpoint);
  }

  async getSale(id: number) {
    return this.request<any>(`/sales/${id}`);
  }

  async createSale(saleData: {
    clientId: number;
    vehicleId: number;
    price: number;
    downPayment: number;
    financingAmount?: number;
    financingTerm?: number;
    monthlyPayment?: number;
    paymentMethod: string;
    notes?: string;
    salespersonId?: number;
  }) {
    return this.request<any>('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  async updateSale(id: number, saleData: Partial<{
    price: number;
    downPayment: number;
    status: string;
    notes: string;
  }>) {
    return this.request<any>(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(saleData),
    });
  }

  async deleteSale(id: number) {
    return this.request<any>(`/sales/${id}`, {
      method: 'DELETE',
    });
  }

  async getSalesStats() {
    return this.request<any>('/sales/stats/overview');
  }

  // Workshop endpoints
  async getServices(params?: {
    page?: number;
    limit?: number;
    status?: string;
    serviceType?: string;
    clientId?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.serviceType) queryParams.append('serviceType', params.serviceType);
    if (params?.clientId) queryParams.append('clientId', params.clientId.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/workshop?${queryString}` : '/workshop';
    
    return this.request<any[]>(endpoint);
  }

  async getService(id: number) {
    return this.request<any>(`/workshop/${id}`);
  }

  async createService(serviceData: {
    clientId: number;
    vehicleId: number;
    serviceType: string;
    description: string;
    estimatedCost: number;
    laborHours?: number;
    mechanicId?: number;
    notes?: string;
  }) {
    return this.request<any>('/workshop', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(id: number, serviceData: Partial<{
    status: string;
    actualCost: number;
    estimatedCost: number;
    notes: string;
  }>) {
    return this.request<any>(`/workshop/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(id: number) {
    return this.request<any>(`/workshop/${id}`, {
      method: 'DELETE',
    });
  }

  async getWorkshopStats() {
    return this.request<any>('/workshop/stats/overview');
  }

  // Health check
  async healthCheck() {
    return this.request<any>('/health');
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;