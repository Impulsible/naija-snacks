import React, { useState, useEffect, useRef, memo } from 'react';
import {
  Heart,
  Leaf,
  Users,
  Award,
  MapPin,
  ChefHat,
  Flame,
  Sparkles,
  ArrowRight,
  Star,
  TrendingUp,
  Target,
  Eye,
  HandHeart,
  Recycle,
  Building2,
  Quote,
  Play,
  Mail,
  ExternalLink,
  CheckCircle2,
  Zap,
  Globe,
  ShoppingBag,
} from 'lucide-react';

// ─── Types & Interfaces ─────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socials?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface TimelineEvent {
  id: string;
  year: string;
  quarter?: string;
  title: string;
  description: string;
  icon: React.ElementType;
  highlight?: string;
}

export interface BrandValue {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
  iconBg: string;
  iconColor: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  text: string;
  rating: number;
  orderCount: string;
}

export interface AboutPageProps {
  className?: string;
}

// ─── Data Constants ─────────────────────────────────────────────────
const BRAND_VALUES: BrandValue[] = [
  {
    id: 'authenticity',
    icon: ChefHat,
    title: 'Radical Authenticity',
    description:
      'Every recipe traces back to real Nigerian kitchens — from Lagos Island mama-put joints to Kano suya spots. No fusion shortcuts, no watered-down flavors.',
    accent: 'from-amber-500/10 to-transparent',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'freshness',
    icon: Leaf,
    title: 'Obsessive Freshness',
    description:
      'We operate on a zero-inventory model. Nothing sits overnight. Ingredients arrive at 5 AM, snacks are fried and baked by 8 AM, and your order ships within the hour.',
    accent: 'from-emerald-500/10 to-transparent',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'community',
    icon: HandHeart,
    title: 'Community First',
    description:
      'We employ 120+ local women across Lagos and Ibadan, providing fair wages, health insurance, and culinary training to preserve generational food knowledge.',
    accent: 'from-rose-500/10 to-transparent',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    id: 'sustainability',
    icon: Recycle,
    title: 'Eco-Conscious Packaging',
    description:
      '100% biodegradable thermal packs, cassava-starch containers, and a carbon-offset delivery fleet. Great taste should never cost the earth.',
    accent: 'from-teal-500/10 to-transparent',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
];

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 't1',
    year: '2021',
    quarter: 'Q3',
    title: 'The Kitchen Table Spark',
    description:
      'Founded by Adaeze and Chidi in their Surulere apartment kitchen, selling chin chin and meat pies to neighbours via WhatsApp.',
    icon: Flame,
    highlight: 'First 50 orders in 2 weeks',
  },
  {
    id: 't2',
    year: '2022',
    quarter: 'Q1',
    title: 'First Commercial Kitchen',
    description:
      'Moved into a NAFDAC-certified 2,000 sq ft kitchen in Ikeja. Launched our signature Puff-Puff Box and Suya Platter lines.',
    icon: Building2,
    highlight: 'NAFDAC Certified',
  },
  {
    id: 't3',
    year: '2022',
    quarter: 'Q4',
    title: 'App Launch & Seed Round',
    description:
      'Released the NaijaSnacks mobile app on iOS and Android. Raised $850K seed funding from Lagos-based VCs to scale logistics.',
    icon: Zap,
    highlight: '$850K Seed Raised',
  },
  {
    id: 't4',
    year: '2023',
    quarter: 'Q2',
    title: '10,000 Orders Milestone',
    description:
      'Crossed 10,000 monthly orders across Lagos. Expanded delivery fleet to 45 thermal-insulated bikes and 8 dispatch hubs.',
    icon: TrendingUp,
    highlight: '10K Monthly Orders',
  },
  {
    id: 't5',
    year: '2024',
    quarter: 'Q1',
    title: 'Ibadan & Abuja Expansion',
    description:
      'Opened satellite kitchens in Ibadan and Abuja. Launched corporate catering and party platter subscriptions for events.',
    icon: Globe,
    highlight: '3 Cities Live',
  },
  {
    id: 't6',
    year: '2025',
    quarter: 'Q2',
    title: 'Where We Are Today',
    description:
      '45,000+ orders monthly, 18,500 active foodies, 120+ kitchen staff, and a 4.9-star rating. Just getting started.',
    icon: Award,
    highlight: '45K+ Monthly Orders',
  },
];

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Adaeze Okafor',
    role: 'Co-Founder & CEO',
    bio: 'Former McKinsey consultant who left corporate life to preserve her grandmother\'s chin chin recipe. Leads brand strategy and partnerships.',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&q=80',
    socials: { twitter: '#', instagram: '#' },
  },
  {
    id: 'tm2',
    name: 'Chidi Nwosu',
    role: 'Co-Founder & CTO',
    bio: 'Full-stack engineer and food logistics nerd. Built the entire delivery routing algorithm and real-time tracking system from scratch.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
    socials: { twitter: '#', linkedin: '#' },
  },
  {
    id: 'tm3',
    name: 'Funke Adeyemi',
    role: 'Head of Kitchen Operations',
    bio: '20-year veteran caterer from Ibadan with mastery over 50+ traditional Nigerian snack recipes. Oversees quality across all 3 kitchens.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80',
    socials: { instagram: '#' },
  },
  {
    id: 'tm4',
    name: 'Tunde Bakare',
    role: 'Head of Logistics',
    bio: 'Former Jumia delivery lead who built our 45-bike thermal fleet and 30-minute dispatch guarantee from the ground up.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
    socials: { twitter: '#', linkedin: '#' },
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'r1',
    name: 'Ngozi Eze',
    location: 'Lekki, Lagos',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80',
    text: 'The puff-puff arrived so hot I burned my fingers! It literally tastes like my aunty\'s recipe from Enugu. I order every Friday for family movie night.',
    rating: 5,
    orderCount: '47 orders',
  },
  {
    id: 'r2',
    name: 'Emeka Obi',
    location: 'Ikeja, Lagos',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
    text: 'As someone who lived in London for 10 years, finding authentic suya this good in Lagos is a miracle. The yaji spice blend is absolutely perfect.',
    rating: 5,
    orderCount: '83 orders',
  },
  {
    id: 'r3',
    name: 'Aisha Mohammed',
    location: 'Wuse, Abuja',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80',
    text: 'Ordered the party platter for my daughter\'s birthday — 60 guests and every single piece was gone in 20 minutes. Already booked for next month!',
    rating: 5,
    orderCount: '22 orders',
  },
];

const IMPACT_STATS = [
  { value: '45K+', label: 'Monthly Orders', icon: ShoppingBag },
  { value: '120+', label: 'Women Employed', icon: Users },
  { value: '3', label: 'Cities Served', icon: MapPin },
  { value: '4.9★', label: 'Average Rating', icon: Star },
];

// ─── Hooks ──────────────────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// ─── Sub-Components ─────────────────────────────────────────────────

const RevealWrapper = memo(function RevealWrapper({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal(0.1);
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible || reduced
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
});

const SectionBadge = memo(function SectionBadge({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-700 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-2xs">
      <Sparkles size={13} className="text-orange-600 animate-pulse" />
      <span>{text}</span>
    </div>
  );
});

// ─── Hero Section ───────────────────────────────────────────────────
const AboutHero = memo(function AboutHero() {
  return (
    <section className="relative min-h-[75vh] sm:min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-stone-950">
      {/* Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-amber-600/15 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 0.5px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-6 sm:space-y-8">
            <RevealWrapper>
              <SectionBadge text="Our Story" />
            </RevealWrapper>

            <RevealWrapper delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.08]">
                <span className="block">Born from a</span>
                <span className="block bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Kitchen Table,
                </span>
                <span className="block">Built for Naija.</span>
              </h1>
            </RevealWrapper>

            <RevealWrapper delay={200}>
              <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
                What started as two friends selling chin chin on WhatsApp in 2021
                has grown into Lagos&apos; most loved snack delivery platform —
                serving 45,000+ orders monthly across three cities.
              </p>
            </RevealWrapper>

            <RevealWrapper delay={300}>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#our-journey"
                  className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-bold px-7 py-3.5 rounded-2xl text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-95 transition-all"
                >
                  <span>Read Our Journey</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </a>
                <button
                  type="button"
                  className="group inline-flex items-center justify-center gap-2.5 bg-white/10 backdrop-blur-md text-white font-semibold px-7 py-3.5 rounded-2xl text-sm border border-white/15 hover:bg-white/15 active:scale-95 transition-all"
                >
                  <Play size={15} className="ml-0.5" />
                  <span>Watch Our Story</span>
                </button>
              </div>
            </RevealWrapper>
          </div>

          {/* Right: Image Collage */}
          <RevealWrapper delay={200} className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/10 rounded-3xl blur-2xl" />
              <div className="relative grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop&q=80"
                      alt="Nigerian chef preparing traditional snacks in a modern kitchen"
                      className="w-full h-64 object-cover"
                      loading="eager"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&q=80"
                      alt="Beautifully arranged Nigerian snack platter"
                      className="w-full h-40 object-cover"
                      loading="eager"
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&q=80"
                      alt="Freshly baked pastries cooling on a rack"
                      className="w-full h-40 object-cover"
                      loading="eager"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=500&fit=crop&q=80"
                      alt="Golden fried snacks being prepared"
                      className="w-full h-64 object-cover"
                      loading="eager"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-xl rounded-2xl px-5 py-3.5 shadow-xl border border-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Heart size={18} className="text-orange-600 fill-orange-600" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-zinc-900">18,500+</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Happy Foodies</p>
                  </div>
                </div>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </div>
    </section>
  );
});

// ─── Mission & Vision Section ───────────────────────────────────────
const MissionVision = memo(function MissionVision() {
  return (
    <section className="relative py-20 sm:py-24 bg-white overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Mission Card */}
          <RevealWrapper>
            <div className="relative group bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-3xl p-8 sm:p-10 border border-orange-100/80 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-400 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-200/20 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                  <Target size={26} className="text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3">Our Mission</h2>
                <p className="text-zinc-600 leading-relaxed text-base">
                  To make authentic, freshly prepared Nigerian snacks accessible to everyone —
                  delivered hot, hygienic, and hassle-free within 30 minutes, while preserving
                  the generational culinary heritage that makes our food culture extraordinary.
                </p>
              </div>
            </div>
          </RevealWrapper>

          {/* Vision Card */}
          <RevealWrapper delay={100}>
            <div className="relative group bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl p-8 sm:p-10 border border-white/10 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-400 overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
                  <Eye size={26} className="text-zinc-950" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Our Vision</h2>
                <p className="text-zinc-400 leading-relaxed text-base">
                  To become Africa&apos;s most trusted snack and small-chops brand — operating
                  in 10 cities by 2028, empowering 1,000+ women in food production, and setting
                  the global gold standard for African street food delivery.
                </p>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </div>
    </section>
  );
});

// ─── Impact Stats Bar ───────────────────────────────────────────────
const ImpactStatsBar = memo(function ImpactStatsBar() {
  return (
    <section className="relative py-12 sm:py-16 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {IMPACT_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <RevealWrapper key={idx} delay={idx * 80}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20">
                    <Icon size={22} className="text-white" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-white/80 font-medium mt-1">
                    {stat.label}
                  </p>
                </div>
              </RevealWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
});

// ─── Brand Values Section ───────────────────────────────────────────
const BrandValuesSection = memo(function BrandValuesSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-b from-white to-zinc-50/50 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealWrapper>
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <SectionBadge text="What We Stand For" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-[1.12] mt-4">
              The Pillars Behind Every Bite
            </h2>
            <p className="text-zinc-500 text-sm sm:text-base lg:text-lg mt-4 leading-relaxed">
              These aren&apos;t just words on a wall. They are the daily decisions that shape
              how we source, cook, pack, and deliver your food.
            </p>
          </div>
        </RevealWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {BRAND_VALUES.map((value, idx) => {
            const Icon = value.icon;
            return (
              <RevealWrapper key={value.id} delay={idx * 80}>
                <div className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col">
                  <div
                    className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-b ${value.accent} opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`}
                    aria-hidden="true"
                  />
                  <div className="relative z-10 flex-1">
                    <div
                      className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${value.iconBg} flex items-center justify-center shadow-xs border border-white/80 mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon size={24} className={value.iconColor} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-zinc-600 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </RevealWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
});

// ─── Timeline / Journey Section ─────────────────────────────────────
const JourneyTimeline = memo(function JourneyTimeline() {
  return (
    <section
      id="our-journey"
      className="relative py-20 sm:py-24 lg:py-28 bg-zinc-950 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-amber-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealWrapper>
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
            <SectionBadge text="Our Journey" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12] mt-4">
              From WhatsApp to 45K Orders
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base lg:text-lg mt-4 leading-relaxed">
              A four-year journey of grit, flavour, and relentless obsession with quality.
            </p>
          </div>
        </RevealWrapper>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Center Line */}
          <div
            className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/60 via-amber-500/40 to-emerald-500/60 sm:-translate-x-px"
            aria-hidden="true"
          />

          <div className="space-y-10 sm:space-y-12">
            {TIMELINE_EVENTS.map((event, idx) => {
              const Icon = event.icon;
              const isLeft = idx % 2 === 0;

              return (
                <RevealWrapper key={event.id} delay={idx * 60}>
                  <div
                    className={`relative flex items-start gap-6 sm:gap-0 ${
                      isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
                    }`}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-6 sm:left-1/2 w-3 h-3 -translate-x-1.5 sm:-translate-x-1.5 mt-2 rounded-full bg-orange-500 ring-4 ring-zinc-950 z-10" />

                    {/* Content Card */}
                    <div
                      className={`ml-14 sm:ml-0 sm:w-[calc(50%-2rem)] ${
                        isLeft ? 'sm:pr-0 sm:text-right' : 'sm:pl-0 sm:text-left'
                      }`}
                    >
                      <div className="bg-white/[0.04] backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-orange-500/30 hover:bg-white/[0.06] transition-all duration-300 group">
                        <div
                          className={`flex items-center gap-2.5 mb-3 ${
                            isLeft ? 'sm:justify-end' : 'sm:justify-start'
                          }`}
                        >
                          <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                            {event.year} {event.quarter}
                          </span>
                          <Icon size={16} className="text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                          {event.description}
                        </p>
                        {event.highlight && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle2 size={11} />
                            {event.highlight}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Spacer for opposite side */}
                    <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
                  </div>
                </RevealWrapper>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});

// ─── Team Section ───────────────────────────────────────────────────
const TeamSection = memo(function TeamSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-b from-white to-orange-50/20 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-200/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealWrapper>
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <SectionBadge text="The Humans Behind the Heat" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-[1.12] mt-4">
              Meet the NaijaSnacks Family
            </h2>
            <p className="text-zinc-500 text-sm sm:text-base lg:text-lg mt-4 leading-relaxed">
              A passionate team of food lovers, engineers, and logistics experts united by one
              mission: making Nigeria&apos;s best snacks accessible to everyone.
            </p>
          </div>
        </RevealWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {TEAM_MEMBERS.map((member, idx) => (
            <RevealWrapper key={member.id} delay={idx * 80}>
              <div className="group relative bg-white rounded-3xl overflow-hidden border border-zinc-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                  <img
                    src={member.image}
                    alt={`${member.name}, ${member.role}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />

                  {/* Social Links Overlay */}
                  {member.socials && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {member.socials.twitter && (
                        <a
                          href={member.socials.twitter}
                          aria-label={`${member.name} on Twitter`}
                          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        </a>
                      )}
                      {member.socials.instagram && (
                        <a
                          href={member.socials.instagram}
                          aria-label={`${member.name} on Instagram`}
                          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                      )}
                      {member.socials.linkedin && (
                        <a
                          href={member.socials.linkedin}
                          aria-label={`${member.name} on LinkedIn`}
                          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mt-0.5">
                    {member.role}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-2">
                    {member.bio}
                  </p>
                </div>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
});

// ─── Testimonials Section ───────────────────────────────────────────
const TestimonialsSection = memo(function TestimonialsSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-b from-orange-50/30 to-white overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealWrapper>
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <SectionBadge text="Community Love" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-[1.12] mt-4">
              What Our Foodies Say
            </h2>
          </div>
        </RevealWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {TESTIMONIALS.map((testimonial, idx) => (
            <RevealWrapper key={testimonial.id} delay={idx * 80}>
              <div className="group bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xs hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <Quote size={28} className="text-orange-200 mb-4" />
                <p className="text-zinc-700 text-sm leading-relaxed flex-1 mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="pt-4 border-t border-zinc-100 flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">
                      {testimonial.name}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {testimonial.location} • {testimonial.orderCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className="text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
});

// ─── CTA Section ────────────────────────────────────────────────────
const AboutCTA = memo(function AboutCTA() {
  return (
    <section className="relative py-20 sm:py-24 bg-white overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealWrapper>
          <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-stone-950 rounded-[2rem] p-8 sm:p-12 lg:p-16 overflow-hidden text-center">
            {/* Ambient Glows */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Flame size={14} className="fill-amber-400" />
                <span>Join 18,500+ Happy Foodies</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
                Ready to Taste the
                <span className="block bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  NaijaSnacks Difference?
                </span>
              </h2>

              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                Your first order ships with free express delivery. No minimums, no commitments —
                just the crispiest, hottest, most authentic snacks you&apos;ve ever had delivered.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href="/explore"
                  className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-bold px-8 py-4 rounded-2xl text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-95 transition-all"
                >
                  <Sparkles size={17} />
                  <span>Order Your First Box</span>
                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white px-6 py-4 rounded-2xl border border-white/15 hover:bg-white/5 transition-all"
                >
                  <Mail size={15} />
                  <span>Partner With Us</span>
                </a>
              </div>
            </div>
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
});

// ─── Main About Page Component ──────────────────────────────────────
export default function AboutPage({ className = '' }: AboutPageProps) {
  return (
    <main className={`min-h-screen ${className}`}>
      <AboutHero />
      <MissionVision />
      <ImpactStatsBar />
      <BrandValuesSection />
      <JourneyTimeline />
      <TeamSection />
      <TestimonialsSection />
      <AboutCTA />
    </main>
  );
}