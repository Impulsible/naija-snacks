import React, { memo, useMemo } from 'react';
import {
  Leaf,
  Truck,
  ShieldCheck,
  Heart,
  Sparkles,
  ArrowUpRight,
  Clock,
  Award,
  Users,
  CheckCircle2,
} from 'lucide-react';

// ─── Types & Interfaces ─────────────────────────────────────────────
export interface FeatureItem {
  id: string;
  icon: React.ElementType;
  title: string;
  tagline: string;
  description: string;
  highlightStat?: string;
  statLabel?: string;
  badge?: string;
  accent: {
    gradient: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    hoverBorder: string;
    hoverGlow: string;
  };
}

export interface WhyNaijaSnacksProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  features?: FeatureItem[];
  showStatsStrip?: boolean;
  className?: string;
}

// ─── Default Features Data ──────────────────────────────────────────
const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 'fresh-ingredients',
    icon: Leaf,
    title: 'Farm-Fresh Daily',
    tagline: '100% Natural & Preservative-Free',
    description:
      'We source raw plantains, prime beef, and organic flours every morning from verified local farmers. No shortcuts, no artificial additives.',
    highlightStat: '0%',
    statLabel: 'Artificial Preservatives',
    badge: 'Farm to Plate',
    accent: {
      gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-emerald-50 text-emerald-600',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 border-emerald-200/60',
      badgeText: 'text-emerald-700',
      hoverBorder: 'group-hover:border-emerald-300/80',
      hoverGlow: 'group-hover:shadow-emerald-500/10',
    },
  },
  {
    id: 'express-delivery',
    icon: Truck,
    title: 'Express 30-Min Drop',
    tagline: 'Delivered Sizzling & Crisp',
    description:
      'Our insulated thermal courier packs ensure your puff-puff stays airy and your suya stays smoky hot from kitchen oil to your dining table.',
    highlightStat: '<30m',
    statLabel: 'Average Lagos Dispatch',
    badge: 'Thermal-Packed',
    accent: {
      gradient: 'from-orange-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-orange-50 text-orange-600',
      iconColor: 'text-orange-600',
      badgeBg: 'bg-orange-50 border-orange-200/60',
      badgeText: 'text-orange-700',
      hoverBorder: 'group-hover:border-orange-300/80',
      hoverGlow: 'group-hover:shadow-orange-500/10',
    },
  },
  {
    id: 'quality-guarantee',
    icon: ShieldCheck,
    title: 'Certified Kitchens',
    tagline: 'Standardized Hygiene Standards',
    description:
      'Every batch undergoes a 3-step freshness and oil-purity check. If your order isn’t piping fresh and delicious, we replace it instantly.',
    highlightStat: '100%',
    statLabel: 'Satisfaction or Refund',
    badge: 'NAFDAC Compliant',
    accent: {
      gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
      iconBg: 'bg-blue-50 text-blue-600',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50 border-blue-200/60',
      badgeText: 'text-blue-700',
      hoverBorder: 'group-hover:border-blue-300/80',
      hoverGlow: 'group-hover:shadow-blue-500/10',
    },
  },
  {
    id: 'heritage-recipes',
    icon: Heart,
    title: 'Generational Craft',
    tagline: 'Authentic Nigerian Heritage',
    description:
      'Handed down from seasoned mama-caterers across Lagos, Ibadan, and Kano. Mastered over decades to bring you nostalgic homemade warmth.',
    highlightStat: '4.9★',
    statLabel: 'Over 12,000+ Reviews',
    badge: 'Secret Spice Blend',
    accent: {
      gradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
      iconBg: 'bg-rose-50 text-rose-600',
      iconColor: 'text-rose-600',
      badgeBg: 'bg-rose-50 border-rose-200/60',
      badgeText: 'text-rose-700',
      hoverBorder: 'group-hover:border-rose-300/80',
      hoverGlow: 'group-hover:shadow-rose-500/10',
    },
  },
];

// ─── Individual Feature Card Component ─────────────────────────────
const FeatureCard = memo(function FeatureCard({
  feature,
  index,
}: {
  feature: FeatureItem;
  index: number;
}) {
  const Icon = feature.icon;

  return (
    <div
      className={`group relative flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xs hover:shadow-xl ${feature.accent.hoverGlow} ${feature.accent.hoverBorder} hover:-translate-y-1.5 transition-all duration-400 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Ambient Top Glow Layer */}
      <div
        className={`absolute top-0 right-0 left-0 h-36 bg-gradient-to-b ${feature.accent.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none`}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Top Bar: Icon + Badge */}
        <div className="flex items-center justify-between gap-3 mb-6">
          {/* Animated Icon Circle */}
          <div
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${feature.accent.iconBg} flex items-center justify-center shadow-xs border border-white/80 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon size={24} className={feature.accent.iconColor} />
          </div>

          {/* Micro Tag / Badge */}
          {feature.badge && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${feature.accent.badgeBg} ${feature.accent.badgeText} shadow-2xs backdrop-blur-sm`}
            >
              <Sparkles size={11} />
              {feature.badge}
            </span>
          )}
        </div>

        {/* Content Header */}
        <div className="space-y-1.5 mb-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
            {feature.tagline}
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">
            {feature.title}
          </h3>
        </div>

        {/* Description Body */}
        <p className="text-zinc-600 text-sm leading-relaxed mb-6 font-normal">
          {feature.description}
        </p>
      </div>

      {/* Card Footer Metric Banner */}
      {feature.highlightStat && (
        <div className="relative z-10 pt-4 border-t border-zinc-100/90 flex items-center justify-between">
          <div>
            <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight block tabular-nums">
              {feature.highlightStat}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              {feature.statLabel}
            </span>
          </div>

          <div
            className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-200/60 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 flex items-center justify-center transition-all duration-300 group-hover:rotate-45"
            aria-hidden="true"
          >
            <ArrowUpRight size={15} />
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Social Proof & Trust Strip ─────────────────────────────────────
const TrustMetricsStrip = memo(function TrustMetricsStrip() {
  const stats = useMemo(
    () => [
      { label: 'Orders Dispatched in Lagos', value: '45,000+', icon: Truck },
      { label: 'Average Delivery Time', value: '28 Mins', icon: Clock },
      { label: '5-Star Customer Rating', value: '99.4%', icon: Award },
      { label: 'Active Monthly Foodies', value: '18,500+', icon: Users },
    ],
    []
  );

  return (
    <div className="mt-14 sm:mt-18 rounded-3xl bg-zinc-950 text-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-black/10 border border-white/10 relative overflow-hidden">
      {/* Subtle Glow backdrop inside strip */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`flex flex-col items-center text-center ${
                idx > 0 ? 'pt-6 sm:pt-0 sm:pl-6 lg:pl-8' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-400 mb-3">
                <Icon size={18} />
              </div>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight tabular-nums">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Guarantee Footnote */}
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400 text-center">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <CheckCircle2 size={15} />
          <span>100% Taste & Temperature Protection on every order</span>
        </div>
      </div>
    </div>
  );
});

// ─── Main Component ─────────────────────────────────────────────────
export const WhyNaijaSnacks: React.FC<WhyNaijaSnacksProps> = ({
  title = 'Why Naija Snacks Hits Different',
  subtitle = 'We are redefining street food and bakery culture with hygienic industrial kitchens, express logistics, and generational Nigerian recipes.',
  badgeText = 'The Naija Standard',
  features = DEFAULT_FEATURES,
  showStatsStrip = true,
  className = '',
}) => {
  return (
    <section
      aria-labelledby="why-naija-snacks-heading"
      className={`relative py-18 sm:py-24 lg:py-28 bg-gradient-to-b from-orange-50/30 via-white to-amber-50/20 overflow-hidden ${className}`}
    >
      {/* ── Ambient Background Lighting ─────────────────────────────── */}
      <div
        className="absolute top-1/4 -right-40 w-96 h-96 bg-orange-400/10 rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
        aria-hidden="true"
      />

      {/* ── Content Container ──────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-700 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4 shadow-2xs">
            <Sparkles size={13} className="text-orange-600 animate-pulse" />
            <span>{badgeText}</span>
          </div>

          {/* Main Title */}
          <h2
            id="why-naija-snacks-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-[1.12]"
          >
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-zinc-500 text-sm sm:text-base lg:text-lg mt-4 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* ── Feature Cards Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* ── Social Proof & Trust Metrics Bar ──────────────────────── */}
        {showStatsStrip && <TrustMetricsStrip />}
      </div>
    </section>
  );
};

export default WhyNaijaSnacks;