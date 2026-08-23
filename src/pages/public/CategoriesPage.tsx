import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat,
  Flame,
  Candy,
  Disc3,
  Beef,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  Star,
  Check,
  Plus,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import Container from '../../components/layout/Container';
import type { Category, Product } from '../../types';
import { formatCurrency } from '../../lib/format';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';

interface CategoriesPageProps {
  onAddToCart?: (product: Product, quantity: number) => void;
  onToggleFavorite?: (productId: string) => void;
}

// ─── Visual Theme Mapping for Categories ───────────────────────────
interface CategoryTheme {
  icon: React.ElementType;
  gradient: string;
  badgeBg: string;
  glowColor: string;
  tagline: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  pastries: {
    icon: ChefHat,
    gradient: 'from-amber-500/25 via-orange-500/10 to-transparent',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300/60',
    glowColor: 'group-hover:shadow-amber-500/15',
    tagline: 'Warm, flaky meat pies & sausage rolls',
  },
  'fried-snacks': {
    icon: Flame,
    gradient: 'from-orange-500/25 via-red-500/10 to-transparent',
    badgeBg: 'bg-orange-100 text-orange-950 border-orange-300/60',
    glowColor: 'group-hover:shadow-orange-500/15',
    tagline: 'Crunchy golden chin chin & savory bites',
  },
  'protein-snacks': {
    icon: Beef,
    gradient: 'from-red-500/25 via-rose-500/10 to-transparent',
    badgeBg: 'bg-red-100 text-red-950 border-red-300/60',
    glowColor: 'group-hover:shadow-red-500/15',
    tagline: 'Charcoal-grilled suya & peppered asun',
  },
  'sweet-snacks': {
    icon: Candy,
    gradient: 'from-rose-500/25 via-pink-500/10 to-transparent',
    badgeBg: 'bg-rose-100 text-rose-950 border-rose-300/60',
    glowColor: 'group-hover:shadow-rose-500/15',
    tagline: 'Soft, golden puff-puff & sweet delights',
  },
  chips: {
    icon: Disc3,
    gradient: 'from-yellow-500/25 via-amber-500/10 to-transparent',
    badgeBg: 'bg-yellow-100 text-yellow-950 border-yellow-300/60',
    glowColor: 'group-hover:shadow-yellow-500/15',
    tagline: 'Crispy plantain chips & salted crisps',
  },
  drinks: {
    icon: UtensilsCrossed,
    gradient: 'from-blue-500/25 via-cyan-500/10 to-transparent',
    badgeBg: 'bg-blue-100 text-blue-950 border-blue-300/60',
    glowColor: 'group-hover:shadow-blue-500/15',
    tagline: 'Chilled zobo, kunu & Chapman coolers',
  },
};

const DEFAULT_THEME: CategoryTheme = {
  icon: UtensilsCrossed,
  gradient: 'from-primary/25 via-orange-500/10 to-transparent',
  badgeBg: 'bg-amber-100 text-amber-950 border-amber-300/60',
  glowColor: 'group-hover:shadow-primary/15',
  tagline: 'Authentic Nigerian handcrafted recipes',
};

// ─── Category Showcase Card Component ───────────────────────────────
const CategoryShowcaseCard: React.FC<{
  category: Category;
  sampleProducts: Product[];
}> = ({ category, sampleProducts }) => {
  const [imgError, setImgError] = useState(false);
  const theme = CATEGORY_THEMES[category.slug] || DEFAULT_THEME;
  const Icon = theme.icon;

  return (
    <Link
      to={`/explore?category=${category.slug}`}
      className={`group relative flex flex-col justify-between bg-white rounded-3xl p-4 sm:p-5 border border-amber-950/10 shadow-sm hover:shadow-2xl ${theme.glowColor} hover:-translate-y-1.5 transition-all duration-500 min-w-0`}
    >
      <div>
        {/* Visual Top Image with Layered Badges */}
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-amber-50/40 mb-4 border border-amber-950/5">
          {/* Ambient Gradient Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-500 z-10`}
          />

          {category.image && !imgError ? (
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
              <Icon size={54} className="text-primary/30 group-hover:scale-110 transition-transform" />
            </div>
          )}

          {/* Floating Category Icon Pill */}
          <div className="absolute top-3 left-3 z-20 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center border border-white/80 group-hover:scale-110 transition-transform">
            <Icon size={18} className="text-stone-900 group-hover:text-primary transition-colors" />
          </div>

          {/* Product Count Pill */}
          <div className="absolute top-3 right-3 z-20">
            <span
              className={`inline-flex items-center text-[11px] font-black px-2.5 py-1 rounded-full border shadow-xs backdrop-blur-md ${theme.badgeBg}`}
            >
              {category.productCount} {category.productCount === 1 ? 'snack' : 'snacks'}
            </span>
          </div>

          {/* Bottom Floating Tagline on Image */}
          <div className="absolute bottom-3 left-3 right-3 z-20">
            <p className="text-[11px] font-bold text-white drop-shadow-md truncate">
              {theme.tagline}
            </p>
          </div>
        </div>

        {/* Title & Exploration Row */}
        <div className="space-y-1 px-1">
          <h2 className="font-heading font-black text-lg sm:text-xl text-stone-900 group-hover:text-primary transition-colors truncate">
            {category.name}
          </h2>
        </div>

        {/* Mini Preview Chips for Top Snacks in this Category */}
        {sampleProducts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-950/[0.06] flex flex-wrap gap-1.5">
            {sampleProducts.slice(0, 2).map((item) => (
              <span
                key={item.id}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50/80 text-stone-700 border border-amber-950/5 truncate max-w-[140px]"
              >
                • {item.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-4 pt-3 border-t border-amber-950/[0.06] flex items-center justify-between text-xs font-black text-primary group-hover:text-primary-dark">
        <span>Explore Category Menu</span>
        <div className="w-7 h-7 rounded-xl bg-amber-100/50 group-hover:bg-primary group-hover:text-white text-stone-700 flex items-center justify-center transition-all group-hover:translate-x-1 shadow-2xs">
          <ArrowRight size={13} strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  );
};

// ─── Popular Snack Preview Card Component ────────────────────────────
const PopularSnackCard: React.FC<{
  product: Product;
  categoryName: string;
  onAddToCart?: (product: Product, quantity: number) => void;
  onToggleFavorite?: (productId: string) => void;
}> = ({ product, categoryName, onAddToCart, onToggleFavorite }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    setIsAdded(true);
    onAddToCart?.(product, 1);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-3xl p-4 border border-amber-950/10 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
      <div>
        {/* Top Image Box */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-amber-50/40 mb-3 border border-amber-950/5">
          {product.image && !imgError ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-600"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-black text-primary text-3xl bg-amber-50">
              {product.name.charAt(0)}
            </div>
          )}

          {/* Favorite Trigger */}
          <button
            onClick={() => {
              setIsFavorite(!isFavorite);
              onToggleFavorite?.(product.id);
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-xs text-stone-600 hover:text-red-500 transition-colors"
            aria-label="Save to favorites"
          >
            <Heart size={13} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
          </button>

          {/* Popular Badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-orange-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              <Flame size={9} /> Top Craving
            </span>
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-[10px] font-bold text-amber-950 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs border border-white/60">
              {categoryName}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-1 px-0.5">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-stone-400">({product.reviewCount})</span>
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[9px] font-bold text-red-500">Only {product.stock} left</span>
            )}
          </div>

          <Link to={`/product/${product.slug}`} className="block group-hover:text-primary transition-colors">
            <h3 className="font-heading font-black text-sm text-stone-900 truncate">
              {product.name}
            </h3>
          </Link>

          <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed font-medium">
            {product.description}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 mt-3 border-t border-amber-950/[0.06] flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-black text-stone-900">
          {formatCurrency(product.price)}
        </span>

        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${
            product.stock <= 0
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : isAdded
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-primary hover:bg-primary-dark text-white shadow-xs'
          }`}
        >
          {product.stock <= 0 ? (
            <span>Sold Out</span>
          ) : isAdded ? (
            <>
              <Check size={12} />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus size={12} strokeWidth={3} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Loading Skeleton ────────────────────────────────────────────────
const CategoriesSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-950/10 shadow-sm animate-pulse">
        <div className="w-full aspect-[16/10] rounded-2xl bg-amber-50/40 mb-4" />
        <div className="h-6 bg-amber-50 rounded w-3/4 mb-2" />
        <div className="h-4 bg-amber-50 rounded w-1/2" />
        <div className="mt-4 pt-3 border-t border-amber-950/[0.06] flex items-center justify-between">
          <div className="h-4 bg-amber-50 rounded w-1/3" />
          <div className="w-7 h-7 bg-amber-50 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Categories Page Component ──────────────────────────────────
export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  onAddToCart,
  onToggleFavorite,
}) => {
  // ─── Fetch Categories from API ────────────────────────────────────
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const categories = categoriesData || [];

  // ─── Fetch Products from API ──────────────────────────────────────
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts({ limit: 100 });
  const products = productsData?.products || [];

  // ─── Group products by category slug for quick lookup ─────────────
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {};
    
    products.forEach((product: Product) => {
      const categoryName = typeof product.category === 'string'
        ? product.category
        : product.category.slug;
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
      if (!grouped[slug]) {
        grouped[slug] = [];
      }
      grouped[slug].push(product);
    });
    
    return grouped;
  }, [products]);

  // ─── Loading State ──────────────────────────────────────────────────
  if (categoriesLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] py-10 sm:py-14 lg:py-18">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-900/10 text-amber-950 text-xs font-black uppercase tracking-wider shadow-2xs">
              <Sparkles size={13} className="text-primary animate-pulse" />
              <span>Handcrafted Flavors of Nigeria</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900 leading-[1.15]">
              Explore Snack Categories
            </h1>
          </div>
          <CategoriesSkeleton />
        </Container>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────
  if (categoriesError || productsError) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] py-10 sm:py-14 lg:py-18">
        <Container>
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} />
            </div>
            <h3 className="font-heading font-black text-lg text-stone-900">Failed to load categories</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mt-2">
              We could not load the categories. Please try again later.
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

  // ─── Empty State ────────────────────────────────────────────────────
  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] py-10 sm:py-14 lg:py-18">
        <Container>
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-primary flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed size={28} />
            </div>
            <h3 className="font-heading font-black text-lg text-stone-900">No categories available</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mt-2">
              Categories are being prepared. Please check back soon.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-10 sm:py-14 lg:py-18 text-stone-900">
      <Container>
        {/* ── 1. Page Header & Ambient Banner ───────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-900/10 text-amber-950 text-xs font-black uppercase tracking-wider shadow-2xs">
            <Sparkles size={13} className="text-primary animate-pulse" />
            <span>Handcrafted Flavors of Nigeria</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900 leading-[1.15]">
            Explore Snack Categories
          </h1>

          <p className="text-stone-500 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
            Browse our freshly baked delicacies, crispy bites, and charcoal-grilled treats by category. Baked fresh and delivered warm to your doorstep.
          </p>

          {/* Quick Category Jump Navigation Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5">
            {categories.map((cat: { id: React.Key | null | undefined; slug: any; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.slug}`}
                className="px-3 py-1 text-xs font-bold rounded-xl bg-white hover:bg-amber-100/60 text-stone-700 border border-amber-950/10 transition-colors shadow-2xs"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ── 2. Primary Categories Showcase Grid ────────────────────── */}
        {categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
            {categories.map((category: Category) => {
              const categoryProducts = productsByCategory[category.slug] || [];

              return (
                <CategoryShowcaseCard
                  key={category.id}
                  category={category}
                  sampleProducts={categoryProducts}
                />
              );
            })}
          </div>
        )}

        {/* ── 3. Popular in Each Category Spotlight ─────────────────── */}
        {categories.length > 0 && products.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-amber-950/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <div className="flex items-center gap-1.5 text-primary text-xs font-black uppercase tracking-wider mb-1.5">
                  <Flame size={14} />
                  <span>Customer Favorites</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 tracking-tight">
                  Top Rated in Each Category
                </h2>
              </div>

              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:text-primary-dark group"
              >
                <span>Explore All Snacks</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {categories.map((category: { slug: string | number; name: string; }) => {
                const categoryProducts = productsByCategory[category.slug] || [];
                
                // Find the top-rated or popular product in this category
                const topProduct =
                  categoryProducts.find(
                    (p) => p.popular || p.featured
                  ) ||
                  categoryProducts[0];

                if (!topProduct) return null;

                return (
                  <PopularSnackCard
                    key={topProduct.id}
                    product={topProduct}
                    categoryName={category.name}
                    onAddToCart={onAddToCart}
                    onToggleFavorite={onToggleFavorite}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── 4. Freshness & Hygiene Guarantee Strip ────────────────── */}
        <div className="mt-16 sm:mt-20 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-100/60 via-orange-50/40 to-amber-100/60 border border-amber-900/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-amber-950/10 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-stone-900">
                100% Fresh Kitchen Guarantee
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Every snack across all categories is prepared daily using verified recipes and dispatched in heat-sealed thermal packs.
              </p>
            </div>
          </div>

          <Link
            to="/explore"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-[0.98] shrink-0"
          >
            <span>Start Your Order</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default CategoriesPage;