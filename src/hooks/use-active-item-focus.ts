import { type RefObject, useEffect } from 'react';

export type UseActiveItemFocusConfig = {
  /** Reference to the item element to focus */
  ref: RefObject<HTMLElement> | null;
  /** Whether this item is currently active */
  isActive: boolean;
  /** Whether this item is disabled */
  disabled: boolean;
  /**
   * Focus mode - determines when to auto-focus:
   * - 'roving-tabindex': Auto-focus when active (default)
   * - 'activedescendant': Don't auto-focus (container manages focus)
   */
  focusMode?: 'roving-tabindex' | 'activedescendant';
  /**
   * When true, only focus if focus is already within the container.
   * This prevents mouse hover from causing focus rings when navigating with keyboard.
   *
   * @example
   * In Listbox, we only want to auto-focus during keyboard navigation,
   * not when the user hovers with their mouse. We check if focus is
   * already within the listbox to determine if keyboard nav is active.
   */
  checkFocusWithin?: {
    /** Enable the focus-within check */
    enabled: boolean;
    /** ARIA role of the container to check (e.g., 'listbox', 'menu') */
    containerRole: string;
  };
};

/**
 * Automatically focuses an element when it becomes active, typically used
 * in keyboard navigation patterns like roving tabindex.
 *
 * This hook handles the common pattern where an item should receive DOM focus
 * when it becomes the "active" item in a list, menu, or navigation structure.
 * It includes safeguards to:
 * - Only focus when not disabled
 * - Only focus when not already focused (prevents infinite loops)
 * - Optionally check if focus is within the container (prevents hover-induced focus)
 * - Respect focus mode (roving-tabindex vs activedescendant)
 *
 * @param config - Configuration object for auto-focus behavior
 *
 * @example
 * ```tsx
 * // Basic usage (Menu item)
 * function MenuItem() {
 *   const itemRef = useRef<HTMLDivElement>(null);
 *   const { active } = useMenu();
 *   const isActive = active === id;
 *
 *   useActiveItemFocus({
 *     ref: itemRef,
 *     isActive,
 *     disabled: false,
 *   });
 *
 *   return <div ref={itemRef}>Item</div>;
 * }
 *
 * // With focus-within check (Listbox item)
 * function ListboxItem() {
 *   const itemRef = useRef<HTMLDivElement>(null);
 *   const { active, focusMode } = useListbox();
 *   const isActive = active === id;
 *
 *   useActiveItemFocus({
 *     ref: itemRef,
 *     isActive,
 *     disabled: false,
 *     focusMode,
 *     checkFocusWithin: {
 *       enabled: true,
 *       containerRole: 'listbox',
 *     },
 *   });
 *
 *   return <div ref={itemRef}>Item</div>;
 * }
 * ```
 */
export function useActiveItemFocus({
  ref,
  isActive,
  disabled,
  focusMode = 'roving-tabindex',
  checkFocusWithin,
}: UseActiveItemFocusConfig): void {
  useEffect(() => {
    if (!ref?.current) {
      return;
    }

    // Don't focus in activedescendant mode (container manages focus)
    if (focusMode === 'activedescendant') {
      return;
    }

    // Don't focus if disabled or not active
    if (disabled || !isActive) {
      return;
    }

    // Don't focus if already focused
    if (document.activeElement === ref.current) {
      return;
    }

    // Optional: Check if focus is within the container
    // This prevents hover from causing focus when only keyboard nav should focus
    if (checkFocusWithin?.enabled) {
      const container = ref.current.closest(`[role="${checkFocusWithin.containerRole}"]`);
      const focusWithinContainer = container?.contains(document.activeElement);

      if (!focusWithinContainer) {
        return;
      }
    }

    ref.current.focus();
  }, [isActive, disabled, focusMode, checkFocusWithin, ref]);
}
