import React, { useState, useEffect, useMemo, memo, useRef, useCallback } from 'react';
import {
  Star,
  ArrowRight,
  Sparkles,
  Clock,
  ShoppingBag,
  Check,
  Heart,
  Share2,
  ShieldCheck,
  Zap,
  Info,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import Container from '../layout/Container';
import type { Product } from '../../types';
import { formatCurrency } from '../../lib/format';
import { useCartStore } from '../../store/cartStore';
import { useFeaturedProducts } from '../../hooks/useProducts';
import { Link } from 'react-router-dom';

export interface SnackOfTheDayProps {
  products?: Product[];
  onAddToCart?: (product: Product, quantity: number) => void;
  onViewDetails?: (slug: string) => void;
  onToggleFavorite?: (productId: string) => void;
  className?: string;
}

// ─── Mongoose Document Normalizer ──────────────────────────────────
// Ensures data from MongoDB (using _id, populated objects, or arrays) matches frontend types
const normalizeMongooseProduct = (raw: any): Product => {
  if (!raw) return {} as Product;

  const image =
    raw.image ||
    (Array.isArray(raw.images) && raw.images.length > 0 ? raw.images[0] : '');

  const category =
    typeof raw.category === 'object' && raw.category !== null
      ? raw.category.name || raw.category.slug || 'Snack'
      : raw.category || 'Snack';

  return {
    id: raw.id || raw._id || String(Math.random()),
    name: raw.name || 'Delicious Nigerian Snack',
    slug: raw.slug || '',
    description: raw.description || '',
    price: typeof raw.price === 'number' ? raw.price : 0,
    originalPrice: raw.originalPrice,
    rating: typeof raw.rating === 'number' ? raw.rating : 5.0,
    reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : 0,
    image,
    images: Array.isArray(raw.images) ? raw.images : [image],
    category,
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    allergens: Array.isArray(raw.allergens) ? raw.allergens : [],
    stock: typeof raw.stock === 'number' ? raw.stock : 0,
    featured: Boolean(raw.featured),
    popular: Boolean(raw.popular),
  };
};

// ─── Extract Product List From Any API Response Shape ──────────────
const extractRealProductsFromApi = (apiResponse: any): Product[] => {
  if (!apiResponse) return [];
  
  let list: any[] = [];
  if (Array.isArray(apiResponse)) list = apiResponse;
  else if (Array.isArray(apiResponse.data)) list = apiResponse.data;
  else if (Array.isArray(apiResponse.products)) list = apiResponse.products;
  else if (Array.isArray(apiResponse.featured)) list = apiResponse.featured;

  return list.map(normalizeMongooseProduct);
};

// ─── Deterministic Daily Index Calculation ──────────────────────────
const getDailySnackData = (productList: Product[]) => {
  if (!productList || productList.length === 0) return null;

  const msInDay = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const daysSinceEpoch = Math.floor(now / msInDay);

  const activeIndex = daysSinceEpoch % productList.length;
  const nextIndex = (activeIndex + 1) % productList.length;

  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msToMidnight = midnight.getTime() - now;

  return {
    activeProduct: productList[activeIndex],
    nextProduct: productList[nextIndex],
    msToMidnight,
    dayKey: daysSinceEpoch,
  };
};

// ─── Real-Time Countdown Timer ──────────────────────────────────────
const CountdownTimer = memo(function CountdownTimer({
  msRemaining,
  onCountdownEnd,
}: {
  msRemaining: number;
  onCountdownEnd: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(msRemaining);

  useEffect(() => {
    setTimeLeft(msRemaining);
  }, [msRemaining]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onCountdownEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          onCountdownEnd();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onCountdownEnd]);

  const formattedTime = useMemo(() => {
    const totalSeconds = Math.floor(timeLeft / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
  }, [timeLeft]);

  return (
    <div className="inline-flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl text-amber-400 text-xs font-mono shadow-md">
      <Clock size={13} className="animate-pulse" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
        Next Drop In:
      </span>
      <span className="font-bold tracking-wider">{formattedTime}</span>
    </div>
  );
});

// ─── Star Rating Sub-Component ──────────────────────────────────────
const StarRating = memo(function StarRating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  const fullStars = Math.floor(rating);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} stars`}>
        {[1, 2, 3, 4, 5].map((index) => (
          <Star
            key={index}
            size={14}
            className={
              index <= fullStars
                ? 'text-amber-400 fill-amber-400'
                : 'text-stone-700 fill-stone-800'
            }
          />
        ))}
      </div>
      <span className="text-xs font-bold text-amber-300">{rating.toFixed(1)}</span>
      <span className="text-stone-600">•</span>
      <span className="text-xs font-semibold text-stone-400">
        {reviewCount.toLocaleString()} Verified Reviews
      </span>
    </div>
  );
});

// ─── Loading Skeleton ──────────────────────────────────────────────
const SnackOfTheDaySkeleton = () => (
  <div className="relative w-full overflow-hidden bg-[#0C0A09] py-16 sm:py-20 lg:py-24 border-y border-amber-950/10">
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-pulse">
        <div className="lg:col-span-5">
          <div className="aspect-square w-full rounded-3xl bg-stone-850" />
        </div>
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="h-4 bg-stone-850 rounded w-32" />
            <div className="h-8 bg-stone-850 rounded w-3/4" />
          </div>
          <div className="h-20 bg-stone-850 rounded w-full" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-stone-850 rounded-xl" />
            <div className="h-16 bg-stone-850 rounded-xl" />
          </div>
          <div className="h-12 bg-stone-850 rounded-xl w-1/2" />
        </div>
      </div>
    </Container>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────
export const SnackOfTheDay: React.FC<SnackOfTheDayProps> = ({
  products: propProducts,
  onAddToCart,
  onViewDetails,
  onToggleFavorite,
  className = '',
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [triggerTransition, setTriggerTransition] = useState(false);
  const [cycleTick, setCycleTick] = useState(0);
  const [imageError, setImageError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const { addItem, items } = useCartStore();

  // Fetch featured products strictly from MongoDB API backend
  const { data: fetchedProducts, isLoading, error, refetch } = useFeaturedProducts(10);

  // Extract products strictly from real props or real API
  const realProducts = useMemo(() => {
    const fromProps = extractRealProductsFromApi(propProducts);
    if (fromProps.length > 0) return fromProps;

    const fromFetched = extractRealProductsFromApi(fetchedProducts);
    if (fromFetched.length > 0) return fromFetched;

    return [];
  }, [propProducts, fetchedProducts]);

  // Compute Active Daily Snack from MongoDB product array
  const dailyData = useMemo(() => {
    return getDailySnackData(realProducts);
  }, [realProducts, cycleTick]);

  // Sync favorites with localStorage
  useEffect(() => {
    if (dailyData?.activeProduct) {
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(savedFavorites.includes(dailyData.activeProduct.id));
      setImageError(false);
    }
  }, [dailyData?.activeProduct?.id]);

  // Handle midnight cycle refresh
  const handleMidnightRefresh = useCallback(() => {
    setTriggerTransition(true);
    setTimeout(() => {
      setCycleTick((prev) => prev + 1);
      setTriggerTransition(false);
      setQuantity(1);
      setIsFavorite(false);
    }, 800);
  }, []);

  const handleShare = async () => {
    if (!dailyData) return;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Snack of the Day: ${dailyData.activeProduct.name}`,
          text: dailyData.activeProduct.description,
          url: shareUrl,
        });
      } catch {
        /* Fallback silently */
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleAddToCartWithPersistence = useCallback(
    (product: Product, qty: number) => {
      addItem(product, qty);
      setIsAdded(true);

      if (onAddToCart) {
        onAddToCart(product, qty);
      }

      setTimeout(() => setIsAdded(false), 2000);
    },
    [addItem, onAddToCart]
  );

  const handleToggleFavoriteWithPersistence = useCallback(
    (productId: string) => {
      const newState = !isFavorite;
      setIsFavorite(newState);

      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (newState) {
        if (!savedFavorites.includes(productId)) {
          localStorage.setItem('favorites', JSON.stringify([...savedFavorites, productId]));
        }
      } else {
        localStorage.setItem(
          'favorites',
          JSON.stringify(savedFavorites.filter((id: string) => id !== productId))
        );
      }

      if (onToggleFavorite) {
        onToggleFavorite(productId);
      }
    },
    [isFavorite, onToggleFavorite]
  );

  // 1. Show loading skeleton while querying MongoDB
  if (isLoading && !propProducts) {
    return <SnackOfTheDaySkeleton />;
  }

  // 2. Show Database Error or Disconnected State
  if (error && !propProducts) {
    return (
      <div className="py-20 text-center bg-[#0C0A09] text-stone-400 border-y border-amber-950/10 px-4">
        <AlertTriangle className="mx-auto text-primary mb-3" size={32} />
        <p className="text-sm font-bold text-stone-200">Unable to connect to MongoDB server.</p>
        <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
          Please check that your backend server is running on port 5000 and MongoDB is connected.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold border border-white/10"
        >
          <RefreshCw size={13} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // 3. Show Empty Database State (Prompts user to seed MongoDB)
  if (!dailyData || realProducts.length === 0) {
    return (
      <div className="py-20 text-center bg-[#0C0A09] text-stone-400 border-y border-amber-950/10 px-4">
        <Sparkles className="mx-auto text-amber-500 mb-3 opacity-60" size={36} />
        <p className="text-sm font-black text-stone-200">No Featured Products in Database</p>
        <p className="text-xs text-stone-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          Your MongoDB database is currently empty. Run <code className="bg-stone-900 text-amber-400 px-2 py-0.5 rounded font-mono text-[11px]">npm run seed</code> in your server terminal to populate real snacks!
        </p>
      </div>
    );
  }

  const { activeProduct, nextProduct, msToMidnight } = dailyData;
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <section
      ref={containerRef}
      aria-labelledby="special-offer-title"
      className={`relative w-full overflow-hidden bg-[#0C0A09] text-stone-100 py-16 sm:py-20 lg:py-24 border-y border-amber-950/10 ${className}`}
    >
      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.97) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeOutDown {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.97) translateY(8px); }
        }
        .anim-slide-up {
          animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-slide-down {
          animation: fadeOutDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* ── Background Glow Detail ─────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-0 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <Container>
        <div
          className={`relative z-10 transition-all duration-700 ${
            triggerTransition ? 'anim-slide-down' : 'anim-slide-up'
          }`}
        >
          {/* ── Top Header Section ───────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-10 border-b border-amber-950/10">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <h2
                id="special-offer-title"
                className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-500"
              >
                Special 24-Hour Deal Rotation
              </h2>
              {cartItemCount > 0 && (
                <span className="ml-2 bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  {cartItemCount} in cart
                </span>
              )}
            </div>

            {/* Auto-Cycling Midnight Countdown */}
            <CountdownTimer msRemaining={msToMidnight} onCountdownEnd={handleMidnightRefresh} />
          </div>

          {/* ── Main Layout Grid ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Visual Media Showcase (Left: 5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative group">
                {/* Glow Backdrop */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-amber-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-45 transition duration-500" />

                {/* Primary Image Container */}
                <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-stone-900 border border-amber-950/20 shadow-2xl">
                  {activeProduct.image && !imageError ? (
                    <img
                      src={activeProduct.image}
                      alt={activeProduct.name}
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950 text-stone-500 p-6 text-center">
                      <Sparkles size={48} className="opacity-30 mb-2 text-primary" />
                      <span className="text-xs font-black uppercase tracking-wider text-stone-400">
                        {activeProduct.name}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

                  {/* Hot Deal Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 bg-[#FFFDF9] text-stone-950 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-md">
                      <Zap size={10} className="text-primary fill-primary" />
                      Snack of the Day
                    </span>
                  </div>

                  {/* Action Badges */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <button
                      onClick={handleShare}
                      className="w-8 h-8 rounded-xl bg-stone-900/80 backdrop-blur-sm hover:bg-stone-900 text-stone-300 hover:text-white flex items-center justify-center transition-all border border-white/5 shadow-md"
                      aria-label="Share this deal"
                    >
                      {isCopied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                    </button>
                    <button
                      onClick={() => handleToggleFavoriteWithPersistence(activeProduct.id)}
                      className="w-8 h-8 rounded-xl bg-stone-900/80 backdrop-blur-sm hover:bg-stone-900 text-stone-300 hover:text-white flex items-center justify-center transition-all border border-white/5 shadow-md"
                      aria-label="Save to favorites"
                    >
                      <Heart
                        size={14}
                        className={isFavorite ? 'text-red-500 fill-red-500' : 'text-stone-300'}
                      />
                    </button>
                  </div>

                  {/* Category Pill Over Image */}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-black/60 border border-white/10 px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
                      {typeof activeProduct.category === 'string'
                        ? activeProduct.category
                        : activeProduct.category?.name || activeProduct.category?.slug || 'Snack'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Action Panel (Right: 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <StarRating rating={activeProduct.rating} reviewCount={activeProduct.reviewCount} />
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight text-white leading-tight">
                  {activeProduct.name}
                </h3>
              </div>

              <p className="text-stone-400 text-xs sm:text-sm md:text-base leading-relaxed">
                {activeProduct.description}
              </p>

              {/* Dynamic Metadata Lists (Ingredients / Allergens) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeProduct.ingredients && activeProduct.ingredients.length > 0 && (
                  <div className="p-3 bg-stone-900/40 rounded-xl border border-amber-950/10">
                    <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Sparkles size={10} /> Key Ingredients
                    </h4>
                    <p className="text-xs text-stone-400 truncate">
                      {activeProduct.ingredients.slice(0, 3).join(', ')}
                    </p>
                  </div>
                )}

                {activeProduct.allergens && activeProduct.allergens.length > 0 && (
                  <div className="p-3 bg-stone-900/40 rounded-xl border border-amber-950/10">
                    <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Info size={10} /> Allergen Advisory
                    </h4>
                    <p className="text-xs text-stone-400 truncate">
                      {activeProduct.allergens.join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Price & Quantity Purchase Card */}
              <div className="p-4 bg-stone-950/80 rounded-2xl border border-amber-950/15 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest leading-none">
                    Exclusive Price
                  </p>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight leading-none block pt-1">
                    {formatCurrency(activeProduct.price)}
                  </span>
                </div>

                {/* Counter Selector */}
                <div className="flex items-center bg-stone-900 rounded-xl p-1 border border-white/5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white font-bold disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-xs">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(activeProduct.stock || 20, q + 1))}
                    disabled={quantity >= (activeProduct.stock || 20)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white font-bold disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dynamic Stock Alarm Callout */}
              {activeProduct.stock !== undefined && activeProduct.stock <= 10 && activeProduct.stock > 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>
                    Only <strong className="font-black">{activeProduct.stock} batches</strong> left of
                    this recipe today!
                  </span>
                </div>
              )}

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAddToCartWithPersistence(activeProduct, quantity)}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
                    isAdded
                      ? 'bg-emerald-600 text-white shadow-emerald-950/20'
                      : 'bg-gradient-to-r from-primary to-orange-500 hover:from-primary-dark hover:to-orange-700 text-white shadow-primary/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} />
                      <span>Added to Basket</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>
                        Add to Basket • {formatCurrency(activeProduct.price * quantity)}
                      </span>
                    </>
                  )}
                </button>

                {/* Full Recipe Profile - Navigates to Product Detail Page */}
                <Link
                  to={`/product/${activeProduct.slug}`}
                  onClick={(e) => {
                    if (onViewDetails) {
                      e.preventDefault();
                      onViewDetails(activeProduct.slug);
                    }
                  }}
                  className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-white/5 transition-all flex items-center justify-center gap-1.5 group"
                >
                  <span>Full Recipe Profile</span>
                  <ArrowRight
                    size={14}
                    className="text-stone-400 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>

              {/* Upcoming Preview Indicator */}
              {nextProduct && (
                <div className="pt-4 border-t border-amber-950/10 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Fresh ingredients guaranteed</span>
                  </span>
                  <span>
                    Next tomorrow drop:{' '}
                    <strong className="text-stone-400 font-bold">{nextProduct.name}</strong>
                  </span>
                </div>
              )}

            </div>

          </div>
        </div>
      </Container>
    </section>
  );
};

export default SnackOfTheDay;