import React, { useState, useId, forwardRef, memo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Zod Validation Schema ──────────────────────────────────────────
export const registerSchema = z
  .object({
    firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
    lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
    email: z
      .string()
      .min(1, { message: 'Email address is required' })
      .email({ message: 'Please enter a valid email address' }),
    phone: z
      .string()
      .min(1, { message: 'Phone number is required' })
      .regex(/^(?:\+234|0)[789][01]\d{8}$/, {
        message: 'Enter a valid Nigerian phone number (e.g. 08031234567)',
      }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms and Conditions to proceed',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

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

// ─── Self-Contained Custom Checkbox ───────────────────────────────
interface CheckboxProps {
  label: React.ReactNode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
}

const CustomCheckbox = ({ label, checked, onChange, name, error }: CheckboxProps) => {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="group flex items-start gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <div
          className={`w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-200 shadow-2xs ${
            checked
              ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-600 text-white shadow-xs shadow-orange-500/25'
              : error
              ? 'border-red-400 bg-red-50/10'
              : 'bg-white border-zinc-300 group-hover:border-zinc-400'
          } peer-focus-visible:ring-4 peer-focus-visible:ring-orange-500/20 peer-focus-visible:border-orange-500`}
          aria-hidden="true"
        >
          {checked && <Check size={13} className="stroke-[3] text-white" />}
        </div>
        <span className="text-xs sm:text-sm font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors leading-normal">
          {label}
        </span>
      </label>
      {error && (
        <p role="alert" className="text-xs font-semibold text-red-600 flex items-center gap-1.5 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

// ─── Password Strength Verification Checklist ──────────────────────
const PasswordStrengthMeter = memo(function PasswordStrengthMeter({ value = '' }: { value?: string }) {
  const requirements = [
    { label: 'At least 8 characters', met: value.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(value) },
    { label: 'One lowercase letter', met: /[a-z]/.test(value) },
    { label: 'One number', met: /[0-9]/.test(value) },
  ];

  const score = requirements.filter((r) => r.met).length;

  const getStrengthMeta = () => {
    if (!value) return { text: 'Empty', color: 'text-zinc-400', progressColor: 'bg-zinc-200' };
    if (score <= 1) return { text: 'Too Weak', color: 'text-red-500', progressColor: 'bg-red-500' };
    if (score <= 2) return { text: 'Fair', color: 'text-orange-500', progressColor: 'bg-orange-500' };
    if (score <= 3) return { text: 'Good Strength', color: 'text-amber-500', progressColor: 'bg-amber-500' };
    return { text: 'Extremely Strong', color: 'text-emerald-600', progressColor: 'bg-emerald-500' };
  };

  const meta = getStrengthMeta();

  return (
    <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-zinc-700">Security Score:</span>
        <span className={`text-xs font-black tracking-wide uppercase ${meta.color}`}>{meta.text}</span>
      </div>

      {/* Progress Segments */}
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

      {/* Checklist items */}
      <ul className="grid grid-cols-1 xs:grid-cols-2 gap-x-3 gap-y-1.5 pt-1 border-t border-zinc-200/50 list-none p-0 m-0">
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
    <div className="max-w-md w-full mx-auto text-center space-y-6 py-6 sm:py-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative inline-flex mb-2">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 size={32} className="text-white animate-bounce" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Account Created!</h1>
        <p className="text-sm sm:text-base text-zinc-500 max-w-xs mx-auto">
          Welcome to the NaijaSnacks family! Please check your email to verify your account.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-2xl text-xs font-mono border border-white/10 shadow-md">
        <Clock size={13} className="text-orange-400 animate-spin" />
        <span>Redirecting in <span className="font-bold text-orange-400">{countdown}s</span>...</span>
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

// ─── Main RegisterPage Component ────────────────────────────────────
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true);
    setServerError('');

    try {
      await registerUser(data);
      setIsSuccess(true);
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || 'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* ── Background Decorative Gradient ─────────────────────────── */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30 -z-10" />
      
      {/* ── Main Content ────────────────────────────────────────────── */}
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        {/* ── Left Pane: Interactive Register Form ───────────────────── */}
        <div className="w-full lg:w-[54%] xl:w-[50%] flex flex-col justify-start lg:justify-between p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 overflow-y-auto">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Link to="/" className="flex items-center gap-2 group focus:outline-none">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <Flame size={18} className="text-white" />
              </div>
              <span className="font-black text-base sm:text-xl tracking-tight text-zinc-900">
                Naija<span className="text-orange-600">Snacks</span>
              </span>
            </Link>

            {!isSuccess && (
              <Link
                to="/login"
                className="text-xs sm:text-sm font-bold text-zinc-600 hover:text-orange-600 transition-colors"
              >
                Have an account? <span className="text-orange-600 underline underline-offset-4">Login</span>
              </Link>
            )}
          </div>

          {/* Dynamic Inner Layout Switcher */}
          {isSuccess ? (
            <SuccessRedirectView />
          ) : (
            <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6 flex-1 flex flex-col justify-center lg:justify-start">
              {/* Header Copy */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 leading-tight">
                  Create your account
                </h1>
                <p className="text-sm text-zinc-500">
                  Join our community and secure guaranteed 30-minute delivery.
                </p>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200/80 text-red-700 p-3 sm:p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-500" />
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">{serverError}</p>
                </div>
              )}

              {/* Registration Input Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4" noValidate>
                
                {/* Name Row */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <CustomInput
                    label="First Name"
                    type="text"
                    placeholder="e.g. Adebayo"
                    icon={<User size={16} />}
                    error={errors.firstName?.message}
                    {...register('firstName')}
                  />
                  <CustomInput
                    label="Last Name"
                    type="text"
                    placeholder="e.g. Balogun"
                    icon={<User size={16} />}
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>

                {/* Email */}
                <CustomInput
                  label="Email Address"
                  type="email"
                  placeholder="e.g. bayo@example.com"
                  icon={<Mail size={16} />}
                  error={errors.email?.message}
                  autoComplete="email"
                  {...register('email')}
                />

                {/* Phone */}
                <CustomInput
                  label="Phone Number"
                  type="tel"
                  placeholder="e.g. 08031234567"
                  icon={<Phone size={16} />}
                  error={errors.phone?.message}
                  autoComplete="tel"
                  {...register('phone')}
                />

                {/* Password */}
                <CustomInput
                  label="Password"
                  type="password"
                  placeholder="At least 8 strong characters"
                  icon={<Lock size={16} />}
                  error={errors.password?.message}
                  showPasswordToggle
                  autoComplete="new-password"
                  {...register('password')}
                />

                {/* Live Strength Checklist Panel */}
                {passwordValue && <PasswordStrengthMeter value={passwordValue} />}

                {/* Confirm Password */}
                <CustomInput
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat password"
                  icon={<Lock size={16} />}
                  error={errors.confirmPassword?.message}
                  showPasswordToggle
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />

                {/* Terms and conditions statement */}
                <div className="pt-1">
                  <Controller
                    name="agreeToTerms"
                    control={control}
                    render={({ field }) => (
                      <CustomCheckbox
                        name={field.name}
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        error={errors.agreeToTerms?.message}
                        label={
                          <>
                            I agree to the{' '}
                            <a
                              href="/terms"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2"
                            >
                              Terms & Conditions
                            </a>{' '}
                            and{' '}
                            <a
                              href="/privacy"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2"
                            >
                              Privacy Policy
                            </a>
                          </>
                        }
                      />
                    )}
                  />
                </div>

                {/* CTA Register Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 sm:h-12 mt-1 sm:mt-2 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer Security Badges */}
          <div className="mt-6 sm:mt-8 lg:mt-10 pt-4 sm:pt-5 border-t border-zinc-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Encrypted Data Storage</span>
            </div>
            <p className="text-[10px] sm:text-xs">© {new Date().getFullYear()} NaijaSnacks Ltd.</p>
          </div>
        </div>

        {/* ── Right Pane: Atmospheric Brand Showcase ─────────────────── */}
        <div className="hidden lg:flex flex-1 relative bg-zinc-950 p-12 xl:p-16 flex-col justify-between overflow-hidden min-h-[400px]">
          {/* Background Graphic Asset with Ambient Darkness */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&h=1600&fit=crop&q=85"
              alt="Delicious fresh grilled meats and snacks"
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
              <span>Freshly Dispatched From 3 Cities</span>
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
                Preserving Kitchen Heritage
              </span>
              <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
                Delicious street flavor, processed cleanly.
              </h2>
              <p className="text-zinc-300 text-sm xl:text-base leading-relaxed">
                We leverage modern technology to source from local partners, preparing ancestral recipes in
                certified clinical-grade kitchens. Every order dispatches with zero delay.
              </p>
            </div>

            {/* Customer Support Verified Review Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-5 text-white flex items-center gap-4 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80"
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
                  &ldquo;Clean packaging, quick delivery, and the meat pies have actual meat filling, not just potato air.&rdquo;
                </p>
                <p className="text-[11px] font-bold text-orange-300 mt-1">
                  Tunde S. <span className="text-zinc-400 font-normal">• Certified Customer</span>
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

export default RegisterPage;