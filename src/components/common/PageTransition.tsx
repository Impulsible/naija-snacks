import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  /** Automatically reset window scroll position to the top on page transition (default: true) */
  scrollToTop?: boolean;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = 'w-full',
  scrollToTop = true,
}) => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Reset scroll position on route switch
  useEffect(() => {
    if (scrollToTop) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname, scrollToTop]);

  // ─── Adaptive Transition Presets ──────────────────────────────────
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 12,
      scale: shouldReduceMotion ? 1 : 0.995,
    },
    enter: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1], // Cinematic smooth arrival
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -8,
      transition: {
        duration: 0.18,
        ease: [0.7, 0, 0.84, 0], // Snappy exit so new page loads promptly
      },
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{ willChange: 'transform, opacity' }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;