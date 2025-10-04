// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// HTTP Methods enum
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// Request configuration interface
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
}

// Auth token management
class AuthTokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Main API Client class
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.HEADERS;
  }

  private async request<T>(
    endpoint: string,
    method: HttpMethod = HttpMethod.GET,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Prepare headers
    const headers = {
      ...this.defaultHeaders,
      ...AuthTokenManager.getAuthHeaders(),
      ...config?.headers,
    };

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for methods that support it
    if (data && [HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH].includes(method)) {
      requestOptions.body = JSON.stringify(data);
    }

    // Add query parameters for GET requests
    if (config?.params && method === HttpMethod.GET) {
      const searchParams = new URLSearchParams(config.params);
      url.concat(`?${searchParams.toString()}`);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      // Handle non-JSON responses
      if (!response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const responseData = await response.json();

      // Handle HTTP error status codes
      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || responseData.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message,
        pagination: responseData.pagination,
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // HTTP method helpers
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HttpMethod.GET, undefined, config);
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HttpMethod.POST, data, config);
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HttpMethod.PUT, data, config);
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HttpMethod.PATCH, data, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HttpMethod.DELETE, undefined, config);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export { AuthTokenManager };