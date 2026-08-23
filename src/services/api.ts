// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for serverless
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('naija-snacks-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('naija-snacks-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Product API ──────────────────────────────────────────────────────
export const productApi = {
  getProducts: async (params?: any) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getProductBySlug: async (slug: string) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },
  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured');
    return response.data;
  },
  getPopularProducts: async () => {
    const response = await api.get('/products/popular');
    return response.data;
  },
  getProductsByCategory: async (slug: string) => {
    const response = await api.get(`/products/category/${slug}`);
    return response.data;
  },
  createProduct: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// ─── Category API ────────────────────────────────────────────────────
export const categoryApi = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getCategoryBySlug: async (slug: string) => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },
  getCategoryById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  createCategory: async (categoryData: any) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  updateCategory: async (id: string, categoryData: any) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// ─── Auth API ────────────────────────────────────────────────────────
export const authApi = {
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('naija-snacks-token', response.data.token);
    }
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('naija-snacks-token');
  },
};

// ─── User API ────────────────────────────────────────────────────────
export const userApi = {
  getFavorites: async () => {
    const response = await api.get('/users/favorites');
    return response.data;
  },
  addToFavorites: async (productId: string) => {
    const response = await api.post(`/users/favorites/${productId}`);
    return response.data;
  },
  removeFromFavorites: async (productId: string) => {
    const response = await api.delete(`/users/favorites/${productId}`);
    return response.data;
  },
  checkFavorite: async (productId: string) => {
    const response = await api.get(`/users/favorites/check/${productId}`);
    return response.data;
  },
};

export default api;