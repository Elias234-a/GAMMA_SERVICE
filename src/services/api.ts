// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

// Client Types
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  documentType: 'CC' | 'CE' | 'NIT' | 'PP';
  address: string;
  city: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone: string;
  document: string;
  documentType: 'CC' | 'CE' | 'NIT' | 'PP';
  address?: string;
  city: string;
  department: string;
}

// Vehicle Types
export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  plate: string;
  engineNumber: string;
  mileage: number;
  price: number;
  cost: number;
  status: 'Disponible' | 'Vendido' | 'Reservado' | 'En Reparación';
  fuelType: string;
  transmission: string;
  engineSize: string;
  doors: number;
  seats: number;
  description: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleRequest {
  brand: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  plate?: string;
  engineNumber?: string;
  mileage?: number;
  price: number;
  cost: number;
  status?: 'Disponible' | 'Vendido' | 'Reservado' | 'En Reparación';
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
  doors?: number;
  seats?: number;
  description?: string;
  images?: string[];
}

// Sales Types
export interface Sale {
  id: number;
  clientId: number;
  vehicleId: number;
  clientName: string;
  vehicleInfo: string;
  salePrice: number;
  downPayment: number;
  financingAmount: number;
  financingTerm: number;
  monthlyPayment: number;
  saleDate: string;
  status: 'Pendiente' | 'Completada' | 'Cancelada';
  salesperson: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleRequest {
  clientId: number;
  vehicleId: number;
  salePrice: number;
  downPayment: number;
  financingAmount: number;
  financingTerm: number;
  monthlyPayment: number;
  saleDate: string;
  status?: 'Pendiente' | 'Completada' | 'Cancelada';
  salesperson?: string;
  notes?: string;
}

// Workshop Types
export interface WorkshopOrder {
  id: number;
  clientId: number;
  vehicleId: number;
  clientName: string;
  vehicleInfo: string;
  orderNumber: string;
  serviceType: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  estimatedDuration: number;
  actualDuration: number;
  status: 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';
  priority: 'Baja' | 'Normal' | 'Alta' | 'Urgente';
  assignedMechanic: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkshopOrderRequest {
  clientId: number;
  vehicleId: number;
  serviceType: string;
  description: string;
  estimatedCost: number;
  estimatedDuration: number;
  priority?: 'Baja' | 'Normal' | 'Alta' | 'Urgente';
  assignedMechanic?: string;
  startDate?: string;
}

// Inventory Types
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplier: string;
  location: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemRequest {
  name: string;
  category: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplier: string;
  location?: string;
  description?: string;
}

// Reports Types
export interface SalesReport {
  period: string;
  summary: {
    totalSales: number;
    totalVehicles: number;
    averageSale: number;
  };
  chartData: Array<{
    month: string;
    sales: number;
    vehicles: number;
  }>;
  generatedAt: string;
}

export interface InventoryReport {
  summary: {
    totalItems: number;
    totalValue: number;
    categories: number;
  };
  chartData: Array<{
    category: string;
    quantity: number;
    value: number;
  }>;
  generatedAt: string;
}

export interface WorkshopReport {
  period: string;
  summary: {
    totalOrders: number;
    completedOrders: number;
    completionRate: number;
  };
  chartData: Array<{
    status: string;
    count: number;
  }>;
  generatedAt: string;
}

export interface DashboardReport {
  sales: {
    currentMonth: number;
    vehiclesSold: number;
    growth: number;
  };
  inventory: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
  };
  workshop: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
  };
  clients: {
    total: number;
    newThisMonth: number;
    active: number;
  };
  generatedAt: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
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
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  async verifyToken(): Promise<User> {
    const response = await this.request<User>('/auth/verify');
    return response.data!;
  }

  // Client methods
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<Client[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `/clients${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request<Client[]>(endpoint);
  }

  async getClient(id: number): Promise<Client> {
    const response = await this.request<Client>(`/clients/${id}`);
    return response.data!;
  }

  async createClient(client: CreateClientRequest): Promise<Client> {
    const response = await this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
    return response.data!;
  }

  async updateClient(id: number, client: Partial<CreateClientRequest>): Promise<Client> {
    const response = await this.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
    return response.data!;
  }

  async deleteClient(id: number): Promise<void> {
    await this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Vehicle methods
  async getVehicles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    brand?: string;
  }): Promise<ApiResponse<Vehicle[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.brand) queryParams.append('brand', params.brand);

    const endpoint = `/vehicles${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request<Vehicle[]>(endpoint);
  }

  async getVehicle(id: number): Promise<Vehicle> {
    const response = await this.request<Vehicle>(`/vehicles/${id}`);
    return response.data!;
  }

  async createVehicle(vehicle: CreateVehicleRequest): Promise<Vehicle> {
    const response = await this.request<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
    return response.data!;
  }

  async updateVehicle(id: number, vehicle: Partial<CreateVehicleRequest>): Promise<Vehicle> {
    const response = await this.request<Vehicle>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    });
    return response.data!;
  }

  async deleteVehicle(id: number): Promise<void> {
    await this.request(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  // Sales methods
  async getSales(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Sale[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = `/sales${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request<Sale[]>(endpoint);
  }

  async getSale(id: number): Promise<Sale> {
    const response = await this.request<Sale>(`/sales/${id}`);
    return response.data!;
  }

  async createSale(sale: CreateSaleRequest): Promise<Sale> {
    const response = await this.request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
    return response.data!;
  }

  async updateSale(id: number, sale: Partial<CreateSaleRequest>): Promise<Sale> {
    const response = await this.request<Sale>(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sale),
    });
    return response.data!;
  }

  async deleteSale(id: number): Promise<void> {
    await this.request(`/sales/${id}`, {
      method: 'DELETE',
    });
  }

  // Workshop methods
  async getWorkshopOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }): Promise<ApiResponse<WorkshopOrder[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);

    const endpoint = `/workshop${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request<WorkshopOrder[]>(endpoint);
  }

  async getWorkshopOrder(id: number): Promise<WorkshopOrder> {
    const response = await this.request<WorkshopOrder>(`/workshop/${id}`);
    return response.data!;
  }

  async createWorkshopOrder(order: CreateWorkshopOrderRequest): Promise<WorkshopOrder> {
    const response = await this.request<WorkshopOrder>('/workshop', {
      method: 'POST',
      body: JSON.stringify(order),
    });
    return response.data!;
  }

  async updateWorkshopOrder(id: number, order: Partial<CreateWorkshopOrderRequest>): Promise<WorkshopOrder> {
    const response = await this.request<WorkshopOrder>(`/workshop/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
    return response.data!;
  }

  async deleteWorkshopOrder(id: number): Promise<void> {
    await this.request(`/workshop/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory methods
  async getInventory(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStock?: boolean;
  }): Promise<ApiResponse<InventoryItem[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.lowStock) queryParams.append('lowStock', params.lowStock.toString());

    const endpoint = `/inventory${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request<InventoryItem[]>(endpoint);
  }

  async getInventoryItem(id: number): Promise<InventoryItem> {
    const response = await this.request<InventoryItem>(`/inventory/${id}`);
    return response.data!;
  }

  async createInventoryItem(item: CreateInventoryItemRequest): Promise<InventoryItem> {
    const response = await this.request<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return response.data!;
  }

  async updateInventoryItem(id: number, item: Partial<CreateInventoryItemRequest>): Promise<InventoryItem> {
    const response = await this.request<InventoryItem>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return response.data!;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await this.request(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  // Reports methods
  async getSalesReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SalesReport> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = `/reports/sales${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await this.request<SalesReport>(endpoint);
    return response.data!;
  }

  async getInventoryReport(params?: {
    lowStock?: boolean;
  }): Promise<InventoryReport> {
    const queryParams = new URLSearchParams();
    if (params?.lowStock) queryParams.append('lowStock', params.lowStock.toString());

    const endpoint = `/reports/inventory${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await this.request<InventoryReport>(endpoint);
    return response.data!;
  }

  async getWorkshopReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<WorkshopReport> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = `/reports/workshop${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await this.request<WorkshopReport>(endpoint);
    return response.data!;
  }

  async getDashboardReport(): Promise<DashboardReport> {
    const response = await this.request<DashboardReport>('/reports/dashboard');
    return response.data!;
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual methods for convenience
export const {
  login,
  logout,
  verifyToken,
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getWorkshopOrders,
  getWorkshopOrder,
  createWorkshopOrder,
  updateWorkshopOrder,
  deleteWorkshopOrder,
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getSalesReport,
  getInventoryReport,
  getWorkshopReport,
  getDashboardReport,
} = apiClient;