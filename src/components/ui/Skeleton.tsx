import React, { memo, useMemo } from 'react';

// ─── Types & Interfaces ─────────────────────────────────────────────
export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';

export interface SkeletonProps {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Animation style */
  animation?: SkeletonAnimation;
  /** Width override (e.g. '100%', 200, '12rem') */
  width?: string | number;
  /** Height override (e.g. '1rem', 40, '200px') */
  height?: string | number;
  /** Shortcut to make element a perfect circle */
  circle?: boolean;
  /** Number of skeleton copies to render */
  count?: number;
  /** Additional custom classes */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
}

export interface GridSkeletonProps {
  /** Number of cards to render */
  count?: number;
  /** Responsive Tailwind grid column classes */
  gridClassName?: string;
  /** Skeleton element or card variant to repeat */
  children?: React.ReactNode;
}

export interface TextSkeletonProps {
  /** Number of text line placeholders */
  lines?: number;
  /** Height of each text line */
  lineHeight?: string;
  /** Spacing between lines */
  gap?: string;
  /** Additional container classes */
  className?: string;
}

// ─── Core Base Skeleton Component ───────────────────────────────────
export const Skeleton = memo(function Skeleton({
  variant = 'rounded',
  animation = 'shimmer',
  width,
  height,
  circle = false,
  count = 1,
  className = '',
  style,
}: SkeletonProps) {
  // Compute style overrides for explicit width & height
  const inlineStyles = useMemo(() => {
    const computedStyles: React.CSSProperties = { ...style };
    if (width !== undefined) {
      computedStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      computedStyles.height = typeof height === 'number' ? `${height}px` : height;
    }
    return computedStyles;
  }, [style, width, height]);

  // Compute shape classes
  const shapeClass = useMemo(() => {
    if (circle) return 'rounded-full';
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'text':
        return 'rounded-md h-4 w-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
      default:
        return 'rounded-2xl';
    }
  }, [variant, circle]);

  // Compute animation classes
  const animationClass = useMemo(() => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse bg-zinc-200/90';
      case 'none':
        return 'bg-zinc-200/90';
      case 'shimmer':
      default:
        return 'relative overflow-hidden bg-zinc-200/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';
    }
  }, [animation]);

  const baseElement = (
    <div
      aria-hidden="true"
      className={`inline-block select-none ${shapeClass} ${animationClass} ${className}`}
      style={inlineStyles}
    >
      <style>{`
        @keyframes skeleton-shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <React.Fragment key={index}>{baseElement}</React.Fragment>
        ))}
      </>
    );
  }

  return baseElement;
});

// ─── Specialized Text Paragraph Skeleton ────────────────────────────
export const TextSkeleton = memo(function TextSkeleton({
  lines = 3,
  lineHeight = 'h-3.5',
  gap = 'space-y-2',
  className = '',
}: TextSkeletonProps) {
  return (
    <div className={`w-full ${gap} ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, idx) => {
        // Vary width on last line for natural paragraph look
        const isLast = idx === lines - 1;
        const widthClass = isLast && lines > 1 ? 'w-2/3' : 'w-full';

        return (
          <Skeleton
            key={idx}
            variant="text"
            className={`${lineHeight} ${widthClass}`}
          />
        );
      })}
    </div>
  );
});

// ─── Product Card Skeleton ──────────────────────────────────────────
export const ProductCardSkeleton = memo(function ProductCardSkeleton({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex flex-col justify-between bg-white rounded-3xl p-3.5 sm:p-4 border border-zinc-200/80 shadow-2xs space-y-3.5 ${className}`}
    >
      {/* Aspect Ratio Image Box */}
      <div className="relative w-full aspect-[4/3] bg-zinc-100 rounded-2xl overflow-hidden">
        <Skeleton className="w-full h-full rounded-2xl" />
        {/* Floating Top Badge */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>
        {/* Wishlist Button */}
        <div className="absolute top-3 right-3">
          <Skeleton circle className="w-8 h-8" />
        </div>
      </div>

      {/* Info Block */}
      <div className="space-y-2.5">
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-12 h-3" />
        </div>

        {/* Title */}
        <Skeleton className="w-4/5 h-5 rounded-md" />

        {/* Subtitle / Description */}
        <Skeleton className="w-full h-3 rounded-md" />
      </div>

      {/* Footer Price & Add Button Row */}
      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
        <div className="space-y-1">
          <Skeleton className="w-16 h-5 rounded-md" />
          <Skeleton className="w-10 h-2.5 rounded-md" />
        </div>
        <Skeleton className="w-20 h-10 rounded-xl" />
      </div>
    </div>
  );
});

// ─── Category Card Skeleton ─────────────────────────────────────────
export const CategoryCardSkeleton = memo(function CategoryCardSkeleton({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`bg-white rounded-3xl p-3 sm:p-3.5 border border-zinc-200/80 shadow-2xs space-y-3 ${className}`}
    >
      {/* Top Image Preview */}
      <div className="relative w-full aspect-[4/3] bg-zinc-100 rounded-2xl overflow-hidden">
        <Skeleton className="w-full h-full rounded-2xl" />
        <div className="absolute top-2.5 left-2.5">
          <Skeleton className="w-8 h-8 rounded-xl" />
        </div>
      </div>

      {/* Content Label */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="space-y-1 flex-1">
          <Skeleton className="w-3/4 h-4 rounded-md" />
          <Skeleton className="w-1/2 h-3 rounded-md" />
        </div>
        <Skeleton circle className="w-7 h-7" />
      </div>
    </div>
  );
});

// ─── Banner / Hero Skeleton ─────────────────────────────────────────
export const BannerSkeleton = memo(function BannerSkeleton({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`w-full rounded-3xl bg-zinc-100 border border-zinc-200/80 p-6 sm:p-10 flex flex-col justify-between space-y-6 ${className}`}
    >
      <div className="space-y-3 max-w-lg">
        <Skeleton className="w-24 h-6 rounded-full" />
        <Skeleton className="w-full h-10 sm:h-12 rounded-xl" />
        <Skeleton className="w-4/5 h-10 sm:h-12 rounded-xl" />
        <TextSkeleton lines={2} className="pt-2" />
      </div>

      <div className="flex flex-wrap gap-3 pt-4">
        <Skeleton className="w-36 h-12 rounded-2xl" />
        <Skeleton className="w-32 h-12 rounded-2xl" />
      </div>
    </div>
  );
});

// ─── Universal Grid Skeleton ────────────────────────────────────────
export const GridSkeleton = memo(function GridSkeleton({
  count = 4,
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6',
  children,
}: GridSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading contents..."
      className={gridClassName}
    >
      {/* Hidden screen-reader status text */}
      <span className="sr-only">Loading grid items, please wait...</span>

      {Array.from({ length: count }).map((_, idx) => (
        <React.Fragment key={idx}>
          {children || <ProductCardSkeleton />}
        </React.Fragment>
      ))}
    </div>
  );
});

// ─── Attach Presets to Compound Pattern ──────────────────────────────
type CompoundSkeleton = typeof Skeleton & {
  ProductCard: typeof ProductCardSkeleton;
  CategoryCard: typeof CategoryCardSkeleton;
  Banner: typeof BannerSkeleton;
  Text: typeof TextSkeleton;
  Grid: typeof GridSkeleton;
};

const CompoundSkeletonExport = Skeleton as CompoundSkeleton;
CompoundSkeletonExport.ProductCard = ProductCardSkeleton;
CompoundSkeletonExport.CategoryCard = CategoryCardSkeleton;
CompoundSkeletonExport.Banner = BannerSkeleton;
CompoundSkeletonExport.Text = TextSkeleton;
CompoundSkeletonExport.Grid = GridSkeleton;

export default CompoundSkeletonExport;