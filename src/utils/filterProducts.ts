import type { Product } from '../types';

export type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';

export interface FilterOptions {
  searchQuery: string;
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  minRating: number;
  inStockOnly: boolean;
  sortBy: SortOption;
}

export const filterAndSortProducts = (
  products: Product[],
  filters: FilterOptions
): Product[] => {
  let filtered = [...products];

  // Search filter
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        String(product.category).toLowerCase().includes(query) ||
        product.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(query)
        )
    );
  }

  // Category filter
  if (filters.categories.length > 0) {
    filtered = filtered.filter(product =>
      filters.categories.includes(String(product.category))
    );
  }

  // Price range filter
  filtered = filtered.filter(
    product =>
      product.price >= filters.priceRange.min &&
      product.price <= filters.priceRange.max
  );

  // Rating filter
  if (filters.minRating > 0) {
    filtered = filtered.filter(product => product.rating >= filters.minRating);
  }

  // Stock filter
  if (filters.inStockOnly) {
    filtered = filtered.filter(product => product.stock > 0);
  }

  // Sorting
  switch (filters.sortBy) {
    case 'popular':
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    default:
      // 'newest' - keep original order for now
      break;
  }

  return filtered;
};