import React from 'react';

// ─── Base Atomic Skeleton ────────────────────────────────────────────
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'rounded' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-lg',
    rounded: 'rounded-2xl',
    circular: 'rounded-full',
  };

  return (
    <div
      className={`relative overflow-hidden bg-stone-200/70 animate-pulse ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Dynamic light reflection sweep */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
};

// ─── 1. Product Card Skeleton ────────────────────────────────────────
export const ProductCardSkeleton = () => {
  return (
    <div className="p-3 sm:p-4 rounded-3xl bg-white border border-amber-950/10 shadow-sm space-y-3.5">
      {/* Product Image Area with simulated floating badge */}
      <div className="relative aspect-square w-full rounded-2xl bg-stone-100 overflow-hidden">
        <Skeleton className="w-full h-full rounded-2xl" />
        <div className="absolute top-2.5 right-2.5">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <div className="absolute bottom-2.5 left-2.5">
          <Skeleton className="w-16 h-5 rounded-md" />
        </div>
      </div>

      {/* Info Body */}
      <div className="space-y-2 pt-1">
        {/* Rating line */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="w-10 h-3.5 rounded-md" />
          <Skeleton className="w-8 h-3.5 rounded-md" />
        </div>

        {/* Title */}
        <Skeleton className="h-4 w-5/6 rounded-lg" />
        <Skeleton className="h-3.5 w-1/2 rounded-lg" />

        {/* Price & Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <Skeleton className="h-3 w-10 rounded" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// ─── 2. Order Card Skeleton ──────────────────────────────────────────
export const OrderCardSkeleton = () => {
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-amber-950/10 shadow-sm space-y-4">
      {/* Header Row: Order Number & Status Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-3.5 w-24 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-48 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>

      {/* Item Thumbnails & Delivery Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-7 flex items-center gap-2">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="space-y-1.5 pl-2">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        </div>

        <div className="md:col-span-5 space-y-1.5 md:border-l md:border-stone-100 md:pl-4">
          <Skeleton className="h-3.5 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>

      {/* Footer: Price & Action Buttons */}
      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Skeleton className="h-3.5 w-20 rounded" />
          <Skeleton className="h-6 w-28 rounded-lg" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// ─── 3. Stats & KPI Card Skeleton ────────────────────────────────────
export const StatsCardSkeleton = () => {
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-amber-950/10 shadow-sm space-y-4">
      {/* Icon Squircle & Trend Chip */}
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-16 h-6 rounded-lg" />
      </div>

      {/* Metric Value & Label */}
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-8 w-36 rounded-lg" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
};

// ─── 4. Table Row Skeleton ───────────────────────────────────────────
export const TableRowSkeleton = () => {
  return (
    <tr className="border-b border-stone-100">
      <td className="py-4 pl-6 pr-4">
        <div className="flex items-center gap-3.5">
          <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      </td>
      <td className="py-4 px-4"><Skeleton className="h-6 w-20 rounded-lg" /></td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-16 rounded" /></td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-20 rounded" /></td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-16 rounded" /></td>
      <td className="py-4 px-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
      <td className="py-4 pl-4 pr-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="w-8 h-8 rounded-xl" />
        </div>
      </td>
    </tr>
  );
};

export default Skeleton;