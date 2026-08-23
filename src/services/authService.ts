import api from './api';
import type { LoginFormData, RegisterFormData, AuthUser } from '../types/auth';

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export const authService = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<AuthUser> {
    const response = await api.get<{ success: boolean; user: AuthUser }>('/auth/profile');
    return response.data.user;
  },

  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    const response = await api.put<{ success: boolean; user: AuthUser }>('/auth/profile', data);
    return response.data.user;
  },

  logout() {
    localStorage.removeItem('naija-snacks-token');
    localStorage.removeItem('naija-snacks-user');
  },
};