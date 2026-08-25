import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Heart,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Clock,
  Sparkles,
  Flame,
  ChevronRight,
  User,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import AccountLayout from '../../components/account/AccountLayout';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../lib/format';

// ─── Status Badge Variant Helper ────────────────────────────────────
const getStatusBadge = (status: string) => {
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
        icon: AlertCircle,
      };
    case 'on_the_way':
    case 'preparing':
      return {
        label: 'In Kitchen / Delivery',
        className: 'bg-amber-100/80 text-amber-900 border-amber-300/60',
        icon: Truck,
      };
    default:
      return {
        label: 'Processing Order',
        className: 'bg-amber-50 text-primary border-primary/20',
        icon: Clock,
      };
  }
};

// ─── Main Component ─────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Fetch Orders from API
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getUserOrders(),
    enabled: !!user,
  });

  // Calculate local storage saved wishlist items
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavoriteCount(Array.isArray(saved) ? saved.length : 0);
    } catch {
      setFavoriteCount(0);
    }
  }, []);

  const recentOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.slice(0, 3);
  }, [orders]);

  const stats = [
    {
      label: 'Total Orders',
      value: orders?.length || 0,
      icon: Package,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200/60',
      iconBg: 'bg-amber-500/10 text-primary',
      link: '/account/orders',
    },
    {
      label: 'Saved Favourites',
      value: favoriteCount,
      icon: Heart,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/60',
      iconBg: 'bg-rose-500/10 text-rose-600',
      link: '/account/favourites',
    },
    {
      label: 'Delivery Addresses',
      value: user && 'address' in user && user.address ? 1 : 0,
      icon: MapPin,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      link: '/account/addresses',
    },
  ];

  return (
    <AccountLayout
      title={`Welcome back, ${user?.firstName || 'Valued Customer'}! 👋`}
      subtitle="Here is a quick overview of your live snack orders, saved treats, and account activity."
    >
      <div className="space-y-8">
        
        {/* ── 1. Stats Bento Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.link}
                className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white border border-amber-950/10 shadow-xs hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`w-10 h-10 rounded-2xl ${stat.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <StatIcon size={20} />
                    </div>
                    <ChevronRight size={16} className="text-stone-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <span className="font-heading font-black text-3xl sm:text-4xl text-stone-900 tracking-tight block">
                    {stat.value}
                  </span>
                </div>

                <div className="pt-3 mt-3 border-t border-amber-950/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500">{stat.label}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${stat.badgeColor}`}>
                    Active
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── 2. Recent Orders Section ─────────────────────────────── */}
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-amber-950/10 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-amber-950/5">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-primary" />
              <h2 className="font-heading font-black text-base sm:text-lg text-stone-900">
                Recent Orders
              </h2>
            </div>
            
            <Link
              to="/account/orders"
              className="group inline-flex items-center gap-1 text-xs font-black text-primary hover:text-primary-dark transition-colors"
            >
              <span>View All Orders</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            /* Loading Skeleton */
            <div className="space-y-3 py-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-amber-50/50 animate-pulse border border-amber-950/5" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            /* Empty Orders Callout */
            <div className="py-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-950/5">
                <ShoppingBag size={26} />
              </div>
              <div className="space-y-1">
                <p className="font-heading font-black text-sm text-stone-900">No orders placed yet</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto font-medium">
                  Your kitchen order history is clean. Explore our menu to claim your first warm delivery box!
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/explore"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black shadow-md transition-all active:scale-95"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Start Exploring Menu</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Real Orders List */
            <div className="space-y-3">
              {recentOrders.map((order: any) => {
                const badge = getStatusBadge(order.orderStatus);
                const BadgeIcon = badge.icon;
                const dateStr = new Date(order.createdAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <Link
                    key={order.id || order._id}
                    to={`/account/orders/${order.id || order._id}`}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-amber-50/30 hover:bg-amber-50 border border-amber-950/5 hover:border-amber-900/20 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-amber-950/5 flex items-center justify-center text-stone-800 shrink-0">
                        <ShoppingBag size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-black text-xs sm:text-sm text-stone-900 truncate">
                            {order.orderNumber || `#${(order.id || order._id).slice(-6)}`}
                          </p>
                          <span className="text-[10px] text-stone-400">• {dateStr}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                          {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'} ordered
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-950/5">
                      <span className="font-heading font-black text-sm text-stone-900">
                        {formatCurrency(order.total)}
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${badge.className}`}>
                        <BadgeIcon size={11} />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. Quick Actions Banner ─────────────────────────────── */}
        <div className="p-5 sm:p-7 rounded-3xl bg-stone-900 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-base sm:text-lg">
              Quick Shortcuts
            </h2>
            <Flame size={18} className="text-primary animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/explore"
              className="group flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-primary border border-white/10 transition-all text-xs font-bold"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={16} className="text-amber-400 group-hover:text-white transition-colors" />
                <span>Browse Fresh Snack Menu</span>
              </div>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/account/profile"
              className="group flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-stone-800 border border-white/10 transition-all text-xs font-bold"
            >
              <div className="flex items-center gap-2.5">
                <User size={16} className="text-emerald-400" />
                <span>Update Delivery Profile</span>
              </div>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </AccountLayout>
  );
};

export default DashboardPage;