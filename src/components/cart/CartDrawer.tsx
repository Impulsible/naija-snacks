import { Link } from 'react-router-dom';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';

const FREE_SHIPPING_THRESHOLD = 15000; // ₦15,000 threshold for free delivery

const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotalItems,
  } = useCartStore();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      {/* ── 1. Backdrop Overlay ────────────────────────────────────── */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* ── 2. Slide-Over Panel ────────────────────────────────────── */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-amber-950/10 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-amber-950/10 bg-gradient-to-r from-[#FFFDF9] to-amber-50/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-sm">
                <ShoppingBag size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-heading font-black text-lg text-stone-900 leading-none">
                  Your Snack Bag
                </h2>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mt-1 block">
                  {totalItems} {totalItems === 1 ? 'snack item' : 'snack items'}
                </span>
              </div>
            </div>

            {/* Prominent Header Close Button */}
            <button
              onClick={closeCart}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-all active:scale-95 border border-stone-200/60"
              aria-label="Close cart drawer"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          {items.length > 0 && (
            <div className="bg-amber-50/60 border-b border-amber-900/10 px-6 py-3">
              <div className="flex items-center gap-2 mb-1.5 text-xs">
                <Truck size={14} className="text-primary shrink-0" />
                <span className="text-stone-700 font-medium">
                  {remainingForFreeShipping > 0 ? (
                    <>
                      Add <strong className="text-stone-900 font-bold">{formatPrice(remainingForFreeShipping)}</strong> more for <strong className="text-primary font-bold">Free Lagos Delivery</strong>
                    </>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      🎉 You unlocked Free Delivery!
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* ── 3. Content Body ───────────────────────────────────────── */}
          {items.length === 0 ? (
            
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-5">
                <div className="absolute -inset-3 bg-amber-100/50 rounded-full blur-lg animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-[#FFFDF9] to-amber-50 rounded-3xl border border-amber-950/10 flex items-center justify-center shadow-inner">
                  <ShoppingBag size={34} className="text-stone-300 stroke-[1.8]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-primary border-2 border-white flex items-center justify-center text-white shadow-sm">
                  <Sparkles size={12} className="fill-current" />
                </div>
              </div>

              <h3 className="font-heading font-black text-lg text-stone-900 mb-1">
                Your cart is feeling light
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mb-6">
                Treat yourself to fresh chin chin, plantain chips, kilishi, and authentic Nigerian bites!
              </p>
              
              <div className="flex flex-col gap-2.5 w-full max-w-xs">
                <Link
                  to="/explore"
                  onClick={closeCart}
                  className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <span>Explore Snacks</span>
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <button
                  onClick={closeCart}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 py-2 transition-colors"
                >
                  Close & Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 divide-y divide-stone-100">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="pt-3.5 first:pt-0 flex gap-3.5 group"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/snacks/${item.product.slug}`}
                      onClick={closeCart}
                      className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60 self-start"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/snacks/${item.product.slug}`}
                          onClick={closeCart}
                          className="font-heading font-black text-sm text-stone-900 hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-stone-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <span className="text-[11px] font-medium text-stone-400">
                        {formatPrice(item.product.price)} each
                      </span>

                      {/* Bottom row: Price & Quantity pill */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-heading font-black text-sm text-stone-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>

                        {/* Modern Stepper */}
                        <div className="inline-flex items-center rounded-xl bg-stone-100 border border-stone-200/70 p-0.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-stone-600 hover:text-stone-900 shadow-sm transition-all active:scale-95 disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </button>
                          
                          <span className="w-8 text-center text-xs font-black text-stone-800">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.product.stock}
                            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-stone-600 hover:text-stone-900 shadow-sm transition-all active:scale-95 disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── 4. Drawer Footer ─────────────────────────────────── */}
              <div className="border-t border-amber-950/10 p-5 sm:p-6 bg-gradient-to-b from-[#FFFDF9] to-white space-y-4">
                
                {/* Breakdown Summary */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-stone-800">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                    <span>Delivery Estimate</span>
                    <span className="font-bold text-stone-800">
                      {remainingForFreeShipping <= 0 ? 'FREE' : 'Calculated next'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-dashed border-stone-200">
                    <span className="font-heading font-black text-base text-stone-900">Total</span>
                    <span className="font-heading font-black text-xl text-primary">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="space-y-2 pt-1">
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white text-sm font-black shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/cart"
                      onClick={closeCart}
                      className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-black text-stone-700 transition-colors"
                    >
                      View Cart
                    </Link>

                    {/* Bottom Explicit Close Button */}
                    <button
                      type="button"
                      onClick={closeCart}
                      className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-black text-stone-500 hover:text-stone-800 transition-colors"
                    >
                      Close Bag
                    </button>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-stone-400 font-medium">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>Safe & Encrypted 256-bit Checkout</span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;