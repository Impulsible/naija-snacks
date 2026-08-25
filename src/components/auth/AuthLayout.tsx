import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  Sparkles, 
  Store,
  ShieldAlert
} from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  icon?: 'login' | 'register' | 'forgot' | 'reset';
  backTo?: string;
  backToLabel?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  icon = 'login',
  backTo = '/',
  backToLabel = 'Back to Store',
}) => {
  const IconComponent = {
    login: ShieldCheck,
    register: User,
    forgot: Lock,
    reset: KeyRound,
  }[icon];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-stone-50 to-amber-50/40 py-10 sm:py-16 flex flex-col justify-center relative overflow-hidden text-stone-900">
      
      {/* ── Background Ambient Glows ─────────────────────────────────── */}
      <div 
        aria-hidden="true" 
        className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none -z-10" 
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-10 right-10 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl pointer-events-none -z-10" 
      />

      <div className="max-w-md w-full mx-auto px-4 sm:px-6 relative z-10">
        
        {/* ── 1. Top Navigation Bar ──────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={backTo}
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white border border-stone-200/70 text-xs font-bold text-stone-600 hover:text-stone-900 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            <span>{backToLabel}</span>
          </Link>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/70 border border-amber-900/10 text-[10px] font-black uppercase tracking-wider text-amber-900">
            <ShieldCheck size={12} className="text-primary" />
            <span>Secure Portal</span>
          </div>
        </div>

        {/* ── 2. Brand Anchor ────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Store size={18} className="stroke-[2.5]" />
            </div>
            <div className="text-left">
              <span className="font-heading font-black text-base tracking-wider text-stone-900 block leading-none">
                NAIJA SNACKS
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Fresh • Warm • Express
              </span>
            </div>
          </Link>
        </div>

        {/* ── 3. Main Auth Card ──────────────────────────────────────── */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-amber-950/10 shadow-xl shadow-stone-200/50 p-6 sm:p-9 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="relative inline-block mb-1">
              {/* Outer Glow Ring */}
              <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-md" />
              
              {/* Icon Container */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center shadow-lg shadow-primary/25 border border-white/20">
                <IconComponent size={28} className="stroke-[2.2]" />
              </div>

              {/* Micro Accent Badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-sm">
                <Sparkles size={11} className="fill-current" />
              </div>
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed max-w-xs mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Form Content */}
          <div className="pt-2">
            {children}
          </div>

        </div>

        {/* ── 4. Card Footer Trust & Legal ────────────────────────────── */}
        <div className="mt-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-stone-400">
            <ShieldAlert size={13} className="text-emerald-600 shrink-0" />
            <span>256-bit Encrypted SSL Connection</span>
          </div>

          <p className="text-xs text-stone-500 font-medium leading-normal max-w-xs mx-auto">
            By proceeding, you agree to the Naija Snacks{' '}
            <a 
              href="/terms" 
              className="text-stone-900 font-bold underline hover:text-primary transition-colors"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a 
              href="/privacy" 
              className="text-stone-900 font-bold underline hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;