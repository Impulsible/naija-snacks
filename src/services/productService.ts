import api from './api';
import type { Product } from '../types';

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

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
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ProductsResponse>(`/products?${params.toString()}`);
    return response.data;
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const response = await api.get<{ success: boolean; product: Product }>(`/products/${slug}`);
    return response.data.product;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await this.getProducts({ featured: true, limit: 4 });
    return response.products;
  },

  async getPopularProducts(): Promise<Product[]> {
    const response = await this.getProducts({ popular: true, limit: 4 });
    return response.products;
  },
};