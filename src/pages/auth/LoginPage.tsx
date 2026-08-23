import React, { useState, useId, forwardRef, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Check,
  Copy,
  ShieldCheck,
  Flame,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Zod Validation Schema ──────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

// ─── Social Login Icons ─────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
    />
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
    />
    <path
      fill="#FBBC05"
      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.85-.92.04-2.04.62-2.7 1.39-.58.67-1.09 1.74-1.03 2.78 1.03.08 2.09-.57 2.72-1.32z" />
  </svg>
);

// ─── Inline Form Components ─────────────────────────────────────────
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
          className={`group relative flex items-center w-full h-12 px-4 rounded-2xl border transition-all duration-200 shadow-2xs ${
            error
              ? 'border-red-300 bg-red-50/20 text-red-900 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10'
              : 'border-zinc-200/90 bg-white hover:border-zinc-300 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10'
          }`}
        >
          {icon && (
            <span
              className={`mr-3 flex items-center justify-center transition-colors duration-200 ${
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
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="text-xs font-semibold text-red-600 flex items-center gap-1.5 pt-0.5">
            <AlertCircle size={13} className="shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);
CustomInput.displayName = 'CustomInput';

interface CheckboxProps {
  label: React.ReactNode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
}

const CustomCheckbox = ({ label, checked, onChange, name }: CheckboxProps) => {
  const id = useId();

  return (
    <label htmlFor={id} className="group flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <div
        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 shadow-2xs ${
          checked
            ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-600 text-white shadow-xs shadow-orange-500/25'
            : 'bg-white border-zinc-300 group-hover:border-zinc-400'
        } peer-focus-visible:ring-4 peer-focus-visible:ring-orange-500/20 peer-focus-visible:border-orange-500`}
        aria-hidden="true"
      >
        {checked && <Check size={13} className="stroke-[3] text-white" />}
      </div>
      <span className="text-xs sm:text-sm font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors">
        {label}
      </span>
    </label>
  );
};

// ─── Demo Credentials Helper Pill ───────────────────────────────────
const DemoCredentialPill = memo(function DemoCredentialPill({
  onFill,
}: {
  onFill: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onFill();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-orange-50/70 border border-orange-200/80 p-4 transition-all">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-800">
          <Sparkles size={13} className="text-orange-600" />
          <span>Instant Demo Access</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-white hover:bg-orange-100/60 border border-orange-200 px-2.5 py-1 rounded-lg shadow-2xs transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-600" />
              <span className="text-emerald-700">Autofilled!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>One-Click Autofill</span>
            </>
          )}
        </button>
      </div>
      <div className="text-xs text-zinc-600 font-mono space-y-0.5 bg-white/60 p-2 rounded-xl border border-orange-100">
        <p className="flex justify-between">
          <span className="text-zinc-400 font-sans">Email:</span>
          <span className="font-semibold text-zinc-800">demo@naijasnacks.ng</span>
        </p>
        <p className="flex justify-between">
          <span className="text-zinc-400 font-sans">Password:</span>
          <span className="font-semibold text-zinc-800">Password123</span>
        </p>
      </div>
    </div>
  );
});

// ─── Main LoginPage Component ───────────────────────────────────────
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleAutofillDemo = () => {
    setValue('email', 'demo@naijasnacks.ng', { shouldValidate: true });
    setValue('password', 'Password123', { shouldValidate: true });
    setValue('rememberMe', true);
    setServerError('');
  };

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    setServerError('');

    try {
      await login(data);
      navigate('/');
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* ── Background Decorative Gradient ─────────────────────────── */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30 -z-10" />
      
      {/* ── Main Content with Slide Animation ──────────────────────── */}
      <div className="w-full min-h-screen flex animate-[slideUp_0.6s_cubic-bezier(0.16,1,0.3,1)]">
        {/* ── Left Pane: Interactive Login Form ──────────────────────── */}
        <div className="w-full lg:w-[52%] xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-18">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <Link to="/" className="flex items-center gap-2 group focus:outline-none">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <Flame size={20} className="text-white" />
              </div>
              <span className="font-black text-xl tracking-tight text-zinc-900">
                Naija<span className="text-orange-600">Snacks</span>
              </span>
            </Link>

            <Link
              to="/register"
              className="text-xs sm:text-sm font-bold text-zinc-600 hover:text-orange-600 transition-colors"
            >
              Need an account? <span className="text-orange-600 underline underline-offset-4">Register</span>
            </Link>
          </div>

          {/* Form Container */}
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Header Copy */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
                Welcome back!
              </h1>
              <p className="text-sm sm:text-base text-zinc-500">
                Sign in to order your favourite freshly prepared Nigerian snacks.
              </p>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-2xl border border-zinc-200/90 bg-white hover:bg-zinc-50 text-xs sm:text-sm font-bold text-zinc-800 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-2xl border border-zinc-200/90 bg-white hover:bg-zinc-50 text-xs sm:text-sm font-bold text-zinc-800 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
              >
                <AppleIcon />
                <span>Apple ID</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-zinc-200" />
              <span className="absolute bg-white px-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Or with email
              </span>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200/80 text-red-700 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                <p className="text-xs sm:text-sm font-medium leading-relaxed">{serverError}</p>
              </div>
            )}

            {/* Core Credentials Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <CustomInput
                label="Email Address"
                type="email"
                placeholder="e.g. adebayo@example.com"
                icon={<Mail size={18} />}
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />

              <CustomInput
                label="Password"
                type="password"
                placeholder="Enter your account password"
                icon={<Lock size={18} />}
                error={errors.password?.message}
                showPasswordToggle
                autoComplete="current-password"
                {...register('password')}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <CustomCheckbox
                      name={field.name}
                      label="Remember me"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />

                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none focus-visible:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Autofill Box */}
            <DemoCredentialPill onFill={handleAutofillDemo} />
          </div>

          {/* Footer Security Badges */}
          <div className="mt-8 pt-6 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>End-to-End 256-bit Encrypted</span>
            </div>
            <p>© {new Date().getFullYear()} NaijaSnacks Ltd.</p>
          </div>
        </div>

        {/* ── Right Pane: Atmospheric Brand Showcase ─────────────────── */}
        <div className="hidden lg:flex flex-1 relative bg-zinc-950 p-12 xl:p-16 flex-col justify-between overflow-hidden">
          {/* Background Image with Ambient Vignette */}
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

          {/* Top Floating Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400">
              <Sparkles size={13} />
              <span>Lagos • Abuja • Ibadan</span>
            </span>
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white text-xs font-bold">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span>4.9 / 5.0 Rating</span>
            </div>
          </div>

          {/* Bottom Hero Pitch Card */}
          <div className="relative z-10 max-w-lg space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-orange-400">
                Fresh Daily Guarantee
              </span>
              <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
                Hot Puff-Puff, Crispy Meat Pies & Sizzling Suya in 30 Mins.
              </h2>
              <p className="text-zinc-300 text-sm xl:text-base leading-relaxed">
                Experience the true taste of authentic Nigerian street food prepared in certified
                hygienic kitchens and delivered warm straight to your doorstep.
              </p>
            </div>

            {/* Social Proof Review Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-5 text-white flex items-center gap-4 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&q=80"
                alt="Customer avatar"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-400 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs italic text-zinc-200 line-clamp-2">
                  &ldquo;Fastest snack delivery in Lekki! The chin chin has that nostalgic buttery crunch.&rdquo;
                </p>
                <p className="text-[11px] font-bold text-orange-300 mt-1">
                  Chioma A. <span className="text-zinc-400 font-normal">• Verified Foodie</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CSS Animation Styles ───────────────────────────────────── */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;