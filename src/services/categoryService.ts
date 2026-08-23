import api from './api';
import { type Category } from '../types';

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<CategoriesResponse>('/categories');
    return response.data.categories;
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await api.get<{ success: boolean; category: Category }>(`/categories/${slug}`);
    return response.data.category;
  },
};