import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShoppingBag,
  Zap,
  Truck,
  Flame,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
} from 'lucide-react';
import Container from '../layout/Container';

// ─── Step Data Model ────────────────────────────────────────────────
export interface HowItWorksStep {
  number: string;
  stepLabel: string;
  title: string;
  description: string;
  accentColor: string;
  badge: string;
  highlightText: string;
  icon: React.ElementType;
  previewComponent: React.ReactNode;
}

interface HowItWorksProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

// ─── Step 1 Micro-Visual: Live Snack Discovery ───────────────────────
const StepOneVisual = () => (
  <div className="relative w-full h-32 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-900/10 p-3.5 flex flex-col justify-between overflow-hidden group-hover:border-primary/30 transition-colors">
    {/* Mini Search Pill */}
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-950/10 shadow-2xs">
      <Search size={12} className="text-primary shrink-0" />
      <span className="text-[11px] font-bold text-stone-800 truncate">Crispy Chin Chin & Pie...</span>
    </div>

    {/* Quick Category Chips */}
    <div className="flex items-center gap-1.5 overflow-hidden">
      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-primary text-white px-2.5 py-1 rounded-lg shadow-2xs shrink-0">
        <Flame size={10} /> Hot Pastries
      </span>
      <span className="text-[10px] font-bold bg-white/80 text-stone-600 px-2 py-1 rounded-lg border border-amber-950/5 shrink-0">
        Finger Foods
      </span>
      <span className="text-[10px] font-bold bg-white/80 text-stone-600 px-2 py-1 rounded-lg border border-amber-950/5 shrink-0">
        Suya
      </span>
    </div>

    {/* Ambient Glow */}
    <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
  </div>
);

// ─── Step 2 Micro-Visual: 1-Tap Express Order ───────────────────────
const StepTwoVisual = () => (
  <div className="relative w-full h-32 rounded-2xl bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent border border-amber-900/10 p-3.5 flex flex-col justify-between overflow-hidden group-hover:border-orange-500/30 transition-colors">
    {/* Cart Item Row */}
    <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-2 rounded-xl border border-amber-950/10 shadow-2xs">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center text-[10px] font-black text-orange-700">
          🥧
        </div>
        <div className="truncate">
          <p className="text-[10px] font-black text-stone-900 truncate">2x Warm Meat Pies</p>
        </div>
      </div>
      <span className="text-[11px] font-black text-emerald-700 shrink-0">₦1,600</span>
    </div>

    {/* Secure One-Tap CTA */}
    <div className="flex items-center justify-between bg-stone-900 text-white px-3 py-1.5 rounded-xl shadow-xs">
      <div className="flex items-center gap-1.5 text-[10px] font-bold">
        <Zap size={11} className="text-amber-400 fill-amber-400" />
        <span>Instant Checkout</span>
      </div>
      <div className="flex items-center gap-1 text-[9px] text-stone-400">
        <ShieldCheck size={11} className="text-emerald-400" />
        <span>Encrypted</span>
      </div>
    </div>

    {/* Ambient Glow */}
    <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-orange-500/20 rounded-full blur-xl pointer-events-none" />
  </div>
);

// ─── Step 3 Micro-Visual: Heat-Sealed Hot Delivery ──────────────────
const StepThreeVisual = () => (
  <div className="relative w-full h-32 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-amber-900/10 p-3.5 flex flex-col justify-between overflow-hidden group-hover:border-emerald-500/30 transition-colors">
    {/* Live Dispatch Pill */}
    <div className="flex items-center justify-between bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-amber-950/10 shadow-2xs">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Truck size={14} className="text-emerald-600" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
        </div>
        <span className="text-[10px] font-black text-stone-800">Rider on Admiralty Way</span>
      </div>
      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
        25 mins
      </span>
    </div>

    {/* Hot & Fresh Guarantee Tag */}
    <div className="flex items-center justify-between bg-emerald-950/90 text-emerald-200 px-3 py-1.5 rounded-xl">
      <div className="flex items-center gap-1.5 text-[10px] font-bold">
        <PackageCheck size={12} className="text-emerald-400" />
        <span>Thermal Insulated Box</span>
      </div>
      <span className="text-[9px] font-black text-emerald-300 uppercase">Fresh & Hot</span>
    </div>

    {/* Ambient Glow */}
    <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
  </div>
);

// ─── Default Steps Configuration ────────────────────────────────────
const DEFAULT_STEPS: HowItWorksStep[] = [
  {
    number: '01',
    stepLabel: 'Step 01',
    title: 'Explore & Crave',
    description:
      'Search authentic pastries, crispy Chin Chin, and spicy Suya handcrafted fresh by verified local kitchens.',
    accentColor: 'from-primary via-orange-500 to-amber-500',
    badge: 'Real-time Kitchen Menus',
    highlightText: '50+ Snack Varieties',
    icon: Sparkles,
    previewComponent: <StepOneVisual />,
  },
  {
    number: '02',
    stepLabel: 'Step 02',
    title: 'Order in Seconds',
    description:
      'Customize your snack box, select your delivery address, and check out with frictionless payment methods.',
    accentColor: 'from-orange-600 via-red-500 to-amber-500',
    badge: '1-Click Paystack / Card',
    highlightText: 'Instant Kitchen Alert',
    icon: ShoppingBag,
    previewComponent: <StepTwoVisual />,
  },
  {
    number: '03',
    stepLabel: 'Step 03',
    title: 'Unbox Warm & Fresh',
    description:
      'Track your rider in real time. Your snacks arrive fresh, crisp, and warm in insulated thermal packaging in 30 mins.',
    accentColor: 'from-emerald-600 via-teal-500 to-amber-500',
    badge: 'Express 30-Min Dropoff',
    highlightText: 'Heat-Sealed Freshness',
    icon: Truck,
    previewComponent: <StepThreeVisual />,
  },
];

// ─── Main Component ─────────────────────────────────────────────────
const HowItWorks: React.FC<HowItWorksProps> = ({
  title = 'From Kitchen to Doorstep in 30 Mins',
  subtitle = 'Craving fresh Nigerian snacks? Here is how we bake, pack, and deliver warm perfection to your door.',
  ctaText = 'Start Your First Order',
  ctaLink = '/explore',
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-white via-amber-50/25 to-[#FFFDF9] overflow-hidden">
      {/* Background Decorative Mesh Blobs */}
      <div
        className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 -ml-24"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none -mr-24 -mb-24"
        aria-hidden="true"
      />

      <Container>
        <div className="relative z-10">
          
          {/* ── Section Header ─────────────────────────────────────── */}
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 bg-amber-100/70 border border-amber-900/10 px-3.5 py-1.5 rounded-full mb-3.5 shadow-2xs">
              <Clock size={12} className="text-amber-800" />
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                Speedy & Seamless Experience
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-[1.15]">
              {title}
            </h2>

            {/* Subtitle */}
            <p className="text-stone-500 text-sm sm:text-base lg:text-lg mt-3.5 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* ── Steps Grid ─────────────────────────────────────────── */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* Desktop Flowing Connector Track (Background Line) */}
            <div
              className="hidden md:block absolute top-28 left-[18%] right-[18%] h-0.5 pointer-events-none z-0"
              aria-hidden="true"
            >
              <div className="w-full h-full bg-gradient-to-r from-primary/30 via-orange-400/30 to-emerald-500/30" />
              {/* Pulsing indicator traveling across the line */}
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-amber-100 shadow-sm animate-pulse" />
            </div>

            {DEFAULT_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isSelected = activeStep === index;

              return (
                <div
                  key={step.number}
                  onMouseEnter={() => setActiveStep(index)}
                  className={`group relative flex flex-col justify-between bg-[#FFFDF9] rounded-3xl p-5 sm:p-6 lg:p-7 border transition-all duration-500 z-10 ${
                    isSelected
                      ? 'border-primary/40 shadow-xl shadow-amber-950/8 -translate-y-2'
                      : 'border-amber-950/10 shadow-sm hover:border-amber-900/20 hover:shadow-md'
                  }`}
                >
                  {/* Top Row: Number Badge & Step Category */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-5">
                      {/* Step Number with Ambient Glow */}
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.accentColor} text-white font-black text-lg flex items-center justify-center shadow-md shadow-amber-950/10 group-hover:scale-105 transition-transform`}
                        >
                          {step.number}
                        </div>
                        {/* Status Checkmark */}
                        <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-stone-900 border-2 border-white flex items-center justify-center">
                          <CheckCircle2 size={10} className="text-amber-400" />
                        </div>
                      </div>

                      {/* Pill Badge */}
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100/60 text-amber-900 border border-amber-950/5">
                        {step.badge}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 tracking-tight group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>

                  {/* Middle: Micro-Visual Card Preview */}
                  <div className="mt-6 mb-5">
                    {step.previewComponent}
                  </div>

                  {/* Bottom: Highlight Feature Check */}
                  <div className="pt-3.5 border-t border-amber-950/[0.07] flex items-center justify-between text-xs font-bold text-stone-700">
                    <span className="flex items-center gap-1.5 text-stone-800">
                      <StepIcon size={14} className="text-primary" />
                      {step.highlightText}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-stone-300 group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Bottom Trust Signals & Order CTA ───────────────────── */}
          <div className="mt-14 sm:mt-20 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-stone-900 text-white shadow-xl shadow-amber-950/10">
            
            {/* Left Info Column */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Flame size={24} />
              </div>
              <div>
                <h4 className="font-heading font-black text-lg sm:text-xl leading-tight">
                  Craving freshly made snacks right now?
                </h4>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  Average delivery speed across Lagos is currently <strong className="text-amber-300">28 minutes</strong>.
                </p>
              </div>
            </div>

            {/* Right Action Button */}
            <div className="shrink-0 w-full sm:w-auto">
              <Link
                to={ctaLink}
                className="group flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary-dark hover:to-orange-600 text-white text-xs sm:text-sm font-black shadow-lg shadow-primary/25 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <span>{ctaText}</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;