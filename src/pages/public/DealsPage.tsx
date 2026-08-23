import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  ShoppingBag,
  Check,
  Tag,
  Zap,
  Star,
  Percent,
  Timer,
  AlertTriangle,
  Heart,
  Layers,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Container from '../../components/layout/Container';
import type { Product, Category } from '../../types';
import { formatCurrency } from '../../lib/format';
import { useCartStore } from '../../store/cartStore';
import { useFeaturedProducts, useProducts } from '../../hooks/useProducts';

interface DealsPageProps {
  products?: Product[];
}

// ─── Helpers ────────────────────────────────────────────────────────
const getCategoryName = (category: string | Category | undefined | null): string => {
  if (!category) return 'Snack';
  if (typeof category === 'string') return category.replace(/-/g, ' ');
  return category.name || category.slug || 'Snack';
};

/** Normalize MongoDB / API product shape → frontend Product */
const normalizeProduct = (raw: any): Product => {
  if (!raw) return {} as Product;

  const image =
    raw.image ||
    (Array.isArray(raw.images) && raw.images.length > 0 ? raw.images[0] : '');

  let category: string | Category = 'Snack';
  if (typeof raw.category === 'string') {
    category = raw.category;
  } else if (raw.category && typeof raw.category === 'object') {
    category = raw.category;
  }

  return {
    id: String(raw.id || raw._id || ''),
    name: raw.name || '',
    slug: raw.slug || '',
    description: raw.description || '',
    price: typeof raw.price === 'number' ? raw.price : 0,
    originalPrice:
      typeof raw.originalPrice === 'number' ? raw.originalPrice : undefined,
    category,
    image,
    images: Array.isArray(raw.images) ? raw.images : image ? [image] : [],
    rating: typeof raw.rating === 'number' ? raw.rating : 0,
    reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : 0,
    stock: typeof raw.stock === 'number' ? raw.stock : 0,
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    allergens: Array.isArray(raw.allergens) ? raw.allergens : [],
    featured: Boolean(raw.featured),
    popular: Boolean(raw.popular),
  };
};

/** Extract array from any common API response shape */
const extractProducts = (data: any): Product[] => {
  if (!data) return [];
  let list: any[] = [];
  if (Array.isArray(data)) list = data;
  else if (Array.isArray(data.data)) list = data.data;
  else if (Array.isArray(data.products)) list = data.products;
  else if (Array.isArray(data.featured)) list = data.featured;
  else if (data.data?.products && Array.isArray(data.data.products)) {
    list = data.data.products;
  }
  return list.map(normalizeProduct).filter((p) => p.id && p.name);
};

// ─── Flash Countdown (UI only — ends at midnight) ───────────────────
const FlashCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ h, m, s });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-2 font-mono text-xl sm:text-2xl font-black text-white">
      <div className="bg-stone-800/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-inner">
        {pad(timeLeft.h)}
      </div>
      <span className="text-stone-500 animate-pulse">:</span>
      <div className="bg-stone-800/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-inner">
        {pad(timeLeft.m)}
      </div>
      <span className="text-stone-500 animate-pulse">:</span>
      <div className="bg-stone-800/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-inner text-amber-400">
        {pad(timeLeft.s)}
      </div>
    </div>
  );
};

// ─── Deal Card ──────────────────────────────────────────────────────
const DealCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addItem } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  const stockProgress = Math.max(10, Math.min(100, (product.stock / 50) * 100));
  const isAlmostSoldOut = product.stock > 0 && product.stock <= 10;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-3xl p-4 border border-amber-950/10 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-500 hover:-translate-y-1">
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-amber-50/50 mb-4 border border-amber-950/5">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-primary text-3xl bg-amber-50">
            {product.name.charAt(0)}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {discountPercent > 0 && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md">
              <Flame size={11} /> Save {discountPercent}%
            </span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xs text-stone-500 hover:text-red-500 transition-colors"
          aria-label="Save deal"
        >
          <Heart size={15} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
            <span className={isAlmostSoldOut ? 'text-red-600' : 'text-stone-500'}>
              {product.stock <= 0
                ? 'Sold Out'
                : isAlmostSoldOut
                ? 'Hurry! Almost Sold Out'
                : 'Available Stock'}
            </span>
            <span className="text-stone-900">{product.stock} Left</span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                product.stock <= 0
                  ? 'bg-stone-300'
                  : isAlmostSoldOut
                  ? 'bg-red-500'
                  : 'bg-primary'
              }`}
              style={{ width: product.stock <= 0 ? '0%' : `${stockProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5 px-1 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-amber-900/50 uppercase tracking-widest">
            {getCategoryName(product.category)}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span>{(product.rating || 0).toFixed(1)}</span>
          </div>
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="block group-hover:text-primary transition-colors"
        >
          <h3 className="font-heading font-black text-sm sm:text-base text-stone-900 truncate">
            {product.name}
          </h3>
        </Link>
        <p className="text-[11px] text-stone-500 line-clamp-2 font-medium leading-relaxed">
          {product.description}
        </p>
      </div>

      <div className="mt-auto pt-3 border-t border-amber-950/5 flex items-center justify-between gap-2 px-1">
        <div className="flex flex-col">
          {product.originalPrice != null && product.originalPrice > product.price && (
            <span className="text-[10px] text-stone-400 line-through font-bold">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
          <span className="text-lg font-black text-stone-900 leading-none">
            {formatCurrency(product.price)}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 ${
            product.stock <= 0
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : isAdded
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20 hover:shadow-lg'
          }`}
        >
          {product.stock <= 0 ? (
            <span>Sold Out</span>
          ) : isAdded ? (
            <>
              <Check size={14} className="stroke-[3]" />
              <span>Claimed!</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} />
              <span>Claim Deal</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Loading Skeleton ───────────────────────────────────────────────
const DealsSkeleton = () => (
  <div className="min-h-screen bg-[#FFFDF9] pb-20">
    <div className="h-64 sm:h-80 bg-stone-900 animate-pulse" />
    <Container>
      <div className="pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-white border border-amber-950/10 p-4 animate-pulse"
          >
            <div className="aspect-[4/3] rounded-2xl bg-stone-100 mb-4" />
            <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
            <div className="h-3 bg-stone-100 rounded w-full mb-4" />
            <div className="h-10 bg-stone-100 rounded-xl" />
          </div>
        ))}
      </div>
    </Container>
  </div>
);

// ─── Main Deals Page (Database-Powered) ─────────────────────────────
export const DealsPage: React.FC<DealsPageProps> = ({ products: propProducts }) => {
  const [filter, setFilter] = useState<'all' | 'combos' | 'flash' | 'under-2k'>('all');

  // Prefer full catalog so we can find any product with originalPrice
  const {
    data: allProductsData,
    isLoading: isLoadingAll,
    error: errorAll,
    refetch: refetchAll,
  } = useProducts?.() ?? { data: undefined, isLoading: false, error: null, refetch: () => {} };

  const {
    data: featuredData,
    isLoading: isLoadingFeatured,
    error: errorFeatured,
    refetch: refetchFeatured,
  } = useFeaturedProducts(50);

  const isLoading = isLoadingAll || isLoadingFeatured;
  const error = errorAll || errorFeatured;

  const dbProducts = useMemo(() => {
    if (propProducts && propProducts.length > 0) {
      return extractProducts(propProducts);
    }
    const fromAll = extractProducts(allProductsData);
    if (fromAll.length > 0) return fromAll;
    return extractProducts(featuredData);
  }, [propProducts, allProductsData, featuredData]);

  /** Real deals only: must have originalPrice > price from DB */
  const deals = useMemo(() => {
    const discounted = dbProducts.filter(
      (p) =>
        typeof p.originalPrice === 'number' &&
        p.originalPrice > p.price &&
        p.price > 0
    );

    switch (filter) {
      case 'flash':
        return discounted.filter(
          (p) => (p.originalPrice! - p.price) / p.originalPrice! >= 0.2
        );
      case 'combos':
        return discounted.filter((p) => {
          const n = p.name.toLowerCase();
          return (
            n.includes('combo') ||
            n.includes('box') ||
            n.includes('platter') ||
            n.includes('pack') ||
            n.includes('bundle')
          );
        });
      case 'under-2k':
        return discounted.filter((p) => p.price <= 2000);
      default:
        return discounted;
    }
  }, [dbProducts, filter]);

  const handleRetry = () => {
    refetchAll?.();
    refetchFeatured?.();
  };

  if (isLoading && dbProducts.length === 0) {
    return <DealsSkeleton />;
  }

  if (error && dbProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FFFDF9] px-4">
        <div className="max-w-md text-center space-y-4 p-8 rounded-3xl bg-white border border-amber-950/10 shadow-sm">
          <AlertTriangle className="mx-auto text-primary" size={36} />
          <h2 className="font-heading font-black text-lg text-stone-900">
            Could not load deals
          </h2>
          <p className="text-xs text-stone-500">
            Check that your API server is running and MongoDB is connected.
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-stone-900 pb-20">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 py-16 sm:py-20 lg:py-24 overflow-hidden border-y border-stone-800">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <Container>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-5 text-center lg:text-left mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                  Live From Our Kitchen Menu
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white leading-[1.1]">
                Grab Nigeria&apos;s Best{' '}
                <span className="text-primary">Snack Deals.</span>
              </h1>

              <p className="text-stone-400 text-sm sm:text-base font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                Real discounts on real snacks from our database — flash sales,
                party combos, and daily kitchen specials.
              </p>
            </div>

            <div className="shrink-0 bg-stone-900/50 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-2xl flex flex-col items-center">
              <div className="flex items-center gap-2 text-red-400 mb-4">
                <Timer size={18} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Today&apos;s Deals End In
                </span>
              </div>
              <FlashCountdown />
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-4">
                Resets at midnight
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div className="pt-10 sm:pt-14 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-heading font-black text-stone-900">
              Active Offers{' '}
              <span className="text-stone-400 text-base">({deals.length})</span>
            </h2>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
              {[
                { id: 'all', label: 'All Deals', icon: Tag },
                { id: 'flash', label: 'Flash Sales (20%+)', icon: Zap },
                { id: 'combos', label: 'Party Combos', icon: Layers },
                { id: 'under-2k', label: 'Under ₦2,000', icon: Percent },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as typeof filter)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-md'
                        : 'bg-white hover:bg-amber-50 text-stone-600 border border-amber-950/10'
                    }`}
                  >
                    <Icon
                      size={13}
                      className={isActive ? 'text-amber-400' : 'text-stone-400'}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {deals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {deals.map((product) => (
                <DealCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 px-4 text-center bg-white rounded-3xl border border-amber-950/10 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                {dbProducts.length === 0 ? (
                  <Sparkles size={28} />
                ) : (
                  <AlertTriangle size={28} />
                )}
              </div>
              <h3 className="font-heading font-black text-lg text-stone-900 mb-1">
                {dbProducts.length === 0
                  ? 'No products in database'
                  : 'No active deals for this filter'}
              </h3>
              <p className="text-xs text-stone-500 font-medium max-w-sm mb-6">
                {dbProducts.length === 0 ? (
                  <>
                    Seed your MongoDB with discounted snacks (
                    <code className="bg-stone-100 px-1.5 py-0.5 rounded text-[11px] font-mono">
                      originalPrice
                    </code>{' '}
                    &gt;{' '}
                    <code className="bg-stone-100 px-1.5 py-0.5 rounded text-[11px] font-mono">
                      price
                    </code>
                    ). Run{' '}
                    <code className="bg-stone-900 text-amber-400 px-1.5 py-0.5 rounded text-[11px] font-mono">
                      npm run seed
                    </code>{' '}
                    in the server folder.
                  </>
                ) : (
                  'Try another filter, or add more products with originalPrice higher than price in your seed data.'
                )}
              </p>
              {filter !== 'all' && dbProducts.length > 0 && (
                <button
                  onClick={() => setFilter('all')}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
                >
                  View All Deals
                </button>
              )}
              {dbProducts.length === 0 && (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default DealsPage;