import React, { memo, useMemo } from 'react';
import { Flame } from 'lucide-react';

// ─── Types & Interfaces ─────────────────────────────────────────────
export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'spinner' | 'brand' | 'dots' | 'pulse' | 'bars';
export type LoaderColor = 'primary' | 'orange' | 'amber' | 'emerald' | 'white' | 'dark';

export interface LoaderProps {
  /** Size scale of the loader visual */
  size?: LoaderSize;
  /** Visual theme/animation style */
  variant?: LoaderVariant;
  /** Palette color variant */
  color?: LoaderColor;
  /** Optional loading text message (e.g., "Baking your meat pie...") */
  label?: string;
  /** Position of the optional label relative to the spinner */
  labelPosition?: 'bottom' | 'right' | 'top';
  /** Accessible screen-reader text for assist technology */
  ariaLabel?: string;
  /** Renders as a full-viewport modal overlay for page transitions */
  fullScreen?: boolean;
  /** Renders as an absolute overlay within its parent container */
  overlay?: boolean;
  /** Applies backdrop blur intensity when overlay or fullScreen is enabled */
  blur?: boolean;
  /** Additional CSS class overrides for the wrapper */
  className?: string;
  /** Additional CSS class overrides for the spinner element */
  spinnerClassName?: string;
}

// ─── Size Configurations ────────────────────────────────────────────
const SIZE_CONFIGS: Record<
  LoaderSize,
  {
    dimension: string;
    borderWidth: string;
    iconSize: number;
    textSize: string;
    gap: string;
    dotSize: string;
    barHeight: string;
  }
> = {
  xs: {
    dimension: 'w-3.5 h-3.5',
    borderWidth: 'border-2',
    iconSize: 10,
    textSize: 'text-[10px]',
    gap: 'gap-1.5',
    dotSize: 'w-1 h-1',
    barHeight: 'h-3 w-0.5',
  },
  sm: {
    dimension: 'w-5 h-5',
    borderWidth: 'border-2',
    iconSize: 12,
    textSize: 'text-xs',
    gap: 'gap-2',
    dotSize: 'w-1.5 h-1.5',
    barHeight: 'h-4 w-1',
  },
  md: {
    dimension: 'w-8 h-8',
    borderWidth: 'border-3',
    iconSize: 18,
    textSize: 'text-sm',
    gap: 'gap-2.5',
    dotSize: 'w-2 h-2',
    barHeight: 'h-6 w-1.5',
  },
  lg: {
    dimension: 'w-12 h-12',
    borderWidth: 'border-4',
    iconSize: 26,
    textSize: 'text-base',
    gap: 'gap-3',
    dotSize: 'w-3 h-3',
    barHeight: 'h-8 w-2',
  },
  xl: {
    dimension: 'w-16 h-16',
    borderWidth: 'border-[5px]',
    iconSize: 34,
    textSize: 'text-lg',
    gap: 'gap-4',
    dotSize: 'w-4 h-4',
    barHeight: 'h-10 w-2.5',
  },
};

// ─── Color Configurations ───────────────────────────────────────────
const COLOR_CONFIGS: Record<
  LoaderColor,
  {
    ring: string;
    track: string;
    fill: string;
    text: string;
    glow: string;
  }
> = {
  primary: {
    ring: 'border-orange-600',
    track: 'border-orange-100',
    fill: 'bg-orange-600',
    text: 'text-orange-950',
    glow: 'shadow-orange-500/20',
  },
  orange: {
    ring: 'border-orange-500',
    track: 'border-orange-100',
    fill: 'bg-orange-500',
    text: 'text-orange-900',
    glow: 'shadow-orange-500/20',
  },
  amber: {
    ring: 'border-amber-500',
    track: 'border-amber-100',
    fill: 'bg-amber-500',
    text: 'text-amber-950',
    glow: 'shadow-amber-500/20',
  },
  emerald: {
    ring: 'border-emerald-600',
    track: 'border-emerald-100',
    fill: 'bg-emerald-600',
    text: 'text-emerald-950',
    glow: 'shadow-emerald-500/20',
  },
  white: {
    ring: 'border-white',
    track: 'border-white/20',
    fill: 'bg-white',
    text: 'text-white',
    glow: 'shadow-black/10',
  },
  dark: {
    ring: 'border-zinc-900',
    track: 'border-zinc-200',
    fill: 'bg-zinc-900',
    text: 'text-zinc-900',
    glow: 'shadow-black/10',
  },
};

// ─── Sub-Renderers ──────────────────────────────────────────────────

/** Classic Dual-Track Orbit Spinner */
const RingSpinner = memo(function RingSpinner({
  size,
  color,
  spinnerClassName = '',
}: {
  size: LoaderSize;
  color: LoaderColor;
  spinnerClassName?: string;
}) {
  const config = SIZE_CONFIGS[size];
  const palette = COLOR_CONFIGS[color];

  return (
    <div className={`relative flex items-center justify-center ${config.dimension} ${spinnerClassName}`}>
      {/* Background Track */}
      <div
        className={`absolute inset-0 rounded-full ${config.borderWidth} ${palette.track}`}
        aria-hidden="true"
      />
      {/* Active Spinning Ring */}
      <div
        className={`absolute inset-0 rounded-full ${config.borderWidth} ${palette.ring} border-t-transparent border-r-transparent animate-spin`}
        aria-hidden="true"
      />
    </div>
  );
});

/** NaijaSnacks Signature Flame/Emblem Loader */
const BrandLoader = memo(function BrandLoader({
  size,
  color,
  spinnerClassName = '',
}: {
  size: LoaderSize;
  color: LoaderColor;
  spinnerClassName?: string;
}) {
  const config = SIZE_CONFIGS[size];
  const palette = COLOR_CONFIGS[color];

  return (
    <div className={`relative flex items-center justify-center ${config.dimension} ${spinnerClassName}`}>
      {/* Outer Orbit Ring */}
      <div
        className={`absolute inset-0 rounded-2xl ${config.borderWidth} ${palette.ring} border-b-transparent animate-spin`}
        style={{ animationDuration: '1.2s' }}
        aria-hidden="true"
      />
      {/* Inner Glowing Flame Badge */}
      <div
        className={`relative z-10 p-1.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md ${palette.glow} animate-pulse`}
        aria-hidden="true"
      >
        <Flame size={config.iconSize} className="fill-white stroke-none" />
      </div>
    </div>
  );
});

/** Three-Dot Pulse Bouncing Indicator */
const DotsLoader = memo(function DotsLoader({
  size,
  color,
  spinnerClassName = '',
}: {
  size: LoaderSize;
  color: LoaderColor;
  spinnerClassName?: string;
}) {
  const config = SIZE_CONFIGS[size];
  const palette = COLOR_CONFIGS[color];

  return (
    <div
      className={`flex items-center gap-1.5 ${spinnerClassName}`}
      aria-hidden="true"
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className={`${config.dotSize} rounded-full ${palette.fill} animate-bounce`}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
});

/** Equalizer Bars Pulse */
const BarsLoader = memo(function BarsLoader({
  size,
  color,
  spinnerClassName = '',
}: {
  size: LoaderSize;
  color: LoaderColor;
  spinnerClassName?: string;
}) {
  const config = SIZE_CONFIGS[size];
  const palette = COLOR_CONFIGS[color];

  return (
    <div
      className={`flex items-center gap-1 ${spinnerClassName}`}
      aria-hidden="true"
    >
      {[0, 150, 300, 450].map((delay, index) => (
        <span
          key={index}
          className={`${config.barHeight} rounded-full ${palette.fill} animate-[pulse_1s_infinite_ease-in-out]`}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
});

/** Glowing Soft Radial Pulse */
const PulseLoader = memo(function PulseLoader({
  size,
  color,
  spinnerClassName = '',
}: {
  size: LoaderSize;
  color: LoaderColor;
  spinnerClassName?: string;
}) {
  const config = SIZE_CONFIGS[size];
  const palette = COLOR_CONFIGS[color];

  return (
    <div className={`relative flex items-center justify-center ${config.dimension} ${spinnerClassName}`}>
      <span
        className={`absolute inset-0 rounded-full ${palette.fill} opacity-75 animate-ping`}
        aria-hidden="true"
      />
      <span
        className={`relative inline-flex rounded-full ${config.dimension} ${palette.fill} shadow-md ${palette.glow}`}
        aria-hidden="true"
      />
    </div>
  );
});

// ─── Main Production Loader Component ───────────────────────────────
export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  label,
  labelPosition = 'bottom',
  ariaLabel,
  fullScreen = false,
  overlay = false,
  blur = true,
  className = '',
  spinnerClassName = '',
}) => {
  const sizeConfig = SIZE_CONFIGS[size];
  const colorPalette = COLOR_CONFIGS[color];
  const accessibleText = ariaLabel || label || 'Loading content, please wait...';

  // Determine flex direction based on label position
  const layoutDirection = useMemo(() => {
    switch (labelPosition) {
      case 'right':
        return 'flex-row items-center';
      case 'top':
        return 'flex-col-reverse items-center text-center';
      case 'bottom':
      default:
        return 'flex-col items-center text-center';
    }
  }, [labelPosition]);

  // Render core loader variant
  const renderGraphic = () => {
    switch (variant) {
      case 'brand':
        return <BrandLoader size={size} color={color} spinnerClassName={spinnerClassName} />;
      case 'dots':
        return <DotsLoader size={size} color={color} spinnerClassName={spinnerClassName} />;
      case 'bars':
        return <BarsLoader size={size} color={color} spinnerClassName={spinnerClassName} />;
      case 'pulse':
        return <PulseLoader size={size} color={color} spinnerClassName={spinnerClassName} />;
      case 'spinner':
      default:
        return <RingSpinner size={size} color={color} spinnerClassName={spinnerClassName} />;
    }
  };

  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={accessibleText}
      className={`inline-flex ${layoutDirection} ${sizeConfig.gap} ${className}`}
    >
      {renderGraphic()}

      {/* Screen Reader Announcement */}
      <span className="sr-only">{accessibleText}</span>

      {/* Optional Visible Label */}
      {label && (
        <span
          className={`font-bold tracking-tight ${sizeConfig.textSize} ${colorPalette.text} select-none`}
        >
          {label}
        </span>
      )}
    </div>
  );

  // 1. Fullscreen Viewport Modal Loader
  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-stone-950/40 ${
          blur ? 'backdrop-blur-md' : ''
        } animate-in fade-in duration-200`}
      >
        <div className="bg-white/95 rounded-3xl p-8 shadow-2xl border border-white/60 flex flex-col items-center max-w-xs text-center space-y-3">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full blur-md" />
            <BrandLoader size="lg" color="primary" />
          </div>
          <div className="space-y-1">
            <p className="font-extrabold text-stone-900 text-base">
              {label || 'Preparing Fresh Flavors...'}
            </p>
            <p className="text-xs text-stone-500 font-medium">
              Please hold tight while we process your request.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Absolute Parent Container Overlay Loader
  if (overlay) {
    return (
      <div
        className={`absolute inset-0 z-40 flex items-center justify-center bg-white/70 ${
          blur ? 'backdrop-blur-xs' : ''
        } rounded-inherit animate-in fade-in duration-150`}
      >
        {content}
      </div>
    );
  }

  // 3. Standard Inline Loader
  return content;
};

export default memo(Loader);