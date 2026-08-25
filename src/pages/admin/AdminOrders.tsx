import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Eye,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Clock,
  AlertTriangle,
  MapPin,
  CreditCard,
  Banknote,
  Phone,
  Trash2,
  Loader2,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatPrice } from '../../utils/formatPrice';
import { orderService } from '../../services/orderService';

// ─── Lightweight Inline Toast Helper (replaces react-hot-toast) ─────
const toast = {
  success: (msg: string) => {
    console.log('✅', msg);
    // Optional: could show non-blocking snackbar
  },
  error: (msg: string) => {
    console.error('❌', msg);
    alert(msg);
  },
};

// ─── Types ──────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  total: number;
  subtotal: number;
  deliveryFee: number;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'paystack' | 'cash_on_delivery';
  items: OrderItem[];
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    phone: string;
    additionalInfo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMutatingId, setActiveMutatingId] = useState<string | null>(null);

  // ─── Fetch Orders ────────────────────────────────────────────────
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: async () => {
      const result = await orderService.getAdminOrders(
        statusFilter !== 'all' ? statusFilter : undefined
      );
      return result as any;
    },
  });

  // Normalize orders shape from backend (may be flat array or { orders: [] })
  const allOrdersList: Order[] = Array.isArray(ordersData)
    ? (ordersData as Order[])
    : ((ordersData?.orders as Order[]) || []);

  // ─── Update Order Status ─────────────────────────────────────────
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      orderService.updateOrderStatus(orderId, status),
    onMutate: ({ orderId }) => {
      setActiveMutatingId(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update order status');
    },
    onSettled: () => {
      setActiveMutatingId(null);
    }
  });

  // ─── Delete Order ─────────────────────────────────────────────────
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => (orderService as any).deleteOrder(orderId),
    onMutate: (orderId) => {
      setActiveMutatingId(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete order');
    },
    onSettled: () => {
      setActiveMutatingId(null);
    }
  });

  // ─── Status Filter Tabs ───────────────────────────────────────────
  const statuses = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'ready', label: 'Ready for Dispatch' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // ─── Operational Metrics Calculation ──────────────────────────────
  const pendingCount = allOrdersList.filter((o: Order) => o.status === 'pending').length;
  const inProgressCount = allOrdersList.filter((o: Order) => 
    ['confirmed', 'processing', 'ready', 'out_for_delivery'].includes(o.status)
  ).length;
  const completedCount = allOrdersList.filter((o: Order) => o.status === 'delivered').length;

  // ─── Helpers ──────────────────────────────────────────────────────
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/70">
            <XCircle size={13} className="text-red-600" />
            Cancelled
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Action
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/70">
            <CheckCircle2 size={13} className="text-sky-600" />
            Confirmed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/70">
            <Package size={13} className="text-blue-600" />
            Baking / Packing
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/70">
            <Package size={13} className="text-purple-600" />
            Ready for Courier
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/70">
            <Truck size={13} className="text-indigo-600" />
            In Transit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50">
            <CheckCircle2 size={11} className="text-emerald-600" />
            Paid
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/50">
            <XCircle size={11} className="text-red-600" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/50">
            <Clock size={11} className="text-amber-600" />
            Payment Pending
          </span>
        );
    }
  };

  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return [
          { 
            label: 'Confirm Order', 
            action: () => handleStatusChange(order.id, 'confirmed'),
            className: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm shadow-emerald-600/20'
          },
          { 
            label: 'Cancel Order', 
            action: () => handleStatusChange(order.id, 'cancelled'),
            className: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60'
          },
        ];
      case 'confirmed':
        return [
          { 
            label: 'Start Baking / Kitchen Packing', 
            action: () => handleStatusChange(order.id, 'processing'),
            className: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-600/20'
          },
        ];
      case 'processing':
        return [
          { 
            label: 'Mark as Ready for Pickup', 
            action: () => handleStatusChange(order.id, 'ready'),
            className: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm shadow-purple-600/20'
          },
        ];
      case 'ready':
        return [
          { 
            label: 'Handover to Dispatch Rider', 
            action: () => handleStatusChange(order.id, 'out_for_delivery'),
            className: 'bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white shadow-sm shadow-primary/20'
          },
        ];
      case 'out_for_delivery':
        return [
          { 
            label: 'Confirm Final Delivery', 
            action: () => handleStatusChange(order.id, 'delivered'),
            className: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-sm shadow-emerald-600/20'
          },
        ];
      default:
        return [];
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    if (window.confirm(`Are you sure you want to permanently delete order "${orderNumber}"? This cannot be undone.`)) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  // ─── Search Filtering ─────────────────────────────────────────────
  const filteredOrders = allOrdersList.filter((order: Order) => {
    const term = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(term) ||
      order.customer?.firstName?.toLowerCase().includes(term) ||
      order.customer?.lastName?.toLowerCase().includes(term) ||
      order.customer?.email?.toLowerCase().includes(term) ||
      (order.deliveryAddress?.city && order.deliveryAddress.city.toLowerCase().includes(term))
    );
  });

  return (
    <AdminLayout
      title="Orders & Fulfillment"
      subtitle="Track active customer receipts, assign couriers, verify payments, and process kitchen dispatches."
    >
      <div className="space-y-6">
        
        {/* ── 1. Operational Fulfillment Metrics Strip ─────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-amber-950/10 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-primary border border-amber-200/60 flex items-center justify-center shrink-0">
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">All Receipts</p>
              <h4 className="font-heading font-black text-lg text-stone-900 leading-tight">
                {isLoading ? '...' : allOrdersList.length} <span className="text-xs font-medium text-stone-500">Total</span>
              </h4>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-950/10 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Needs Action</p>
              <h4 className="font-heading font-black text-lg text-stone-900 leading-tight">
                {isLoading ? '...' : pendingCount} <span className="text-xs font-bold text-amber-700">Pending</span>
              </h4>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-950/10 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 border border-sky-200/60 flex items-center justify-center shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">In Progress</p>
              <h4 className="font-heading font-black text-lg text-stone-900 leading-tight">
                {isLoading ? '...' : inProgressCount} <span className="text-xs font-bold text-sky-700">Active</span>
              </h4>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-950/10 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Completed</p>
              <h4 className="font-heading font-black text-lg text-stone-900 leading-tight">
                {isLoading ? '...' : completedCount} <span className="text-xs font-medium text-emerald-700">Delivered</span>
              </h4>
            </div>
          </div>
        </div>

        {/* ── 2. Toolbar & Live Search ──────────────────────────────── */}
        <div className="p-4 rounded-3xl bg-white border border-amber-950/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer name, email, or city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-stone-500 shrink-0 self-end sm:self-center">
            <Sparkles size={14} className="text-primary" />
            <span>Showing {filteredOrders.length} filtered {filteredOrders.length === 1 ? 'order' : 'orders'}</span>
          </div>
        </div>

        {/* ── 3. Status Filter Rail ─────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {statuses.map(status => {
            const count = status.value === 'all' 
              ? allOrdersList.length 
              : allOrdersList.filter((o: Order) => o.status === status.value).length;
            const isActive = statusFilter === status.value;

            return (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-2xl whitespace-nowrap text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-md shadow-primary/20 scale-[1.02]'
                    : 'bg-white text-stone-600 hover:bg-amber-50/50 hover:text-stone-900 border border-stone-200/70'
                }`}
              >
                <span>{status.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 4. Content Area ───────────────────────────────────────── */}
        {isLoading ? (
          
          /* Skeleton Loading Cards */
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 rounded-3xl bg-white border border-stone-100 animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-48 bg-stone-100 rounded" />
                  <div className="h-6 w-24 bg-stone-100 rounded-full" />
                </div>
                <div className="h-4 w-1/3 bg-stone-100 rounded" />
                <div className="h-16 w-full bg-stone-50 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          
          /* Error State */
          <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center max-w-md mx-auto my-6">
            <AlertTriangle size={36} className="text-red-500 mx-auto mb-3" />
            <h3 className="font-heading font-black text-base text-red-800 mb-1">
              Unable to Synchronize Orders
            </h3>
            <p className="text-xs text-red-600 mb-5">
              {(error as Error)?.message || 'An error occurred while communicating with the dispatch database.'}
            </p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          
          /* Empty State */
          <div className="p-12 rounded-3xl bg-white border border-amber-950/10 text-center flex flex-col items-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-primary mb-4 shadow-inner">
              <Package size={28} />
            </div>
            <h3 className="font-heading font-black text-base text-stone-900 mb-1">
              No orders found
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mb-6">
              {searchQuery 
                ? `No orders matching query "${searchQuery}" in this view.` 
                : statusFilter !== 'all' 
                  ? `There are currently no orders under "${statusFilter}".` 
                  : 'Your kitchen queue is clear with zero customer orders.'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-xs font-black text-primary hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          
          /* Orders Cards Grid */
          <div className="space-y-4">
            {filteredOrders.map((order: Order) => {
              const actions = getStatusActions(order);
              const fullName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Guest User';
              const isMutatingThis = activeMutatingId === order.id;

              return (
                <div
                  key={order.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-amber-950/10 shadow-sm hover:shadow-md hover:border-amber-950/20 transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-stone-900 tracking-tight">
                          {order.orderNumber}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs text-stone-400 font-medium">
                          {new Date(order.createdAt).toLocaleDateString('en-NG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-heading font-black text-sm text-stone-800">
                          {fullName}
                        </span>
                        <span className="text-xs text-stone-400 font-medium">
                          ({order.customer?.email || 'N/A'})
                        </span>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </div>

                  {/* Order Contents & Route Information */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Item Thumbnails & Summary (7 cols) */}
                    <div className="md:col-span-7 space-y-2">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {order.items?.slice(0, 4).map((item, index) => (
                          <div
                            key={index}
                            className="relative w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 group"
                            title={`${item.quantity}x ${item.name}`}
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-stone-400">
                                🍱
                              </div>
                            )}
                            <span className="absolute bottom-0 right-0 bg-stone-900/80 text-white font-mono text-[9px] font-bold px-1 rounded-tl">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}

                        {(order.items?.length || 0) > 4 && (
                          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-black text-stone-600 shrink-0">
                            +{(order.items?.length || 0) - 4}
                          </div>
                        )}

                        <div className="pl-2">
                          <p className="text-xs font-bold text-stone-800">
                            {order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0} snacks total
                          </p>
                          <p className="text-[11px] text-stone-400 truncate max-w-xs">
                            {order.items?.map(i => i.name).join(', ') || 'No items'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Destination & Payment (5 cols) */}
                    <div className="md:col-span-5 flex flex-col justify-center space-y-1.5 md:border-l md:border-stone-100 md:pl-4">
                      {order.deliveryAddress && (
                        <div className="flex items-start gap-1.5 text-xs text-stone-600">
                          <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                          <span className="truncate">
                            {order.deliveryAddress.street}, {order.deliveryAddress.city}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-stone-400">
                        <span className="flex items-center gap-1">
                          {order.paymentMethod === 'paystack' ? (
                            <>
                              <CreditCard size={12} className="text-stone-500" />
                              <span>Paystack Online</span>
                            </>
                          ) : (
                            <>
                              <Banknote size={12} className="text-stone-500" />
                              <span>Cash on Delivery</span>
                            </>
                          )}
                        </span>

                        {order.customer?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-stone-500" />
                            <span>{order.customer.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Card Actions & Pricing Footer */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-baseline gap-2 self-start sm:self-center">
                      <span className="text-xs font-bold text-stone-400">Total Payable:</span>
                      <span className="font-heading font-black text-lg text-primary">
                        {formatPrice(order.total)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                      {actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={action.action}
                          disabled={isMutatingThis}
                          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 ${action.className}`}
                        >
                          {isMutatingThis ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <span>{action.label}</span>
                          )}
                        </button>
                      ))}

                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="View Full Order Invoice"
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">Details</span>
                      </button>

                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                          disabled={isMutatingThis}
                          className="p-2.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Order Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminOrders;