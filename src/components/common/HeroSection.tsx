import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  Clock,
  MapPin,
  Truck,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Zap,
  Play,
  Heart,
  Plus,
} from 'lucide-react';
import Container from '../layout/Container';
import type { Product, Category } from '../../types';
import { useFeaturedProducts } from '../../hooks/useProducts';

// ─── Fallback Images ─────────────────────────────────────────────────
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1629904853716-f0bc54eea481?w=600&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1601050690597-df0568f70952?w=600&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=600&fit=crop&auto=format',
];

// ─── Utilities ──────────────────────────────────────────────────────
const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

const usePrefersReducedMotion = (): boolean => {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return prefersReduced;
};

// ─── Types ──────────────────────────────────────────────────────────
interface HeroSectionProps {
  featuredProducts?: Product[];
  categories?: Category[];
  totalProducts?: number;
  totalCustomers?: number;
  averageRating?: number;
  averageDeliveryMinutes?: number;
  onExplore?: () => void;
  onWatchDemo?: () => void;
  onSearch?: (query: string) => void;
  onProductClick?: (product: Product) => void;
}

// ─── Product Image with Fallback ────────────────────────────────────
const ProductImage: React.FC<{
  product: Product;
  className?: string;
  imgClassName?: string;
  fallbackIconSize?: number;
  index?: number;
}> = ({ product, imgClassName = '', index = 0 }) => {
  const [hasError, setHasError] = useState(false);

  if (!product.image || hasError) {
    const fallbackImage = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    return (
      <img
        src={fallbackImage}
        alt={product.name}
        className={imgClassName || 'w-full h-full object-cover'}
        loading="eager"
      />
    );
  }

  return (
    <img
      src={product.image}
      alt={product.name}
      className={imgClassName || 'w-full h-full object-cover'}
      loading="eager"
      onError={() => setHasError(true)}
    />
  );
};

// ─── Floating Product Card ──────────────────────────────────────────
interface FloatingCardProps {
  product: Product;
  positionClasses: string;
  delay: number;
  size?: 'sm' | 'md';
  reducedMotion: boolean;
  onClick?: (product: Product) => void;
  index?: number;
}

const FloatingProductCard: React.FC<FloatingCardProps> = ({
  product,
  positionClasses,
  delay,
  size = 'md',
  reducedMotion,
  onClick,
  index = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const sizes = {
    sm: 'w-[100px] sm:w-[120px]',
    md: 'w-[130px] sm:w-[150px]',
  };

  return (
    <button
      onClick={() => onClick?.(product)}
      className={`absolute ${positionClasses} z-30 transition-all duration-1000 ease-out group ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-90'
      }`}
      style={{
        animation:
          isVisible && !reducedMotion
            ? `float-gentle 6s ease-in-out ${delay / 1000}s infinite`
            : 'none',
      }}
      aria-label={`View ${product.name}`}
    >
      <div
        className={`${sizes[size]} bg-white rounded-2xl p-2 shadow-2xl shadow-black/15 border border-white/80 hover:scale-105 hover:-translate-y-1 hover:shadow-primary/20 transition-all duration-500 cursor-pointer`}
      >
        <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gradient-to-br from-gray-50 to-gray-100">
          <ProductImage
            product={product}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            fallbackIconSize={32}
            index={index}
          />

          <div className="absolute top-1.5 right-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
            <Star size={8} className="fill-yellow-400 text-yellow-400" />
            {product.rating.toFixed(1)}
          </div>

          <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
            <Plus size={12} strokeWidth={3} />
          </div>
        </div>
        <div className="px-1 pb-0.5">
          <p className="text-xs font-bold text-gray-800 truncate">
            {product.name}
          </p>
          <p className="text-xs font-black text-emerald-600 mt-0.5">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </button>
  );
};

// ─── Animated Counter ───────────────────────────────────────────────
const AnimatedCounter: React.FC<{
  end: number;
  suffix?: string;
  duration?: number;
  decimals?: number;
  label: string;
  icon: React.ElementType;
  reducedMotion: boolean;
}> = ({
  end,
  suffix = '',
  duration = 2000,
  decimals = 0,
  label,
  icon: Icon,
  reducedMotion,
}) => {
  const [count, setCount] = useState(reducedMotion ? end : 0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      setCount(end);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reducedMotion, end]);

  useEffect(() => {
    if (!isVisible || reducedMotion) return;
    let raf: number;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(eased * end);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isVisible, end, duration, reducedMotion]);

  const display =
    decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();

  return (
    <div
      ref={ref}
      className="group relative bg-white/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/80 hover:bg-white/95 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 min-w-0"
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shrink-0">
          <Icon size={14} className="text-primary" />
        </div>
        <span className="font-heading font-black text-xl sm:text-2xl md:text-3xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
          {display}
          {suffix}
        </span>
      </div>
      <span className="text-xs sm:text-sm text-gray-500 font-medium">
        {label}
      </span>
    </div>
  );
};

// ─── Delivery Tracker Pill ──────────────────────────────────────────
const DELIVERY_STEPS = [
  'Order Placed',
  'Preparing',
  'On the Way',
  'Delivered!',
] as const;

const DeliveryTrackerPill: React.FC<{ reducedMotion: boolean }> = ({
  reducedMotion,
}) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % DELIVERY_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div className="inline-flex items-center gap-2.5 sm:gap-3 bg-white/80 backdrop-blur-xl px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-lg shadow-black/5 border border-white/60 max-w-full">
      <div className="relative shrink-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
          <Truck size={12} className="text-white sm:w-3.5 sm:h-3.5" />
        </div>
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full" />
      </div>

      <div className="flex flex-col min-w-0">
        <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Live Tracking
        </span>
        <span
          key={step}
          className="text-xs sm:text-sm font-bold text-gray-800 truncate"
          style={{
            animation: reducedMotion ? 'none' : 'slideUp 0.5s ease-out',
          }}
        >
          {DELIVERY_STEPS[step]}
        </span>
      </div>

      <div className="hidden sm:flex gap-1 ml-1 shrink-0">
        {DELIVERY_STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= step ? 'w-4 bg-emerald-500' : 'w-1.5 bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Search Bar ─────────────────────────────────────────────────────
interface SearchBarProps {
  categories: Category[];
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ categories, onSearch }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const placeholders = useMemo(() => {
    if (categories.length === 0) return ['Search for snacks...'];
    return categories.slice(0, 4).map((c) => `Search for ${c.name}...`);
  }, [categories]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  useEffect(() => {
    const text = placeholders[currentIndex];
    let charIndex = 0;
    setPlaceholder('');
    const typeInterval = setInterval(() => {
      if (charIndex <= text.length) {
        setPlaceholder(text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 55);
    return () => clearInterval(typeInterval);
  }, [currentIndex, placeholders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center bg-white/85 backdrop-blur-xl rounded-2xl border-2 transition-all duration-500 shadow-lg shadow-black/5 max-w-lg w-full ${
        isFocused
          ? 'border-primary/40 shadow-xl shadow-primary/10'
          : 'border-white/60 hover:border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 pl-4 sm:pl-5 pr-2 py-3 sm:py-4 flex-1 min-w-0">
        <MapPin
          size={16}
          className={`shrink-0 transition-colors duration-300 ${
            isFocused ? 'text-primary' : 'text-gray-400'
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="bg-transparent outline-none text-gray-800 placeholder-gray-400 w-full min-w-0 text-sm font-medium"
          aria-label="Search snacks"
        />
      </div>
      <button
        type="submit"
        disabled={!query.trim()}
        className="bg-gradient-to-r from-primary to-primary/90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl m-1.5 font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 group shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Search</span>
        <ArrowRight
          size={14}
          className="group-hover:translate-x-0.5 transition-transform duration-300"
        />
      </button>
    </form>
  );
};

// ─── Trust Badge ────────────────────────────────────────────────────
const TrustBadge: React.FC<{
  icon: React.ElementType;
  text: string;
  delay: number;
}> = ({ icon: Icon, text, delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`flex items-center gap-2 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Icon size={12} className="text-primary" />
      </div>
      <span className="text-xs sm:text-sm text-gray-600 font-semibold whitespace-nowrap">
        {text}
      </span>
    </div>
  );
};

// ─── Hero Product Showcase (Main Image with rotation) ───────────────
const HeroShowcase: React.FC<{
  products: Product[];
  reducedMotion: boolean;
  onProductClick?: (product: Product) => void;
}> = ({ products, reducedMotion, onProductClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (reducedMotion || products.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length, reducedMotion]);

  if (products.length === 0) return null;

  const activeProduct = products[activeIndex];

  return (
    <div className="relative w-full aspect-square max-w-[520px] mx-auto">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-orange-200/25 to-amber-100/30 blur-3xl scale-95" />
      <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-amber-100/40 to-orange-50/60" />

      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none ${
          reducedMotion ? '' : 'animate-[spin_40s_linear_infinite]'
        }`}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r="48.5"
          fill="none"
          stroke="url(#dash-gradient)"
          strokeWidth="0.3"
          strokeDasharray="1.5 2"
          opacity="0.5"
        />
        <defs>
          <linearGradient id="dash-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e85d04" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#e85d04" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        className={`absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none ${
          reducedMotion ? '' : 'animate-[spin_60s_linear_infinite_reverse]'
        }`}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r="49"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="0.15"
          strokeDasharray="0.5 4"
          opacity="0.3"
        />
      </svg>

      <div className="absolute inset-8 md:inset-10 rounded-full overflow-hidden shadow-2xl shadow-primary/20 bg-white group">
        <div className="relative w-full h-full">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === activeIndex
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-110'
              }`}
              aria-hidden={index !== activeIndex}
            >
              <ProductImage
                product={product}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover"
                fallbackIconSize={80}
                index={index}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 via-transparent to-transparent pointer-events-none" />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {String(activeProduct.category || 'Snack')}
          </span>
        </div>

        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={16}
            className={`transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'
            }`}
          />
        </button>

        <button
          onClick={() => onProductClick?.(activeProduct)}
          className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl border border-white/60 flex items-center justify-between gap-3 hover:bg-white transition-colors group/card text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={9}
                    className={
                      i <= Math.floor(activeProduct.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-gray-500">
                {activeProduct.rating.toFixed(1)} ({activeProduct.reviewCount})
              </span>
            </div>
            <p className="text-sm font-black text-gray-900 truncate">
              {activeProduct.name}
            </p>
            <p className="text-xs font-black text-primary mt-0.5">
              {formatPrice(activeProduct.price)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0 group-hover/card:bg-primary group-hover/card:rotate-45 transition-all duration-300">
            <ArrowRight size={16} />
          </div>
        </button>
      </div>

      {products.length > 1 && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 bg-white/90 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-white/60">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === activeIndex
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`View product ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Hero Section ──────────────────────────────────────────────
const HeroSection: React.FC<HeroSectionProps> = ({
  featuredProducts: propFeaturedProducts,
  categories: propCategories,
  totalProducts = 50,
  totalCustomers = 5000,
  averageRating = 4.8,
  averageDeliveryMinutes = 30,
  onExplore,
  onWatchDemo,
  onSearch,
  onProductClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();

  // Fetch data from API if not provided as props
  const { data: fetchedFeatured, isLoading: featuredLoading } = useFeaturedProducts(6);
  const featuredProducts = propFeaturedProducts || fetchedFeatured || [];
  const categories = propCategories || [];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth - 0.5) * 15,
          y: (e.clientY / window.innerHeight - 0.5) * 15,
        });
        rafRef.current = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  const handleSearch = useCallback(
    (query: string) => {
      if (onSearch) onSearch(query);
      else navigate(`/explore?search=${encodeURIComponent(query)}`);
    },
    [onSearch, navigate]
  );

  const handleExplore = useCallback(() => {
    if (onExplore) onExplore();
    else navigate('/explore');
  }, [onExplore, navigate]);

  const handleWatchDemo = useCallback(() => {
    if (onWatchDemo) onWatchDemo();
  }, [onWatchDemo]);

  const handleProductClick = useCallback(
    (product: Product) => {
      if (onProductClick) onProductClick(product);
      else navigate(`/product/${product.slug}`);
    },
    [onProductClick, navigate]
  );

  const stats = useMemo(
    () =>
      [
        totalProducts !== undefined && {
          end: totalProducts,
          suffix: '+',
          label: 'Snack Varieties',
          icon: Sparkles,
        },
        totalCustomers !== undefined && {
          end: totalCustomers,
          suffix: totalCustomers >= 1000 ? '+' : '',
          label: 'Happy Customers',
          icon: Star,
        },
        averageDeliveryMinutes !== undefined && {
          end: averageDeliveryMinutes,
          suffix: ' min',
          label: 'Avg. Delivery',
          icon: Clock,
        },
        averageRating !== undefined && {
          end: averageRating,
          suffix: '',
          label: 'App Rating',
          icon: ShieldCheck,
          decimals: 1,
        },
      ].filter(Boolean) as Array<{
        end: number;
        suffix: string;
        label: string;
        icon: React.ElementType;
        decimals?: number;
      }>,
    [totalProducts, totalCustomers, averageDeliveryMinutes, averageRating]
  );

  const trustBadges = useMemo(
    () => [
      { icon: Clock, text: 'Fast delivery' },
      { icon: ShieldCheck, text: 'Quality guaranteed' },
      { icon: Truck, text: 'Free delivery over ₦5k' },
    ],
    []
  );

  const showcaseProducts = featuredProducts.slice(0, 3);
  const floatingProducts = featuredProducts.slice(3, 6);

  // Show loading skeleton while fetching
  if (featuredLoading) {
    return (
      <section className="relative w-full overflow-x-clip overflow-y-visible bg-gradient-to-br from-orange-50 via-amber-50/30 to-rose-50/40 py-20">
        <Container>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded-full w-48" />
              <div className="space-y-4">
                <div className="h-16 bg-gray-200 rounded-xl w-3/4" />
                <div className="h-16 bg-gray-200 rounded-xl w-2/3" />
              </div>
              <div className="h-6 bg-gray-200 rounded-xl w-1/2" />
              <div className="h-14 bg-gray-200 rounded-2xl w-full" />
              <div className="flex gap-4">
                <div className="h-14 bg-gray-200 rounded-2xl w-36" />
                <div className="h-14 bg-gray-200 rounded-2xl w-48" />
              </div>
            </div>
            <div className="aspect-square max-w-[520px] mx-auto bg-gray-200 rounded-full animate-pulse" />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-x-clip overflow-y-visible bg-gradient-to-br from-orange-50 via-amber-50/30 to-rose-50/40"
      aria-labelledby="hero-heading"
    >
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(1deg); }
          66% { transform: translateY(-4px) rotate(-1deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob-morph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          33% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          66% { border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .hero-gradient-text {
          background: linear-gradient(135deg, #e85d04, #dc2f02, #f59e0b);
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 3s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-gradient-text,
          .shimmer-effect::after {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px, 0)`,
          transition: 'transform 0.4s ease-out',
        }}
      >
        <div
          className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-gradient-to-br from-primary/15 to-orange-300/10"
          style={{
            animation: reducedMotion
              ? 'none'
              : 'blob-morph 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/2 -left-32 w-[350px] h-[350px] bg-gradient-to-br from-amber-200/20 to-yellow-300/10"
          style={{
            animation: reducedMotion
              ? 'none'
              : 'blob-morph 15s ease-in-out infinite 2s',
          }}
        />
        <div
          className="absolute -bottom-20 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-rose-200/15 to-pink-300/10"
          style={{
            animation: reducedMotion
              ? 'none'
              : 'blob-morph 10s ease-in-out infinite 4s',
          }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <Container>
        <div className="relative z-10 pt-8 pb-16 md:pt-16 md:pb-24 lg:pt-20 lg:pb-28 min-h-screen flex flex-col justify-center">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 xl:gap-16 items-center">
            {/* ── Left: Content ─────────────────────────────────────── */}
            <div className="space-y-6 md:space-y-8 min-w-0 order-2 lg:order-1">
              <div
                className={`transition-all duration-1000 delay-100 ${
                  isLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
              >
                <DeliveryTrackerPill reducedMotion={reducedMotion} />
              </div>

              <div
                className={`space-y-4 transition-all duration-1000 delay-300 ${
                  isLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
              >
                <h1
                  id="hero-heading"
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight"
                >
                  <span className="block text-gray-900">
                    Discover the Taste
                  </span>
                  <span className="block hero-gradient-text">of Naija,</span>
                  <span className="flex items-center gap-3 text-gray-900 flex-wrap">
                    Delivered
                    <span className="inline-flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 shadow-xl shadow-primary/25">
                      <Zap
                        size={20}
                        className="text-white sm:w-6 sm:h-6"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </h1>
              </div>

              <p
                className={`text-base sm:text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed transition-all duration-1000 delay-500 ${
                  isLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
              >
                From crispy{' '}
                <span className="text-gray-800 font-semibold">Chin Chin</span>{' '}
                to freshly baked{' '}
                <span className="text-gray-800 font-semibold">Meat Pie</span>—
                order in minutes, delivered warm to your door.
              </p>

              <div
                className={`transition-all duration-1000 delay-700 ${
                  isLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
              >
                <SearchBar categories={categories} onSearch={handleSearch} />
              </div>

              <div
                className={`flex flex-col sm:flex-row gap-3 sm:gap-4 transition-all duration-1000 delay-[800ms] ${
                  isLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
              >
                <button
                  onClick={handleExplore}
                  className="group relative bg-gradient-to-r from-primary to-orange-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-300 shimmer-effect flex items-center justify-center gap-2.5 overflow-hidden"
                >
                  <Sparkles
                    size={16}
                    className="group-hover:rotate-12 transition-transform duration-300"
                  />
                  <span>Order Now</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </button>

                {onWatchDemo && (
                  <button
                    onClick={handleWatchDemo}
                    className="group flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base text-gray-700 bg-white/60 backdrop-blur-md border border-white/80 hover:bg-white hover:shadow-lg active:scale-[0.98] transition-all duration-300"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300 shrink-0">
                      <Play
                        size={14}
                        className="text-gray-600 group-hover:text-primary ml-0.5 transition-colors duration-300"
                      />
                    </div>
                    <span>Watch How It Works</span>
                  </button>
                )}
              </div>

              <div
                className={`flex flex-wrap gap-x-5 gap-y-3 transition-all duration-1000 delay-[1000ms] ${
                  isLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
              >
                {trustBadges.map((badge, index) => (
                  <TrustBadge
                    key={badge.text}
                    icon={badge.icon}
                    text={badge.text}
                    delay={1200 + index * 200}
                  />
                ))}
              </div>
            </div>

            {/* ── Right: Beautiful Snack Showcase ───────────────────── */}
            {showcaseProducts.length > 0 && (
              <div
                className={`relative order-1 lg:order-2 transition-all duration-1000 delay-500 ${
                  isLoaded
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 translate-x-8 scale-95'
                }`}
              >
                <div
                  className="relative"
                  style={{
                    transform: reducedMotion
                      ? 'none'
                      : `translate3d(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.15}px, 0)`,
                    transition: 'transform 0.4s ease-out',
                    willChange: reducedMotion ? 'auto' : 'transform',
                  }}
                >
                  <HeroShowcase
                    products={showcaseProducts}
                    reducedMotion={reducedMotion}
                    onProductClick={handleProductClick}
                  />

                  {floatingProducts[0] && (
                    <FloatingProductCard
                      product={floatingProducts[0]}
                      positionClasses="top-4 -left-2 sm:-left-4 lg:-left-2 xl:-left-8"
                      delay={1000}
                      reducedMotion={reducedMotion}
                      onClick={handleProductClick}
                      index={3}
                    />
                  )}
                  {floatingProducts[1] && (
                    <FloatingProductCard
                      product={floatingProducts[1]}
                      positionClasses="top-1/3 -right-2 sm:-right-4 lg:-right-2 xl:-right-8"
                      delay={1300}
                      size="sm"
                      reducedMotion={reducedMotion}
                      onClick={handleProductClick}
                      index={4}
                    />
                  )}
                  {floatingProducts[2] && (
                    <FloatingProductCard
                      product={floatingProducts[2]}
                      positionClasses="bottom-8 left-2 sm:-left-2 lg:left-4 xl:-left-4"
                      delay={1600}
                      size="sm"
                      reducedMotion={reducedMotion}
                      onClick={handleProductClick}
                      index={5}
                    />
                  )}

                  <div
                    className={`absolute top-16 -right-2 sm:-right-4 lg:top-8 xl:-right-6 z-30 transition-all duration-1000 delay-[1800ms] ${
                      isLoaded
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-8'
                    }`}
                  >
                    <div className="bg-white rounded-2xl px-3 py-2.5 shadow-2xl shadow-black/15 border border-white/80 flex items-center gap-2.5 max-w-[190px]">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                          <ShieldCheck size={15} className="text-white" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                          <svg
                            className="w-1.5 h-1.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={4}
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-gray-900">
                          Just Delivered!
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          Warm & fresh
                        </p>
                      </div>
                    </div>
                  </div>

                  {averageRating !== undefined && (
                    <div
                      className={`absolute bottom-1/3 left-0 sm:-left-2 lg:left-2 xl:-left-6 z-30 transition-all duration-1000 delay-[2000ms] ${
                        isLoaded
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-6'
                      }`}
                    >
                      <div className="bg-white rounded-2xl px-3 py-2.5 shadow-2xl shadow-black/15 border border-white/80">
                        <div className="flex items-center gap-0.5 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={11}
                              className={
                                i <= Math.floor(averageRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-yellow-400/40 text-yellow-400/40'
                              }
                            />
                          ))}
                        </div>
                        <p className="text-[11px] font-black text-gray-900">
                          {averageRating.toFixed(1)}
                          {totalCustomers !== undefined && (
                            <span className="font-medium text-gray-500 ml-1">
                              ({totalCustomers >= 1000
                                ? `${(totalCustomers / 1000).toFixed(1)}k`
                                : totalCustomers}
                              + reviews)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {stats.length > 0 && (
            <div
              className={`mt-12 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl transition-all duration-1000 delay-[1200ms] ${
                isLoaded
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              {stats.map((stat) => (
                <AnimatedCounter
                  key={stat.label}
                  end={stat.end}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  label={stat.label}
                  icon={stat.icon}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          )}

          <div
            className={`hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 transition-all duration-1000 delay-[2000ms] ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
              Scroll to explore
            </span>
            <ChevronDown
              size={18}
              className="text-gray-400 animate-bounce"
              aria-hidden="true"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;