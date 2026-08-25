import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() || 'A';

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/categories', label: 'Categories', icon: Tag },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* ── 1. Mobile Backdrop ───────────────────────────────────────── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── 2. Sidebar Navigation ────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-stone-950 border-r border-stone-800/80 flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <Store size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-heading font-black text-sm tracking-wider text-white block">
                NAIJA SNACKS
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Admin Console
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <span className="px-3 text-[10px] font-black uppercase tracking-widest text-stone-300/80 block mb-2">
            Main Management
          </span>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-3 rounded-2xl font-heading text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg shadow-primary/20'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={18}
                      className={isActive ? 'text-white' : 'text-stone-300 group-hover:text-stone-200 transition-colors'}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <Sparkles size={13} className="text-white/80 fill-current" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-stone-850/80 bg-stone-950/40 space-y-3">
          <div className="p-3 rounded-2xl bg-stone-900/90 border border-stone-800/80 flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-primary text-white flex items-center justify-center font-heading font-black text-sm">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-stone-900" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Store Admin'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck size={11} className="text-primary shrink-0" />
                <span className="text-[10px] text-stone-400 font-semibold capitalize truncate">
                  {user?.role || 'Staff Member'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-bold text-stone-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-[0.98]"
          >
            <LogOut size={15} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* ── 3. Main Content Container ────────────────────────────────── */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 border-b border-amber-950/5 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>
            
            <div className="min-w-0">
              <h1 className="font-heading font-black text-lg sm:text-xl text-stone-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-stone-500 font-medium truncate hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-primary text-xs font-black border border-stone-200/60 hover:border-amber-200 transition-all active:scale-95 shadow-sm"
            >
              <span>Live Store</span>
              <ExternalLink size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;