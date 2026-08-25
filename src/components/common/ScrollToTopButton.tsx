import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const SCROLL_THRESHOLD = 400;
const MAX_SCROLL_FOR_PROGRESS = 2000; // Full ring at 2000px scroll

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const rafRef = useRef<number | null>(null);

  // ─── Throttled Scroll Listener via rAF ─────────────────────────────
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      setIsVisible(scrollY > SCROLL_THRESHOLD);
      setScrollProgress(
        Math.min(1, Math.max(0, scrollY / Math.max(docHeight, MAX_SCROLL_FOR_PROGRESS)))
      );

      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'instant' : 'smooth',
    });
  };

  // ─── SVG Progress Ring Calculations ────────────────────────────────
  const ringSize = 44;
  const strokeWidth = 2.5;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 0.6,
            y: shouldReduceMotion ? 0 : 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 0.6,
            y: shouldReduceMotion ? 0 : 20,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 28,
            mass: 0.8,
          }}
          whileHover={{
            scale: 1.08,
            y: -2,
            transition: { duration: 0.2, ease: 'easeOut' },
          }}
          whileTap={{
            scale: 0.92,
            transition: { duration: 0.1 },
          }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="Scroll back to top of page"
          title="Back to top"
        >
          {/* Outer glow pulse on first appearance */}
          <motion.span
            className="absolute inset-0 rounded-full bg-primary/20"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: 'easeOut',
              repeat: 1,
              repeatDelay: 0.5,
            }}
            aria-hidden="true"
          />

          {/* Button Container */}
          <span className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-stone-900/90 backdrop-blur-md border border-amber-950/20 shadow-xl shadow-stone-900/25 hover:shadow-2xl hover:shadow-stone-900/30 transition-shadow">
            
            {/* SVG Progress Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox={`0 0 ${ringSize} ${ringSize}`}
              aria-hidden="true"
            >
              {/* Background track */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={strokeWidth}
              />
              {/* Active progress arc */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="url(#scrollGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-150 ease-out"
              />
              <defs>
                <linearGradient id="scrollGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>

            {/* Arrow Icon */}
            <ArrowUp
              size={18}
              className="text-white/90 group-hover:text-white transition-colors relative z-10"
              strokeWidth={2.5}
            />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;