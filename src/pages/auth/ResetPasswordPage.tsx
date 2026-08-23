import React, { useState, useId, forwardRef, memo, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Flame,
  Sparkles,
  ShieldCheck,
  Star,
  Check,
  Eye,
  EyeOff,
  Clock,
  ArrowLeft,
  XCircle,
} from 'lucide-react';

// ─── Zod Validation Schema ──────────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

// ─── Self-Contained Custom Input ──────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const CustomInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, error, icon, showPasswordToggle = false, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const id = useId();
    const isPassword = type === 'password';
    const activeType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="w-full space-y-1.5">
        <label htmlFor={id} className="block text-xs sm:text-sm font-bold text-zinc-800 select-none">
          {label}
        </label>
        <div
          className={`group relative flex items-center w-full h-11 px-4 rounded-2xl border transition-all duration-200 shadow-2xs ${
            error
              ? 'border-red-300 bg-red-50/20 text-red-900 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10'
              : 'border-zinc-200/90 bg-white hover:border-zinc-300 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10'
          }`}
        >
          {icon && (
            <span
              className={`mr-2.5 flex items-center justify-center transition-colors duration-200 ${
                error ? 'text-red-500' : 'text-zinc-400 group-focus-within:text-orange-600'
              }`}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            name={name}
            type={activeType}
            className="w-full h-full bg-transparent outline-none placeholder:text-zinc-400 text-sm font-medium text-zinc-900"
            {...props}
          />
          {showPasswordToggle && isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="text-xs font-semibold text-red-600 flex items-center gap-1.5 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle size={13} className="shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);
CustomInput.displayName = 'CustomInput';

// ─── Password Strength Verification Checklist ──────────────────────
const PasswordStrengthMeter = memo(function PasswordStrengthMeter({ value = '' }: { value?: string }) {
  const requirements = useMemo(() => [
    { label: 'At least 8 characters', met: value.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(value) },
    { label: 'One lowercase letter', met: /[a-z]/.test(value) },
    { label: 'One number', met: /[0-9]/.test(value) },
  ], [value]);

  const score = useMemo(() => requirements.filter((r) => r.met).length, [requirements]);

  const meta = useMemo(() => {
    if (!value) return { text: 'Empty', color: 'text-zinc-400', progressColor: 'bg-zinc-200' };
    if (score <= 1) return { text: 'Too Weak', color: 'text-red-500', progressColor: 'bg-red-500' };
    if (score <= 2) return { text: 'Fair', color: 'text-orange-500', progressColor: 'bg-orange-500' };
    if (score <= 3) return { text: 'Good Strength', color: 'text-amber-500', progressColor: 'bg-amber-500' };
    return { text: 'Extremely Strong', color: 'text-emerald-600', progressColor: 'bg-emerald-500' };
  }, [value, score]);

  return (
    <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-zinc-700">Security Score:</span>
        <span className={`text-xs font-black tracking-wide uppercase ${meta.color}`}>{meta.text}</span>
      </div>

      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              score >= step ? meta.progressColor : 'bg-zinc-200'
            }`}
          />
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1 border-t border-zinc-200/50 list-none p-0 m-0">
        {requirements.map((req, idx) => (
          <li
            key={idx}
            className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
              req.met ? 'text-emerald-700' : 'text-zinc-400'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                req.met ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-300'
              }`}
            >
              <Check size={10} className="stroke-[3]" />
            </div>
            <span className="truncate">{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

// ─── Success Redirect View ──────────────────────────────────────────
const SuccessRedirectView = memo(function SuccessRedirectView() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="max-w-md w-full mx-auto text-center space-y-6 py-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative inline-flex mb-2">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 size={40} className="text-white animate-bounce" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Password Reset!</h1>
        <p className="text-sm sm:text-base text-zinc-500 max-w-xs mx-auto">
          Your new security credentials have been synced. You can now login safely with your updated password.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4.5 py-2 rounded-2xl text-xs font-mono border border-white/10 shadow-md">
        <Clock size={13} className="text-orange-400 animate-spin" />
        <span>Redirecting to Login in <span className="font-bold text-orange-400">{countdown}s</span>...</span>
      </div>

      <Link
        to="/login"
        className="block text-sm font-bold text-orange-600 hover:text-orange-700 underline underline-offset-4"
      >
        Click here to login immediately
      </Link>
    </div>
  );
});

// ─── Invalid / Expired Token View ───────────────────────────────────
const InvalidTokenView = memo(function InvalidTokenView() {
  return (
    <div className="max-w-md w-full mx-auto text-center space-y-6 py-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative inline-flex mb-2">
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
          <XCircle size={40} className="text-white" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Link Expired</h1>
        <p className="text-sm sm:text-base text-zinc-500 max-w-xs mx-auto">
          For security reasons, recovery links are single-use and expire after 15 minutes.
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/forgot-password"
          className="inline-flex items-center justify-center gap-2.5 h-12 w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <span>Request New Reset Link</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-orange-600 py-1.5 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Return to Login</span>
      </Link>
    </div>
  );
});

// ─── Main ResetPasswordPage Component ───────────────────────────────
export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      // Simulate secure API call latency
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Reset password securely with token:', token);
      setIsSuccess(true);
    } catch (error) {
      console.error('Password synchronization failure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30 overflow-hidden">
      {/* ── Left Pane: Interactive Reset Form ─────────────────────── */}
      <div className="w-full lg:w-[52%] xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-18 overflow-y-auto">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 group focus:outline-none">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <Flame size={20} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-zinc-900">
              Naija<span className="text-orange-600">Snacks</span>
            </span>
          </Link>

          {!isSuccess && token && (
            <Link
              to="/login"
              className="text-xs sm:text-sm font-bold text-zinc-600 hover:text-orange-600 transition-colors"
            >
              Have an account? <span className="text-orange-600 underline underline-offset-4">Login</span>
            </Link>
          )}
        </div>

        {/* Dynamic Inner Layout Switcher */}
        {!token ? (
          <InvalidTokenView />
        ) : isSuccess ? (
          <SuccessRedirectView />
        ) : (
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Header Copy */}
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-tight">
                Reset your password
              </h1>
              <p className="text-sm text-zinc-500 font-medium">
                Choose a strong, unique password to secure your account.
              </p>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              
              {/* New Password */}
              <CustomInput
                label="New Password"
                type="password"
                placeholder="Enter strong password"
                icon={<Lock size={16} />}
                error={errors.password?.message}
                showPasswordToggle
                autoComplete="new-password"
                {...register('password')}
              />

              {/* Password Strength Checklist */}
              {passwordValue && <PasswordStrengthMeter value={passwordValue} />}

              {/* Confirm Password */}
              <CustomInput
                label="Confirm New Password"
                type="password"
                placeholder="Confirm your password choice"
                icon={<Lock size={16} />}
                error={errors.confirmPassword?.message}
                showPasswordToggle
                autoComplete="new-password"
                {...register('confirmPassword')}
              />

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Syncing passwords...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm New Password</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer Security Badges */}
        <div className="mt-8 pt-6 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Encrypted Credential Storage</span>
          </div>
          <p>© {new Date().getFullYear()} NaijaSnacks Ltd.</p>
        </div>
      </div>

      {/* ── Right Pane: Atmospheric Brand Showcase ─────────────────── */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-950 p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Background Graphic Asset with Ambient Darkness */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=1600&fit=crop&q=85"
            alt="Warm fresh snacks display"
            className="w-full h-full object-cover opacity-35 scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/40" />
        </div>

        {/* Ambient Top Glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating Headers */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400">
            <Sparkles size={13} />
            <span>Secure Verification Hub</span>
          </span>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white text-xs font-bold">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span>4.9 / 5.0 Rating</span>
          </div>
        </div>

        {/* Bottom Hero Pitch Copy */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-orange-400">
              Account Security First
            </span>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              A secure space to safeguard your culinary choices.
            </h2>
            <p className="text-zinc-300 text-sm xl:text-base leading-relaxed">
              We leverage modern encryption technology to protect your profile, addresses, payment history, 
              and favorite order options with clean multi-layered industry standards.
            </p>
          </div>

          {/* Quick FAQ / Guide Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-5 text-white flex items-center gap-4 shadow-xl">
            <div className="min-w-0">
              <p className="text-xs font-bold text-orange-300 mb-1">
                Password Safety Recommendation:
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Avoid reusing passwords from other websites or apps. Try combining random words, uppercase letters, numbers, and symbols to ensure maximum coverage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResetPasswordPage;