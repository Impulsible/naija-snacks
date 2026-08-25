import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Flame,
  RotateCcw,
  Sparkles,
  Receipt,
  X,
} from 'lucide-react';
import AccountLayout from '../../components/account/AccountLayout';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

// ─── Order Status Configuration ─────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  all: { label: 'All Orders', className: '', icon: Package },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-900 border-amber-300/60',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-blue-50 text-blue-700 border-blue-200/60',
    icon: CheckCircle2,
  },
  preparing: {
    label: 'Kitchen Baking',
    className: 'bg-orange-50 text-orange-800 border-orange-200/60',
    icon: Flame,
  },
  on_the_way: {
    label: 'On the Way',
    className: 'bg-teal-50 text-teal-800 border-teal-200/60',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-600 border-red-200/60',
    icon: AlertCircle,
  },
};

const OrdersPage = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getUserOrders(),
    enabled: !!user,
  });

  // Filter Orders Logic
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];

    return orders.filter((order: any) => {
      // Status Filter
      if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesOrderNumber = (order.orderNumber || '').toLowerCase().includes(query);
        const matchesItem = order.items?.some((item: any) =>
          item.name.toLowerCase().includes(query)
        );
        if (!matchesOrderNumber && !matchesItem) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <AccountLayout
      title="My Orders"
      subtitle="Track live snack deliveries, view kitchen receipts, and re-order your favorite treats."
    >
      <div className="space-y-6 text-stone-900">
        
        {/* ── 1. Search & Filter Bar ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order # or snack name..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-amber-950/10 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-bold text-stone-900 placeholder-stone-400 outline-none shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {Object.keys(STATUS_CONFIG).map((key) => {
              const cfg = STATUS_CONFIG[key];
              const isActive = statusFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white hover:bg-amber-100/50 text-stone-600 border border-amber-950/10'
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

        </div>

        {/* ── 2. Orders Content List ───────────────────────────────── */}
        {isLoading ? (
          /* Loading Skeleton */
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-3xl bg-white border border-amber-950/10 p-5 animate-pulse space-y-3"
              >
                <div className="h-4 bg-stone-100 rounded w-1/3" />
                <div className="h-10 bg-stone-50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center bg-white rounded-3xl border border-amber-950/10 shadow-2xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100/60 text-primary flex items-center justify-center mx-auto">
              <Package size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-black text-base text-stone-900">
                No orders match your criteria
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try clearing your search query or selecting a different status filter.'
                  : "You haven't placed any orders yet. Explore our freshly baked menu to start!"}
              </p>
            </div>
            {(searchQuery || statusFilter !== 'all') ? (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100 text-amber-950 text-xs font-bold hover:bg-amber-200 transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </button>
            ) : (
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black shadow-md transition-all active:scale-95"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Start Order</span>
              </Link>
            )}
          </div>
        ) : (
          /* Active Orders List */
          <div className="space-y-3.5">
            {filteredOrders.map((order: any) => {
              const statusCfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;

              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <Link
                  key={order.id || order._id}
                  to={`/account/orders/${order.id || order._id}`}
                  className="group block p-4 sm:p-5 bg-white rounded-3xl border border-amber-950/10 shadow-2xs hover:shadow-md hover:border-primary/30 transition-all duration-300"
                >
                  {/* Top Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-amber-950/5 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-950/5 flex items-center justify-center text-stone-800">
                        <Receipt size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs sm:text-sm text-stone-900">
                            {order.orderNumber || `#${(order.id || order._id).slice(-6)}`}
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium">
                            • {formattedDate}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
                          Payment: {order.paymentMethod === 'paystack' ? 'Card / Online' : 'Cash on Delivery'}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusCfg.className}`}>
                        <StatusIcon size={12} />
                        <span>{statusCfg.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Items Preview & Pricing Footer */}
                  <div className="flex items-center justify-between gap-4">
                    {/* Item Avatars Stack */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex -space-x-2 overflow-hidden shrink-0">
                        {order.items?.slice(0, 3).map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="relative w-9 h-9 rounded-xl overflow-hidden border-2 border-white bg-amber-50 shadow-2xs shrink-0"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-800 truncate">
                          {order.items?.map((i: any) => i.name).join(', ')}
                        </p>
                        <p className="text-[10px] text-stone-400 font-medium truncate">
                          Total {order.items?.length || 1} {order.items?.length === 1 ? 'snack portion' : 'snack portions'}
                        </p>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">
                          Total
                        </span>
                        <span className="font-heading font-black text-sm sm:text-base text-stone-900">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                      
                      <div className="w-8 h-8 rounded-xl bg-amber-50 group-hover:bg-primary group-hover:text-white text-stone-400 flex items-center justify-center transition-all group-hover:translate-x-0.5">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </AccountLayout>
  );
};

export default OrdersPage;