import { useState, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// ─── Types & Interfaces ──────────────────────────────────────────────
export type ButtonVariant =
  | 'primary'
  | 'gradient'
  | 'secondary'
  | 'soft'
  | 'outline'
  | 'glass'
  | 'ghost'
  | 'destructive';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon-sm' | 'icon-md' | 'icon-lg';
export type ButtonShape = 'pill' | 'rounded' | 'square';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  badge?: string | number;
  shimmer?: boolean;
  glow?: boolean;
  fullWidth?: boolean;
  ripple?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  children?: React.ReactNode;
}

// Support both standard button attributes and react-router-dom Link props
export type ButtonProps = BaseProps &
  (
    | ({ to: string; href?: never } & Omit<React.ComponentPropsWithRef<typeof Link>, 'to' | 'onClick' | 'className'>)
    | ({ href: string; to?: never } & Omit<React.ComponentPropsWithRef<'a'>, 'href' | 'onClick' | 'className'>)
    | ({ to?: never; href?: never } & Omit<React.ComponentPropsWithRef<'button'>, 'onClick' | 'className' | 'disabled'>)
  );

interface RippleCoord {
  x: number;
  y: number;
  id: number;
}

// ─── Style Mappings ──────────────────────────────────────────────────
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:bg-primary-darker shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 border border-primary/20',
  gradient:
    'bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white hover:brightness-110 active:brightness-95 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 border border-white/20',
  secondary:
    'bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 shadow-sm hover:shadow-md text-gray-800',
  soft:
    'bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20 border border-primary/10',
  outline:
    'bg-transparent text-gray-800 border-2 border-gray-200 hover:border-primary hover:text-primary active:bg-primary/5',
  glass:
    'bg-white/80 backdrop-blur-xl text-gray-900 border border-white/60 hover:bg-white/95 active:bg-white/70 shadow-lg shadow-black/5 hover:shadow-xl',
  ghost:
    'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 active:bg-gray-200/80',
  destructive:
    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white active:bg-red-700 shadow-sm hover:shadow-red-500/20',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-8 px-3 text-xs gap-1.5 font-medium',
  sm: 'h-9 px-4 text-xs gap-2 font-semibold tracking-wide',
  md: 'h-11 px-5 text-sm gap-2.5 font-semibold',
  lg: 'h-13 px-7 text-base gap-3 font-bold',
  xl: 'h-15 px-9 text-lg gap-3.5 font-bold tracking-tight',
  'icon-sm': 'w-8 h-8 p-0 text-xs justify-center',
  'icon-md': 'w-11 h-11 p-0 text-sm justify-center',
  'icon-lg': 'w-13 h-13 p-0 text-base justify-center',
};

const shapeStyles: Record<ButtonShape, string> = {
  pill: 'rounded-full',
  rounded: 'rounded-2xl',
  square: 'rounded-xl',
};

// ─── Main Component ──────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      shape = 'pill',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      badge,
      shimmer = false,
      glow = false,
      fullWidth = false,
      ripple = true,
      className = '',
      disabled = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<RippleCoord[]>([]);
    const isInteractive = !disabled && !isLoading;

    // Handle Coordinate Ripple Effect
    const handlePointerDown = (e: React.MouseEvent<HTMLElement>) => {
      if (!ripple || !isInteractive) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    };

    // Base Interactive & Accessibility Classes
    const baseStyles = [
      'relative inline-flex items-center justify-center select-none overflow-hidden',
      'transition-all duration-300 ease-out transform-gpu',
      'focus:outline-none focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
      isInteractive ? 'cursor-pointer active:scale-[0.97] hover:-translate-y-0.5' : 'cursor-not-allowed opacity-60 pointer-events-none',
      fullWidth ? 'w-full' : '',
      glow && isInteractive ? 'animate-pulse' : '',
    ].join(' ');

    const combinedClasses = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      shapeStyles[shape],
      className,
    ].join(' ');

    // ── Button Interior Elements ──
    const content = (
      <>
        {shimmer && isInteractive && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        )}

        {ripples.map(({ x, y, id }) => (
          <span
            key={id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5">
            {leftIcon}
          </span>
        ) : null}

        <span
          className={`truncate transition-opacity duration-200 ${
            isLoading && !loadingText ? 'opacity-80' : 'opacity-100'
          }`}
        >
          {isLoading && loadingText ? loadingText : children}
        </span>

        {!isLoading && rightIcon && (
          <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-1">
            {rightIcon}
          </span>
        )}

        {badge !== undefined && (
          <span className="ml-1.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-white/20 text-current border border-white/30 backdrop-blur-sm">
            {badge}
          </span>
        )}
      </>
    );

    // ── Polymorphic Rendering (Link, <a>, or <button>) ──
    if ('to' in props && props.to) {
      const { to, ...rest } = props;
      return (
        <Link
          to={to}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          className={`group ${combinedClasses}`}
          onPointerDown={handlePointerDown}
          onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
          aria-disabled={!isInteractive}
          tabIndex={!isInteractive ? -1 : 0}
          {...rest}
        >
          {content}
        </Link>
      );
    }

    if ('href' in props && props.href) {
      const { href, ...rest } = props;
      return (
        <a
          href={href}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          className={`group ${combinedClasses}`}
          onPointerDown={handlePointerDown}
          onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
          aria-disabled={!isInteractive}
          tabIndex={!isInteractive ? -1 : 0}
          {...rest}
        >
          {content}
        </a>
      );
    }

    const { type = 'button', ...rest } = props as React.ComponentPropsWithRef<'button'>;
    return (
      <button
        type={type}
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        className={`group ${combinedClasses}`}
        disabled={!isInteractive}
        aria-busy={isLoading}
        onPointerDown={handlePointerDown}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        {...rest}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;