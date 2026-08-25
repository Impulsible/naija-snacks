import React from 'react';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  /** Index for sequential staggered reveal */
  index?: number;
  className?: string;
  /** Enable subtle 3D lift on hover (ideal for product cards & dashboard widgets) */
  enableHover?: boolean;
  /** Enable tactile compression on click/tap */
  enableTap?: boolean;
  /** Animate when scrolled into viewport instead of immediate mount (default: true) */
  inView?: boolean;
  /** Delay multiplier per index in seconds (default: 0.06s) */
  staggerDelay?: number;
  /** Maximum delay cap to avoid long waits on large grids (default: 0.45s) */
  maxDelay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  index = 0,
  className = '',
  enableHover = false,
  enableTap = false,
  inView = true,
  staggerDelay = 0.06,
  maxDelay = 0.45,
  ...motionProps
}) => {
  // Cap the delay so items lower in large lists render promptly
  const calculatedDelay = Math.min(index * staggerDelay, maxDelay);

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: calculatedDelay,
        ease: [0.16, 1, 0.3, 1], // Cinematic smooth deceleration
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      {...(inView
        ? {
            whileInView: 'visible',
            viewport: { once: true, amount: 0.08, margin: '0px 0px -20px 0px' },
          }
        : { animate: 'visible' })}
      variants={cardVariants}
      whileHover={
        enableHover
          ? {
              y: -4,
              transition: { duration: 0.2, ease: 'easeOut' },
            }
          : undefined
      }
      whileTap={
        enableTap
          ? {
              scale: 0.985,
              transition: { duration: 0.1, ease: 'easeOut' },
            }
          : undefined
      }
      style={{ willChange: 'transform, opacity' }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;