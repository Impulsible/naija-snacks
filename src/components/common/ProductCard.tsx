import React, { useState, useCallback, memo, useMemo, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingCart,
  Check,
  Eye,
  Sparkles,
  Flame,
  Clock,
} from 'lucide-react';
import type { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useAuth } from '../../context/AuthContext';

// ─── Types & Interfaces ─────────────────────────────────────────────
export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  onToggleFavorite?: (productId: string, isFavorite: boolean) => void;
  onQuickView?: (product: Product) => void;
  onClick?: (product: Product) => void;
  className?: string;
}

// ─── Helper Functions ──────────────────────────────────────────────
const getCategoryName = (category: any): string => {
  if (!category) return 'Naija Snack';
  if (typeof category === 'string') return category;
  if (typeof category === 'object' && category.name) return category.name;
  return 'Naija Snack';
};

const getDescriptionText = (description: any): string => {
  if (!description) return '';
  if (typeof description === 'string') return description;
  if (typeof description === 'object' && description.text) return description.text;
  return '';
};

// ─── Star Rating Sub-component ──────────────────────────────────────
const RatingBadge = memo(function RatingBadge({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`Rated ${rating.toFixed(1)} out of 5 stars from ${reviewCount} reviews`}
    >
      <div className="flex items-center">
        <Star size={13} className="text-amber-400 fill-amber-400" aria-hidden="true" />
      </div>
      <span className="text-xs font-bold text-zinc-900 tabular-nums">
        {rating.toFixed(1)}
      </span>
      <span className="text-[11px] text-zinc-400 font-medium">
        ({reviewCount > 999 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
      </span>
    </div>
  );
});

// ─── Main Product Card Component ───────────────────────────────────
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  onClick,
  className = '',
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use cart store for persistence
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuth();

  const isAvailable = product.stock > 0;

  // Safely get values from potentially nested objects
  const categoryName = useMemo(() => getCategoryName(product.category), [product.category]);
  const descriptionText = useMemo(() => getDescriptionText(product.description), [product.description]);

  // Discount calculation (if originalPrice exists on product)
  const discountPercent = useMemo(() => {
    const originalPrice = (product as any).originalPrice;
    if (!originalPrice || originalPrice <= product.price) return null;
    return Math.round(((originalPrice - product.price) / originalPrice) * 100);
  }, [product.price, (product as any).originalPrice]);

  // Load favorite state from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isFavorited = savedFavorites.includes(product.id);
      setIsFavorite(isFavorited);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, [product.id]);

  // Handlers
  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        window.location.href = '/login';
        return;
      }

      const nextState = !isFavorite;
      setIsFavorite(nextState);
      
      // Persist to localStorage
      try {
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (nextState) {
          if (!savedFavorites.includes(product.id)) {
            localStorage.setItem('favorites', JSON.stringify([...savedFavorites, product.id]));
          }
        } else {
          localStorage.setItem('favorites', JSON.stringify(savedFavorites.filter((id: string) => id !== product.id)));
        }
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
      
      onToggleFavorite?.(product.id, nextState);
    },
    [isFavorite, onToggleFavorite, product.id, isAuthenticated]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!isAvailable || isAdded) return;

      // Use the cart store to add item (persists to localStorage)
      addItem(product, 1);
      setIsAdded(true);

      // Call external callback if provided
      onAddToCart?.(product, 1);

      setTimeout(() => {
        setIsAdded(false);
      }, 1800);
    },
    [isAvailable, isAdded, onAddToCart, product, addItem]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onQuickView?.(product);
    },
    [onQuickView, product]
  );

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(product);
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between bg-white rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-xl hover:shadow-orange-500/8 hover:border-orange-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
        !isAvailable ? 'opacity-75' : ''
      } ${className}`}
    >
      {/* ── Top Media Area ─────────────────────────────────────────── */}
      <div className="relative w-full aspect-[4/3] bg-zinc-100 overflow-hidden">
        {/* Clickable Image Link Container */}
        <a
          href={`/product/${product.slug}`}
          onClick={handleCardClick}
          className="block w-full h-full cursor-pointer focus:outline-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          {/* Skeleton placeholder before load */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 via-zinc-200/60 to-zinc-100 animate-pulse" />
          )}

          {/* Product Image */}
          {!imageError ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108 ${
                !isAvailable ? 'grayscale contrast-75' : ''
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            /* Fallback Graphic */
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50/50 p-4 text-orange-400">
              <Sparkles size={36} className="opacity-40 mb-1" />
              <span className="text-[11px] font-semibold text-zinc-400">Image unavailable</span>
            </div>
          )}

          {/* Vignette Gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </a>

        {/* ── Top Floating Badges (Left) ───────────────────────────── */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5 pointer-events-none">
          {product.featured && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md shadow-orange-500/20">
              <Sparkles size={10} className="fill-zinc-950" />
              Featured
            </span>
          )}

          {discountPercent && (
            <span className="inline-flex items-center bg-red-600 text-white font-black text-[10px] tracking-wide px-2 py-0.5 rounded-full shadow-xs">
              -{discountPercent}%
            </span>
          )}

          {product.isNew && !product.featured && (
            <span className="inline-flex items-center bg-emerald-600 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              Fresh Drop
            </span>
          )}

          {product.isSpicy && (
            <span className="inline-flex items-center gap-0.5 bg-orange-600/90 backdrop-blur-xs text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              <Flame size={10} className="fill-white" />
              Spicy
            </span>
          )}
        </div>

        {/* ── Top Actions (Right) ──────────────────────────────────── */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {/* Quick View Button (Desktop Hover) */}
          {onQuickView && isAvailable && (
            <button
              type="button"
              onClick={handleQuickView}
              aria-label={`Quick view ${product.name}`}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-zinc-700 hover:text-orange-600 hover:bg-white flex items-center justify-center shadow-xs opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Eye size={14} />
            </button>
          )}

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={isFavorite}
            className={`w-8 h-8 rounded-full backdrop-blur-md border transition-all duration-200 flex items-center justify-center shadow-xs active:scale-90 ${
              isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-500'
                : 'bg-white/90 border-white/60 text-zinc-600 hover:text-rose-500 hover:bg-white hover:scale-105'
            }`}
          >
            <Heart
              size={15}
              className={`transition-all duration-200 ${
                isFavorite ? 'fill-rose-500 stroke-rose-500 scale-110' : ''
              }`}
            />
          </button>
        </div>

        {/* ── Bottom Media Overlay Status (Out of Stock / Prep Time) ── */}
        {!isAvailable ? (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] flex items-center justify-center p-3 pointer-events-none">
            <span className="bg-zinc-900/90 text-zinc-200 border border-white/10 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Sold Out
            </span>
          </div>
        ) : product.prepTime ? (
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="inline-flex items-center gap-1 bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
              <Clock size={10} className="text-amber-400" />
              {product.prepTime}
            </span>
          </div>
        ) : null}
      </div>

      {/* ── Product Info & Bottom Actions ──────────────────────────── */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider truncate">
              {categoryName} {/* ✅ FIXED: Using safe category name */}
            </span>
            <RatingBadge rating={product.rating} reviewCount={product.reviewCount} />
          </div>

          {/* Product Title */}
          <a
            href={`/product/${product.slug}`}
            onClick={handleCardClick}
            className="block group/title focus:outline-none focus-visible:underline"
          >
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 group-hover/title:text-orange-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </a>

          {/* Short Description (Optional 1-line summary) */}
          {descriptionText && (
            <p className="text-xs text-zinc-500 line-clamp-1 mt-1 font-normal leading-relaxed">
              {descriptionText} {/* ✅ FIXED: Using safe description text */}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2 mt-auto">
          {/* Price Layout */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-zinc-900 tracking-tight">
                ₦{product.price.toLocaleString('en-NG')}
              </span>
              {/* @ts-ignore - originalPrice might not be in the main Product type */}
              {(product as any).originalPrice && (product as any).originalPrice > product.price && (
                <span className="text-xs text-zinc-400 line-through font-medium">
                  ₦{(product as any).originalPrice.toLocaleString('en-NG')}
                </span>
              )}
            </div>
            {product.stock !== undefined && product.stock <= 5 && isAvailable && (
              <span className="text-[10px] font-semibold text-red-500">
                Only {product.stock} left
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            aria-label={
              isAdded
                ? `Added ${product.name} to cart`
                : !isAvailable
                ? `${product.name} is out of stock`
                : `Add ${product.name} to cart`
            }
            className={`relative flex items-center justify-center gap-1.5 h-10 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
              isAdded
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : !isAvailable
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                : 'bg-zinc-900 hover:bg-orange-600 text-white shadow-xs hover:shadow-md hover:shadow-orange-500/20'
            }`}
          >
            {isAdded ? (
              <>
                <Check size={15} className="stroke-[3] animate-in zoom-in duration-200" />
                <span className="hidden xs:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;