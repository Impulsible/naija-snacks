import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  MessageCircle,
  Truck,
  Flame,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Receipt,
  Share2,
} from 'lucide-react';
import Container from '../../components/layout/Container';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../lib/format';

export interface OrderItem {
  product: string | any;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  phone: string;
  additionalInfo?: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'paystack' | 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
}

const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setLoading(false);
        setError('Invalid order ID.');
        return;
      }

      try {
        const response = await orderService.getOrderById(id) as any;
        // Cleanly unpack standard success payloads or direct structures safely
        const orderData = response.order || response;
        setOrder(orderData);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError(err.response?.data?.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleCopyOrderNumber = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  // Maps backend database states safely to matching frontend step milestones
  const orderSteps = useMemo(() => {
    let currentStatus: string = order?.orderStatus || 'confirmed';
    
    // Normalize DB sub-states to user visual milestones
    if (currentStatus === 'processing' || currentStatus === 'ready') {
      currentStatus = 'preparing';
    } else if (currentStatus === 'out_for_delivery') {
      currentStatus = 'on_the_way';
    }

    const statusOrder = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return [
      { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
      { id: 'preparing', label: 'Kitchen Baking', icon: Flame },
      { id: 'on_the_way', label: 'Rider Dispatched', icon: Truck },
      { id: 'delivered', label: 'Warm Arrival', icon: Package },
    ].map((step, idx) => ({
      ...step,
      isCompleted: idx <= (currentIndex >= 0 ? currentIndex : 1),
      isCurrent: idx === (currentIndex >= 0 ? currentIndex : 1),
    }));
  }, [order?.orderStatus]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FFFDF9] py-20 text-stone-900">
        <Container>
          <div className="max-w-md mx-auto text-center space-y-4 p-8 rounded-3xl bg-white border border-amber-950/10 shadow-sm animate-pulse">
            <div className="w-16 h-16 rounded-2xl bg-amber-100/60 mx-auto" />
            <div className="h-6 bg-stone-100 rounded-xl w-3/4 mx-auto" />
            <div className="h-4 bg-stone-100 rounded-xl w-1/2 mx-auto" />
            <div className="h-20 bg-stone-50 rounded-2xl" />
          </div>
        </Container>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FFFDF9] py-20 text-stone-900">
        <Container>
          <div className="max-w-md mx-auto text-center space-y-5 p-8 sm:p-10 rounded-3xl bg-white border border-amber-950/10 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-heading font-black text-stone-900">Order Not Found</h1>
              <p className="text-xs text-stone-500 font-medium">
                {error || 'We could not locate this order reference in our kitchen records.'}
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-stone-900 text-white text-xs font-black hover:bg-stone-800 transition-all shadow-md"
            >
              <RotateCcw size={14} />
              <span>Explore Active Menu</span>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 sm:py-12 lg:py-16 text-stone-900">
      <Container>
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center space-y-4 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white shadow-xl border border-amber-900/20 relative overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg">
                <CheckCircle2 size={44} className="stroke-[2.5]" />
              </div>

              <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles size={11} />
                <span>Order Dispatched to Kitchen</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white">
                Order Confirmed!
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto font-medium leading-relaxed pt-1">
                Thank you for your order! Our bakers are preparing your snacks fresh. Expect hot & crisp delivery soon.
              </p>

              <div className="pt-4 flex items-center justify-center">
                <div className="inline-flex items-center gap-3 bg-stone-800/80 backdrop-blur-md border border-stone-700/60 px-4 py-2 rounded-2xl text-xs">
                  <span className="text-stone-400 font-medium">Order Reference:</span>
                  <span className="font-mono font-black text-amber-400 tracking-wider">{order.orderNumber}</span>
                  <button onClick={handleCopyOrderNumber} className="p-1 text-stone-400 hover:text-white transition-colors">
                    {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-amber-950/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-amber-950/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100/60 text-primary flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-sm text-stone-900">Dispatch Status</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Estimated Arrival: ~25 - 35 mins</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 relative">
              {orderSteps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      step.isCompleted ? 'bg-primary text-white shadow-md' : 'bg-stone-100 text-stone-400'
                    }`}>
                      <StepIcon size={18} />
                    </div>
                    <span className={`text-[10px] font-black leading-tight ${
                      step.isCompleted ? 'text-stone-900' : 'text-stone-400'
                    }`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-amber-950/10 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-amber-950/5">
              <div className="w-8 h-8 rounded-xl bg-amber-100/60 text-primary flex items-center justify-center">
                <Receipt size={16} />
              </div>
              <h3 className="font-heading font-black text-sm text-stone-900">Snack Bag Details</h3>
            </div>

            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-stone-50/50 border border-amber-950/5">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl border border-amber-950/5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-stone-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-stone-400 font-medium">Quantity: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-stone-900 shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-amber-950/10 space-y-2 text-xs font-semibold text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-900 font-bold">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Express Delivery Fee</span>
                <span className="text-stone-900 font-bold font-mono">
                  {order.deliveryFee === 0 ? <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">FREE</span> : formatCurrency(order.deliveryFee)}
                </span>
              </div>
              <div className="pt-3 border-t border-amber-950/10 flex items-baseline justify-between">
                <span className="font-heading font-black text-sm text-stone-900">Total Paid</span>
                <span className="font-heading font-black text-2xl text-primary tracking-tight">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-amber-950/10 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <MapPin size={15} />
                <span className="uppercase tracking-wider font-black">Delivery Location</span>
              </div>
              <div className="text-xs text-stone-700 leading-relaxed font-medium">
                <p className="font-bold text-stone-900">{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                <p className="text-stone-500 pt-1">Phone: {order.deliveryAddress.phone}</p>
                {order.deliveryAddress.additionalInfo && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/50 mt-2">
                    Note: {order.deliveryAddress.additionalInfo}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-amber-950/10 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <ShieldCheck size={15} />
                <span className="uppercase tracking-wider font-black">Payment Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Method:</span>
                  <span className="font-bold uppercase text-stone-900 font-mono">
                    {order.paymentMethod === 'paystack' ? 'Paystack (Card)' : 'Cash on Delivery'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Status:</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/track-order/${order.id || order._id}`}
              className="group flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-[0.98]"
            >
              <span>Track Live Rider</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/explore"
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white hover:bg-amber-50 border border-amber-950/10 text-stone-800 text-xs sm:text-sm font-black shadow-2xs transition-colors"
            >
              <ShoppingBag size={15} />
              <span>Order More Snacks</span>
            </Link>
          </div>

          <div className="text-center pt-4">
            <a
              href={`https://wa.me/2348023456789?text=Hi%20Naija%20Snacks,%20I%20have%20a%20question%20about%20order%20${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-emerald-700 font-bold transition-colors"
            >
              <MessageCircle size={14} className="text-emerald-600" />
              <span>Need to change delivery notes? Contact Kitchen on WhatsApp</span>
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default OrderConfirmationPage;