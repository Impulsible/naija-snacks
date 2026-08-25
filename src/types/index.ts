// src/types/index.ts

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  images?: string[]; // Optional array of image URLs
  category: string | Category;
  rating: number;
  reviewCount: number;
  ingredients: string[];
  allergens: string[];
  stock: number;
  featured: boolean;
  popular: boolean;
  // Optional fields that might come from API
  originalPrice?: number;
  isNew?: boolean;
  isSpicy?: boolean;
  prepTime?: string;
  inStock?: boolean;
  stockCount?: number;
  createdAt?: string;
  updatedAt?: string;
  // MongoDB fields
  _id?: string;
  __v?: number;
  isActive?: boolean;
}

export interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  description?: string;
  isActive?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'user';
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  favorites?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  user: string | User;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paymentMethod: 'card' | 'cash' | 'transfer';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── Auth Types ──────────────────────────────────────────────────────
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role?: 'customer' | 'user';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// ─── Filter Types ────────────────────────────────────────────────────
export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  featured?: boolean;
  popular?: boolean;
  inStock?: boolean;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}