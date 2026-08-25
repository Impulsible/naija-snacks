import React, { useState, useEffect } from 'react';
import { ShoppingBag, ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Optional secondary image URL to attempt before displaying the fallback badge */
  fallbackSrc?: string;
  className?: string;
  fallbackClassName?: string;
  /** Custom aspect ratio wrapper style (e.g., "aspect-square", "aspect-video") */
  aspectRatio?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  fallbackClassName = '',
  aspectRatio = '',
  loading = 'lazy',
  decoding = 'async',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize state when src prop updates dynamically
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  // ─── Fallback Error State ──────────────────────────────────────────
  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#FFFDF9] to-amber-50/50 border border-amber-950/10 p-4 text-center select-none ${
          aspectRatio ? aspectRatio : ''
        } ${fallbackClassName || className}`}
        role="img"
        aria-label={alt || 'Image unavailable'}
      >
        <div className="relative mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-100/70 border border-amber-900/10 text-amber-700 flex items-center justify-center shadow-sm">
            <ShoppingBag size={18} className="stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-stone-500">
            <ImageOff size={9} strokeWidth={2.5} />
          </div>
        </div>

        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate max-w-[130px]">
          {alt || 'Snack Preview'}
        </span>
      </div>
    );
  }

  // ─── Normal Progressive Loaded State ───────────────────────────────
  return (
    <div
      className={`relative overflow-hidden bg-stone-100 ${
        aspectRatio ? aspectRatio : ''
      } ${className}`}
    >
      {/* Warm Ambient Shimmer Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-stone-200/70 z-10 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      )}

      {/* Progressive Image with De-blur Transition */}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
          } else {
            setHasError(true);
            setIsLoading(false);
          }
        }}
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${
          isLoading
            ? 'opacity-0 scale-[1.03] blur-sm'
            : 'opacity-100 scale-100 blur-0'
        }`}
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;