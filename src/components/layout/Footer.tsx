import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  MessageCircle,
  Award,
} from 'lucide-react';
import Container from '../layout/Container';

// ─── Types & Configuration ──────────────────────────────────────────
export interface FooterHub {
  city: string;
  areas: string;
}

export interface FooterProps {
  companyName?: string;
  supportEmail?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  hubs?: FooterHub[];
  kitchenStatus?: {
    isOpen: boolean;
    nextDispatchTime?: string;
  };
}

// ─── Custom Social Icons (SVG for accurate brand marks) ─────────────
const SocialIcons = {
  Instagram: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  Twitter: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  TikTok: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.74 1.07-.05 2.08-.63 2.64-1.54.43-.65.65-1.44.66-2.22.03-4.8.01-9.61.02-14.42z" />
    </svg>
  ),
  Facebook: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.593 0 9 1.582 9 4.615V8z" />
    </svg>
  ),
};

const DEFAULT_HUBS: FooterHub[] = [
  { city: 'Lagos Hub', areas: 'Lekki, VI, Ikoyi, Ikeja, Yaba, Surulere' },
  { city: 'Abuja Hub', areas: 'Maitama, Wuse 2, Gwarinpa, Jabi, Central Area' },
];

// ─── Main Footer Component ──────────────────────────────────────────
const Footer: React.FC<FooterProps> = ({
  companyName = 'NAIJA SNACKS',
  supportEmail = 'orders@naijasnacks.ng',
  supportPhone = '+234 802 345 6789',
  whatsappNumber = '2348023456789',
  hubs = DEFAULT_HUBS,
  kitchenStatus = { isOpen: true, nextDispatchTime: 'in 15 mins' },
}) => {
  return (
    <footer className="relative bg-[#12100D] text-stone-300 overflow-hidden border-t border-amber-900/20">
      
      {/* ── Top Ambient Lighting ──────────────────────────────────── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* ── 1. Top Kitchen Status & Delivery Coverage Strip ────────── */}
      <div className="border-b border-stone-800/80 bg-stone-950/60 py-3.5 px-4">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Live Dispatch Pill */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
              </div>
              <span className="font-black text-white uppercase tracking-wider text-[11px]">
                {kitchenStatus.isOpen ? 'Kitchens Active & Baking' : 'Kitchens Closed'}
              </span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-400">
                Next delivery batch departs{' '}
                <strong className="text-amber-300 font-bold">{kitchenStatus.nextDispatchTime}</strong>
              </span>
            </div>

            {/* Quick WhatsApp Support Trigger */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hi%20Naija%20Snacks,%20I%20have%20an%20inquiry%20about%20an%20order`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40 px-3 py-1 rounded-full font-bold text-[11px] transition-all hover:scale-105"
            >
              <MessageCircle size={12} className="text-emerald-400" />
              <span>WhatsApp Quick Order / Help</span>
            </a>
          </div>
        </Container>
      </div>

      {/* ── 2. Main Navigation Grid ───────────────────────────────── */}
      <Container>
        <div className="pt-14 pb-12 lg:pt-16 lg:pb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand & Mission Column (Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                <span className="text-xl select-none">🇳🇬</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#12100D] rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-xl tracking-tight text-white leading-none">
                  NAIJA<span className="text-primary">SNACKS</span>
                </span>
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none mt-1">
                  Fresh Warm Express
                </span>
              </div>
            </Link>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Discover the taste of home. We partner with premier Nigerian pastry chefs and grill masters to deliver freshly made Chin Chin, warm Meat Pies, and authentic snacks in 30 minutes.
            </p>

            {/* Hygiene & Packaging Guarantees */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 bg-stone-900/80 border border-stone-800 px-2.5 py-1 rounded-xl text-[11px] font-bold text-stone-300">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>NAFDAC Compliant</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-stone-900/80 border border-stone-800 px-2.5 py-1 rounded-xl text-[11px] font-bold text-stone-300">
                <Award size={13} className="text-amber-400" />
                <span>100% Halal Meat</span>
              </div>
            </div>

            {/* Social Network Links */}
            <div className="pt-2">
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2.5">
                Join our foodie community
              </p>
              <div className="flex items-center gap-2">
                {[
                  { icon: SocialIcons.Instagram, label: 'Instagram', href: 'https://instagram.com' },
                  { icon: SocialIcons.TikTok, label: 'TikTok', href: 'https://tiktok.com' },
                  { icon: SocialIcons.Twitter, label: 'X (Twitter)', href: 'https://twitter.com' },
                  { icon: SocialIcons.Facebook, label: 'Facebook', href: 'https://facebook.com' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-primary border border-stone-800 hover:border-primary text-stone-400 hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <social.icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Menu Links (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-heading font-black text-sm text-white uppercase tracking-wider">
              Craving Menu
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-stone-400">
              {[
                { to: '/category/pastries', label: 'Pastries & Meat Pies', badge: 'Popular' },
                { to: '/category/fried-snacks', label: 'Crispy Chin Chin' },
                { to: '/category/protein-snacks', label: 'Spicy Suya & Asun' },
                { to: '/category/sweet-snacks', label: 'Puff-Puff & Sweets' },
                { to: '/categories/party-packs', label: 'Event Party Packs' },
                { to: '/deals', label: 'Weekly Combo Deals' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-black bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.2 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support & Account (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-heading font-black text-sm text-white uppercase tracking-wider">
              Orders & Help
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-stone-400">
              {[
                { to: '/orders', label: 'Live Order Tracker' },
                { to: '/favorites', label: 'Saved Favourites' },
                { to: '/account', label: 'My Account' },
                { to: '/catering', label: 'Corporate Catering' },
                { to: '/faq', label: 'Delivery FAQs' },
                { to: '/hygiene', label: 'Kitchen Hygiene Standards' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="hover:text-white transition-colors block hover:translate-x-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Kitchen Hubs & Contact (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-heading font-black text-sm text-white uppercase tracking-wider">
              Delivery Hubs & Contact
            </h4>
            
            {/* Hub Locations */}
            <div className="space-y-2.5">
              {hubs.map((hub) => (
                <div
                  key={hub.city}
                  className="p-2.5 bg-stone-900/60 rounded-2xl border border-stone-800/80 text-xs"
                >
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <MapPin size={13} className="text-primary" />
                    <span>{hub.city}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 pl-4">{hub.areas}</p>
                </div>
              ))}
            </div>

            {/* Direct Contact Links */}
            <div className="pt-2 space-y-2 text-xs font-semibold text-stone-300">
              <a
                href={`tel:${supportPhone}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-stone-900 flex items-center justify-center text-amber-500">
                  <Phone size={12} />
                </div>
                <span>{supportPhone}</span>
              </a>
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-stone-900 flex items-center justify-center text-amber-500">
                  <Mail size={12} />
                </div>
                <span>{supportEmail}</span>
              </a>
            </div>

          </div>

        </div>

        {/* ── 3. Payment Methods & Security Strip ───────────────────── */}
        <div className="py-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>100% Encrypted & Safe Payments via Nigerian Rails:</span>
          </div>

          {/* Payment Pill Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {['Paystack', 'Flutterwave', 'Mastercard', 'Visa', 'Verve Local'].map((method) => (
              <span
                key={method}
                className="text-[10px] font-black uppercase tracking-wider bg-stone-900 border border-stone-800 px-2.5 py-1 rounded-lg text-stone-300"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* ── 4. Bottom Legal & Copyright ───────────────────────────── */}
        <div className="py-6 border-t border-stone-900 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-stone-500 font-medium text-center md:text-left">
          <p>
            © {new Date().getFullYear()} {companyName}. All rights reserved. Handcrafted for snack lovers across Nigeria.
          </p>

          <div className="flex items-center justify-center gap-4 text-stone-400">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookie Preferences
            </Link>
          </div>
        </div>

      </Container>
    </footer>
  );
};

export default Footer;