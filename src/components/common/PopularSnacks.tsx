import React, { useState, useMemo, memo, useCallback, useEffect } from 'react';
import {
  ArrowRight,
  Flame,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import ProductCard from './ProductCard';
import { useCartStore } from '../../store/cartStore';
import type { Product } from '../../types';
import { usePopularProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';

// ─── Types & Interfaces ─────────────────────────────────────────────
export interface PopularSnacksProps {
  products?: Product[];
  title?: string;
  subtitle?: string;
  badgeText?: string;
  viewAllLink?: string;
  limit?: number;
  showCategoryTabs?: boolean;
  onAddToCart?: (product: Product, quantity: number) => void;
  onToggleFavorite?: (productId: string, isFavorite: boolean) => void;
  onQuickView?: (product: Product) => void;
  className?: string;
}

// ─── Loading Skeleton Grid ──────────────────────────────────────────
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-3xl p-4 border border-zinc-100 shadow-sm animate-pulse space-y-4"
      >
        <div className="w-full aspect-[4/3] bg-zinc-100 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-4 bg-zinc-100 rounded-md w-1/3" />
          <div className="h-5 bg-zinc-100 rounded-md w-3/4" />
          <div className="h-3 bg-zinc-100 rounded-md w-full" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <div className="h-6 bg-zinc-100 rounded-md w-1/3" />
          <div className="h-9 bg-zinc-100 rounded-xl w-16" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Category Tab Pill ──────────────────────────────────────────────
interface FilterTabProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: (id: string) => void;
  productCount: number;
}

const FilterTab = memo(function FilterTab({
  id,
  label,
  isActive,
  onClick,
  productCount,
}: FilterTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onClick(id)}
      className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
        isActive
          ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10'
          : 'bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 border border-zinc-200/70'
      }`}
    >
      {label}
      {productCount > 0 && (
        <span className="ml-1.5 text-[10px] font-bold text-zinc-400">
          ({productCount})
        </span>
      )}
    </button>
  );
});

// ─── Category Filter Tabs Configuration ─────────────────────────────
// These slugs should match your database category slugs
const FILTER_TABS = [
  { id: 'all', label: 'All Popular' },
  { id: 'pastries', label: 'Pastries & Pies' },
  { id: 'fried-snacks', label: 'Small Chops' },
  { id: 'protein-snacks', label: 'Suya & Grills' },
  { id: 'sweet-snacks', label: 'Sweet Treats' },
  { id: 'chips', label: 'Chips & Crisps' },
] as const;

type FilterTabId = (typeof FILTER_TABS)[number]['id'];

// ─── Main Popular Snacks Section ────────────────────────────────────
export const PopularSnacks: React.FC<PopularSnacksProps> = ({
  products: propProducts,
  title = 'Most Loved by Lagos Foodies',
  subtitle = 'The snacks our community orders again and again — handcrafted daily with authentic recipes.',
  badgeText = 'Trending This Week',
  viewAllLink = '/explore',
  limit = 4,
  showCategoryTabs = true,
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<FilterTabId>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the cart store for persistence
  const { addItem, items } = useCartStore();

  // Fetch popular products from API if not provided as props
  const { data: fetchedProducts, isLoading: isFetching, error, refetch } = usePopularProducts(limit);
  
  // Fetch categories to display proper names
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  // Use prop products if provided, otherwise use fetched products
  const products = propProducts || fetchedProducts || [];
  const categories = categoriesData || [];

  // Load cart items from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart-storage');
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        if (parsed?.state?.items) {
          // The store's persist middleware handles this automatically
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  const handleTabChange = useCallback((id: FilterTabId) => {
    setActiveTab(id);
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(timer);
  }, []);

  // Handle add to cart with persistence
  const handleAddToCart = useCallback((product: Product, quantity: number) => {
    addItem(product, quantity);
    
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  }, [addItem, onAddToCart]);

  // Handle toggle favorite with persistence
  const handleToggleFavorite = useCallback((productId: string, isFavorite: boolean) => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updatedFavorites;
    
    if (isFavorite) {
      if (!savedFavorites.includes(productId)) {
        updatedFavorites = [...savedFavorites, productId];
      } else {
        updatedFavorites = savedFavorites;
      }
    } else {
      updatedFavorites = savedFavorites.filter((id: string) => id !== productId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
    if (onToggleFavorite) {
      onToggleFavorite(productId, isFavorite);
    }
  }, [onToggleFavorite]);

  // ─── Get category slug from product ──────────────────────────────
  const getCategorySlug = (product: Product): string => {
    if (typeof product.category === 'string') {
      return product.category;
    }
    if (product.category && typeof product.category === 'object') {
      return (product.category as any).slug || '';
    }
    return '';
  };

  // ─── Count products per category ──────────────────────────────────
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p: Product) => {
      const slug = getCategorySlug(p);
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // ─── Filter products by selected tab ──────────────────────────────
  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') {
      return products.slice(0, limit);
    }
    
    // Filter by category slug
    const filtered = products.filter((p: Product) => {
      const slug = getCategorySlug(p);
      return slug === activeTab;
    });
    
    return filtered.slice(0, limit);
  }, [products, activeTab, limit]);

  // Get cart count for display
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Debug logging
  console.log('🔍 PopularSnacks Debug:');
  console.log('  Products count:', products.length);
  console.log('  Categories:', categories.map((c: { slug: any; }) => c.slug).join(', '));
  console.log('  Category counts:', categoryCounts);
  console.log('  Active tab:', activeTab);
  console.log('  Filtered products:', filteredProducts.length);

  // Show loading state
  if ((isFetching || categoriesLoading) && products.length === 0) {
    return (
      <section className={`relative py-18 sm:py-24 bg-gradient-to-b from-white via-zinc-50/40 to-white overflow-hidden ${className}`}>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductGridSkeleton />
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className={`relative py-18 sm:py-24 bg-gradient-to-b from-white via-zinc-50/40 to-white overflow-hidden ${className}`}>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 px-4 bg-red-50 rounded-3xl border border-red-200">
            <p className="text-sm font-bold text-red-600">Failed to load popular snacks</p>
            <p className="text-xs text-red-400 mt-1">Please try again later</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // If no products, show empty state
  if (products.length === 0) {
    return (
      <section className={`relative py-18 sm:py-24 bg-gradient-to-b from-white via-zinc-50/40 to-white overflow-hidden ${className}`}>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 px-4 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
            <Sparkles size={36} className="text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-700">No popular snacks available</p>
            <p className="text-xs text-zinc-400 mt-1">Check back shortly for our trending items.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="popular-snacks-heading"
      className={`relative py-18 sm:py-24 bg-gradient-to-b from-white via-zinc-50/40 to-white overflow-hidden ${className}`}
    >
      {/* ── Ambient Background Glows ───────────────────────────────── */}
      <div
        className="absolute top-1/3 -left-32 w-80 h-80 bg-orange-400/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 -right-32 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Header Row ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-700 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3.5 shadow-2xs">
              <Flame size={14} className="text-orange-600 animate-pulse" />
              <span>{badgeText}</span>
              {cartItemCount > 0 && (
                <span className="ml-1 bg-orange-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                  {cartItemCount} in cart
                </span>
              )}
            </div>

            {/* Main Heading */}
            <h2
              id="popular-snacks-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-[1.12]"
            >
              {title}
            </h2>

            {/* Subtitle */}
            <p className="text-zinc-500 text-sm sm:text-base lg:text-lg mt-3 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Desktop "View All" Button */}
          {viewAllLink && (
            <div className="hidden md:flex shrink-0">
              <a
                href={viewAllLink}
                className="group inline-flex items-center gap-2 text-sm font-bold text-zinc-800 hover:text-orange-600 bg-white hover:bg-orange-50/50 px-5 py-3 rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Layers size={16} className="text-orange-500" />
                <span>View Full Menu</span>
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </a>
            </div>
          )}
        </div>

        {/* ── Optional Category Filter Tabs ─────────────────────────── */}
        {showCategoryTabs && products.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 sm:pb-6 mb-6 sm:mb-8 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-1.5 sm:gap-2" role="tablist">
              {FILTER_TABS.map((tab) => {
                const count = categoryCounts[tab.id] || 0;
                // Only show tabs that have products (or "All" tab)
                if (tab.id !== 'all' && count === 0) {
                  return null;
                }
                return (
                  <FilterTab
                    key={tab.id}
                    id={tab.id}
                    label={tab.label}
                    isActive={activeTab === tab.id}
                    onClick={handleTabChange as (id: string) => void}
                    productCount={count}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── Product Grid ──────────────────────────────────────────── */}
        {isLoading ? (
          <ProductGridSkeleton />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {filteredProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart || handleAddToCart}
                onToggleFavorite={onToggleFavorite || handleToggleFavorite}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
            <Sparkles size={36} className="text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-700">
              No snacks in "{FILTER_TABS.find(t => t.id === activeTab)?.label || 'this category'}" yet
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Check back shortly or explore our full catalog.
            </p>
          </div>
        )}

        {/* ── Mobile View All Button ────────────────────────────────── */}
        {viewAllLink && products.length > 0 && (
          <div className="mt-10 text-center md:hidden">
            <a
              href={viewAllLink}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-zinc-800 bg-white border border-zinc-200/90 shadow-sm active:scale-[0.98]"
            >
              <span>Explore All {products.length}+ Snacks</span>
              <ChevronRight size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularSnacks;