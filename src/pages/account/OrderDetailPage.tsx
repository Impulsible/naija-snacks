import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Clock,
  Phone,
  CreditCard,
  ChevronLeft,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Receipt,
  Copy,
  Check,
  MessageCircle,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import AccountLayout from '../../components/account/AccountLayout';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../lib/format';
import { useCartStore } from '../../store/cartStore';

// ─── Status Configuration Helper ────────────────────────────────────
const getStatusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return {
        label: 'Delivered',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        icon: CheckCircle2,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        className: 'bg-red-50 text-red-600 border-red-200/60',
        icon: AlertTriangle,
      };
    case 'on_the_way':
      return {
        label: 'On the Way (Rider Dispatched)',
        className: 'bg-teal-50 text-teal-800 border-teal-200/60',
        icon: Truck,
      };
    case 'preparing':
      return {
        label: 'Kitchen Baking Fresh',
        className: 'bg-orange-50 text-orange-800 border-orange-200/60',
        icon: Flame,
      };
    default:
      return {
        label: 'Order Confirmed',
        className: 'bg-amber-100/80 text-amber-900 border-amber-300/60',
        icon: Clock,
      };
  }
};

const getPaymentStatusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return {
        label: 'Payment Completed',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      };
    case 'failed':
      return {
        label: 'Payment Failed',
        className: 'bg-red-50 text-red-600 border-red-200/60',
      };
    default:
      return {
        label: 'Payment Pending',
        className: 'bg-amber-100/80 text-amber-900 border-amber-300/60',
      };
  }
};

// ─── Loading Skeleton ───────────────────────────────────────────────
const OrderDetailSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-6 bg-amber-100/60 rounded-xl w-32" />
    <div className="h-28 rounded-3xl bg-white border border-amber-950/10" />
    <div className="h-48 rounded-3xl bg-white border border-amber-950/10" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-32 rounded-3xl bg-white border border-amber-950/10" />
      <div className="h-32 rounded-3xl bg-white border border-amber-950/10" />
    </div>
  </div>
);

// ─── Main Order Detail Component ─────────────────────────────────────
const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
  });

  const handleCopy = async (text: unknown, fieldName: string) => {
    const value = typeof text === 'string' || typeof text === 'number' ? String(text) : '';

    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* Fallback */
    }
  };

  const handleReorderAll = () => {
    if (!order?.items) return;
    order.items.forEach((item: any) => {
      // Reconstruct minimal product shape for cart store
      const productObj = {
        id: item.product?._id || item.product?.id || item.product,
        name: item.name,
        slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        price: item.price,
        image: item.image,
        category: 'Snack',
        description: '',
        stock: 50,
        rating: 5,
        reviewCount: 1,
      };
      addItem(productObj as any, item.quantity);
    });
    navigate('/cart');
  };

  // 4-Stage Stepper Items
  const orderSteps = useMemo(() => {
    const currentStatus = order?.orderStatus?.toLowerCase() || 'confirmed';
    const statusOrder = ['confirmed', 'preparing', 'on_the_way', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return [
      { id: 'confirmed', label: 'Order Confirmed', icon: ShieldCheck },
      { id: 'preparing', label: 'Kitchen Baking', icon: Flame },
      { id: 'on_the_way', label: 'Rider Dispatched', icon: Truck },
      { id: 'delivered', label: 'Warm Arrival', icon: CheckCircle2 },
    ].map((step, idx) => ({
      ...step,
      isCompleted: idx <= (currentIndex >= 0 ? currentIndex : 1),
    }));
  }, [order?.orderStatus]);

  if (isLoading) {
    return (
      <AccountLayout title="Loading Order Details...">
        <OrderDetailSkeleton />
      </AccountLayout>
    );
  }

  if (!order) {
    return (
      <AccountLayout
        title="Order Not Found"
        subtitle="We couldn't locate this specific order reference in our records."
      >
        <div className="py-12 text-center space-y-4 bg-white rounded-3xl border border-amber-950/10 p-8 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-black text-lg text-stone-900">
              Missing Order Reference
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              The order link may have expired or been moved. Check your order history for active dispatches.
            </p>
          </div>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 text-white text-xs font-black shadow-md hover:bg-stone-800 transition-all"
          >
            <RotateCcw size={14} />
            <span>Back to All Orders</span>
          </Link>
        </div>
      </AccountLayout>
    );
  }

  const statusCfg = getStatusConfig(order.orderStatus);
  const paymentCfg = getPaymentStatusConfig(order.paymentStatus);
  const StatusIcon = statusCfg.icon;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Get order number string for copying
  const orderNumberString = order.orderNumber || order.id || order._id || '';

  return (
    <AccountLayout
      title={`Order ${orderNumberString.slice(-6)}`}
      subtitle={`Placed on ${formattedDate}`}
    >
      <div className="space-y-6 text-stone-900">
        
        {/* ── 1. Top Navigation & Quick Actions ───────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-amber-950/5">
          <Link
            to="/account/orders"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Orders List</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(orderNumberString, 'orderNum')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-stone-700 text-xs font-bold border border-amber-950/10 transition-colors"
            >
              {copiedField === 'orderNum' ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span>Copied #</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Order #</span>
                </>
              )}
            </button>

            <button
              onClick={handleReorderAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-black shadow-xs transition-all active:scale-95"
            >
              <RotateCcw size={13} />
              <span>Re-order All Items</span>
            </button>
          </div>
        </div>

        {/* ── 2. Live Dispatch Progress Stepper ─────────────────────── */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-amber-950/10 shadow-2xs space-y-6">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-amber-950/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100/60 text-primary flex items-center justify-center">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-stone-900">Dispatch Progress</h3>
                <p className="text-[11px] text-stone-500 font-medium">Estimated Arrival: ~25 - 35 mins</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusCfg.className}`}>
                <StatusIcon size={12} />
                <span>{statusCfg.label}</span>
              </span>
            </div>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-4 gap-2 relative">
            {orderSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      step.isCompleted
                        ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    <StepIcon size={18} />
                  </div>
                  <span
                    className={`text-[10px] font-black leading-tight ${
                      step.isCompleted ? 'text-stone-900' : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. Ordered Items List Card ────────────────────────────── */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-amber-950/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-amber-950/5">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-primary" />
              <h3 className="font-heading font-black text-sm sm:text-base text-stone-900">
                Snack Items Ordered ({order.items?.length || 0})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {order.items?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/30 border border-amber-950/5 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-amber-100/50 shrink-0 border border-amber-950/5">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-primary text-base">
                        {item.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-black text-xs sm:text-sm text-stone-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-stone-400 font-medium">
                      {formatCurrency(item.price)} × {item.quantity} portions
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-heading font-black text-xs sm:text-sm text-stone-900 block">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Financial Order Summary ────────────────────────────── */}
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-amber-950/10 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-amber-950/5 text-stone-900">
            <Receipt size={16} className="text-primary" />
            <h3 className="font-heading font-black text-sm">Receipt Breakdown</h3>
          </div>

          <div className="space-y-2 text-xs font-semibold text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-stone-900 font-bold">{formatCurrency(order.subtotal)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Express Delivery Fee</span>
              {order.deliveryFee === 0 ? (
                <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                  FREE
                </span>
              ) : (
                <span className="text-stone-900 font-bold">{formatCurrency(order.deliveryFee)}</span>
              )}
            </div>

            <div className="pt-3 border-t border-amber-950/10 flex items-baseline justify-between">
              <span className="font-heading font-black text-sm text-stone-900">Total Paid</span>
              <span className="font-heading font-black text-2xl text-primary tracking-tight">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* ── 5. Delivery Address & Contact Cards ───────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Address */}
          <div className="p-5 bg-white rounded-3xl border border-amber-950/10 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <MapPin size={15} />
              <span className="uppercase tracking-wider font-black">Delivery Location</span>
            </div>
            <div className="text-xs text-stone-700 leading-relaxed font-medium space-y-0.5">
              <p className="font-bold text-stone-900">{order.deliveryAddress?.street}</p>
              <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
              {order.deliveryAddress?.additionalInfo && (
                <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200/50 mt-2">
                  Note: {order.deliveryAddress.additionalInfo}
                </p>
              )}
            </div>
          </div>

          {/* Contact & Payment Info */}
          <div className="p-5 bg-white rounded-3xl border border-amber-950/10 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <CreditCard size={15} />
              <span className="uppercase tracking-wider font-black">Payment & Contact</span>
            </div>
            <div className="text-xs text-stone-700 space-y-2 font-medium">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Phone:</span>
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <Phone size={11} className="text-stone-400" />
                  {order.deliveryAddress?.phone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Payment Method:</span>
                <span className="font-bold uppercase text-stone-900">
                  {order.paymentMethod === 'paystack' ? 'Paystack (Online)' : 'Cash on Delivery'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Payment Status:</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${paymentCfg.className}`}>
                  {paymentCfg.label}
                </span>
              </div>

              {order.paymentReference && (
                <div className="pt-2 border-t border-amber-950/5 flex items-center justify-between text-[10px]">
                  <span className="text-stone-400">Ref: {order.paymentReference}</span>
                  <button
                    onClick={() => handleCopy(order.paymentReference, 'payRef')}
                    className="text-primary font-bold hover:underline"
                  >
                    {copiedField === 'payRef' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── 6. Bottom WhatsApp Kitchen Support Banner ──────────────── */}
        <div className="p-5 rounded-3xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle size={20} />
            </div>
            <div>
              <h4 className="font-heading font-black text-sm">Need Help With This Dispatch?</h4>
              <p className="text-xs text-stone-400 font-medium">
                Connect directly with our Lagos Kitchen Manager on WhatsApp for live rider updates.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/2348023456789?text=Hi%20Naija%20Snacks,%20I%20have%20a%20question%20about%20Order%20${orderNumberString}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shrink-0 active:scale-95 shadow-md"
          >
            <span>WhatsApp Kitchen</span>
            <ArrowRight size={14} />
          </a>
        </div>

      </div>
    </AccountLayout>
  );
};

export default OrderDetailPage;