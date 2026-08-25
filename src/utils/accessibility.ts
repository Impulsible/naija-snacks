import React from 'react';

// ─── 1. Focus Ring Presets (WCAG 2.2 AA / AAA Compliant) ─────────────
export const focusStyles = {
  /** Standard primary focus ring with smooth offset */
  default:
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-shadow',

  /** Backward-compatible alias for existing imports */
  outline:
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-shadow',

  /** For dark obsidian panels, dark sidebars, and black floating action buttons */
  dark:
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 transition-shadow',

  /** For dangerous actions (e.g., deleting orders, clearing carts, or removing items) */
  destructive:
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-shadow',

  /** Inset ring for tight spaces, pill tabs, and nested table actions */
  inset:
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset transition-shadow',

  /** Subtle ring for secondary controls and form field inputs */
  subtle:
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1 focus-visible:ring-offset-white transition-shadow',

  /** Composite search bars & multi-element containers */
  within:
    'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-white transition-shadow',
} as const;

// ─── 2. Screen Reader Only Class ─────────────────────────────────────
export const srOnlyClass =
  'sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-stone-900 focus:rounded-xl focus:shadow-2xl focus:border focus:border-amber-950/10';

// ─── 3. ARIA Labels & Dynamic Formatters ─────────────────────────────
export const ariaLabels = {
  // Static Core Actions (Backward Compatible)
  closeModal: 'Close modal dialog',
  openMenu: 'Open main navigation menu',
  closeMenu: 'Close main navigation menu',
  openCart: 'Open shopping cart drawer',
  closeCart: 'Close shopping cart drawer',
  addToCart: 'Add snack to cart',
  removeFromCart: 'Remove item from cart',
  increaseQuantity: 'Increase snack quantity by 1',
  decreaseQuantity: 'Decrease snack quantity by 1',
  scrollToTop: 'Scroll back to top of page',
  toggleDarkMode: 'Toggle interface visual theme',
  searchSnacks: 'Search snack catalog by keyword',
  filterCategory: 'Filter snacks by category',

  // Dynamic Generator Functions (Rich UX)
  productCard: (name: string, price?: string) =>
    price ? `View details for ${name}, priced at ${price}` : `View details for ${name}`,
  
  addItem: (name: string) => `Add ${name} to shopping cart`,
  removeItem: (name: string) => `Remove ${name} from shopping cart`,
  
  updateQuantity: (name: string, currentQty: number) =>
    `Current quantity for ${name} is ${currentQty}. Adjust quantity.`,

  itemCount: (count: number) =>
    `${count} ${count === 1 ? 'snack item' : 'snack items'} currently in shopping cart`,

  orderStatus: (orderNumber: string, status: string) =>
    `Order reference ${orderNumber} is currently ${status.replace('_', ' ')}`,

  pagination: (currentPage: number, totalPages: number) =>
    `Page ${currentPage} of ${totalPages}`,
};

// ─── 4. Keyboard Navigation Handlers ─────────────────────────────────

/**
 * Standard trigger handler for Enter and Spacebar keys on custom buttons or cards.
 */
export const keyboardHandler = (
  e: React.KeyboardEvent,
  action: () => void
) => {
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    action();
  }
};

/**
 * Executes a callback when the Escape key is pressed (for closing modals, drawers, or search overlays).
 */
export const handleEscape = (
  e: React.KeyboardEvent | KeyboardEvent,
  action: () => void
) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    e.preventDefault();
    action();
  }
};

/**
 * Composable multi-key action dispatcher for rich interactive components.
 *
 * @example
 * ```tsx
 * const onKeyDown = createKeyHandler({
 *   Enter: () => openItem(),
 *   Escape: () => closeDrawer(),
 *   ArrowDown: () => highlightNext(),
 *   ArrowUp: () => highlightPrev(),
 * });
 * ```
 */
export const createKeyHandler = (
  keyMap: Partial<Record<string, (e: React.KeyboardEvent) => void>>
) => {
  return (e: React.KeyboardEvent) => {
    const handler = keyMap[e.key];
    if (handler) {
      e.preventDefault();
      handler(e);
    }
  };
};

// ─── 5. Screen Reader Live Announcements ─────────────────────────────
/**
 * Programmatically announces dynamic status changes to screen readers via an accessible live region.
 *
 * @param message The notification string to be read aloud.
 * @param politeness 'polite' (waits for speaker to pause) | 'assertive' (interrupts immediately).
 */
export const announceToScreenReader = (
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
) => {
  if (typeof document === 'undefined') return;

  const liveRegionId = `a11y-live-announcer-${politeness}`;
  let announcer = document.getElementById(liveRegionId);

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = liveRegionId;
    announcer.setAttribute('aria-live', politeness);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }

  // Clear previous message then inject new message
  announcer.textContent = '';
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = message;
    }
  }, 50);
};

export default {
  focusStyles,
  srOnlyClass,
  ariaLabels,
  keyboardHandler,
  handleEscape,
  createKeyHandler,
  announceToScreenReader,
};