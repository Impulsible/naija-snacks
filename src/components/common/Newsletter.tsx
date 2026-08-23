import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Flame,
  ShieldCheck,
  Gift,
  ArrowRight,
  Tag,
  Clock,
  Loader2,
} from 'lucide-react';
import Container from '../layout/Container';

export interface NewsletterProps {
  title?: string;
  subtitle?: string;
  discountPercentage?: number;
  promoCode?: string;
  subscriberCount?: number;
  onSubscribe?: (email: string) => Promise<{ success: boolean; message?: string }>;
}

const Newsletter: React.FC<NewsletterProps> = ({
  title = 'Get 10% Off Your First Warm Snack Box',
  subtitle = 'Join over 15,000+ food lovers. Receive secret drop alerts, weekend batch discounts, and instant promo vouchers.',
  discountPercentage = 10,
  promoCode = 'NAIJA10',
  subscriberCount = 15400,
  onSubscribe,
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      if (onSubscribe) {
        const result = await onSubscribe(email.trim());
        if (result.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(result.message || 'Subscription failed. Please try again.');
        }
      } else {
        // Simulated network request delay for local dev/preview
        await new Promise((resolve) => setTimeout(resolve, 800));
        setStatus('success');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please check your connection.');
    }
  };

  return (
    <section
      className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-amber-50/30 to-[#FFFDF9] overflow-hidden"
      aria-labelledby="newsletter-heading"
    >
      {/* Background Decorative Mesh Orbs */}
      <div
        className="absolute top-1/2 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-10 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <Container>
        <div className="relative z-10">
          
          {/* Main Card Container */}
          <div className="relative rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white p-6 sm:p-10 lg:p-14 shadow-2xl shadow-amber-950/15 border border-amber-900/20 overflow-hidden">
            
            {/* Ambient Inner Lighting */}
            <div
              className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-primary/25 via-orange-500/15 to-transparent rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Subtle Grid Accent Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* ── Left Column: Value Proposition ────────────────────── */}
              <div className="lg:col-span-7 space-y-5 text-left">
                
                {/* Incentive Pill Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-orange-500/15 border border-primary/30 px-3.5 py-1.5 rounded-full text-amber-300 text-xs font-black uppercase tracking-wider shadow-xs">
                  <Gift size={14} className="text-primary animate-pulse" />
                  <span>Instant {discountPercentage}% Welcome Voucher</span>
                </div>

                {/* Main Heading */}
                <h2
                  id="newsletter-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-[1.15]"
                >
                  {title}
                </h2>

                {/* Subtitle */}
                <p className="text-stone-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-medium">
                  {subtitle}
                </p>

                {/* Social Proof & Trust Ticker */}
                <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-stone-300 font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 overflow-hidden shrink-0">
                      {['👩🏾', '👨🏾', '🧑🏾', '👩🏽'].map((emoji, idx) => (
                        <div
                          key={idx}
                          className="w-7 h-7 rounded-full bg-stone-800 border-2 border-stone-900 flex items-center justify-center text-xs shadow-xs"
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <span className="text-stone-300 font-bold">
                      {subscriberCount.toLocaleString()}+ Snack Lovers
                    </span>
                  </div>

                  <span className="hidden sm:inline w-1 h-1 bg-stone-700 rounded-full" />

                  <div className="flex items-center gap-1.5 text-stone-400">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>No Spam. 1-Click Unsubscribe.</span>
                  </div>
                </div>

              </div>

              {/* ── Right Column: Interactive Subscription / Reward Card ── */}
              <div className="lg:col-span-5 w-full">
                
                {status === 'success' ? (
                  /* ── Success & Voucher Reveal Card ─────────────────── */
                  <div className="bg-[#FFFDF9] text-stone-900 rounded-3xl p-6 sm:p-7 shadow-xl border border-amber-200/80 animate-[scaleUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-base sm:text-lg leading-tight">
                          You're on the VIP List! 🎉
                        </h3>
                        <p className="text-xs text-stone-500 font-medium mt-0.5">
                          Here is your first order coupon code:
                        </p>
                      </div>
                    </div>

                    {/* Voucher Code Reveal Box */}
                    <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-2xl border-2 border-dashed border-primary/30 mb-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Tag size={16} className="text-primary shrink-0" />
                        <span className="font-mono font-black text-base sm:text-lg tracking-wider text-stone-900">
                          {promoCode}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                          copied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-primary hover:bg-primary-dark text-white shadow-xs'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check size={13} />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Order Now Callout */}
                    <a
                      href="/explore"
                      className="group flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black transition-all shadow-md active:scale-[0.98]"
                    >
                      <span>Apply Code & Explore Menu</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                ) : (
                  /* ── Form Input Card ───────────────────────────────── */
                  <form
                    onSubmit={handleSubmit}
                    className="bg-[#FFFDF9] rounded-3xl p-4 sm:p-6 shadow-xl border border-amber-900/10 flex flex-col gap-3.5"
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
                        Enter your email for the discount:
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                        <Clock size={10} /> Valid for 7 Days
                      </span>
                    </div>

                    {/* Input Field with Inline Action */}
                    <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (status === 'error') setStatus('idle');
                          }}
                          placeholder="adebayo@example.com"
                          disabled={status === 'loading'}
                          required
                          className="w-full pl-11 pr-4 py-3.5 text-xs sm:text-sm font-bold text-stone-900 placeholder-stone-400 bg-stone-50 rounded-2xl border border-stone-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === 'loading' || !email.trim()}
                        className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {status === 'loading' ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Claiming...</span>
                          </>
                        ) : (
                          <>
                            <span>Claim 10% Off</span>
                            <Send
                              size={14}
                              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                            />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Error Message Feedback */}
                    {status === 'error' && errorMessage && (
                      <p className="text-xs font-bold text-red-600 px-1 animate-fadeIn">
                        {errorMessage}
                      </p>
                    )}

                    {/* Footer Reassurance */}
                    <div className="flex items-center justify-between text-[10px] text-stone-400 px-1 pt-1 border-t border-stone-100">
                      <span className="flex items-center gap-1">
                        <Flame size={11} className="text-primary" />
                        Fresh drops every Friday morning
                      </span>
                      <span className="text-stone-300">100% Privacy Protected</span>
                    </div>
                  </form>
                )}

              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default Newsletter;