import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import Container from '../layout/Container';
import { useAuth } from '../../context/AuthContext';

interface AccountLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() || 'U';

  const displayName =
    user?.firstName || user?.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(' ')
      : user?.email?.split('@')[0] || 'Guest';

  const navItems = [
    { to: '/account', label: 'Dashboard', icon: Home, end: true },
    { to: '/account/orders', label: 'My Orders', icon: Package },
    { to: '/account/favourites', label: 'Favourites', icon: Heart },
    { to: '/account/addresses', label: 'Addresses', icon: MapPin },
    { to: '/account/profile', label: 'Profile', icon: User },
    { to: '/account/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 sm:py-10 lg:py-14 text-stone-900">
      <Container>
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-stone-500 mb-6 sm:mb-8 overflow-x-auto no-scrollbar"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="hover:text-primary transition-colors shrink-0"
          >
            Home
          </Link>
          <ChevronRight size={14} className="text-stone-300 shrink-0" />
          <span className="text-stone-900 font-black shrink-0">Account</span>
          {title && title !== 'Dashboard' && (
            <>
              <ChevronRight size={14} className="text-stone-300 shrink-0" />
              <span className="text-stone-600 truncate">{title}</span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ── Sidebar ───────────────────────────────────────────── */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Profile card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white p-5 sm:p-6 border border-amber-900/20 shadow-lg shadow-amber-950/10">
              <div
                className="absolute -top-16 -right-16 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"
                aria-hidden
              />
              <div
                className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"
                aria-hidden
              />

              <div className="relative z-10 flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center text-lg font-black shadow-md shadow-primary/30">
                    {initials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-black text-base sm:text-lg text-white truncate leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-stone-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-wider text-amber-200">
                    <ShieldCheck size={10} />
                    {user?.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>
              </div>

              {/* Quick links strip */}
              <div className="relative z-10 mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
                <Link
                  to="/account/orders"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-stone-200 transition-colors"
                >
                  <Package size={12} className="text-primary" />
                  Orders
                </Link>
                <Link
                  to="/explore"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-stone-200 transition-colors"
                >
                  <ShoppingBag size={12} className="text-amber-400" />
                  Shop
                </Link>
              </div>
            </div>

            {/* Nav card */}
            <div className="bg-white rounded-3xl border border-amber-950/10 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/50 px-2">
                  Account menu
                </p>
              </div>

              <nav className="px-2 pb-2 space-y-0.5" aria-label="Account navigation">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary shadow-sm'
                          : 'text-stone-700 hover:bg-amber-50/80 hover:text-stone-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-primary text-white shadow-md shadow-primary/25'
                              : 'bg-amber-50 text-stone-500 group-hover:bg-amber-100/80 group-hover:text-primary'
                          }`}
                        >
                          <item.icon size={16} />
                        </span>
                        <span className="flex-1 min-w-0 truncate">{item.label}</span>
                        <ChevronRight
                          size={14}
                          className={`shrink-0 transition-all ${
                            isActive
                              ? 'text-primary opacity-100'
                              : 'text-stone-300 opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="p-2 pt-1 border-t border-amber-950/5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <LogOut size={16} />
                  </span>
                  <span>Sign out</span>
                </button>
              </div>
            </div>

            {/* Trust strip (desktop) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-amber-50/60 border border-amber-900/10 text-[10px] font-bold text-stone-600">
              <Sparkles size={12} className="text-primary shrink-0" />
              <span>Secure account · Naija Snacks Express</span>
            </div>
          </aside>

          {/* ── Main content ──────────────────────────────────────── */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0">
            <div className="bg-white rounded-3xl border border-amber-950/10 shadow-sm overflow-hidden">
              {/* Page header */}
              <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-amber-950/5 bg-gradient-to-r from-amber-50/40 via-white to-white">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-stone-900">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1.5 max-w-xl leading-relaxed">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Slot content */}
              <div className="p-5 sm:p-8">{children}</div>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
};

export default AccountLayout;