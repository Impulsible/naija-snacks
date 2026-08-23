import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  ChevronRight,
  Check,
  Share2,
  ShieldCheck,
  Clock,
  Flame,
  Sparkles,
  Info,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ThermometerSun,
  PackageCheck,
} from 'lucide-react';
import Container from '../../components/layout/Container';
import type { Product } from '../../types';
import { formatCurrency } from '../../lib/format';
import { useProduct, useProducts } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';

interface ProductDetailPageProps {
  onAddToCart?: (product: Product, quantity: number) => void;
  onToggleFavorite?: (productId: string) => void;
}

// ─── Loading Skeleton ──────────────────────────────────────────────────
const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-[#FFFDF9] py-6 sm:py-10 lg:py-14">
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start animate-pulse">
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square w-full rounded-3xl bg-amber-100" />
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-20 h-20 rounded-2xl bg-amber-100" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2.5">
            <div className="h-6 bg-amber-100 rounded w-32" />
            <div className="h-10 bg-amber-100 rounded w-3/4" />
            <div className="h-6 bg-amber-100 rounded w-1/2" />
          </div>
          <div className="h-12 bg-amber-100 rounded-xl w-1/3" />
          <div className="h-20 bg-amber-100 rounded-xl w-full" />
          <div className="h-24 bg-amber-100 rounded-3xl w-full" />
        </div>
      </div>
    </Container>
  </div>
);

// ─── Helper: Get category name from product ─────────────────────────
const getCategoryName = (category: any): string => {
  if (!category) return 'Snack';
  if (typeof category === 'string') return category;
  if (typeof category === 'object') {
    if (category.name) return category.name;
    if (category.slug) return category.slug.replace(/-/g, ' ');
  }
  return 'Snack';
};

// ─── Helper: Get category slug from product ─────────────────────────
const getCategorySlug = (category: any): string => {
  if (!category) return '';
  if (typeof category === 'string') return category;
  if (typeof category === 'object' && category.slug) return category.slug;
  return '';
};

// ─── Main Product Detail Page Component ─────────────────────────────
export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  onAddToCart,
  onToggleFavorite,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState<number>(1);
  const [isFavourite, setIsFavourite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isAdded, setIsAdded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'allergens' | 'instructions' | 'nutrition'>('ingredients');

  // ─── Fetch Product from API ────────────────────────────────────────
  const { data: product, isLoading, error } = useProduct(slug || '');

  // ─── Fetch Related Products ────────────────────────────────────────
  const categorySlug = useMemo(() => getCategorySlug(product?.category), [product?.category]);
  
  const { data: relatedProductsData } = useProducts({
    category: categorySlug,
    limit: 4,
  });
  
  const relatedProducts = relatedProductsData?.products?.filter(
    (p: Product) => p.id !== product?.id
  ) || [];

  // ─── Gallery images ─────────────────────────────────────────────────
  const galleryImages = useMemo(() => {
    if (!product?.image) return [];
    const images = (product as any).images || [product.image];
    return images.length > 1 ? images : [product.image, product.image, product.image];
  }, [product]);

  // ─── Load favorite state from localStorage ─────────────────────────
  useEffect(() => {
    if (product?.id) {
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isFavorited = savedFavorites.includes(product.id);
      setIsFavourite(isFavorited);
    }
  }, [product?.id]);

  // ─── Reset state on slug change ────────────────────────────────────
  useEffect(() => {
    setQuantity(1);
    setIsAdded(false);
    setSelectedImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // ─── Loading State ──────────────────────────────────────────────────
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // ─── Error or Not Found State ──────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FFFDF9] py-20 text-stone-900">
        <Container>
          <div className="max-w-md mx-auto text-center space-y-4 p-8 rounded-3xl bg-white border border-amber-950/10 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-primary flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-heading font-black">Snack Not Found</h1>
            <p className="text-xs text-stone-500">
              The delicacy you are looking for has been moved or is currently being freshly baked.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white text-xs font-black shadow-md hover:bg-primary-dark transition-all"
            >
              <span>Explore Active Menu</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, product.stock)));
  };

  const handleAddToCart = () => {
    setIsAdded(true);
    addItem(product, quantity);
    onAddToCart?.(product, quantity);
    setTimeout(() => setIsAdded(false), 2200);
  };

  const handleToggleFavorite = () => {
    setIsFavourite((prev) => !prev);
    
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!isFavourite) {
      if (!savedFavorites.includes(product.id)) {
        localStorage.setItem('favorites', JSON.stringify([...savedFavorites, product.id]));
      }
    } else {
      localStorage.setItem('favorites', JSON.stringify(savedFavorites.filter((id: string) => id !== product.id)));
    }
    
    onToggleFavorite?.(product.id);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | Naija Snacks`,
          text: product.description,
          url,
        });
      } catch {
        /* Fallback silently */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isOutOfStock = product.stock <= 0;
  
  // Get category name for display
  const categoryDisplayName = getCategoryName(product.category);

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-6 sm:py-10 lg:py-14 text-stone-900">
      <Container>
        {/* ── 1. Breadcrumb Navigation ───────────────────────────────── */}
        <nav
          className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-stone-500 mb-6 sm:mb-8 overflow-x-auto pb-1 no-scrollbar"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-primary transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight size={13} className="text-stone-300 shrink-0" />
          <Link to="/explore" className="hover:text-primary transition-colors shrink-0">
            Explore
          </Link>
          <ChevronRight size={13} className="text-stone-300 shrink-0" />
          <Link
            to={`/explore?category=${categorySlug}`}
            className="hover:text-primary transition-colors capitalize shrink-0"
          >
            {categoryDisplayName}
          </Link>
          <ChevronRight size={13} className="text-stone-300 shrink-0" />
          <span className="text-stone-900 font-black truncate">{product.name}</span>
        </nav>

        {/* ── 2. Main Product Hero Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          
          {/* LEFT: Image Showcase Gallery (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary Main Image Frame */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-amber-950/10 shadow-lg group">
              <img
                src={galleryImages[selectedImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Ambient Vignette Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md">
                    <Sparkles size={12} className="fill-stone-950" />
                    Snack of the Day
                  </span>
                )}
                {product.popular && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                    <Flame size={12} />
                    Top Seller
                  </span>
                )}
              </div>

              {/* Top Right Action Pills (Favorite & Share) */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 flex items-center justify-center text-stone-700 hover:text-primary hover:bg-white transition-all shadow-sm active:scale-95"
                  aria-label="Share snack"
                >
                  {isCopied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 flex items-center justify-center text-stone-700 hover:text-red-500 hover:bg-white transition-all shadow-sm active:scale-95"
                  aria-label="Add to favorites"
                >
                  <Heart
                    size={16}
                    className={`transition-colors ${isFavourite ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </button>
              </div>

              {/* Live Fresh Heat-Seal Status */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Fresh Batch Ready to Dispatch</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-lg">
                  <Clock size={11} />
                  <span>25-35 Mins</span>
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation Gallery */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {galleryImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-primary ring-2 ring-primary/20 shadow-md scale-102'
                        : 'border-amber-950/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Packaging & Hygiene Trust Strip */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-amber-950/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100/60 text-amber-900 flex items-center justify-center shrink-0">
                  <PackageCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900 leading-tight">Thermal Foil Sealed</h4>
                  <p className="text-[10px] text-stone-500">Arrives crisp & warm</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-amber-950/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900 leading-tight">NAFDAC Compliant</h4>
                  <p className="text-[10px] text-stone-500">Hygiene certified kitchen</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Ordering & Specs (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Title, Category & Review Rating */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 bg-amber-100/70 border border-amber-900/10 px-2.5 py-1 rounded-lg">
                  {categoryDisplayName}
                </span>
                <span className="text-xs font-bold text-stone-400">• Handcrafted Recipe</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900 leading-[1.1]">
                {product.name}
              </h1>

              {/* Star Rating Overview */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={
                        star <= Math.floor(product.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-stone-200 fill-stone-200'
                      }
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-stone-900">{product.rating.toFixed(1)}</span>
                <span className="text-stone-400 text-xs">•</span>
                <span className="text-xs font-bold text-stone-500 hover:text-primary transition-colors cursor-pointer">
                  {product.reviewCount} Verified Reviews
                </span>
              </div>
            </div>

            {/* Price & Batch Inventory Warning */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-amber-950/10 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">
                  Price per portion
                </span>
                <span className="text-3xl sm:text-4xl font-heading font-black text-stone-900 tracking-tight">
                  {formatCurrency(product.price)}
                </span>
              </div>

              {product.stock <= 10 && product.stock > 0 ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-black animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span>Only {product.stock} left in batch!</span>
                </div>
              ) : isOutOfStock ? (
                <span className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-500 text-xs font-black">
                  Sold Out for Today
                </span>
              ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                  <CheckCircle2 size={13} />
                  <span>In Stock & Ready</span>
                </div>
              )}
            </div>

            {/* Description Body */}
            <p className="text-xs sm:text-sm md:text-base text-stone-600 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Quantity Portion Selector & Add to Bag CTA */}
            <div className="p-5 rounded-3xl bg-amber-50/40 border border-amber-950/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-black text-stone-900 block">Select Quantity</span>
                  <span className="text-[11px] text-stone-500">Choose portion size for your order</span>
                </div>

                {/* Tactile Quantity Pill */}
                <div className="inline-flex items-center bg-white border border-amber-950/10 rounded-2xl p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-amber-50 disabled:opacity-30 transition-all font-bold"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-heading font-black text-base text-stone-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-amber-50 disabled:opacity-30 transition-all font-bold"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 px-7 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md active:scale-[0.98] ${
                    isOutOfStock
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : isAdded
                      ? 'bg-emerald-600 text-white shadow-emerald-950/20'
                      : 'bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white shadow-primary/25 hover:shadow-xl'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Sold Out</span>
                  ) : isAdded ? (
                    <>
                      <Check size={18} className="stroke-[3]" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>
                        Add to Bag • {formatCurrency(product.price * quantity)}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`px-5 py-4 rounded-2xl border transition-all flex items-center justify-center ${
                    isFavourite
                      ? 'bg-red-50 text-red-500 border-red-200'
                      : 'bg-white hover:bg-amber-50 text-stone-700 border-amber-950/10'
                  }`}
                  aria-label="Save to wishlist"
                >
                  <Heart size={18} className={isFavourite ? 'fill-red-500' : ''} />
                </button>
              </div>
            </div>

            {/* ── 3. Recipe Tabs (Ingredients, Allergens, Instructions) ─── */}
            <div className="pt-4 border-t border-amber-950/10">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
                {[
                  { id: 'ingredients', label: 'Ingredients', icon: Sparkles },
                  { id: 'allergens', label: 'Allergens', icon: Info },
                  { id: 'instructions', label: 'Reheating & Warmth', icon: ThermometerSun },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-white hover:bg-amber-100/50 text-stone-600 border border-amber-950/10'
                      }`}
                    >
                      <TabIcon size={13} className={isActive ? 'text-amber-400' : 'text-stone-400'} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panels */}
              <div className="p-5 rounded-3xl bg-white border border-amber-950/10 shadow-2xs mt-2 animate-[fadeIn_0.2s_ease-out]">
                {activeTab === 'ingredients' && product.ingredients && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                      Authentic Recipe Ingredients
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.ingredients.map((item: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 text-stone-800 text-xs font-bold border border-amber-950/5 shadow-2xs"
                        >
                          • {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'allergens' && product.allergens && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-red-900">
                      Allergen Information
                    </h4>
                    {product.allergens.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {product.allergens.map((item: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-black border border-red-200"
                          >
                            ⚠️ Contains: {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 font-medium">
                        No major artificial allergens identified. Prepared in a verified kitchen.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'instructions' && (
                  <div className="space-y-2.5 text-xs text-stone-600 leading-relaxed font-medium">
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                      How to Enjoy at Home
                    </h4>
                    <p>
                      • <strong>Oven / Air Fryer (Recommended):</strong> Pre-heat to 160°C and warm for 3-5 minutes for optimal pastry flakiness.
                    </p>
                    <p>
                      • <strong>Microwave:</strong> Place with a small glass of water and warm for 40 seconds to retain moisture.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. Related Snacks Section ──────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-amber-950/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-1.5 text-primary text-xs font-black uppercase tracking-wider mb-1">
                  <Sparkles size={14} />
                  <span>Delicious Pairings</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 tracking-tight">
                  Customers Also Ordered
                </h2>
              </div>

              <Link
                to={`/explore?category=${categorySlug}`}
                className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:text-primary-dark group"
              >
                <span>View More in {categoryDisplayName}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {relatedProducts.map((relProduct: Product) => (
                <Link
                  key={relProduct.id}
                  to={`/product/${relProduct.slug}`}
                  className="group flex flex-col justify-between bg-white rounded-3xl p-4 border border-amber-950/10 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-amber-50/40 border border-amber-950/5">
                      <img
                        src={relProduct.image}
                        alt={relProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span>{relProduct.rating.toFixed(1)}</span>
                      </div>
                      <h3 className="font-heading font-black text-sm text-stone-900 group-hover:text-primary transition-colors truncate">
                        {relProduct.name}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-1">{relProduct.description}</p>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-amber-950/5 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-black text-stone-900">
                      {formatCurrency(relProduct.price)}
                    </span>
                    <span className="text-xs font-black text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Order</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* ── 5. Sticky Mobile Bottom Order Bar ──────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-xl border-t border-amber-950/10 p-3.5 shadow-2xl">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block leading-none">
              Total ({quantity}x)
            </span>
            <span className="text-lg font-heading font-black text-stone-900 leading-tight">
              {formatCurrency(product.price * quantity)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-primary text-white'
            }`}
          >
            {isOutOfStock ? (
              <span>Sold Out</span>
            ) : isAdded ? (
              <>
                <Check size={16} />
                <span>Added to Bag!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;