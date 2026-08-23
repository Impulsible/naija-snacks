import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Star,
  Flame,
  Clock,
  Sparkles,
  ShoppingBag,
  Check,
  RotateCcw,
  ChevronDown,
  Heart,
  Plus,
  PackageX,
} from 'lucide-react';
import Container from '../../components/layout/Container';
import type { Product, Category } from '../../types';
import { formatCurrency } from '../../lib/format';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';

// ─── Filter Options State Model ──────────────────────────────────────
export interface ExploreFilters {
  searchQuery: string;
  categories: string[];
  priceRange: { min: number; max: number };
  minRating: number;
  inStockOnly: boolean;
  sortBy: 'popular' | 'rating' | 'price-low' | 'price-high' | 'newest';
}

interface ExplorePageProps {
  onAddToCart?: (product: Product, quantity: number) => void;
  onToggleFavorite?: (productId: string) => void;
}

const PRICE_BOUNDS = { min: 0, max: 10000 };

// ─── Sort Dropdown Menu ──────────────────────────────────────────────
const SortDropdown: React.FC<{
  value: ExploreFilters['sortBy'];
  onChange: (val: ExploreFilters['sortBy']) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortLabels: Record<ExploreFilters['sortBy'], string> = {
    popular: 'Most Popular',
    rating: 'Highest Rated',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    newest: 'Newest Arrivals',
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-amber-950/10 hover:border-amber-900/20 text-xs font-bold text-stone-800 shadow-2xs transition-all"
        aria-label="Sort products"
      >
        <ArrowUpDown size={13} className="text-primary" />
        <span className="text-stone-500 hidden sm:inline">Sort by:</span>
        <span>{sortLabels[value]}</span>
        <ChevronDown size={13} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#FFFDF9] rounded-2xl shadow-xl border border-amber-950/10 py-1.5 z-30 animate-[scaleUp_0.15s_ease-out]">
          {(Object.keys(sortLabels) as Array<ExploreFilters['sortBy']>).map((key) => (
            <button
              key={key}
              onClick={() => {
                onChange(key);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors ${
                value === key
                  ? 'bg-amber-100/60 text-primary font-black'
                  : 'text-stone-700 hover:bg-amber-50/60'
              }`}
            >
              <span>{sortLabels[key]}</span>
              {value === key && <Check size={13} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Filter Sidebar Content ──────────────────────────────────────────
const FilterSidebarContent: React.FC<{
  filters: ExploreFilters;
  categories: Category[];
  onChange: (newFilters: ExploreFilters) => void;
  onClear: () => void;
}> = ({ filters, categories, onChange, onClear }) => {
  const toggleCategory = (slug: string) => {
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    onChange({ ...filters, categories: next });
  };

  return (
    <div className="space-y-6 text-stone-900">
      {/* Categories Multi-Select */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-900/60">
            Categories
          </h4>
          {filters.categories.length > 0 && (
            <button
              onClick={() => onChange({ ...filters, categories: [] })}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-2">
          {categories.map((cat) => {
            const isChecked = filters.categories.includes(cat.slug);
            return (
              <label
                key={cat.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all border ${
                  isChecked
                    ? 'bg-amber-100/60 border-primary/30 text-stone-900'
                    : 'hover:bg-amber-50/40 border-transparent text-stone-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.slug)}
                    className="w-4 h-4 rounded-md text-primary border-amber-950/20 focus:ring-primary focus:ring-offset-0"
                  />
                  <span className="text-xs font-bold">{cat.name}</span>
                </div>
                <span className="text-[10px] font-bold text-stone-400 bg-white/80 px-2 py-0.5 rounded-md border border-amber-950/5">
                  {cat.productCount || 0}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="pt-4 border-t border-amber-950/[0.08]">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-900/60 mb-3">
          Max Price: {formatCurrency(filters.priceRange.max)}
        </h4>
        <input
          type="range"
          min={PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          step={200}
          value={filters.priceRange.max}
          onChange={(e) =>
            onChange({
              ...filters,
              priceRange: { min: filters.priceRange.min, max: Number(e.target.value) },
            })
          }
          className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 mt-2">
          <span>{formatCurrency(PRICE_BOUNDS.min)}</span>
          <span>{formatCurrency(PRICE_BOUNDS.max)}</span>
        </div>
      </div>

      {/* Minimum Rating Selector */}
      <div className="pt-4 border-t border-amber-950/[0.08]">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-900/60 mb-3">
          Minimum Rating
        </h4>
        <div className="grid grid-cols-4 gap-1.5">
          {[4.5, 4.0, 3.5, 0].map((rating) => {
            const isSelected = filters.minRating === rating;
            return (
              <button
                key={rating}
                onClick={() => onChange({ ...filters, minRating: rating })}
                className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center gap-1 border transition-all ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-stone-700 border-amber-950/10'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  <Star size={11} className={isSelected ? 'fill-white' : 'fill-amber-400 text-amber-400'} />
                  <span>{rating === 0 ? 'Any' : `${rating}+`}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock & Freshness Availability Switch */}
      <div className="pt-4 border-t border-amber-950/[0.08]">
        <label className="flex items-center justify-between p-3 rounded-2xl bg-white border border-amber-950/10 cursor-pointer hover:border-amber-900/20 transition-all">
          <div className="flex items-center gap-2.5">
            <Clock size={16} className="text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-stone-900">In-Stock Only</p>
              <p className="text-[10px] text-stone-400">Ready to dispatch now</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className="w-4 h-4 rounded text-primary focus:ring-0"
          />
        </label>
      </div>

      {/* Clear Filters CTA */}
      <button
        onClick={onClear}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
      >
        <RotateCcw size={13} />
        <span>Reset All Filters</span>
      </button>
    </div>
  );
};

// ─── Product Card (Grid / List Adaptive) ─────────────────────────────
const ProductCard: React.FC<{
  product: Product;
  viewMode: 'grid' | 'list';
  onToggleFavorite?: (productId: string) => void;
}> = ({ product, viewMode, onToggleFavorite }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  // Use cart store directly
  const { addItem } = useCartStore();

  const handleAdd = () => {
    // Add to cart using the store
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const isOutOfStock = product.stock <= 0;

  // Safe category name with proper type checking
  const categoryName = useMemo(() => {
    if (!product.category) return 'Snack';
    if (typeof product.category === 'string') return product.category;
    if (typeof product.category === 'object' && product.category !== null) {
      const cat = product.category as any;
      if (cat.name && typeof cat.name === 'string') return cat.name;
      if (cat.slug && typeof cat.slug === 'string') return cat.slug;
    }
    return 'Snack';
  }, [product.category]);

  // Safe description text with proper type checking
  const descriptionText = useMemo(() => {
    if (!product.description) return '';
    if (typeof product.description === 'string') return product.description;
    if (typeof product.description === 'object' && product.description !== null) {
      const desc = product.description as any;
      if (desc.text && typeof desc.text === 'string') return desc.text;
    }
    return '';
  }, [product.description]);

  if (viewMode === 'list') {
    return (
      <div className="group relative flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 bg-white rounded-3xl border border-amber-950/10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-amber-50 shrink-0 border border-amber-950/5">
            {product.image && !imgError ? (
              <img
                src={product.image}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-primary text-xl">
                {product.name.charAt(0)}
              </div>
            )}
            {product.featured && (
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-primary text-white text-[8px] font-black rounded-md uppercase">
                Hot
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 mb-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-stone-800">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-stone-400">({product.reviewCount})</span>
            </div>
            <Link to={`/product/${product.slug}`} className="hover:underline">
              <h3 className="font-heading font-black text-sm sm:text-base text-stone-900 truncate">
                {product.name}
              </h3>
            </Link>
            {descriptionText && (
              <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{descriptionText}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-950/5 shrink-0">
          <div className="text-left sm:text-right">
            <span className="text-xs font-black text-stone-400 block uppercase text-[9px]">Price</span>
            <span className="text-base sm:text-lg font-black text-stone-900">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-primary hover:bg-primary-dark text-white shadow-xs'
            }`}
          >
            {isOutOfStock ? (
              <span>Sold Out</span>
            ) : isAdded ? (
              <>
                <Check size={14} />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Grid Mode Card
  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-3xl p-3.5 sm:p-4 border border-amber-950/10 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
      {/* Top Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-amber-50/50 mb-3 border border-amber-950/5">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-primary text-3xl bg-amber-50">
            {product.name.charAt(0)}
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => {
            setIsFavorite(!isFavorite);
            onToggleFavorite?.(product.id);
          }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs text-stone-600 hover:text-red-500 transition-colors"
          aria-label="Favorite"
        >
          <Heart size={14} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
        </button>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.featured && (
            <span className="inline-flex items-center gap-1 bg-primary text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              <Flame size={9} /> Bestseller
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
              Only {product.stock} Left
            </span>
          )}
        </div>
      </div>

      {/* Content Details */}
      <div className="space-y-1.5 px-0.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold text-amber-900/50 uppercase tracking-wider">
            {categoryName}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>

        <Link to={`/product/${product.slug}`} className="block group-hover:text-primary transition-colors">
          <h3 className="font-heading font-black text-sm text-stone-900 truncate">
            {product.name}
          </h3>
        </Link>

        {descriptionText && (
          <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed font-medium">
            {descriptionText}
          </p>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 mt-3 border-t border-amber-950/[0.06] flex items-center justify-between gap-2">
        <div>
          <span className="text-xs sm:text-sm font-black text-stone-900 block">
            {formatCurrency(product.price)}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${
            isOutOfStock
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : isAdded
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-primary hover:bg-primary-dark text-white shadow-xs'
          }`}
        >
          {isOutOfStock ? (
            <span>Sold Out</span>
          ) : isAdded ? (
            <>
              <Check size={13} />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus size={13} strokeWidth={3} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Main Explore Page Component ─────────────────────────────────────
export const ExplorePage: React.FC<ExplorePageProps> = ({
  onToggleFavorite,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ─── Fetch Categories from API ────────────────────────────────────
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useCategories();
  
  // Properly type the categories data
  const categories: Category[] = useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData as Category[];
    if (typeof categoriesData === 'object' && 'data' in categoriesData && Array.isArray((categoriesData as any).data)) {
      return (categoriesData as any).data;
    }
    return [];
  }, [categoriesData]);

  // ─── Initialize filters from URL parameters ──────────────────────
  const [filters, setFilters] = useState<ExploreFilters>(() => {
    const search = searchParams.get('search') || '';
    const cat = searchParams.get('category');
    const minP = Number(searchParams.get('minPrice')) || PRICE_BOUNDS.min;
    const maxP = Number(searchParams.get('maxPrice')) || PRICE_BOUNDS.max;
    const rating = Number(searchParams.get('rating')) || 0;
    const inStock = searchParams.get('inStock') === 'true';
    const sort = (searchParams.get('sort') as ExploreFilters['sortBy']) || 'popular';

    return {
      searchQuery: search,
      categories: cat ? cat.split(',') : [],
      priceRange: { min: minP, max: maxP },
      minRating: rating,
      inStockOnly: inStock,
      sortBy: sort,
    };
  });

  // ─── Build API query params from filters ──────────────────────────
  const apiFilters = useMemo(() => {
    const params: any = {};
    if (filters.searchQuery) params.search = filters.searchQuery;
    if (filters.categories.length > 0) params.category = filters.categories[0];
    if (filters.priceRange.max < PRICE_BOUNDS.max) params.maxPrice = filters.priceRange.max;
    if (filters.minRating > 0) params.minRating = filters.minRating;
    if (filters.inStockOnly) params.inStock = true;
    
    if (filters.sortBy === 'popular') params.sortBy = 'reviewCount';
    else if (filters.sortBy === 'rating') params.sortBy = 'rating';
    else if (filters.sortBy === 'price-low') { params.sortBy = 'price'; params.order = 'asc'; }
    else if (filters.sortBy === 'price-high') { params.sortBy = 'price'; params.order = 'desc'; }
    else if (filters.sortBy === 'newest') params.sortBy = 'createdAt';
    
    params.limit = 20;
    return params;
  }, [filters]);

  // ─── Fetch Products from API ──────────────────────────────────────
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError 
  } = useProducts(apiFilters);
  
  const products = productsData?.products || [];

  // ─── Sync URL params with filters ─────────────────────────────────
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryParam],
      }));
    }
  }, [searchParams]);

  // ─── Sync state back to URL parameters ────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    if (filters.categories.length > 0) params.set('category', filters.categories.join(','));
    if (filters.priceRange.max < PRICE_BOUNDS.max) params.set('maxPrice', String(filters.priceRange.max));
    if (filters.minRating > 0) params.set('rating', String(filters.minRating));
    if (filters.inStockOnly) params.set('inStock', 'true');
    if (filters.sortBy !== 'popular') params.set('sort', filters.sortBy);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      categories: [],
      priceRange: { min: PRICE_BOUNDS.min, max: PRICE_BOUNDS.max },
      minRating: 0,
      inStockOnly: false,
      sortBy: 'popular',
    });
  };

  // Active filter count for badging
  const activeFilterCount =
    filters.categories.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.priceRange.max < PRICE_BOUNDS.max ? 1 : 0);

  // ─── Loading State ──────────────────────────────────────────────────
  if (categoriesLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] py-8 sm:py-12">
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
              <p className="mt-4 text-stone-600 text-sm font-medium">Loading delicious snacks...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────
  if (productsError || categoriesError) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] py-8 sm:py-12">
        <Container>
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <PackageX size={28} />
            </div>
            <h3 className="font-heading font-black text-lg text-stone-900">Failed to load content</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mt-2">
              {(productsError as any)?.message || (categoriesError as any)?.message || 'Please try again later.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"
            >
              Retry
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 sm:py-12 text-stone-900">
      <Container>
        {/* ── 1. Page Header & Live Counters ────────────────────────── */}
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-900/10 text-amber-900 text-xs font-black uppercase tracking-wider">
              <Sparkles size={13} className="text-primary animate-pulse" />
              <span>Full Kitchen Catalog</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900">
            Explore Naija Snacks
          </h1>

          <p className="text-stone-500 text-xs sm:text-sm md:text-base max-w-2xl font-medium">
            Handcrafted with love by premier Nigerian cooks. Select your cravings, customize your portions, and order warm delivery.
          </p>
        </div>

        {/* ── 2. Top Fast Search & Filter Header ────────────────────── */}
        <div className="mb-6 space-y-3">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by snack name (e.g. Meat Pie, Chin Chin, Suya)..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-amber-950/10 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-bold placeholder-stone-400 outline-none shadow-2xs transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Category Carousel Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, categories: [] }))}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                filters.categories.length === 0
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white hover:bg-amber-100/50 text-stone-600 border border-amber-950/10'
              }`}
            >
              All Snacks ({products.length})
            </button>
            {categories.map((cat: Category) => {
              const isSelected = filters.categories.includes(cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    const next = isSelected
                      ? filters.categories.filter((c) => c !== cat.slug)
                      : [...filters.categories, cat.slug];
                    setFilters((prev) => ({ ...prev, categories: next }));
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white hover:bg-amber-100/50 text-stone-700 border border-amber-950/10'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Main Catalog Columns ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar (3 cols) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24 p-5 rounded-3xl bg-white border border-amber-950/10 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-950/10">
              <h3 className="font-heading font-black text-sm text-stone-900 flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-primary" />
                <span>Filters</span>
              </h3>
              {activeFilterCount > 0 && (
                <span className="text-[10px] font-bold text-primary bg-amber-100/70 px-2 py-0.5 rounded-full">
                  {activeFilterCount} Active
                </span>
              )}
            </div>

            <FilterSidebarContent
              filters={filters}
              categories={categories}
              onChange={setFilters}
              onClear={handleClearFilters}
            />
          </div>

          {/* Main Results Column (9 cols) */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Toolbar Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white border border-amber-950/10 shadow-2xs">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Sheet Trigger */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100/60 text-stone-900 text-xs font-bold"
                >
                  <SlidersHorizontal size={13} />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <p className="text-xs font-bold text-stone-500">
                  Showing <span className="text-stone-900 font-black">{products.length}</span> cravings
                </p>
              </div>

              {/* Right View & Sort Toggles */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/60">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-400 hover:text-stone-700'
                    }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-400 hover:text-stone-700'
                    }`}
                    aria-label="List view"
                  >
                    <ListIcon size={14} />
                  </button>
                </div>

                <SortDropdown
                  value={filters.sortBy}
                  onChange={(val) => setFilters((prev) => ({ ...prev, sortBy: val }))}
                />
              </div>
            </div>

            {/* Active Filters Tag Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {filters.categories.map((catSlug) => (
                  <span
                    key={catSlug}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 text-[11px] font-bold border border-amber-950/10"
                  >
                    <span>{catSlug}</span>
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          categories: prev.categories.filter((c) => c !== catSlug),
                        }))
                      }
                      className="hover:text-primary"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}

                {filters.priceRange.max < PRICE_BOUNDS.max && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 text-[11px] font-bold border border-amber-950/10">
                    <span>Under {formatCurrency(filters.priceRange.max)}</span>
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: { min: PRICE_BOUNDS.min, max: PRICE_BOUNDS.max },
                        }))
                      }
                      className="hover:text-primary"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {filters.minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 text-[11px] font-bold border border-amber-950/10">
                    <span>{filters.minRating}+ Stars</span>
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, minRating: 0 }))}
                      className="hover:text-primary"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {filters.inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 text-[11px] font-bold border border-amber-950/10">
                    <span>In Stock Only</span>
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: false }))}
                      className="hover:text-primary"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleClearFilters}
                  className="text-[11px] font-black text-primary hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* ── 4. Product Results Grid / List ──────────────────────── */}
            {products.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'
                    : 'space-y-3'
                }
              >
                {products.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              /* Empty State Banner */
              <div className="py-16 px-4 text-center bg-white rounded-3xl border border-amber-950/10 shadow-2xs space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-primary flex items-center justify-center mx-auto">
                  <PackageX size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-black text-lg text-stone-900">
                    No matching snacks found
                  </h3>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    We could not find anything matching your exact criteria. Try adjusting your filters or searching another snack!
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

          </div>

        </div>
      </Container>

      {/* ── 5. Mobile Filter Slide-Over Drawer ───────────────────────── */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-[#FFFDF9] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10 animate-[slideInRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-amber-950/10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-primary" />
                  <h3 className="font-heading font-black text-base text-stone-900">
                    Filter Menu
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X size={18} />
                </button>
              </div>

              <FilterSidebarContent
                filters={filters}
                categories={categories}
                onChange={setFilters}
                onClear={handleClearFilters}
              />
            </div>

            <div className="pt-4 mt-6 border-t border-amber-950/10">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 rounded-2xl bg-primary text-white text-xs font-black shadow-md"
              >
                Apply Filters ({products.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;