import React, { useState, useId, forwardRef, memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Flame,
  Sparkles,
  ShieldCheck,
  Clock,
  RefreshCw,
  Inbox,
  ExternalLink,
  HelpCircle,
  Check,
  Send,
} from 'lucide-react';

// ─── Zod Validation Schema ──────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

// ─── Self-Contained Custom Input ────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  icon?: React.ReactNode;
}

const CustomInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, error, icon, type = 'text', ...props }, ref) => {
    const id = useId();

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
            type={type}
            className="w-full h-full bg-transparent outline-none placeholder:text-zinc-400 text-sm font-medium text-zinc-900"
            {...props}
          />
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

// ─── Email Provider Detection Helper ────────────────────────────────
function getEmailProviderUrl(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  if (domain.includes('gmail')) return 'https://mail.google.com';
  if (domain.includes('yahoo')) return 'https://mail.yahoo.com';
  if (domain.includes('outlook') || domain.includes('hotmail')) return 'https://outlook.live.com';
  if (domain.includes('icloud')) return 'https://www.icloud.com/mail';
  return null;
}

// ─── Success Confirmation View ──────────────────────────────────────
interface SuccessStateProps {
  email: string;
  onResend: () => Promise<void>;
  onChangeEmail: () => void;
}

const ResetSuccessView = memo(function ResetSuccessView({
  email,
  onResend,
  onChangeEmail,
}: SuccessStateProps) {
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const providerUrl = getEmailProviderUrl(email);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setResendSuccess(false);

    try {
      await onResend();
      setResendSuccess(true);
      setCountdown(60);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch {
      // Handle error if necessary
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-400">
      {/* Icon Badge */}
      <div className="text-center">
        <div className="relative inline-flex mb-3">
          <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl animate-pulse" />
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/25">
            <Inbox size={36} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-tight">
          Check Your Inbox
        </h1>
        <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
          We&apos;ve sent a password reset link to:
        </p>
        <p className="font-bold text-zinc-900 text-sm sm:text-base mt-0.5 break-all bg-zinc-100/80 px-3 py-1 rounded-xl inline-block border border-zinc-200/80">
          {email}
        </p>
      </div>

      {/* Primary Mail Provider Action */}
      {providerUrl && (
        <a
          href={providerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10 active:scale-[0.98] transition-all"
        >
          <Mail size={16} />
          <span>Open Email Client</span>
          <ExternalLink size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
        </a>
      )}

      {/* Reassurance & Tip Card */}
      <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/60 space-y-2.5 text-xs text-zinc-600">
        <div className="flex items-center gap-2 font-bold text-orange-900">
          <HelpCircle size={14} className="text-orange-600 shrink-0" />
          <span>Didn&apos;t receive the email?</span>
        </div>
        <ul className="space-y-1.5 text-zinc-600 pl-4 list-disc marker:text-orange-400">
          <li>Check your spam or promotions folder.</li>
          <li>The secure reset link will expire in <strong>15 minutes</strong>.</li>
          <li>Make sure you entered your registered account email.</li>
        </ul>
      </div>

      {/* Resend Status Banner */}
      {resendSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>A fresh reset link has been dispatched to your inbox.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="w-full h-11 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 rounded-2xl font-bold text-xs sm:text-sm border border-zinc-200/80 shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isResending ? (
            <>
              <RefreshCw size={14} className="animate-spin text-orange-600" />
              <span>Resending link...</span>
            </>
          ) : countdown > 0 ? (
            <>
              <Clock size={14} className="text-zinc-400" />
              <span>Resend link in <strong className="text-zinc-900 font-mono">{countdown}s</strong></span>
            </>
          ) : (
            <>
              <RefreshCw size={14} className="text-orange-600" />
              <span>Resend Reset Email</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onChangeEmail}
          className="w-full text-xs font-bold text-zinc-500 hover:text-orange-600 py-1.5 transition-colors"
        >
          Wrong email? Try another address
        </button>
      </div>

      {/* Back to Login Anchor */}
      <div className="pt-4 border-t border-zinc-200/60 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 group transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Return to login</span>
        </Link>
      </div>
    </div>
  );
});

// ─── Main ForgotPasswordPage Component ──────────────────────────────
export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    setIsLoading(true);
    setServerError('');

    try {
      // Simulate backend password reset request
      await new Promise((resolve) => setTimeout(resolve, 1400));
      console.log('Password reset link requested for:', data.email);
      setSubmittedEmail(data.email);
    } catch {
      setServerError('An error occurred while attempting to send the reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!submittedEmail) return;
    // Simulate re-request latency
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log('Resent recovery email to:', submittedEmail);
  };

  const handleAutofillDemo = () => {
    setValue('email', 'demo@naijasnacks.ng', { shouldValidate: true });
    setServerError('');
  };

  return (
    <main className="min-h-screen w-full flex bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30 overflow-hidden">
      {/* ── Left Pane: Interactive Recovery Form ───────────────────── */}
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
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Back to Login</span>
          </Link>
        </div>

        {/* Dynamic Form Area */}
        {submittedEmail ? (
          <ResetSuccessView
            email={submittedEmail}
            onResend={handleResend}
            onChangeEmail={() => setSubmittedEmail(null)}
          />
        ) : (
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Header Copy */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-700 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-1 shadow-2xs">
                <ShieldCheck size={13} className="text-orange-600" />
                <span>Account Recovery</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
                Reset your password
              </h1>
              <p className="text-sm sm:text-base text-zinc-500 leading-relaxed">
                Enter your registered email address and we&apos;ll send you a secure verification link to create a new password.
              </p>
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

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <CustomInput
                label="Registered Email Address"
                type="email"
                placeholder="e.g. adebayo@example.com"
                icon={<Mail size={18} />}
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Dispatching link...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Helper */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAutofillDemo}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-orange-200 hover:border-orange-300 bg-orange-50/40 hover:bg-orange-50 text-xs font-semibold text-orange-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles size={13} className="text-orange-500" />
                <span>Fill with Demo Email (demo@naijasnacks.ng)</span>
              </button>
            </div>

            {/* Support Note */}
            <div className="pt-4 text-center">
              <p className="text-xs text-zinc-500">
                Having trouble accessing your account?{' '}
                <a
                  href="mailto:support@naijasnacks.ng"
                  className="font-bold text-zinc-700 hover:text-orange-600 underline underline-offset-2 transition-colors"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Footer Security Badges */}
        <div className="mt-8 pt-6 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>256-bit Secure Recovery Link</span>
          </div>
          <p>© {new Date().getFullYear()} NaijaSnacks Ltd.</p>
        </div>
      </div>

      {/* ── Right Pane: Atmospheric Brand Showcase ─────────────────── */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-950 p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Background Image with Ambient Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200&h=1600&fit=crop&q=85"
            alt="Warm Nigerian treats display"
            className="w-full h-full object-cover opacity-35 scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/40" />
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Floating Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400">
            <Sparkles size={13} />
            <span>Fast & Secure Verification</span>
          </span>
        </div>

        {/* Bottom Hero Pitch Card */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-orange-400">
              Account Security First
            </span>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              Get back to enjoying freshly baked snacks in minutes.
            </h2>
            <p className="text-zinc-300 text-sm xl:text-base leading-relaxed">
              We protect your saved addresses, payment methods, and favorite order history with
              multi-layered security standards.
            </p>
          </div>

          {/* Quick FAQ Accordion Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-5 text-white space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
              <Check size={14} className="text-emerald-400 stroke-[3]" />
              <span>What happens next?</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              You will receive a password reset link in your email. Click the link to securely choose a new password and immediately return to ordering.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;