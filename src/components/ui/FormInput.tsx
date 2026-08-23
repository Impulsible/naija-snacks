import React, {
  useState,
  useId,
  forwardRef,
  useMemo,
  useCallback,
  memo,
} from 'react';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

// ─── Types & Interfaces ─────────────────────────────────────────────
export type InputSize = 'sm' | 'md' | 'lg';

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string;
  name: string;
  error?: string | null;
  helperText?: string;
  success?: boolean | string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  showPasswordToggle?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  required?: boolean;
  optional?: boolean;
  actionLink?: {
    text: string;
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
  };
  size?: InputSize;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  showCharCount?: boolean;
  loading?: boolean;
}

// ─── Size Variations Mapping ────────────────────────────────────────
const SIZE_CONFIGS: Record<
  InputSize,
  {
    container: string;
    input: string;
    iconPaddingLeft: string;
    iconPaddingRight: string;
    iconSize: number;
    text: string;
    label: string;
  }
> = {
  sm: {
    container: 'h-10 px-3 rounded-xl',
    input: 'text-xs',
    iconPaddingLeft: 'pl-9',
    iconPaddingRight: 'pr-9',
    iconSize: 14,
    text: 'text-xs',
    label: 'text-xs',
  },
  md: {
    container: 'h-12 px-4 rounded-2xl',
    input: 'text-sm',
    iconPaddingLeft: 'pl-11',
    iconPaddingRight: 'pr-11',
    iconSize: 17,
    text: 'text-sm',
    label: 'text-xs sm:text-sm',
  },
  lg: {
    container: 'h-14 px-4.5 rounded-2xl',
    input: 'text-base',
    iconPaddingLeft: 'pl-12',
    iconPaddingRight: 'pr-12',
    iconSize: 20,
    text: 'text-base',
    label: 'text-sm sm:text-base',
  },
};

// ─── Password Strength Meter (Optional Helper) ──────────────────────
export const PasswordStrengthMeter = memo(function PasswordStrengthMeter({
  value = '',
}: {
  value?: string;
}) {
  const score = useMemo(() => {
    let s = 0;
    if (!value) return 0;
    if (value.length >= 8) s += 1;
    if (/[A-Z]/.test(value)) s += 1;
    if (/[0-9]/.test(value)) s += 1;
    if (/[^A-Za-z0-9]/.test(value)) s += 1;
    return s;
  }, [value]);

  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-zinc-200',
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-emerald-500',
  ];

  if (!value) return null;

  return (
    <div className="mt-2 space-y-1.5 transition-all">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              score >= step ? strengthColors[score] : 'bg-zinc-200'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500">
        <span>Password strength:</span>
        <span
          className={
            score <= 1
              ? 'text-red-500'
              : score === 2
              ? 'text-orange-500'
              : score === 3
              ? 'text-amber-500'
              : 'text-emerald-600'
          }
        >
          {strengthLabels[score]}
        </span>
      </div>
    </div>
  );
});

// ─── Main FormInput Component ───────────────────────────────────────
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      name,
      id,
      error,
      helperText,
      success,
      icon,
      rightElement,
      prefix,
      suffix,
      showPasswordToggle = false,
      clearable = false,
      onClear,
      required = false,
      optional = false,
      actionLink,
      size = 'md',
      type = 'text',
      disabled = false,
      readOnly = false,
      value,
      defaultValue,
      maxLength,
      showCharCount = false,
      loading = false,
      containerClassName = '',
      inputClassName = '',
      labelClassName = '',
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    // Unique ID generation for accessible ARIA relationships
    const generatedId = useId();
    const inputId = id || `field-${name}-${generatedId}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const successId = `${inputId}-success`;

    // Local States
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentLength, setCurrentLength] = useState(() => {
      if (typeof value === 'string') return value.length;
      if (typeof defaultValue === 'string') return defaultValue.length;
      return 0;
    });

    const isPasswordType = type === 'password';
    const activeType = isPasswordType && showPassword ? 'text' : type;
    const config = SIZE_CONFIGS[size];

    const hasValue = Boolean(
      (typeof value === 'string' && value.length > 0) ||
        (typeof value === 'number' && !isNaN(value))
    );

    // Handlers
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentLength(e.target.value.length);
        onChange?.(e);
      },
      [onChange]
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentLength(0);
        onClear?.();
      },
      [onClear]
    );

    // Compute Border and Focus Ring Aesthetics
    const statusStyles = useMemo(() => {
      if (error) {
        return 'border-red-300 bg-red-50/20 text-red-900 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10';
      }
      if (success) {
        return 'border-emerald-300 bg-emerald-50/20 text-emerald-900 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10';
      }
      if (disabled) {
        return 'border-zinc-200 bg-zinc-100/70 text-zinc-400 cursor-not-allowed';
      }
      if (readOnly) {
        return 'border-zinc-200 bg-zinc-50/80 text-zinc-700 cursor-default';
      }
      return 'border-zinc-200/90 bg-white hover:border-zinc-300 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:shadow-xs';
    }, [error, success, disabled, readOnly]);

    return (
      <div className={`w-full ${containerClassName}`}>
        {/* ── Label Row ──────────────────────────────────────────────── */}
        {(label || actionLink || optional) && (
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label
              htmlFor={inputId}
              className={`block font-bold text-zinc-800 select-none ${config.label} ${labelClassName}`}
            >
              <span className="flex items-center gap-1">
                {label}
                {required && (
                  <span
                    className="text-orange-600 font-bold ml-0.5"
                    title="Required field"
                    aria-hidden="true"
                  >
                    *
                  </span>
                )}
                {optional && !required && (
                  <span className="text-[11px] font-normal text-zinc-400 ml-1">
                    (Optional)
                  </span>
                )}
              </span>
            </label>

            {/* Optional Contextual Link (e.g., "Forgot Password?") */}
            {actionLink && (
              <a
                href={actionLink.href || '#'}
                onClick={actionLink.onClick}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none focus-visible:underline"
              >
                {actionLink.text}
              </a>
            )}
          </div>
        )}

        {/* ── Input Wrapper Box ──────────────────────────────────────── */}
        <div
          className={`group relative flex items-center w-full transition-all duration-200 border shadow-2xs ${config.container} ${statusStyles}`}
        >
          {/* Left Icon */}
          {icon && (
            <span
              className={`absolute left-3.5 sm:left-4 flex items-center justify-center pointer-events-none transition-colors duration-200 ${
                error
                  ? 'text-red-500'
                  : success
                  ? 'text-emerald-500'
                  : isFocused
                  ? 'text-orange-600'
                  : disabled
                  ? 'text-zinc-300'
                  : 'text-zinc-400 group-hover:text-zinc-600'
              }`}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}

          {/* Left Prefix (e.g., Currency Symbol '₦', '+234') */}
          {prefix && (
            <span
              className={`inline-flex items-center text-xs sm:text-sm font-bold select-none pr-1.5 border-r border-zinc-200 mr-2.5 ${
                disabled ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              {prefix}
            </span>
          )}

          {/* Core Input Element */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={activeType}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : success ? successId : helperText ? helperId : undefined
            }
            className={`w-full h-full bg-transparent outline-none placeholder:text-zinc-400 font-medium text-zinc-900 disabled:cursor-not-allowed ${
              config.input
            } ${icon ? config.iconPaddingLeft : ''} ${
              showPasswordToggle || clearable || rightElement || loading || error || success
                ? config.iconPaddingRight
                : ''
            } ${inputClassName}`}
            {...props}
          />

          {/* Right Suffix (e.g., 'kg', 'pcs') */}
          {suffix && !loading && (
            <span
              className={`inline-flex items-center text-xs sm:text-sm font-semibold select-none pl-1.5 border-l border-zinc-200 ml-2 ${
                disabled ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              {suffix}
            </span>
          )}

          {/* ── Right-Side Interactive Slot ─────────────────────────── */}
          <div className="absolute right-3 sm:right-3.5 flex items-center gap-1.5 z-10">
            {/* Loading Spinner */}
            {loading && (
              <span
                className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"
                aria-label="Loading..."
              />
            )}

            {/* Clear Button */}
            {clearable && hasValue && !disabled && !readOnly && !loading && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear input value"
                tabIndex={-1}
                className="w-6 h-6 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 flex items-center justify-center transition-colors"
              >
                <X size={13} />
              </button>
            )}

            {/* Password Visibility Toggle */}
            {showPasswordToggle && isPasswordType && !disabled && !loading && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                tabIndex={0}
                className="w-7 h-7 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                {showPassword ? (
                  <EyeOff size={config.iconSize} />
                ) : (
                  <Eye size={config.iconSize} />
                )}
              </button>
            )}

            {/* Custom Right Element */}
            {rightElement && !loading && (
              <div className="flex items-center">{rightElement}</div>
            )}

            {/* Validation State Icons (If no custom right element) */}
            {!rightElement && !loading && !showPasswordToggle && (
              <>
                {error && (
                  <AlertCircle
                    size={config.iconSize}
                    className="text-red-500 shrink-0 animate-in fade-in zoom-in duration-200"
                  />
                )}
                {success && !error && (
                  <CheckCircle2
                    size={config.iconSize}
                    className="text-emerald-500 shrink-0 animate-in fade-in zoom-in duration-200"
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Bottom Helpers & Status Messages ───────────────────────── */}
        <div className="flex items-start justify-between gap-2 mt-1.5 px-0.5">
          <div className="flex-1 min-w-0">
            {/* Error Message */}
            {error && (
              <p
                id={errorId}
                role="alert"
                className="text-xs font-semibold text-red-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <AlertCircle size={13} className="shrink-0" />
                <span>{error}</span>
              </p>
            )}

            {/* Success Message */}
            {!error && success && typeof success === 'string' && (
              <p
                id={successId}
                className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <CheckCircle2 size={13} className="shrink-0" />
                <span>{success}</span>
              </p>
            )}

            {/* Default Helper Text */}
            {!error && !success && helperText && (
              <p id={helperId} className="text-xs font-medium text-zinc-500">
                {helperText}
              </p>
            )}
          </div>

          {/* Character Count Display */}
          {showCharCount && maxLength && (
            <span
              className={`text-[11px] font-mono font-medium shrink-0 tabular-nums ${
                currentLength >= maxLength ? 'text-red-500 font-bold' : 'text-zinc-400'
              }`}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;