// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../services/api';

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

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await productApi.getProducts(filters);
      return {
        products: response.products || [],
        pagination: response.pagination,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await productApi.getProductBySlug(slug);
      return response.product;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async () => {
      try {
        const response = await productApi.getProducts({ 
          featured: true, 
          limit,
          sortBy: 'rating',
          order: 'desc'
        });
        
        // If no featured products, fallback to all products
        if (!response.products || response.products.length === 0) {
          console.warn('No featured products found, falling back to all products');
          const fallbackResponse = await productApi.getProducts({ 
            limit,
            sortBy: 'rating',
            order: 'desc'
          });
          return fallbackResponse.products || [];
        }
        
        return response.products || [];
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Fallback: get any products
        try {
          const fallbackResponse = await productApi.getProducts({ 
            limit,
            sortBy: 'rating',
            order: 'desc'
          });
          return fallbackResponse.products || [];
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          return [];
        }
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const usePopularProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: ['products', 'popular', limit],
    queryFn: async () => {
      try {
        const response = await productApi.getProducts({ 
          popular: true, 
          limit,
          sortBy: 'reviewCount',
          order: 'desc'
        });
        
        if (!response.products || response.products.length === 0) {
          const fallbackResponse = await productApi.getProducts({ 
            limit,
            sortBy: 'reviewCount',
            order: 'desc'
          });
          return fallbackResponse.products || [];
        }
        
        return response.products || [];
      } catch (error) {
        console.error('Error fetching popular products:', error);
        try {
          const fallbackResponse = await productApi.getProducts({ 
            limit,
            sortBy: 'reviewCount',
            order: 'desc'
          });
          return fallbackResponse.products || [];
        } catch (fallbackError) {
          return [];
        }
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useProductsByCategory = (categorySlug: string, limit: number = 12) => {
  return useQuery({
    queryKey: ['products', 'category', categorySlug, limit],
    queryFn: async () => {
      try {
        const response = await productApi.getProducts({ 
          category: categorySlug, 
          limit 
        });
        return {
          products: response.products || [],
          category: response.category,
        };
      } catch (error) {
        console.error('Error fetching products by category:', error);
        return {
          products: [],
          category: null,
        };
      }
    },
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000,
  });
};

// ─── Get Product by ID ──────────────────────────────────────────────
export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productApi.getProductById(id);
      return response.product;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};