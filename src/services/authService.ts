import apiClient from '@/services/apiClient';

export type User = {
  id: string;
  email: string;
  name: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type AuthResponse = {
  user: User;
  token: string;
  refreshToken?: string;
};

const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Registrar un nuevo usuario
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      // Opcional: notificar al backend para invalidar el token
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
      // Continuar con el cierre de sesión local incluso si falla la llamada al servidor
    }
  },

  /**
   * Obtener el usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      return null;
    }
  },

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile', userData);
    return response.data;
  },

  /**
   * Solicitar restablecimiento de contraseña
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * Restablecer contraseña
   */
  async resetPassword(token: string, password: string, passwordConfirmation: string): Promise<void> {
    await apiClient.post('/auth/reset-password', {
      token,
      password,
      password_confirmation: passwordConfirmation,
    });
  },

  /**
   * Verificar token de autenticación
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/verify-token', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { valid: true, user: response.data.user };
    } catch (error) {
      return { valid: false };
    }
  },
};

export default authService;
