import React, { useState, memo, useMemo } from 'react';
import {
  ChefHat,
  Flame,
  Candy,
  Disc3,
  Beef,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  CupSoda,
  Cookie,
  Layers,
  TrendingUp,
  HeartHandshake,
  Clock,
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';

// ─── Types & Interfaces ─────────────────────────────────────────────
export interface Category {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
  description?: string;
  isPopular?: boolean;
  badge?: string;
}

export interface CategoriesSectionProps {
  categories?: Category[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  onCategoryClick?: (category: Category) => void;
  className?: string;
}

interface CategoryTheme {
  icon: React.ElementType;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  glowColor: string;
  accentBg: string;
  iconColor: string;
}

// ─── Visual Theme Mapping ───────────────────────────────────────────
const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'pastries---pies': {
    icon: ChefHat,
    gradient: 'from-amber-600/30 via-orange-500/10 to-transparent',
    badgeBg: 'bg-amber-500/10 backdrop-blur-md',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-500/20',
    glowColor: 'group-hover:shadow-amber-500/15',
    accentBg: 'bg-amber-500',
    iconColor: 'text-amber-600',
  },
  'small-chops': {
    icon: Flame,
    gradient: 'from-orange-600/30 via-red-500/10 to-transparent',
    badgeBg: 'bg-orange-500/10 backdrop-blur-md',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-500/20',
    glowColor: 'group-hover:shadow-orange-500/15',
    accentBg: 'bg-orange-500',
    iconColor: 'text-orange-600',
  },
  'sweet-treats': {
    icon: Candy,
    gradient: 'from-rose-600/30 via-pink-500/10 to-transparent',
    badgeBg: 'bg-rose-500/10 backdrop-blur-md',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-500/20',
    glowColor: 'group-hover:shadow-rose-500/15',
    accentBg: 'bg-rose-500',
    iconColor: 'text-rose-600',
  },
  'chips---crisps': {
    icon: Disc3,
    gradient: 'from-yellow-600/30 via-amber-500/10 to-transparent',
    badgeBg: 'bg-yellow-500/10 backdrop-blur-md',
    badgeText: 'text-yellow-800',
    badgeBorder: 'border-yellow-500/20',
    glowColor: 'group-hover:shadow-yellow-500/15',
    accentBg: 'bg-yellow-500',
    iconColor: 'text-yellow-700',
  },
  'suya---grills': {
    icon: Beef,
    gradient: 'from-red-600/30 via-rose-500/10 to-transparent',
    badgeBg: 'bg-red-500/10 backdrop-blur-md',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-500/20',
    glowColor: 'group-hover:shadow-red-500/15',
    accentBg: 'bg-red-500',
    iconColor: 'text-red-600',
  },
  drinks: {
    icon: CupSoda,
    gradient: 'from-emerald-600/30 via-teal-500/10 to-transparent',
    badgeBg: 'bg-emerald-500/10 backdrop-blur-md',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-500/20',
    glowColor: 'group-hover:shadow-emerald-500/15',
    accentBg: 'bg-emerald-500',
    iconColor: 'text-emerald-600',
  },
  bakery: {
    icon: Cookie,
    gradient: 'from-amber-700/30 via-yellow-600/10 to-transparent',
    badgeBg: 'bg-amber-600/10 backdrop-blur-md',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-600/20',
    glowColor: 'group-hover:shadow-amber-600/15',
    accentBg: 'bg-amber-600',
    iconColor: 'text-amber-700',
  },
};

const DEFAULT_THEME: CategoryTheme = {
  icon: UtensilsCrossed,
  gradient: 'from-orange-600/30 via-amber-500/10 to-transparent',
  badgeBg: 'bg-orange-500/10 backdrop-blur-md',
  badgeText: 'text-orange-700',
  badgeBorder: 'border-orange-500/20',
  glowColor: 'group-hover:shadow-orange-500/15',
  accentBg: 'bg-orange-500',
  iconColor: 'text-orange-600',
};

// ─── Individual Category Card ──────────────────────────────────────
const CategoryCard = memo(function CategoryCard({
  category,
  index,
  onClick,
}: {
  category: Category;
  index: number;
  onClick?: (category: Category) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const theme = useMemo(() => CATEGORY_THEMES[category.slug] || DEFAULT_THEME, [category.slug]);
  const Icon = theme.icon;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(category);
    }
  };

  return (
    <a
      href={`/categories/${category.slug}`}
      onClick={handleClick}
      aria-label={`Explore ${category.name} snacks`}
      className={`group relative flex flex-col justify-between bg-white rounded-3xl p-3 sm:p-3.5 border border-zinc-200/80 shadow-sm hover:shadow-xl ${theme.glowColor} hover:-translate-y-1.5 transition-all duration-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 overflow-hidden`}
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Visual Top Media Section */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 mb-3">
        {/* Background Overlay Ambient Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-400 z-10`}
        />

        {/* Fallback & Image Rendering */}
        {category.image && !imageError ? (
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-orange-50/50 p-4">
            <Icon
              size={40}
              className={`${theme.iconColor} opacity-70 group-hover:scale-110 transition-transform duration-400`}
            />
          </div>
        )}

        {/* Floating Category Icon Badge */}
        <div className="absolute top-2.5 left-2.5 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md shadow-black/5 flex items-center justify-center border border-white/80 group-hover:scale-110 transition-transform duration-300">
          <Icon size={16} className={`${theme.iconColor}`} />
        </div>

        {/* Top-Right Badge: Count or Special Tag */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col items-end gap-1">
          {category.badge ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-900/90 text-white backdrop-blur-md border border-white/10 shadow-xs">
              <Sparkles size={10} className="text-amber-400" />
              {category.badge}
            </span>
          ) : category.productCount !== undefined ? (
            <span
              className={`inline-flex items-center text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
            >
              {category.productCount} {category.productCount === 1 ? 'snack' : 'snacks'}
            </span>
          ) : null}
        </div>

        {/* Popular Trend Pill */}
        {category.isPopular && !category.badge && (
          <div className="absolute bottom-2.5 left-2.5 z-20">
            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500 text-white shadow-xs">
              <TrendingUp size={10} />
              Trending
            </span>
          </div>
        )}
      </div>

      {/* Card Content & Action Bar */}
      <div className="flex items-center justify-between gap-2 px-1 pb-0.5">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 truncate group-hover:text-orange-600 transition-colors">
            {category.name}
          </h3>
          <p className="text-[11px] font-medium text-zinc-400 truncate mt-0.5">
            {category.description || 'Made fresh every morning'}
          </p>
        </div>

        {/* Arrow Action Circle */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-50 border border-zinc-200/60 group-hover:bg-orange-500 group-hover:border-orange-500 text-zinc-400 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 group-hover:translate-x-0.5 shadow-xs">
          <ArrowRight size={13} strokeWidth={2.5} />
        </div>
      </div>
    </a>
  );
});

// ─── Skeleton Loading Component ─────────────────────────────────────
const CategorySkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-3xl p-3 sm:p-3.5 border border-zinc-100 shadow-sm animate-pulse flex flex-col justify-between"
      >
        <div className="w-full aspect-[4/3] rounded-2xl bg-zinc-100 mb-3" />
        <div className="px-1 space-y-2 pb-1">
          <div className="h-4 bg-zinc-100 rounded-md w-3/4" />
          <div className="h-3 bg-zinc-100 rounded-md w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Categories Section ───────────────────────────────────────
export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories: propCategories,
  title = 'Craving Something Specific?',
  subtitle = 'Explore authentic Nigerian delicacies by category — freshly fried, baked, and delivered warm.',
  viewAllLink = '/explore',
  onCategoryClick,
  className = '',
}) => {
  // ─── Fetch Categories from API ────────────────────────────────────
  const { data: fetchedCategories, isLoading, error } = useCategories();

  // Use prop categories if provided, otherwise use fetched categories
  const categories = propCategories || fetchedCategories || [];

  // ─── Loading State ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <section
        aria-labelledby="categories-section-heading"
        className={`relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-orange-50/25 to-white overflow-hidden ${className}`}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3.5">
                <Sparkles size={13} className="text-orange-600 animate-pulse" />
                <span>Handcrafted Daily</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.12]">
                {title}
              </h2>
              <p className="text-zinc-500 text-sm sm:text-base lg:text-lg mt-3 leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
          <CategorySkeletonGrid />
        </div>
      </section>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────
  if (error) {
    return (
      <section
        aria-labelledby="categories-section-heading"
        className={`relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-orange-50/25 to-white overflow-hidden ${className}`}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl">
              <span>⚠️</span>
              <p className="text-sm font-medium">Failed to load categories. Please try again.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── Empty State ────────────────────────────────────────────────────
  if (categories.length === 0) {
    return (
      <section
        aria-labelledby="categories-section-heading"
        className={`relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-orange-50/25 to-white overflow-hidden ${className}`}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-600 px-4 py-3 rounded-2xl">
              <span>🍽️</span>
              <p className="text-sm font-medium">No categories available at the moment.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="categories-section-heading"
      className={`relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-orange-50/25 to-white overflow-hidden ${className}`}
    >
      {/* ── Ambient Background Lighting ─────────────────────────────── */}
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      {/* ── Main Container ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3.5">
              <Sparkles size={13} className="text-orange-600 animate-pulse" />
              <span>Handcrafted Daily</span>
            </div>

            {/* Main Heading */}
            <h2
              id="categories-section-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.12]"
            >
              {title}
            </h2>

            {/* Subtitle */}
            <p className="text-zinc-500 text-sm sm:text-base lg:text-lg mt-3 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* View Full Catalog Link */}
          {viewAllLink && (
            <div className="shrink-0">
              <a
                href={viewAllLink}
                className="group inline-flex items-center gap-2 text-sm font-bold text-zinc-800 hover:text-orange-600 bg-white hover:bg-orange-50/50 px-5 py-3 rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Layers size={16} className="text-orange-500" />
                <span>Browse Full Menu</span>
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </a>
            </div>
          )}
        </div>

        {/* Categories Grid - FIXED: Added unique key prop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
          {categories.map((category: Category, index: number) => (
            <CategoryCard
              key={category._id || category.id || category.slug || `category-${index}`}
              category={category}
              index={index}
              onClick={onCategoryClick}
            />
          ))}
        </div>

        {/* ── Bottom Quality Guarantee Strip ─────────────────────────── */}
        <div className="mt-12 sm:mt-16 flex items-center justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-zinc-200/70 shadow-sm text-xs font-semibold text-zinc-600">
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-orange-500" />
              <span>Baked & Fried Fresh Daily</span>
            </div>
            <span className="hidden sm:inline w-1 h-1 bg-zinc-300 rounded-full" />
            <div className="flex items-center gap-2">
              <ChefHat size={15} className="text-amber-600" />
              <span>Authentic Nigerian Recipes</span>
            </div>
            <span className="hidden sm:inline w-1 h-1 bg-zinc-300 rounded-full" />
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-emerald-600" />
              <span>Dispatched Within 30 Mins</span>
            </div>
            <span className="hidden sm:inline w-1 h-1 bg-zinc-300 rounded-full" />
            <div className="flex items-center gap-2">
              <HeartHandshake size={15} className="text-red-500" />
              <span>Bulk Party Packs Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;