import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────
export interface UseDebounceOptions {
  /** Trigger immediately on the leading edge of the delay (default: false) */
  leading?: boolean;
  /** Maximum time in ms the value can be delayed before forcing an update */
  maxWait?: number;
}

export interface DebouncedFunction<Args extends unknown[], Return> {
  (...args: Args): Return | undefined;
  /** Cancels any pending debounced execution */
  cancel: () => void;
  /** Immediately executes any pending debounced call */
  flush: () => void;
  /** Whether a debounced execution is currently queued */
  isPending: () => boolean;
}

// ─── 1. Primary `useDebounce` (Value Hook) ────────────────────────────
/**
 * Debounces a fast-changing state value (such as live search inputs or filter sliders).
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 350);
 *
 * // With maxWait to force periodic updates during continuous typing:
 * const debouncedSearch = useDebounce(search, 350, { maxWait: 1200 });
 * ```
 */
export function useDebounce<T>(
  value: T,
  delay: number = 300,
  options: UseDebounceOptions = {}
): T {
  const { leading = false, maxWait } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const mountedRef = useRef(false);
  const lastCallTimeRef = useRef<number | null>(null);
  const lastInvokeTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip leading update on initial mount
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const now = Date.now();
    const isFirstCallInWindow = lastCallTimeRef.current === null;
    lastCallTimeRef.current = now;

    // ── Leading Edge Execution ──
    if (leading && isFirstCallInWindow) {
      setDebouncedValue(value);
      lastInvokeTimeRef.current = now;
    }

    // Clear existing trailing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // ── Standard Trailing Timer ──
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      lastInvokeTimeRef.current = Date.now();
      lastCallTimeRef.current = null;
      if (maxTimerRef.current) {
        clearTimeout(maxTimerRef.current);
        maxTimerRef.current = null;
      }
    }, delay);

    // ── MaxWait Fallback Guarantee ──
    if (maxWait && !maxTimerRef.current) {
      const timeSinceLastInvoke = now - lastInvokeTimeRef.current;
      const remainingWait = Math.max(0, maxWait - timeSinceLastInvoke);

      maxTimerRef.current = setTimeout(() => {
        setDebouncedValue(value);
        lastInvokeTimeRef.current = Date.now();
        lastCallTimeRef.current = null;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        maxTimerRef.current = null;
      }, remainingWait);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    };
  }, [value, delay, leading, maxWait]);

  return debouncedValue;
}

// ─── 2. Companion `useDebouncedCallback` (Function Hook) ─────────────
/**
 * Creates a stable debounced callback with `cancel()`, `flush()`, and `isPending()`.
 * Ideal for auto-saving form drafts, tracking analytics, or debounced API calls.
 *
 * @example
 * ```tsx
 * const debouncedSave = useDebouncedCallback((data: ProfileData) => {
 *   authService.saveDraft(data);
 * }, 500);
 *
 * // Cancel on unmount or manual trigger:
 * debouncedSave.cancel();
 * ```
 */
export function useDebouncedCallback<Args extends unknown[], Return = void>(
  callback: (...args: Args) => Return,
  delay: number = 300,
  options: UseDebounceOptions = {}
): DebouncedFunction<Args, Return> {
  const { leading = false, maxWait } = options;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Args | null>(null);
  const lastInvokeTimeRef = useRef<number>(0);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (lastArgsRef.current && timerRef.current) {
      const result = callbackRef.current(...lastArgsRef.current);
      lastInvokeTimeRef.current = Date.now();
      cancel();
      return result;
    }
  }, [cancel]);

  const isPending = useCallback(() => {
    return timerRef.current !== null;
  }, []);

  const debouncedFn = useCallback(
    (...args: Args): Return | undefined => {
      const now = Date.now();
      const isFirstCall = timerRef.current === null;
      lastArgsRef.current = args;

      // ── Leading Edge Execution ──
      if (leading && isFirstCall) {
        lastInvokeTimeRef.current = now;
        return callbackRef.current(...args);
      }

      // ── Clear existing timer ──
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // ── Set trailing timer ──
      timerRef.current = setTimeout(() => {
        if (!leading || !isFirstCall) {
          const result = callbackRef.current(...args);
          lastInvokeTimeRef.current = Date.now();
          cancel();
          return result;
        }
        cancel();
      }, delay);

      // ── MaxWait Fallback ──
      if (maxWait && !maxTimerRef.current) {
        const timeSinceLastInvoke = now - lastInvokeTimeRef.current;
        const remainingWait = Math.max(0, maxWait - timeSinceLastInvoke);

        maxTimerRef.current = setTimeout(() => {
          if (lastArgsRef.current) {
            const result = callbackRef.current(...lastArgsRef.current);
            lastInvokeTimeRef.current = Date.now();
            cancel();
            return result;
          }
          cancel();
        }, remainingWait);
      }

      return undefined;
    },
    [delay, leading, maxWait, cancel]
  );

  // Clean up on component unmount
  useEffect(() => {
    return cancel;
  }, [cancel]);

  // ─── Return debounced function with control methods ──────────────
  return useMemo(() => {
    const fn = debouncedFn as DebouncedFunction<Args, Return>;
    fn.cancel = cancel;
    fn.flush = flush;
    fn.isPending = isPending;
    return fn;
  }, [debouncedFn, cancel, flush, isPending]);
}

export default useDebounce;