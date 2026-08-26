import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  AlertTriangle,
  ChevronRight,
  Wallet,
  Clock,
  Store,
  Loader2
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import { productService } from '../../services/productService';
import { formatPrice } from '../../utils/formatPrice';

// ─── Types ──────────────────────────────────────────────────────────
interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

interface Product {
  id: string;
  _id?: string;
  name: string;
  stock: number;
  price: number;
  category: string | { name: string };
  image?: string;
}

interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const AdminDashboard = () => {
  // ─── Fetch Real Data ─────────────────────────────────────────────
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['admin-dashboard-orders'],
    queryFn: async () => {
      try { return await orderService.getAdminOrders(); }
      catch (e) { console.error(e); return { orders: [] }; }
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-dashboard-users'],
    queryFn: async () => {
      try { return await userService.getUsers(); }
      catch (e) { console.error("Users API failed:", e); return { users: [] }; }
    },
  });

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['admin-dashboard-products'],
    queryFn: async () => {
      try { return await productService.getProducts({ limit: 100 }); }
      catch (e) { console.error(e); return { products: [] }; }
    },
  });

  const isLoading = ordersLoading || productsLoading;

  // ─── Safe Data Mapping ────────────────────────────────────────────
  const rawOrders = ordersData as any;
  const rawUsers = usersData as any;
  const rawProducts = productsData as any;

  const orders: Order[] = Array.isArray(rawOrders) 
    ? rawOrders 
    : (rawOrders?.orders || []);
  
  const users: User[] = Array.isArray(rawUsers) 
    ? rawUsers 
    : (rawUsers?.users || []);
  
  const products: Product[] = Array.isArray(rawProducts)
    ? rawProducts
    : (rawProducts?.products || []);

  // ─── KPI Calculations ─────────────────────────────────────────────
  const totalRevenue = orders
    .filter(order => order.paymentStatus === 'paid')
    .reduce((sum, order) => sum + (order.total || 0), 0);

  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = users.filter(u => u.role !== 'admin').length;

  const lowStockProducts = products
    .filter(product => (product.stock || 0) <= 10)
    .slice(0, 3)
    .map(product => ({
      id: product.id || product._id || '',
      name: product.name,
      stock: product.stock || 0,
      threshold: 15,
      category: typeof product.category === 'string' 
        ? product.category 
        : product.category?.name || 'Uncategorized',
    }));

  // ─── Stats ────────────────────────────────────────────────────────
  const stats = [
    {
      id: 'stat-revenue',
      label: 'Gross Sales Revenue',
      value: formatPrice(totalRevenue),
      change: '+12.5%',
      trend: 'up',
      period: 'vs last month',
      icon: Wallet,
      gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200/60',
    },
    {
      id: 'stat-orders',
      label: 'Completed Orders',
      value: totalOrders.toString(),
      change: '+8.2%',
      trend: 'up',
      period: 'vs last month',
      icon: ShoppingCart,
      gradient: 'from-amber-500/10 to-orange-500/10 text-primary border-amber-200/60',
    },
    {
      id: 'stat-menu',
      label: 'Active Snack Menu',
      value: totalProducts.toString(),
      change: `${products.filter(p => (p.stock || 0) > 0).length} in stock`,
      trend: 'up',
      period: `${products.filter(p => (p.stock || 0) === 0).length} sold out`,
      icon: Package,
      gradient: 'from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200/60',
    },
    {
      id: 'stat-customers',
      label: 'Customer Base',
      value: totalCustomers.toString(),
      change: '+15.3%',
      trend: 'up',
      period: 'vs last month',
      icon: Users,
      gradient: 'from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200/60',
    },
  ];

  // ─── Helpers ──────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || 'pending';
    switch (s) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Delivered
          </span>
        );
      case 'confirmed':
      case 'processing':
      case 'ready':
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Active
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
          </span>
        );
    }
  };

  // ─── Loading State ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AdminLayout title="Store Dashboard" subtitle="Fetching store telemetry...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={40} className="text-primary animate-spin" />
            <p className="text-sm text-stone-500">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────
  if (ordersError || productsError) {
    return (
      <AdminLayout title="Store Dashboard" subtitle="Operational performance...">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-700 mb-2">Failed to Load Dashboard</h3>
          <p className="text-red-600">{(ordersError || productsError)?.message || 'An error occurred.'}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Store Dashboard"
      subtitle="Operational performance, incoming dispatch requests, and store inventory."
    >
      <div className="space-y-6 sm:space-y-8">
        
        {/* ── KPI Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-amber-950/10 shadow-sm hover:shadow-md hover:border-amber-950/20 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br border flex items-center justify-center shadow-inner ${stat.gradient}`}>
                    <Icon size={22} className="stroke-[2.2]" />
                  </div>
                  
                  <div className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-black ${
                    stat.trend === 'up' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-red-50 text-red-700 border border-red-200/50'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    <span>{stat.change}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
                    {stat.value}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs font-bold text-stone-500">{stat.label}</p>
                    <span className="text-[10px] font-semibold text-stone-400">{stat.period}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Split Panels: Orders & Inventory ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Recent Orders */}
          <div className="lg:col-span-7 rounded-3xl bg-white border border-amber-950/10 p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 text-primary flex items-center justify-center">
                    <ShoppingCart size={16} />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-base text-stone-900 leading-none">Live Orders</h2>
                    <span className="text-[11px] text-stone-400 font-medium">Recent checkout dispatches</span>
                  </div>
                </div>

                <Link to="/admin/orders" className="group flex items-center gap-1 text-xs font-black text-primary hover:text-primary-dark transition-colors">
                  <span>View All</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="divide-y divide-stone-100 pt-2">
                {orders.length > 0 ? (
                  orders.slice(0, 5).map((order: Order, idx: number) => {
                    const orderKey = order.id || order._id || order.orderNumber || `dashboard-order-${idx}`;
                    return (
                      <div key={orderKey} className="py-4 flex items-center justify-between gap-4 hover:bg-stone-50/50 rounded-2xl px-2 -mx-2 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200/60 text-stone-700 flex items-center justify-center font-heading font-black text-xs shrink-0">
                            {order.orderNumber?.slice(-4) || 'NS'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-heading font-black text-xs text-stone-900 truncate">
                              {order.orderNumber || 'Unknown Order'}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                              <span className="flex items-center gap-1 font-medium">
                                <Clock size={11} /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-heading font-black text-sm text-stone-900 mb-1">
                            {formatPrice(order.total || 0)}
                          </p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mb-3">
                      <Store size={20} className="text-stone-300" />
                    </div>
                    <p className="text-stone-900 font-heading font-black text-sm">No orders placed yet</p>
                    <p className="text-stone-400 text-xs mt-1">When customers checkout, they will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-amber-950/10 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200/60 text-red-600 flex items-center justify-center">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-base text-stone-900 leading-none">Restock Alert</h2>
                    <span className="text-[11px] text-stone-400 font-medium">Items near exhaustion</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product, idx: number) => {
                    const productKey = product.id || `low-stock-prod-${idx}`;
                    const stockPercentage = Math.round((product.stock / product.threshold) * 100);
                    const isCritical = product.stock <= 5;

                    return (
                      <div key={productKey} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-heading font-black text-xs text-stone-900 truncate">{product.name}</p>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{product.category}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${
                            isCritical ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {isCritical ? 'Critical' : 'Low Stock'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium text-stone-500">
                            <span>In Stock: <strong className="text-stone-800 font-bold">{product.stock}</strong></span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, stockPercentage)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-emerald-600 font-bold text-sm">Inventory is healthy! 🎉</p>
                    <p className="text-stone-400 text-xs mt-1">No items are currently running low.</p>
                  </div>
                )}
              </div>
            </div>

            <Link to="/admin/products/new" className="mt-6 w-full py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black flex items-center justify-center gap-1.5 transition-colors">
              <Plus size={15} strokeWidth={2.5} />
              <span>Add Product Batch</span>
            </Link>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;