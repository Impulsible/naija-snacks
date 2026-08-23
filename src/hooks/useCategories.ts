// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../services/api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryApi.getCategories();
      return response.categories;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const response = await categoryApi.getCategoryBySlug(slug);
      return response.category;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
};