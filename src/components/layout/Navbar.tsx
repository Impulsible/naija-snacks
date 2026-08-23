import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  User as UserIcon,
  MapPin,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Flame,
  LogOut,
  Package,
  Star,
  Truck,
  Gift,
  Zap,
  Percent,
  Tag,
  Sparkles,
} from 'lucide-react';
import Container from './Container';
import type { Product, Category } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useAuth } from '../../context/AuthContext';

// ─── Types ─────────────────────────────────────────────────────────
export interface Promo {
  id: string;
  icon?: React.ElementType;
  badge?: string;
  message: string;
  highlight?: string;
  ctaText?: string;
  ctaLink?: string;
  gradient?: string;
  variant?: 'default' | 'flash' | 'discount' | 'delivery' | 'gift' | 'new';
}

interface NavbarProps {
  categories?: Category[];
  trendingProducts?: Product[];
  deliveryAddress?: string;
  estimatedDeliveryMinutes?: number;
  promos?: Promo[];
  promoRotationSpeed?: number;
  onAddressChange?: () => void;
}

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/categories', label: 'Categories' },
  { to: '/deals', label: 'Deals', badge: 'HOT' },
  { to: '/about', label: 'About' },
] as const;

// ─── Warm & Appetite-Inducing Promo Variant Themes ──────────────────
const PROMO_VARIANTS: Record<
  NonNullable<Promo['variant']>,
  { gradient: string; icon: React.ElementType; badgeColor: string }
> = {
  default: {
    gradient: 'from-orange-600 via-primary to-amber-600',
    icon: Sparkles,
    badgeColor: 'bg-black/20 border-white/30 text-white',
  },
  flash: {
    gradient: 'from-red-600 via-orange-600 to-amber-500',
    icon: Zap,
    badgeColor: 'bg-yellow-300/30 border-yellow-200/50 text-yellow-100',
  },
  discount: {
    gradient: 'from-emerald-700 via-teal-600 to-amber-600',
    icon: Percent,
    badgeColor: 'bg-white/20 border-white/40 text-white',
  },
  delivery: {
    gradient: 'from-amber-700 via-orange-600 to-primary',
    icon: Truck,
    badgeColor: 'bg-white/20 border-white/40 text-white',
  },
  gift: {
    gradient: 'from-pink-600 via-rose-500 to-amber-500',
    icon: Gift,
    badgeColor: 'bg-white/20 border-white/40 text-white',
  },
  new: {
    gradient: 'from-purple-700 via-primary to-orange-500',
    icon: Tag,
    badgeColor: 'bg-white/20 border-white/40 text-white',
  },
};

const DEFAULT_PROMOS: Promo[] = [
  {
    id: 'welcome',
    icon: Gift,
    badge: 'Welcome',
    message: 'Enjoy delicious Nigerian snacks delivered to your door',
    variant: 'default',
  },
  {
    id: 'delivery',
    icon: Truck,
    badge: 'Fast delivery',
    message: 'Fresh snacks, delivered fast',
    variant: 'delivery',
  },
];

// ─── Rotating Promo Banner ─────────────────────────────────────────
interface PromoBannerProps {
  promos: Promo[];
  rotationSpeed: number;
  estimatedDeliveryMinutes?: number;
}

const PromoBanner: React.FC<PromoBannerProps> = ({
  promos,
  rotationSpeed,
  estimatedDeliveryMinutes,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPaused || promos.length <= 1) return;

    timerRef.current = setInterval(() => {
      setDirection('next');
      setActiveIndex((prev) => (prev + 1) % promos.length);
    }, rotationSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, promos.length, rotationSpeed]);

  const goToNext = useCallback(() => {
    setDirection('next');
    setActiveIndex((prev) => (prev + 1) % promos.length);
  }, [promos.length]);

  const goToPrev = useCallback(() => {
    setDirection('prev');
    setActiveIndex((prev) => (prev - 1 + promos.length) % promos.length);
  }, [promos.length]);

  const goToIndex = useCallback((index: number) => {
    setDirection(index > activeIndex ? 'next' : 'prev');
    setActiveIndex(index);
  }, [activeIndex]);

  if (promos.length === 0) return null;

  const currentPromo = promos[activeIndex];
  const variant = currentPromo.variant || 'default';
  const theme = PROMO_VARIANTS[variant];
  const gradient = currentPromo.gradient || theme.gradient;

  return (
    <div
      className={`relative z-[101] w-full bg-gradient-to-r ${gradient} text-white overflow-hidden transition-all duration-700 shadow-inner`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Promotional announcements"
      aria-live="polite"
    >
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] animate-[shimmer-slide_4s_infinite]" />
      </div>

      <Container>
        <div className="relative flex items-center gap-3 py-2 min-w-0">
          {promos.length > 1 && (
            <button
              onClick={goToPrev}
              className="hidden md:flex shrink-0 items-center justify-center w-5.5 h-5.5 rounded-full bg-black/15 hover:bg-black/30 text-white/85 transition-all active:scale-95"
              aria-label="Previous promotion"
            >
              <ChevronLeft size={12} />
            </button>
          )}

          <div className="relative flex-1 min-w-0 h-6 overflow-hidden">
            {promos.map((promo, index) => {
              const promoTheme = PROMO_VARIANTS[promo.variant || 'default'];
              const IconComponent = promo.icon || promoTheme.icon;
              const isActive = index === activeIndex;
              const isPrev =
                (direction === 'next' && index === (activeIndex - 1 + promos.length) % promos.length) ||
                (direction === 'prev' && index === (activeIndex + 1) % promos.length);

              return (
                <div
                  key={promo.id}
                  className={`absolute inset-0 flex items-center gap-2.5 min-w-0 transition-all duration-500 ease-out ${
                    isActive
                      ? 'opacity-100 translate-y-0'
                      : isPrev
                      ? 'opacity-0 -translate-y-full'
                      : 'opacity-0 translate-y-full'
                  }`}
                  aria-hidden={!isActive}
                >
                  <div className="relative shrink-0">
                    <div className="w-5 h-5 rounded-full bg-black/25 backdrop-blur-xs flex items-center justify-center">
                      <IconComponent size={11} className="text-white" />
                    </div>
                    {promo.variant === 'flash' && (
                      <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                    )}
                  </div>

                  {promo.badge && (
                    <span
                      className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${promoTheme.badgeColor} backdrop-blur-xs shrink-0`}
                    >
                      {promo.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 min-w-0 text-xs font-semibold">
                    <span className="truncate text-white/95">{promo.message}</span>
                    {promo.highlight && (
                      <span className="hidden sm:inline font-black text-amber-200 shrink-0">
                        {promo.highlight}
                      </span>
                    )}
                  </div>

                  {promo.ctaText && promo.ctaLink && (
                    <Link
                      to={promo.ctaLink}
                      className="hidden md:inline-flex items-center gap-1 shrink-0 text-[11px] font-black text-white hover:underline underline-offset-2 group"
                    >
                      {promo.ctaText}
                      <ArrowRight
                        size={11}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {estimatedDeliveryMinutes !== undefined && (
              <div className="hidden sm:flex items-center gap-1 text-white/90 pr-2 border-r border-white/20 text-[11px] font-bold">
                <Clock size={11} />
                <span>~{estimatedDeliveryMinutes}m ETA</span>
              </div>
            )}

            {promos.length > 1 && (
              <div className="flex items-center gap-1 shrink-0">
                {promos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToIndex(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === activeIndex ? 'w-4 bg-white' : 'w-1 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to promotion ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {promos.length > 1 && (
              <button
                onClick={goToNext}
                className="hidden md:flex shrink-0 items-center justify-center w-5.5 h-5.5 rounded-full bg-black/15 hover:bg-black/30 text-white/85 transition-all active:scale-95"
                aria-label="Next promotion"
              >
                <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>
      </Container>

      {promos.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            key={`${activeIndex}-${isPaused}`}
            className="h-full bg-white/60"
            style={{ animation: `promo-progress ${rotationSpeed}ms linear forwards` }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Search Command Palette ──────────────────────────────────────────
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  trendingProducts: Product[];
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  categories,
  trendingProducts,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const filteredProducts = query.trim()
    ? trendingProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          String(p.category).toLowerCase().includes(query.toLowerCase())
      )
    : trendingProducts;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] rounded-3xl shadow-2xl border border-amber-950/10 overflow-hidden z-10 animate-[scaleUp_0.25s_cubic-bezier(0.16,1,0.3,1)]">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-3 px-4 sm:px-6 py-4.5 border-b border-amber-950/10 bg-amber-50/40"
        >
          <Search className="text-primary w-5 h-5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search freshly made Chin Chin, Meat Pie, Suya..."
            className="w-full min-w-0 text-sm sm:text-base font-bold text-stone-900 placeholder-stone-400 bg-transparent outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="shrink-0 text-[10px] font-bold text-stone-500 bg-stone-200/60 hover:bg-stone-200 px-2 py-1 rounded-md transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-full hover:bg-amber-100/60 text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto">
          {categories.length > 0 && (
            <div className="px-4 sm:px-6 py-4 border-b border-amber-950/[0.06] bg-amber-50/[0.15]">
              <p className="text-[10px] font-black text-amber-900/50 uppercase tracking-widest mb-3">
                Browse Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      navigate(`/categories/${cat.slug}`);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-100/60 text-amber-950 hover:bg-primary hover:text-white transition-colors shadow-2xs"
                  >
                    {cat.name}
                    <span className="ml-1 text-[10px] text-amber-900/40 font-normal">
                      ({cat.productCount})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center gap-1.5 mb-3 text-primary">
                <Flame size={12} />
                <p className="text-[10px] font-black text-amber-900/50 uppercase tracking-widest">
                  {query.trim() ? 'Matching Products' : 'Popular Right Now'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredProducts.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      navigate(`/product/${product.slug}`);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-amber-950/[0.07] hover:border-primary/40 hover:bg-orange-50/40 text-left transition-all group min-w-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100/40 overflow-hidden shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                          {product.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate">
                        {typeof product.category === 'string'
                          ? product.category
                          : product.category.name}
                      </p>
                    </div>
                    <span className="text-xs font-black text-emerald-700 shrink-0">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredProducts.length === 0 && query.trim() && (
            <div className="px-6 py-12 text-center">
              <Search className="w-8 h-8 text-stone-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-stone-600">
                No results found for "{query}"
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Try searching for another craveable snack item
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── User Dropdown Menu ────────────────────────────────────────────
interface UserMenuProps {
  user: any;
  onLogout?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.firstName && user?.lastName
    ? (user.firstName[0] + user.lastName[0]).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div ref={menuRef} className="relative z-[120] animate-[fadeIn_0.2s_ease-out]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-amber-100/50 hover:bg-amber-100 border border-amber-900/10 pl-1.5 pr-3 py-1.5 rounded-xl transition-all"
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center text-[10px] font-black">
          {initials}
        </div>
        <span className="hidden xl:inline text-xs font-bold text-stone-700 max-w-[80px] truncate">
          {user?.firstName || 'User'}
        </span>
        <ChevronDown
          size={12}
          className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#FFFDF9] rounded-2xl shadow-xl border border-amber-950/10 overflow-hidden animate-[scaleUp_0.15s_ease-out] origin-top-right z-[120]">
          <div className="p-4 bg-gradient-to-br from-primary/5 to-orange-50 border-b border-amber-950/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center text-sm font-black shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-stone-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-stone-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            {[
              { to: '/account', label: 'My Account', icon: UserIcon },
              { to: '/orders', label: 'My Orders', icon: Package },
              { to: '/favorites', label: 'Favorites', icon: Heart },
              { to: '/reviews', label: 'My Reviews', icon: Star },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-primary transition-colors"
              >
                <item.icon size={14} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="border-t border-amber-950/10 py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout?.();
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Navbar Component ──────────────────────────────────────────
const Navbar: React.FC<NavbarProps> = ({
  categories = [],
  trendingProducts = [],
  deliveryAddress,
  estimatedDeliveryMinutes,
  promos,
  promoRotationSpeed = 5000,
  onAddressChange,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ─── Auth & Cart Hooks ──────────────────────────────────────────
  const { user, isAuthenticated, logout } = useAuth();
  const { items, getTotalItems, openCart } = useCartStore();

  const cartCount = getTotalItems();
  const cartSummary = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    return {
      totalItems,
      totalPrice,
      formattedTotal: `₦${totalPrice.toLocaleString('en-NG')}`,
    };
  }, [items]);

  const activePromos = useMemo(
    () => (promos && promos.length > 0 ? promos : DEFAULT_PROMOS),
    [promos]
  );

  // ─── Effects ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      navigate(`/explore?category=${encodeURIComponent(categoryParam)}`);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openCart();
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes sparkle-float {
          0%, 100% { opacity: 0.3; transform: translateY(0) scale(1); }
          50% { opacity: 1; transform: translateY(-4px) scale(1.5); }
        }
        @keyframes promo-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>

      <div className="sticky top-0 z-[100] w-full flex flex-col">
        {/* ── 1. Top Rotating Promo Bar ─────────────────────────────── */}
        <PromoBanner
          promos={activePromos}
          rotationSpeed={promoRotationSpeed}
          estimatedDeliveryMinutes={estimatedDeliveryMinutes}
        />

        {/* ── 2. Header Container ────────────────────────────────────── */}
        <header
          className={`w-full transition-all duration-300 ${
            isScrolled
              ? 'bg-[#FFFDF9]/95 backdrop-blur-xl shadow-md shadow-amber-950/[0.04] border-b border-amber-950/10 py-2.5'
              : 'bg-[#FFFDF9] border-b border-amber-950/[0.06] py-3.5'
          }`}
        >
          <Container>
            <div className="flex items-center justify-between gap-3 sm:gap-4 min-w-0">
              {/* ── LOGO WITH IMAGE ── */}
              <Link to="/" className="flex items-center gap-2.5 shrink-0 group focus:outline-none">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                  <img 
                    src="/images/logo.png" 
                    alt="NaijaSnacks" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#FFFDF9] rounded-full" />
                </div>
                <div className="hidden sm:flex flex-col min-w-0">
                  <span className="font-heading font-black text-base tracking-tight text-stone-900 leading-none">
                    NAIJA<span className="text-primary">SNACKS</span>
                  </span>
                  <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest leading-none mt-1">
                    Fresh Warm Express
                  </span>
                </div>
              </Link>

              {/* LOCATION SELECTOR */}
              {deliveryAddress && (
                <button
                  onClick={onAddressChange}
                  className="hidden xl:flex items-center gap-2 bg-amber-100/50 hover:bg-amber-100 border border-amber-900/10 px-3 py-1.5 rounded-xl transition-all text-left min-w-0 max-w-[210px]"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-800 shrink-0">
                    <MapPin size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-black text-amber-900/50 uppercase tracking-wider leading-tight">
                      Deliver to
                    </div>
                    <div className="text-[11px] font-bold text-stone-800 truncate leading-tight">
                      {deliveryAddress}
                    </div>
                  </div>
                  <ChevronDown size={12} className="text-stone-400 shrink-0" />
                </button>
              )}

              {/* NAV LINKS */}
              <nav className="hidden lg:flex items-center gap-1 bg-amber-100/40 p-1.5 rounded-full border border-amber-950/[0.07] shrink-0">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-stone-950 shadow-sm border border-amber-950/10'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                      }`
                    }
                  >
                    <span className="flex items-center gap-1">
                      {link.label}
                      {'badge' in link && link.badge && (
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-primary text-white text-[8px] font-black rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </span>
                  </NavLink>
                ))}
              </nav>

              {/* ACTIONS */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Search */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-100/50 hover:bg-amber-100/80 border border-amber-950/10 text-stone-600 transition-all"
                  aria-label="Search"
                >
                  <Search size={15} className="text-stone-700" />
                  <span className="hidden md:inline text-xs font-medium text-stone-400">
                    Search...
                  </span>
                  <kbd className="hidden md:inline-flex items-center text-[9px] font-bold bg-white/80 text-stone-500 px-1.5 py-0.5 rounded border border-amber-905/10">
                    ⌘K
                  </kbd>
                </button>

                {/* Favorites */}
                <Link
                  to="/favorites"
                  className="hidden sm:inline-flex p-2 rounded-2xl hover:bg-amber-100/60 text-stone-700 hover:text-primary transition-colors"
                  aria-label="Favorites"
                >
                  <Heart size={18} />
                </Link>

                {/* Cart */}
                <button
                  onClick={handleCartClick}
                  className="group flex items-center gap-2 bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white pl-2.5 pr-3 py-2 rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  aria-label={`Cart (${cartCount} items)`}
                >
                  <div className="relative">
                    <ShoppingBag size={16} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-amber-200 text-stone-950 text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </div>
                  {cartCount > 0 && (
                    <span className="hidden sm:inline border-l border-white/25 pl-2 font-bold tracking-tight">
                      {cartSummary.formattedTotal}
                    </span>
                  )}
                </button>

                {/* User Menu / Sign In */}
                {isAuthenticated && user ? (
                  <div className="hidden lg:block">
                    <UserMenu user={user} onLogout={handleLogout} />
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="hidden lg:inline-flex items-center gap-1.5 bg-amber-100/60 hover:bg-amber-100 border border-amber-900/10 px-3 py-2 rounded-2xl text-xs font-bold text-stone-800 transition-all"
                  >
                    <UserIcon size={13} />
                    <span>Sign In</span>
                  </Link>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl hover:bg-amber-100/60 text-stone-700 transition-colors"
                  aria-label="Menu"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </Container>
        </header>
      </div>

      {/* ── Search Modal ──────────────────────────────────────────── */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        categories={categories}
        trendingProducts={trendingProducts}
      />

      {/* ── Mobile Menu Drawer ────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[120]">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#FFFDF9] shadow-2xl flex flex-col animate-[slideInRight_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden border-l border-amber-950/10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-950/10 shrink-0 bg-amber-50/15">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Mobile Logo with Image */}
                <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
                  <img 
                    src="/images/logo.png" 
                    alt="NaijaSnacks" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-heading font-black text-base text-stone-900 truncate">
                  NAIJA<span className="text-primary">SNACKS</span>
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-amber-100/60 text-stone-500 shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* User Card */}
              {isAuthenticated && user && (
                <Link
                  to="/account"
                  className="flex items-center gap-3 p-3 bg-gradient-to-br from-primary/5 to-orange-50 rounded-2xl border border-amber-950/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center font-black shrink-0">
                    {user.firstName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                  </div>
                  <ArrowRight size={16} className="text-stone-400 shrink-0" />
                </Link>
              )}

              {/* Address Picker */}
              {deliveryAddress && (
                <button
                  onClick={() => {
                    onAddressChange?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-amber-50/45 rounded-2xl border border-amber-950/10 text-left hover:bg-amber-100/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-primary shrink-0 border border-amber-950/5">
                    <MapPin size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black text-amber-900/50 uppercase tracking-wider">
                      Deliver to
                    </p>
                    <p className="text-xs font-bold text-stone-800 truncate">{deliveryAddress}</p>
                  </div>
                  <ChevronDown size={14} className="text-stone-400 shrink-0" />
                </button>
              )}

              {/* Navigation Links */}
              <nav className="space-y-1">
                <p className="text-[10px] font-black text-amber-900/50 uppercase tracking-widest px-3 py-2">
                  Menu
                </p>
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-stone-700 hover:bg-amber-100/40 hover:text-stone-900'
                      }`
                    }
                  >
                    <span className="flex items-center gap-2">
                      {link.label}
                      {'badge' in link && link.badge && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-extrabold rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </span>
                    <ArrowRight size={14} className="text-stone-300" />
                  </NavLink>
                ))}
              </nav>

              {/* Quick Links */}
              <div className="pt-3 border-t border-amber-950/10 space-y-1">
                <p className="text-[10px] font-black text-amber-900/50 uppercase tracking-widest px-3 py-2">
                  Quick Access
                </p>
                {[
                  { to: '/favorites', label: 'Favorites', icon: Heart },
                  { to: '/orders', label: 'My Orders', icon: Package },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-primary rounded-xl transition-colors"
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer Sign-In Actions */}
            <div className="border-t border-amber-950/10 p-4 space-y-2 shrink-0 bg-amber-50/10">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white hover:bg-amber-50 border border-amber-950/10 text-xs font-bold text-stone-800 transition-colors shadow-2xs"
                  >
                    <UserIcon size={14} />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-orange-600 text-white text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all"
                  >
                    Create Account
                    <ArrowRight size={14} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;