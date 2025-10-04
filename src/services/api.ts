// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      return parsed.token;
    } catch (error) {
      console.error('Error parsing user token:', error);
    }
  }
  return null;
};

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(error.error || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  verify: async () => {
    return apiRequest('/auth/verify', {
      method: 'GET',
    });
  },
  
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

// Vehicles API
export const vehiclesApi = {
  getAll: async (params?: { estado?: string; tipo?: string; marca?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/vehicles${query}`, { method: 'GET' });
  },
  
  getById: async (id: number) => {
    return apiRequest(`/vehicles/${id}`, { method: 'GET' });
  },
  
  create: async (vehicle: any) => {
    return apiRequest('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  },
  
  update: async (id: number, vehicle: any) => {
    return apiRequest(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    });
  },
  
  delete: async (id: number) => {
    return apiRequest(`/vehicles/${id}`, { method: 'DELETE' });
  },
};

// Clients API
export const clientsApi = {
  getAll: async (params?: { search?: string; ciudad?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/clients${query}`, { method: 'GET' });
  },
  
  getById: async (id: number) => {
    return apiRequest(`/clients/${id}`, { method: 'GET' });
  },
  
  create: async (client: any) => {
    return apiRequest('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  },
  
  update: async (id: number, client: any) => {
    return apiRequest(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  },
  
  delete: async (id: number) => {
    return apiRequest(`/clients/${id}`, { method: 'DELETE' });
  },
};

// Sales API
export const salesApi = {
  getAll: async (params?: { estado?: string; fechaInicio?: string; fechaFin?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/sales${query}`, { method: 'GET' });
  },
  
  getById: async (id: number) => {
    return apiRequest(`/sales/${id}`, { method: 'GET' });
  },
  
  create: async (sale: any) => {
    return apiRequest('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  },
  
  update: async (id: number, sale: any) => {
    return apiRequest(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sale),
    });
  },
  
  delete: async (id: number) => {
    return apiRequest(`/sales/${id}`, { method: 'DELETE' });
  },
};

// Workshop API
export const workshopApi = {
  getAll: async (params?: { estado?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/workshop${query}`, { method: 'GET' });
  },
  
  getById: async (id: number) => {
    return apiRequest(`/workshop/${id}`, { method: 'GET' });
  },
  
  create: async (order: any) => {
    return apiRequest('/workshop', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },
  
  update: async (id: number, order: any) => {
    return apiRequest(`/workshop/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  },
  
  delete: async (id: number) => {
    return apiRequest(`/workshop/${id}`, { method: 'DELETE' });
  },
};

// Inventory API
export const inventoryApi = {
  getAll: async (params?: { categoria?: string; search?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/inventory${query}`, { method: 'GET' });
  },
  
  getById: async (id: number) => {
    return apiRequest(`/inventory/${id}`, { method: 'GET' });
  },
  
  create: async (item: any) => {
    return apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },
  
  update: async (id: number, item: any) => {
    return apiRequest(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },
  
  delete: async (id: number) => {
    return apiRequest(`/inventory/${id}`, { method: 'DELETE' });
  },
};

export default {
  auth: authApi,
  vehicles: vehiclesApi,
  clients: clientsApi,
  sales: salesApi,
  workshop: workshopApi,
  inventory: inventoryApi,
};
