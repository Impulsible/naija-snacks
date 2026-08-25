import api from './api';

// ─── Types ──────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    additionalInfo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  success: boolean;
  users: AuthUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: {
    user: number;
    admin: number;
  };
}

// ─── Service ────────────────────────────────────────────────────────
export const userService = {
  // ─── Get all users with pagination ──────────────────────────────
  async getUsers(page: number = 1, limit: number = 10): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // ─── Get user by ID ──────────────────────────────────────────────
  async getUserById(id: string): Promise<AuthUser> {
    const response = await api.get<{ success: boolean; user: AuthUser }>(`/users/${id}`);
    return response.data.user;
  },

  // ─── Get all customers (users with role 'user') ─────────────────
  async getAdminCustomers(): Promise<AuthUser[]> {
    const response = await api.get<{ success: boolean; users: AuthUser[] }>('/users/customers');
    return response.data.users;
  },

  // ─── Update user ─────────────────────────────────────────────────
  async updateUser(id: string, data: Partial<AuthUser>): Promise<AuthUser> {
    const response = await api.put<{ success: boolean; user: AuthUser }>(`/users/${id}`, data);
    return response.data.user;
  },

  // ─── Delete user ─────────────────────────────────────────────────
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // ─── Get user statistics ─────────────────────────────────────────
  async getUserStats(): Promise<UserStats> {
    const response = await api.get<{ success: boolean; stats: UserStats }>('/users/stats');
    return response.data.stats;
  },

  // ─── Update user role ────────────────────────────────────────────
  async updateUserRole(id: string, role: 'user' | 'admin'): Promise<AuthUser> {
    const response = await api.patch<{ success: boolean; user: AuthUser }>(`/users/${id}/role`, { role });
    return response.data.user;
  },

  // ─── Toggle user active status ──────────────────────────────────
  async toggleUserStatus(id: string): Promise<AuthUser> {
    const response = await api.patch<{ success: boolean; user: AuthUser }>(`/users/${id}/toggle-status`);
    return response.data.user;
  },
};

export default userService;