import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Sparkles,
  Tag,
  CheckCircle2,
  Clock,
  Flame,
  X,
  PackageCheck,
  Percent,
} from 'lucide-react';
import Container from '../../components/layout/Container';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../lib/format';
import type { CartItem } from '../../types';

const FREE_DELIVERY_THRESHOLD = 10000;
const STANDARD_DELIVERY_FEE = 1200;

export const CartPage: React.FC = () => {
  
  // Connect to your cart store (or use fallback safe methods)
  const {
    items = [],
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTotalItems,
  } = useCartStore();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Financial Calculations
  const rawSubtotal = getSubtotal ? getSubtotal() : items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalItems = getTotalItems ? getTotalItems() : items.reduce((sum, i) => sum + i.quantity, 0);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    return Math.round((rawSubtotal * appliedPromo.discountPercent) / 100);
  }, [rawSubtotal, appliedPromo]);

  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);
  const isFreeDelivery = rawSubtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE;
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - rawSubtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((rawSubtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const finalTotal = subtotalAfterDiscount + deliveryFee;

  // Promo Code Validation Handler
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!promoCodeInput.trim()) return;

    setIsApplyingPromo(true);
    setTimeout(() => {
      setIsApplyingPromo(false);
      const cleanCode = promoCodeInput.trim().toUpperCase();
      if (cleanCode === 'NAIJA10' || cleanCode === 'FRESH10') {
        setAppliedPromo({ code: cleanCode, discountPercent: 10 });
        setPromoCodeInput('');
      } else if (cleanCode === 'YUMMY20') {
        setAppliedPromo({ code: cleanCode, discountPercent: 20 });
        setPromoCodeInput('');
      } else {
        setPromoError('Invalid coupon code. Try "NAIJA10" for 10% off!');
      }
    }, 500);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  // ─── 1. Empty Cart State ──────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FFFDF9] py-16 text-stone-900">
        <Container>
          <div className="max-w-lg mx-auto text-center space-y-6 p-8 sm:p-12 rounded-3xl bg-white border border-amber-950/10 shadow-sm animate-[fadeIn_0.3s_ease-out]">
            {/* Animated Empty Bag Graphic */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-900/10 flex items-center justify-center text-primary shadow-inner">
              <ShoppingBag size={48} className="stroke-[1.5]" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-amber-600">
                <Flame size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-stone-900">
                Your Snack Bag is Empty
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto font-medium">
                Looks like you haven&apos;t added any cravings yet. Discover freshly baked meat pies, crispy chin chin, and juicy suya!
              </p>
            </div>

            {/* Quick Category Discovery Pills */}
            <div className="pt-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/50 mb-3">
                Quick Craving Picks:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: 'Meat Pies', slug: 'pastries' },
                  { label: 'Chin Chin', slug: 'fried-snacks' },
                  { label: 'Beef Suya', slug: 'protein-snacks' },
                  { label: 'Puff-Puff', slug: 'sweet-snacks' },
                ].map((item) => (
                  <Link
                    key={item.slug}
                    to={`/explore?category=${item.slug}`}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-stone-800 text-xs font-bold border border-amber-950/5 transition-all hover:scale-105"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span>Start Shopping Now</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ─── 2. Active Cart Layout ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 sm:py-12 lg:py-16 text-stone-900">
      <Container>
        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-900/10 text-amber-950 text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={12} className="text-primary" />
              <span>Fresh Batch Review</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight text-stone-900">
              Your Snack Bag
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <span className="text-stone-900 font-black">{totalItems} portions</span>
            <span>in your order</span>
          </div>
        </div>

        {/* ── Main 2-Column Checkout Layout ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Item List & Free Delivery Bar (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            
            {/* Gamified Free Express Delivery Meter */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-900/10 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2 text-stone-900">
                  <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center">
                    <Truck size={13} />
                  </div>
                  {isFreeDelivery ? (
                    <span className="text-emerald-700 font-black flex items-center gap-1">
                      <CheckCircle2 size={14} /> You unlocked Free Express Delivery!
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-primary font-black">{formatCurrency(amountNeededForFreeDelivery)}</strong> more for <strong>Free Delivery</strong>
                    </span>
                  )}
                </div>
                <span className="text-stone-400 font-mono text-[11px]">{freeDeliveryProgress}%</span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3">
              {items.map((item: CartItem) => {
                const isMaxStock = item.quantity >= item.product.stock;

                return (
                  <div
                    key={item.product.id}
                    className="group relative p-3.5 sm:p-5 bg-white rounded-3xl border border-amber-950/10 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-4 sm:gap-5"
                  >
                    {/* Thumbnail */}
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-amber-50/50 shrink-0 border border-amber-950/5"
                    >
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-primary text-xl">
                          {item.product.name.charAt(0)}
                        </div>
                      )}
                    </Link>

                    {/* Details Column */}
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-900/60 block">
                            {String(item.product.category).replace(/-/g, ' ')}
                          </span>
                          <Link
                            to={`/product/${item.product.slug}`}
                            className="font-heading font-black text-sm sm:text-base text-stone-900 hover:text-primary transition-colors truncate block"
                          >
                            {item.product.name}
                          </Link>
                        </div>

                        {/* Trash Delete Action */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Pricing & Steppers Row */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-amber-950/5 gap-2">
                        {/* Quantity Pill Stepper */}
                        <div className="inline-flex items-center bg-stone-50 border border-amber-950/10 rounded-xl p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-600 hover:bg-white disabled:opacity-30 transition-all font-bold"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center font-heading font-black text-xs text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={isMaxStock}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-600 hover:bg-white disabled:opacity-30 transition-all font-bold"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Item Total Price */}
                        <div className="text-right">
                          <span className="text-sm sm:text-base font-heading font-black text-stone-900 block leading-tight">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-stone-400 font-medium block">
                              {formatCurrency(item.product.price)} each
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Secondary Controls */}
            <div className="flex items-center justify-between pt-3 px-1">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-950 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Add More Snacks</span>
              </Link>

              <button
                onClick={clearCart}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:underline transition-colors"
              >
                <Trash2 size={13} />
                <span>Clear Bag</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Order Summary & Checkout Card (4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            
            {/* Main Sticky Summary Box */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-950/10 shadow-sm space-y-5 sticky top-24">
              <h2 className="font-heading font-black text-base sm:text-lg text-stone-900 pb-3 border-b border-amber-950/10">
                Order Summary
              </h2>

              {/* Coupon / Voucher Input Accordion */}
              <div>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Percent size={14} className="text-emerald-700 shrink-0" />
                      <div className="truncate">
                        <span className="font-mono font-black text-emerald-900">{appliedPromo.code}</span>
                        <span className="text-[10px] text-emerald-700 block">
                          {appliedPromo.discountPercent}% Discount Applied
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100"
                      aria-label="Remove promo code"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="space-y-1.5">
                    <div className="relative flex items-center">
                      <Tag size={14} className="absolute left-3.5 text-stone-400 pointer-events-none" />
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        placeholder="Voucher code (e.g. NAIJA10)"
                        className="w-full pl-9 pr-20 py-2.5 rounded-2xl bg-amber-50/40 border border-amber-950/10 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-bold placeholder-stone-400 outline-none uppercase"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingPromo || !promoCodeInput.trim()}
                        className="absolute right-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-[11px] font-black transition-all"
                      >
                        {isApplyingPromo ? '...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[11px] font-bold text-red-600 px-1">{promoError}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Price Breakdown Details */}
              <div className="space-y-3 text-xs font-semibold text-stone-600 pt-2 border-t border-amber-950/5">
                <div className="flex justify-between">
                  <span>Snacks Subtotal ({totalItems} items)</span>
                  <span className="text-stone-900 font-bold">{formatCurrency(rawSubtotal)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Voucher ({appliedPromo.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>Express Delivery</span>
                    <span className="text-[10px] text-stone-400">(Thermal Sealed)</span>
                  </span>
                  {isFreeDelivery ? (
                    <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-md">
                      FREE
                    </span>
                  ) : (
                    <span className="text-stone-900 font-bold">{formatCurrency(deliveryFee)}</span>
                  )}
                </div>

                {/* Final Total Amount */}
                <div className="pt-3 border-t border-amber-950/10 flex items-baseline justify-between">
                  <div>
                    <span className="font-heading font-black text-sm text-stone-900 block">Total Due</span>
                    <span className="text-[10px] text-stone-400 font-medium">Includes VAT & Packaging</span>
                  </div>
                  <span className="font-heading font-black text-2xl text-stone-900 tracking-tight">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                to="/checkout"
                className="group flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <span>Proceed to Delivery</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Delivery ETA & Safety Indicators */}
              <div className="pt-3 border-t border-amber-950/5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-stone-600 font-bold">
                  <Clock size={14} className="text-amber-600 shrink-0" />
                  <span>Est. Arrival: 25 - 35 mins</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-600 font-bold">
                  <PackageCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>Thermal packaging maintains fresh warmth</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-600 font-bold">
                  <ShieldCheck size={14} className="text-primary shrink-0" />
                  <span>100% Encrypted Nigerian Payment Rails</span>
                </div>
              </div>

              {/* Payment Rail Badges */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {['Paystack', 'Flutterwave', 'Mastercard', 'Visa', 'Verve'].map((rail) => (
                  <span
                    key={rail}
                    className="text-[9px] font-black uppercase text-stone-400 bg-stone-50 px-2 py-0.5 rounded border border-stone-200"
                  >
                    {rail}
                  </span>
                ))}
              </div>

            </div>

          </div>

        </div>
      </Container>
    </div>
  );
};

export default CartPage;