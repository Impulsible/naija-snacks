import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Store,
  Sparkles,
  ShieldAlert,
  Menu,
  X,
  PlusCircle} from 'lucide-react';
import Container from '../layout/Container'; // Adjust path based on your folders
import { useAuth } from '../../context/AuthContext'; // Adjust path based on your folders

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode; // Optional header slots for action buttons (e.g., "Add Product")
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() || 'AD';

  const displayName =
    user?.firstName || user?.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(' ')
      : user?.email?.split('@')[0] || 'Administrator';

  // Navigation config tailored specifically for admin features
  const adminNavItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Manage Orders', icon: ShoppingCart },
    { to: '/admin/products', label: 'Snack Inventory', icon: Package },
    { to: '/admin/users', label: 'Customer Base', icon: Users },
    { to: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-stone-900 pb-16 lg:pb-24">
      {/* ── Mobile Header Sticky Nav ── */}
      <header className="sticky top-0 z-40 lg:hidden bg-[#FFFDF9]/95 backdrop-blur-md border-b border-amber-950/10 px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-950 flex items-center justify-center text-white font-black text-sm">
            N
          </div>
          <span className="font-heading font-black text-xs tracking-wider uppercase text-stone-950">
            HQ Portal
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-stone-100 border border-stone-200/60 text-stone-800"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Sidebar Drawer Slide-over ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <nav className="fixed top-0 bottom-0 left-0 w-[280px] bg-[#FFFDF9] border-r border-amber-950/10 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl z-50">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-white font-black text-base">
                    N
                  </div>
                  <span className="font-heading font-black text-sm tracking-wider uppercase text-stone-950">
                    HQ Control
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-stone-700 hover:bg-amber-50/80 hover:text-stone-900'
                      }`
                    }
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-amber-950/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ── Main Layout Wrapper ── */}
      <div className="pt-6 sm:pt-8 lg:pt-12">
        <Container>
          {/* Breadcrumbs */}
          <nav
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-stone-500 mb-6 lg:mb-8"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Store size={12} />
              <span>Storefront</span>
            </Link>
            <ChevronRight size={14} className="text-stone-300 shrink-0" />
            <Link to="/admin" className="hover:text-primary transition-colors">
              HQ Control Panel
            </Link>
            <ChevronRight size={14} className="text-stone-300 shrink-0" />
            <span className="text-stone-900 font-black truncate">{title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* ── Desktop Left Sidebar ── */}
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4">
              
              {/* Admin Identity Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white p-5 border border-amber-900/20 shadow-lg shadow-amber-950/10">
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center text-lg font-black shadow-md shadow-primary/30">
                      {initials}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-stone-900 animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-black text-base text-white truncate leading-tight">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">
                      {user?.email || 'admin@naijasnacks.com'}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg bg-red-500/20 border border-red-500/30 text-[9px] font-black uppercase tracking-wider text-red-300">
                      <ShieldAlert size={10} />
                      HQ Ops Control
                    </span>
                  </div>
                </div>

                {/* Direct Command Shortcuts */}
                <div className="relative z-10 mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
                  <Link
                    to="/admin/products/new"
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-stone-200 transition-colors"
                  >
                    <PlusCircle size={12} className="text-primary" />
                    New Snack
                  </Link>
                  <Link
                    to="/"
                    target="_blank"
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-stone-200 transition-colors"
                  >
                    <Store size={12} className="text-amber-400" />
                    View Live
                  </Link>
                </div>
              </div>

              {/* Main Admin Sidebar Navigation */}
              <div className="bg-white rounded-3xl border border-amber-950/10 shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/50 px-2">
                    Operational Control
                  </p>
                </div>

                <nav className="px-2 pb-2 space-y-0.5" aria-label="HQ navigation">
                  {adminNavItems.map((item) => (
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
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Status Ribbon */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-amber-50/60 border border-amber-900/10 text-[10px] font-bold text-stone-600">
                <Sparkles size={12} className="text-primary shrink-0" />
                <span>System Secure · SSL Active</span>
              </div>
            </aside>

            {/* ── Main Data Display Panel ── */}
            <main className="col-span-1 lg:col-span-8 xl:col-span-9 min-w-0">
              <div className="bg-white rounded-3xl border border-amber-950/10 shadow-sm overflow-hidden">
                
                {/* Dashboard Panel Header */}
                <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-amber-950/5 bg-gradient-to-r from-amber-50/40 via-white to-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                    {actions && (
                      <div className="flex items-center gap-2 shrink-0">
                        {actions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Child view slot */}
                <div className="p-5 sm:p-8">{children}</div>
              </div>
            </main>

          </div>
        </Container>
      </div>
    </div>
  );
};

export default AdminLayout;