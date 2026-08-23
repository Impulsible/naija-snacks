import React from 'react';
import { X, Star, SlidersHorizontal } from 'lucide-react';
import { categories } from '../../data/categories';
import type { FilterOptions } from '../../utils/filterProducts';

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onClose,
}) => {
  const handleCategoryToggle = (categorySlug: string) => {
    const updatedCategories = filters.categories.includes(categorySlug)
      ? filters.categories.filter(c => c !== categorySlug)
      : [...filters.categories, categorySlug];
    
    onFilterChange({
      ...filters,
      categories: updatedCategories,
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({
      ...filters,
      priceRange: { min, max },
    });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({
      ...filters,
      minRating: filters.minRating === rating ? 0 : rating,
    });
  };

  const handleStockChange = (inStock: boolean) => {
    onFilterChange({
      ...filters,
      inStockOnly: inStock,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: filters.searchQuery,
      categories: [],
      priceRange: { min: 0, max: 5000 },
      minRating: 0,
      inStockOnly: false,
      sortBy: filters.sortBy,
    });
  };

  const sidebarContent = (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-xl flex items-center gap-2">
          <SlidersHorizontal size={20} />
          Filters
        </h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-primary hover:text-primary-dark font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-semibold mb-4">Categories</h4>
        <div className="space-y-3">
          {categories.map(category => (
            <label key={category.id} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.categories.includes(category.slug)}
                onChange={() => handleCategoryToggle(category.slug)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="ml-3 text-dark group-hover:text-primary transition-colors">
                {category.name}
              </span>
              <span className="ml-auto text-sm text-muted">
                ({category.productCount})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold mb-4">Price Range</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={filters.priceRange.min}
              onChange={(e) => handlePriceChange(Number(e.target.value), filters.priceRange.max)}
              className="input-field py-2"
              placeholder="Min"
              min={0}
            />
            <span className="text-muted">to</span>
            <input
              type="number"
              value={filters.priceRange.max}
              onChange={(e) => handlePriceChange(filters.priceRange.min, Number(e.target.value))}
              className="input-field py-2"
              placeholder="Max"
              min={0}
            />
          </div>
          
          {/* Quick price buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePriceChange(0, 1000)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              Under ₦1,000
            </button>
            <button
              onClick={() => handlePriceChange(1000, 2000)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              ₦1,000 - ₦2,000
            </button>
            <button
              onClick={() => handlePriceChange(2000, 3000)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              ₦2,000 - ₦3,000
            </button>
            <button
              onClick={() => handlePriceChange(3000, 5000)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              ₦3,000+
            </button>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-semibold mb-4">Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                filters.minRating === rating
                  ? 'bg-primary-light border border-primary'
                  : 'hover:bg-cream'
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < rating ? 'text-golden fill-golden' : 'text-muted-light'}
                  />
                ))}
              </div>
              <span className="text-sm">& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="font-semibold mb-4">Availability</h4>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => handleStockChange(e.target.checked)}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <span className="ml-3">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto">
            <div className="p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-cream rounded-full transition-colors"
                aria-label="Close filters"
              >
                <X size={24} />
              </button>
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;