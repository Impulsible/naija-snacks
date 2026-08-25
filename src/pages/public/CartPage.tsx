import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MapPin,
  Phone,
  Banknote,
  ShieldCheck,
  Lock,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
  Truck,
  Building2,
  Map,
  MessageSquare,
} from 'lucide-react';
import Container from '../../components/layout/Container';
import FormInput from '../../components/ui/FormInput';
import { useCartStore } from '../../store/cartStore';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../lib/format';

// ─── Types ──────────────────────────────────────────────────────────
interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderData {
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    phone: string;
    additionalInfo?: string;
  };
  paymentMethod: 'paystack' | 'cash_on_delivery';
}

// ─── Validation Schema ─────────────────────────────────────────────
const checkoutSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City is required (e.g., Lekki, Ikeja)'),
  state: z.string().min(2, 'State is required'),
  phone: z.string().regex(/^(\+234|0)[0-9]{10}$/, 'Must be a valid 11-digit Nigerian number'),
  additionalInfo: z.string().optional(),
  paymentMethod: z.enum(['paystack', 'cash_on_delivery']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ─── Main Component ────────────────────────────────────────────────
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, getTotalItems, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCartEmpty, setIsCartEmpty] = useState(false);

  // Check if cart is empty on mount
  useEffect(() => {
    if (items.length === 0) {
      setIsCartEmpty(true);
    } else {
      setIsCartEmpty(false);
    }
  }, [items.length]);

  // Cart Calculations
  const rawSubtotal = getSubtotal ? getSubtotal() : items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalItems = getTotalItems ? getTotalItems() : items.reduce((sum, i) => sum + i.quantity, 0);
  
  const FREE_DELIVERY_THRESHOLD = 10000;
  const isFreeDelivery = rawSubtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = isFreeDelivery ? 0 : 1500;
  const total = rawSubtotal + deliveryFee;

  const currentUser = user as any;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      street: currentUser?.address || '',
      city: '',
      state: 'Lagos',
      phone: currentUser?.phone || '',
      additionalInfo: '',
      paymentMethod: 'paystack',
    },
  });

  const paymentMethod = watch('paymentMethod');

  const onSubmit = async (data: CheckoutFormData) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    // Double check cart is not empty
    if (items.length === 0) {
      setError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const orderData: OrderData = {
        items: items.map((item) => ({
          product: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })),
        subtotal: rawSubtotal,
        deliveryFee,
        total,
        deliveryAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          phone: data.phone,
          additionalInfo: data.additionalInfo,
        },
        paymentMethod: data.paymentMethod,
      };

      // 1. Create the order using real service
      const order = await orderService.createOrder(orderData);
      
      // 2. Clear the cart AFTER order is created
      clearCart();

      // 3. Handle payment based on method
      if (data.paymentMethod === 'paystack') {
        // Initialize Paystack payment
        const payment = await orderService.initializePayment(order.id);
        
        // Redirect to Paystack payment page
        window.location.href = payment.authorization_url;
      } else {
        // Cash on delivery - navigate to confirmation
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      
      let errorMessage = 'An error occurred during checkout. Please try again.';
      
      if (err && typeof err === 'object') {
        // Handle axios error response
        if ('response' in err && err.response && typeof err.response === 'object') {
          const response = err.response as { data?: { message?: string } };
          if (response.data?.message) {
            errorMessage = response.data.message;
          }
        } else if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // ─── Empty State ─────────────────────────────────────────────────
  if (isCartEmpty || items.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FFFDF9] py-16 text-stone-900">
        <Container>
          <div className="max-w-lg mx-auto text-center space-y-6 p-8 sm:p-12 rounded-3xl bg-white border border-amber-950/10 shadow-sm">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-br from-stone-100 to-stone-50 border border-amber-900/5 flex items-center justify-center text-stone-300">
              <ShoppingBag size={48} className="stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-stone-900">
                Your Cart is Empty
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto font-medium">
                You need to add items to your snack bag before proceeding to the checkout portal.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-[0.98]"
            >
              <span>Explore Menu</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // ─── Main Checkout View ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFFDF9] py-6 sm:py-10 lg:py-14 text-stone-900">
      <Container>
        
        {/* Navigation & Header */}
        <div className="mb-6 sm:mb-10">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-stone-500 hover:text-stone-900 mb-4 transition-colors"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Cart</span>
          </button>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900">
            Secure Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
            
            {/* ── LEFT COLUMN: Forms (7 cols) ────────────────────── */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 pb-32 lg:pb-0">
              
              {/* Delivery Details Block */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-amber-950/10">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-950/5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/60 flex items-center justify-center text-primary">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-lg text-stone-900">Delivery Address</h2>
                    <p className="text-[11px] text-stone-500 font-medium">Where should the rider bring your snacks?</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <FormInput
                      label="Street Address"
                      type="text"
                      placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                      error={errors.street?.message}
                      {...register('street')}
                    />
                    <Map size={16} className="absolute right-4 top-10 text-stone-300" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <FormInput
                        label="City / Region"
                        type="text"
                        placeholder="e.g. Lekki, Ikeja"
                        error={errors.city?.message}
                        {...register('city')}
                      />
                      <Building2 size={16} className="absolute right-4 top-10 text-stone-300" />
                    </div>
                    <div className="relative">
                      <FormInput
                        label="State"
                        type="text"
                        placeholder="e.g. Lagos"
                        error={errors.state?.message}
                        {...register('state')}
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <FormInput
                      label="Phone Number"
                      type="tel"
                      placeholder="e.g. 0802 345 6789"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                    <Phone size={16} className="absolute right-4 top-10 text-stone-300" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        placeholder="e.g. Leave with security at the gate..."
                        className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium text-stone-900 placeholder-stone-400 outline-none resize-none transition-all"
                        {...register('additionalInfo')}
                      />
                      <MessageSquare size={16} className="absolute right-4 top-4 text-stone-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Block */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-amber-950/10">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-950/5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/60 flex items-center justify-center text-emerald-700">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-lg text-stone-900">Payment Options</h2>
                    <p className="text-[11px] text-stone-500 font-medium">All transactions are secure and encrypted.</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Paystack Option */}
                  <label className={`relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'paystack' 
                      ? 'border-primary bg-amber-50/50 shadow-sm' 
                      : 'border-stone-100 hover:border-amber-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      value="paystack"
                      {...register('paymentMethod')}
                      className="sr-only"
                    />
                    <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      paymentMethod === 'paystack' ? 'border-primary' : 'border-stone-300'
                    }`}>
                      {paymentMethod === 'paystack' && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-[scaleUp_0.2s_ease-out]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-black text-stone-900">Pay Now (Card/Transfer)</span>
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-blue-900 text-white text-[8px] font-black uppercase">Visa</span>
                          <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[8px] font-black uppercase">MC</span>
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-xs text-stone-500 font-medium leading-relaxed">
                        Pay securely with your Debit/Credit Card, Bank Transfer, or USSD via Paystack.
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label className={`relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cash_on_delivery' 
                      ? 'border-primary bg-amber-50/50 shadow-sm' 
                      : 'border-stone-100 hover:border-amber-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      value="cash_on_delivery"
                      {...register('paymentMethod')}
                      className="sr-only"
                    />
                    <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      paymentMethod === 'cash_on_delivery' ? 'border-primary' : 'border-stone-300'
                    }`}>
                      {paymentMethod === 'cash_on_delivery' && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-[scaleUp_0.2s_ease-out]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Banknote size={16} className="text-stone-700" />
                        <span className="text-sm font-black text-stone-900">Pay on Delivery</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-stone-500 font-medium leading-relaxed">
                        Pay with cash or POS terminal when your order arrives.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Order Summary (5 cols) ────────────── */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-amber-950/10 p-5 sm:p-6 lg:sticky lg:top-24">
                
                <h2 className="font-heading font-black text-lg text-stone-900 mb-4 pb-4 border-b border-amber-950/5 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-lg">
                    {totalItems} Items
                  </span>
                </h2>

                {/* Collapsed Cart Items Preview */}
                <div className="space-y-3 mb-6 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-amber-50 shrink-0 border border-amber-950/5">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-stone-900 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-stone-500 mt-0.5 truncate">
                          {typeof item.product.category === 'string' 
                            ? item.product.category.replace(/-/g, ' ') 
                            : ''}
                        </p>
                      </div>
                      <span className="text-xs font-black text-stone-900 shrink-0">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Calculation Lines */}
                <div className="space-y-3 text-xs font-semibold text-stone-600 pt-4 border-t border-amber-950/5">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-stone-900 font-bold">{formatCurrency(rawSubtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <span>Express Delivery</span>
                    </span>
                    {isFreeDelivery ? (
                      <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-md">
                        FREE
                      </span>
                    ) : (
                      <span className="text-stone-900 font-bold">{formatCurrency(deliveryFee)}</span>
                    )}
                  </div>
                  
                  {!isFreeDelivery && (
                    <div className="text-[10px] font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/50 flex items-center gap-1.5">
                      <Truck size={12} className="shrink-0" />
                      <span>
                        Add {formatCurrency(FREE_DELIVERY_THRESHOLD - rawSubtotal)} more for free delivery!
                      </span>
                    </div>
                  )}

                  {/* Final Total Calculation */}
                  <div className="pt-4 mt-2 border-t border-amber-950/10 flex items-end justify-between">
                    <div>
                      <span className="font-heading font-black text-sm text-stone-900 block">Total to Pay</span>
                      <span className="text-[10px] text-stone-400 font-medium">Includes VAT</span>
                    </div>
                    <span className="font-heading font-black text-3xl text-primary tracking-tight">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mt-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-red-600">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-bold">{error}</p>
                  </div>
                )}

                {/* Desktop Submit Button (Hidden on Mobile) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="hidden lg:flex items-center justify-center gap-2 w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 text-white text-sm font-black shadow-xl shadow-stone-900/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Processing Securely...</span>
                  ) : paymentMethod === 'paystack' ? (
                    <>
                      <Lock size={15} />
                      <span>Pay {formatCurrency(total)} Securely</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Confirm Delivery Order</span>
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="mt-5 pt-5 border-t border-amber-950/5 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500">
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>256-bit Encrypted Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500">
                    <Truck size={14} className="text-primary shrink-0" />
                    <span>Fast Delivery in Thermal Bags</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ── MOBILE FIXED BOTTOM CTA ── */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#FFFDF9]/95 backdrop-blur-xl border-t border-amber-950/10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-40">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-between w-full px-5 py-4 rounded-2xl bg-stone-900 text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-70"
            >
              <div className="flex items-center gap-2 font-black text-sm">
                {isLoading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : paymentMethod === 'paystack' ? (
                  <>
                    <Lock size={16} className="text-amber-400" />
                    <span>Pay Securely</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Confirm Order</span>
                  </>
                )}
              </div>
              <span className="font-heading font-black text-lg">
                {formatCurrency(total)}
              </span>
            </button>
          </div>

        </form>
      </Container>
    </div>
  );
};

export default CheckoutPage;