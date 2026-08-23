import React, { useState, useMemo } from 'react';
import {
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Flame,
  ThumbsUp,
  MapPin,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import Container from '../layout/Container';

// ─── Types & Interfaces ──────────────────────────────────────────────
export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatarUrl?: string;
  snackOrdered?: string;
  category?: 'pastries' | 'fried-snacks' | 'protein-snacks' | 'sweet-snacks' | 'all';
  isVerifiedBuyer?: boolean;
  timeAgo?: string;
  likesCount?: number;
}

export interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials?: TestimonialItem[];
  averageRating?: number;
  totalReviews?: number;
  onExploreClick?: () => void;
  className?: string;
}

// ─── Default Fallback Testimonial Data ───────────────────────────────
const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't-1',
    name: 'Amina Ibrahim',
    location: 'Lekki Phase 1, Lagos',
    rating: 5,
    text: "The puff-puff reminds me of my grandmother's Sunday recipe! It arrived piping hot within 25 minutes. The crust was crisp with that fluffy, melt-in-your-mouth interior.",
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&q=80',
    snackOrdered: 'Golden Puff-Puff Platter',
    category: 'sweet-snacks',
    isVerifiedBuyer: true,
    timeAgo: '2 hours ago',
    likesCount: 34,
  },
  {
    id: 't-2',
    name: 'Chidi Okafor',
    location: 'Ikeja GRA, Lagos',
    rating: 5,
    text: "Hands down the crunchiest, most flavorful Chin Chin in Nigeria. It's not rock-hard like roadside ones; the buttery nutmeg profile is completely dialed in.",
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&q=80',
    snackOrdered: 'Crunchy Chin Chin Tub (1kg)',
    category: 'fried-snacks',
    isVerifiedBuyer: true,
    timeAgo: 'Yesterday',
    likesCount: 52,
  },
  {
    id: 't-3',
    name: 'Folake Adeyemi',
    location: 'Victoria Island, Lagos',
    rating: 5,
    text: "The minced beef in their Meat Pie is packed with real seasoned beef, no cheap fillers or air pockets. You can tell they use genuine cream butter for the pastry crust.",
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&q=80',
    snackOrdered: 'Classic Nigerian Meat Pie (Pack of 4)',
    category: 'pastries',
    isVerifiedBuyer: true,
    timeAgo: '3 days ago',
    likesCount: 29,
  },
  {
    id: 't-4',
    name: 'Tunde Bakare',
    location: 'Maitama, Abuja',
    rating: 5,
    text: "Ordered the spicy beef suya for a weekend family gathering. Arrived heat-sealed in foil with fresh red onions and extra yaji spice. Disappeared in 10 minutes!",
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&q=80',
    snackOrdered: 'Prime Beef Suya & Peppered Asun',
    category: 'protein-snacks',
    isVerifiedBuyer: true,
    timeAgo: '4 days ago',
    likesCount: 41,
  },
  {
    id: 't-5',
    name: 'Ngozi Eze',
    location: 'Yaba, Lagos',
    rating: 5,
    text: "Customer service is top-notch. I had a last-minute office party and ordered 30 meat pies and 5 chin chin jars. Everything arrived on schedule and still warm!",
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&q=80',
    snackOrdered: 'Office Party Snack Box',
    category: 'pastries',
    isVerifiedBuyer: true,
    timeAgo: '1 week ago',
    likesCount: 19,
  },
  {
    id: 't-6',
    name: 'Dr. Kelechi Nwosu',
    location: 'Wuse 2, Abuja',
    rating: 5,
    text: "Finally an authentic snack brand that takes hygiene and packaging seriously. Sealed thermal bags, prompt riders, and unmatched taste consistency.",
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&q=80',
    snackOrdered: 'Spicy Asun & Plantain Chips',
    category: 'protein-snacks',
    isVerifiedBuyer: true,
    timeAgo: '1 week ago',
    likesCount: 63,
  },
];

// ─── Individual Testimonial Card Component ──────────────────────────
const TestimonialCard: React.FC<{ testimonial: TestimonialItem }> = ({ testimonial }) => {
  const [imgError, setImgError] = useState(false);
  const [likes, setLikes] = useState(testimonial.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(false);

  const initials = testimonial.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 border border-amber-950/10 shadow-sm hover:shadow-xl hover:shadow-amber-950/[0.06] hover:border-primary/30 transition-all duration-500 hover:-translate-y-1.5 min-w-0">
      
      {/* Top Section: Rating Stars + Quote Accent */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* Star Rating Group */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={
                  star <= testimonial.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-stone-200 fill-stone-200'
                }
              />
            ))}
          </div>

          {/* Quote Icon with Soft Glow */}
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Quote size={14} className="fill-primary/20" />
          </div>
        </div>

        {/* Snack Ordered Pill (Contextual Social Proof) */}
        {testimonial.snackOrdered && (
          <div className="inline-flex items-center gap-1.5 bg-amber-100/60 border border-amber-900/10 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider text-amber-950 mb-3.5 max-w-full truncate">
            <Flame size={11} className="text-primary shrink-0" />
            <span className="truncate">Ordered: {testimonial.snackOrdered}</span>
          </div>
        )}

        {/* Review Body */}
        <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-medium mb-6">
          "{testimonial.text}"
        </p>
      </div>

      {/* Bottom Section: Customer Profile & Verification */}
      <div className="pt-4 border-t border-amber-950/[0.07] flex items-center justify-between gap-3">
        
        {/* Customer Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {testimonial.avatarUrl && !imgError ? (
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.name}
                onError={() => setImgError(true)}
                className="w-10 h-10 rounded-2xl object-cover border border-amber-950/10 shadow-2xs group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                {initials}
              </div>
            )}
            
            {testimonial.isVerifiedBuyer && (
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white"
                title="Verified Buyer"
              >
                <CheckCircle2 size={10} strokeWidth={3} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-heading font-black text-xs sm:text-sm text-stone-900 truncate">
                {testimonial.name}
              </h4>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-stone-400 font-medium truncate mt-0.5">
              <MapPin size={10} className="text-primary shrink-0" />
              <span className="truncate">{testimonial.location}</span>
            </div>
          </div>
        </div>

        {/* Helpful Like Button */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all active:scale-95 shrink-0 ${
            hasLiked
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-amber-50/50 hover:bg-amber-100/60 text-stone-600 border-amber-950/10'
          }`}
          aria-label="Mark review as helpful"
        >
          <ThumbsUp size={11} className={hasLiked ? 'fill-white' : ''} />
          <span>{likes}</span>
        </button>

      </div>

    </div>
  );
};

// ─── Main Testimonials Section Component ─────────────────────────────
export const Testimonials: React.FC<TestimonialsProps> = ({
  title = 'Loved by 15,000+ Nigerian Food Lovers',
  subtitle = 'Discover why thousands of snack enthusiasts across Lagos and Abuja choose our kitchens for authentic taste, rapid delivery, and warmth.',
  testimonials = DEFAULT_TESTIMONIALS,
  averageRating = 4.9,
  totalReviews = 2480,
  onExploreClick,
  className = '',
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filterTabs = [
    { id: 'all', label: 'All Reviews' },
    { id: 'pastries', label: 'Pastries & Meat Pies' },
    { id: 'fried-snacks', label: 'Chin Chin' },
    { id: 'protein-snacks', label: 'Suya & Asun' },
    { id: 'sweet-snacks', label: 'Puff-Puff' },
  ];

  const filteredTestimonials = useMemo(() => {
    if (selectedFilter === 'all') return testimonials;
    return testimonials.filter((t) => t.category === selectedFilter);
  }, [testimonials, selectedFilter]);

  return (
    <section
      className={`relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#FFFDF9] via-amber-50/20 to-white overflow-hidden ${className}`}
      aria-labelledby="testimonials-heading"
    >
      {/* ── Background Mesh Orbs ───────────────────────────────────── */}
      <div
        className="absolute top-1/3 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 -right-20 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <Container>
        <div className="relative z-10">

          {/* ── Top Header Section ───────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-14">
            <div className="max-w-2xl text-left">
              {/* Badge Tag */}
              <div className="inline-flex items-center gap-1.5 bg-amber-100/70 border border-amber-900/10 px-3 py-1 rounded-full text-amber-900 text-xs font-black uppercase tracking-wider mb-3.5 shadow-2xs">
                <Sparkles size={13} className="text-primary animate-pulse" />
                <span>Verified Taste Testimonials</span>
              </div>

              {/* Main Heading */}
              <h2
                id="testimonials-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-stone-900 tracking-tight leading-[1.15]"
              >
                {title}
              </h2>

              {/* Subtitle */}
              <p className="text-stone-500 text-xs sm:text-sm md:text-base mt-3 leading-relaxed font-medium">
                {subtitle}
              </p>
            </div>

            {/* Aggregated Score Pill Banner */}
            <div className="flex items-center gap-4 p-3.5 bg-white rounded-2xl border border-amber-950/10 shadow-sm shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-primary text-stone-950 flex flex-col items-center justify-center font-heading font-black leading-none shadow-xs">
                <span className="text-base">{averageRating.toFixed(1)}</span>
                <span className="text-[9px] uppercase tracking-wider mt-0.5">Stars</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-bold text-stone-800 mt-1">
                  Based on {totalReviews.toLocaleString()}+ Genuine Orders
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-0.5">
                  <ShieldCheck size={11} />
                  <span>100% Authentic Customer Feedback</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Category Filter Tabs ─────────────────────────────────── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  selectedFilter === tab.id
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white hover:bg-amber-100/50 text-stone-600 border border-amber-950/[0.08]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Testimonials Responsive Grid ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>

          {/* ── Bottom Callout Banner ────────────────────────────────── */}
          <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-100/60 via-orange-50/40 to-amber-100/60 border border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-amber-950/10 flex items-center justify-center text-primary shrink-0">
                <MessageSquare size={22} />
              </div>
              <div>
                <h4 className="font-heading font-black text-base sm:text-lg text-stone-900">
                  Ordered from us recently?
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Share your review and get ₦500 off your next freshly baked delivery batch!
                </p>
              </div>
            </div>

            <button
              onClick={onExploreClick}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-black shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98] shrink-0"
            >
              <span>Taste the Difference</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default Testimonials;