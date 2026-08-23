import React, {
  forwardRef,
  useId,
  useEffect,
  useRef,
  memo,
} from 'react';
import { Check, Minus, AlertCircle } from 'lucide-react';

// ─── Types & Interfaces ─────────────────────────────────────────────
export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface FormCheckboxLink {
  text: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
}

export interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label: React.ReactNode;
  name: string;
  description?: React.ReactNode;
  error?: string | null;
  link?: FormCheckboxLink;
  indeterminate?: boolean;
  size?: CheckboxSize;
  containerClassName?: string;
  labelClassName?: string;
  card?: boolean; // Renders as an interactive selectable card
}

// ─── Size Configurations ────────────────────────────────────────────
const SIZE_CONFIGS: Record<
  CheckboxSize,
  {
    box: string;
    iconSize: number;
    label: string;
    description: string;
    gap: string;
    offset: string;
  }
> = {
  sm: {
    box: 'w-4 h-4 rounded-md',
    iconSize: 11,
    label: 'text-xs',
    description: 'text-[11px]',
    gap: 'gap-2.5',
    offset: 'mt-0.5',
  },
  md: {
    box: 'w-5 h-5 rounded-lg',
    iconSize: 13,
    label: 'text-sm',
    description: 'text-xs',
    gap: 'gap-3',
    offset: 'mt-0.5',
  },
  lg: {
    box: 'w-6 h-6 rounded-xl',
    iconSize: 16,
    label: 'text-base',
    description: 'text-sm',
    gap: 'gap-3.5',
    offset: 'mt-0.5',
  },
};

// ─── Main FormCheckbox Component ────────────────────────────────────
export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    {
      label,
      name,
      id,
      checked = false,
      onChange,
      description,
      error,
      link,
      indeterminate = false,
      disabled = false,
      required = false,
      size = 'md',
      card = false,
      containerClassName = '',
      labelClassName = '',
      className = '',
      ...props
    },
    forwardedRef
  ) => {
    // Unique ID generation for accessible ARIA relationships
    const generatedId = useId();
    const inputId = id || `checkbox-${name}-${generatedId}`;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-desc`;

    const internalRef = useRef<HTMLInputElement>(null);
    const config = SIZE_CONFIGS[size];

    // Combine forwarded ref and internal ref
    useEffect(() => {
      const ref = forwardedRef || internalRef;
      if (typeof ref === 'function') {
        ref(internalRef.current);
      } else if (ref && 'current' in ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current =
          internalRef.current;
      }
    }, [forwardedRef]);

    // Handle HTML indeterminate property assignment
    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Prevents the parent <label> from automatically toggling the checkbox when the link is clicked
      e.stopPropagation();
      link?.onClick?.(e);
    };

    return (
      <div className={`w-full ${containerClassName}`}>
        <label
          htmlFor={inputId}
          className={`group relative flex items-start ${config.gap} select-none transition-all duration-200 ${
            disabled
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer'
          } ${
            card
              ? `p-4 rounded-2xl border transition-all ${
                  checked
                    ? 'bg-orange-50/40 border-orange-300 ring-1 ring-orange-400/30'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50'
                } ${error ? 'border-red-300 bg-red-50/20' : ''}`
              : ''
          }`}
        >
          {/* Hidden native input maintaining full accessibility */}
          <input
            ref={internalRef}
            type="checkbox"
            id={inputId}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : description ? descriptionId : undefined
            }
            className="peer sr-only"
            {...props}
          />

          {/* ── Custom Checkbox Visual Box ─────────────────────────── */}
          <div
            className={`relative flex items-center justify-center shrink-0 border transition-all duration-200 shadow-2xs ${
              config.box
            } ${config.offset} ${
              disabled
                ? 'bg-zinc-100 border-zinc-300 text-zinc-400'
                : error
                ? 'border-red-500 bg-white group-hover:border-red-600 peer-focus-visible:ring-4 peer-focus-visible:ring-red-500/15'
                : checked || indeterminate
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-600 text-white shadow-xs shadow-orange-500/25'
                : 'bg-white border-zinc-300 group-hover:border-zinc-400'
            } peer-focus-visible:ring-4 peer-focus-visible:ring-orange-500/20 peer-focus-visible:border-orange-500 ${className}`}
            aria-hidden="true"
          >
            {/* Checked Icon */}
            {checked && !indeterminate && (
              <Check
                size={config.iconSize}
                className="stroke-[3] animate-in zoom-in-50 duration-150 text-white"
              />
            )}

            {/* Indeterminate Minus Icon */}
            {indeterminate && (
              <Minus
                size={config.iconSize}
                className="stroke-[3] animate-in zoom-in-50 duration-150 text-white"
              />
            )}
          </div>

          {/* ── Text Content ───────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <span
              className={`block font-medium leading-snug transition-colors ${
                config.label
              } ${
                disabled
                  ? 'text-zinc-400'
                  : checked
                  ? 'text-zinc-900 font-semibold'
                  : 'text-zinc-700 group-hover:text-zinc-900'
              } ${labelClassName}`}
            >
              {label}
              {required && (
                <span
                  className="text-orange-600 font-bold ml-1"
                  title="Required"
                >
                  *
                </span>
              )}
              {/* Contextual Link */}
              {link && (
                <>
                  {' '}
                  <a
                    href={link.href || '#'}
                    onClick={handleLinkClick}
                    target={link.target}
                    rel={
                      link.target === '_blank'
                        ? link.rel || 'noopener noreferrer'
                        : link.rel
                    }
                    className="font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2 decoration-orange-300 hover:decoration-orange-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
                  >
                    {link.text}
                  </a>
                </>
              )}
            </span>

            {/* Optional Description / Subtitle */}
            {description && (
              <p
                id={descriptionId}
                className={`mt-0.5 text-zinc-500 leading-normal ${config.description}`}
              >
                {description}
              </p>
            )}
          </div>
        </label>

        {/* ── Error Message Banner ─────────────────────────────────── */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 ml-0 text-xs font-semibold text-red-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <AlertCircle size={13} className="shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

export default memo(FormCheckbox);