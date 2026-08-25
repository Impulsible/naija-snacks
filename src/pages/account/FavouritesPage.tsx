import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Heart, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  Trash2, 
  Loader2, 
  HelpCircle 
} from 'lucide-react';
import AccountLayout from '../../components/account/AccountLayout';
import ProductCard from '../../components/common/ProductCard';
import { productService } from '../../services/productService';

const FavouritesPage = () => {
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Fetch products (imitating your favorites query)
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'popular'],
    queryFn: () => productService.getPopularProducts(),
  });

  const favouriteProducts = products?.slice(0, 4) || [];

  // Mock clear all function
  const handleClearAll = async () => {
    setIsClearingAll(true);
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsClearingAll(false);
    // Add real clear mechanism here if needed
  };

  return (
    <AccountLayout
      title="My Saved Favourites"
      subtitle="Keep track of your absolute favourite snacks and local delicacies for effortless re-ordering."
    >
      <div className="space-y-6 text-stone-900">
        
        {/* ── 1. Loading State (Modern Skeleton Grids) ────────────────── */}
        {isLoading ? (
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="h-14 rounded-2xl bg-stone-100 animate-pulse w-full" />
            {/* Cards Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-3xl border border-stone-100 bg-white space-y-4 animate-pulse">
                  <div className="aspect-square w-full bg-stone-100 rounded-2xl" />
                  <div className="h-4 bg-stone-100 rounded w-2/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 bg-stone-100 rounded w-1/4" />
                    <div className="h-8 bg-stone-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : favouriteProducts.length === 0 ? (
          
          /* ── 2. Empty State ────────────────────────────────────────── */
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-amber-50/40 border border-amber-950/10 text-center flex flex-col items-center max-w-lg mx-auto my-4">
            <div className="relative mb-6">
              {/* Outer decorative ring */}
              <div className="absolute -inset-4 bg-red-100/40 rounded-full blur-xl animate-pulse" />
              
              {/* Icon Container */}
              <div className="relative w-16 h-16 rounded-2xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center shadow-sm">
                <Heart size={28} className="stroke-[2.5]" />
              </div>
              
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                <Sparkles size={12} className="fill-current" />
              </div>
            </div>

            <h3 className="font-heading font-black text-lg text-stone-900 mb-2">
              Your Snack Library is Empty
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-xs mb-8">
              Save your go-to treats here. One click is all it takes to build a personalized pantry.
            </p>

            <button
              onClick={() => window.location.href = '/explore'}
              className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <ShoppingBag size={16} />
              <span>Browse Artisanal Snacks</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ) : (
          
          /* ── 3. Active Favourites Layout ───────────────────────────── */
          <div className="space-y-6">
            
            {/* Grid Control Header bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFFDF9] to-amber-50/40 border border-amber-950/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center">
                  <Heart size={15} className="fill-current" />
                </div>
                <div>
                  <span className="text-xs font-black text-stone-800 block leading-none">
                    Saved Delicacies
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                    {favouriteProducts.length} {favouriteProducts.length === 1 ? 'snack' : 'snacks'} active
                  </span>
                </div>
              </div>

              {/* Quick actions */}
              <button
                onClick={handleClearAll}
                disabled={isClearingAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-stone-400 hover:text-red-600 hover:bg-red-50/50 transition-all active:scale-95 disabled:opacity-50"
              >
                {isClearingAll ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={12} />
                    <span>Clear All</span>
                  </>
                )}
              </button>
            </div>

            {/* Product Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {favouriteProducts.map(product => (
                <div 
                  key={product.id}
                  className="group relative rounded-3xl border border-stone-100 bg-white p-3 hover:border-amber-900/10 hover:shadow-xl hover:shadow-stone-100/50 transition-all duration-300"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Premium Notice banner */}
            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/50 flex items-start gap-3">
              <HelpCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[11px] font-bold text-stone-700">Stock Availability Note</h4>
                <p className="text-[10px] text-stone-500 leading-normal mt-0.5">
                  Items saved in your favourites are compiled for fast checkout but are not reserved until checkout. Grab them while they remain in stock!
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </AccountLayout>
  );
};

export default FavouritesPage;