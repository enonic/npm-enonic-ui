import { type RefObject, useCallback, useEffect } from 'react';

export type UseClickOutsideConfig = {
  /** Whether the click outside listener is active */
  enabled: boolean;
  /** Reference to the content element (clicks inside are ignored) */
  contentRef: RefObject<HTMLElement>;
  /**
   * Optional references to elements that should be excluded from "outside" detection.
   * Typically used for trigger buttons that toggle the content visibility.
   */
  excludeRefs?: (RefObject<HTMLElement> | undefined)[];
  /** Callback when pointer down occurs outside */
  onPointerDownOutside?: (event: PointerEvent) => void;
  /** Callback when any interaction occurs outside */
  onInteractOutside?: (event: Event) => void;
  /**
   * Callback to close/hide the content.
   * Only called if event.defaultPrevented is false.
   */
  onClose?: () => void;
};

/**
 * Detects clicks/pointer events outside a content element and triggers callbacks.
 *
 * This hook is commonly used for dismissible UI elements like dropdowns, menus,
 * dialogs, and popovers that should close when the user clicks outside.
 *
 * Features:
 * - Ignores clicks inside the content element
 * - Supports excluding additional elements (e.g., trigger buttons)
 * - Ignores clicks inside elements with `data-click-outside-ignore` attribute
 * - Respects event.defaultPrevented to allow custom handling
 * - Only active when enabled
 * - Properly cleans up event listeners
 *
 * @param config - Configuration object for click outside detection
 *
 * @example
 * ```tsx
 * // Basic usage (Dialog)
 * function Dialog() {
 *   const [open, setOpen] = useState(false);
 *   const contentRef = useRef<HTMLDivElement>(null);
 *
 *   useClickOutside({
 *     enabled: open,
 *     contentRef,
 *     onClose: () => setOpen(false),
 *   });
 *
 *   if (!open) return null;
 *   return <div ref={contentRef}>Dialog content</div>;
 * }
 *
 * // With trigger exclusion (Menu)
 * function Menu() {
 *   const [open, setOpen] = useState(false);
 *   const triggerRef = useRef<HTMLButtonElement>(null);
 *   const contentRef = useRef<HTMLDivElement>(null);
 *
 *   useClickOutside({
 *     enabled: open,
 *     contentRef,
 *     excludeRefs: [triggerRef],
 *     onPointerDownOutside: (e) => console.log('Outside click', e),
 *     onInteractOutside: (e) => console.log('Outside interaction', e),
 *     onClose: () => setOpen(false),
 *   });
 *
 *   return (
 *     <>
 *       <button ref={triggerRef}>Open Menu</button>
 *       {open && <div ref={contentRef}>Menu content</div>}
 *     </>
 *   );
 * }
 *
 * // With custom close prevention
 * function CustomDialog() {
 *   const [open, setOpen] = useState(false);
 *   const contentRef = useRef<HTMLDivElement>(null);
 *
 *   useClickOutside({
 *     enabled: open,
 *     contentRef,
 *     onPointerDownOutside: (e) => {
 *       const shouldClose = confirm('Close dialog?');
 *       if (!shouldClose) {
 *         e.preventDefault(); // Prevents onClose from being called
 *       }
 *     },
 *     onClose: () => setOpen(false),
 *   });
 *
 *   if (!open) return null;
 *   return <div ref={contentRef}>Dialog content</div>;
 * }
 * ```
 */
export function useClickOutside({
  enabled,
  contentRef,
  excludeRefs = [],
  onPointerDownOutside,
  onInteractOutside,
  onClose,
}: UseClickOutsideConfig): void {
  const handlePointerDown = useCallback(
    (event: PointerEvent): void => {
      // ? Use composedPath() so shadow-DOM retargeting doesn't hide the real origin
      const path = event.composedPath();
      const target = path[0];

      if (!(target instanceof Node)) {
        return;
      }

      if (contentRef.current && path.includes(contentRef.current)) {
        return;
      }

      for (const excludeRef of excludeRefs) {
        const element = excludeRef?.current;
        if (element && path.includes(element)) {
          return;
        }
      }

      if (path.some(node => node instanceof Element && node.hasAttribute('data-click-outside-ignore'))) {
        return;
      }

      onPointerDownOutside?.(event);
      onInteractOutside?.(event);

      if (!event.defaultPrevented) {
        onClose?.();
      }
    },
    [contentRef, excludeRefs, onPointerDownOutside, onInteractOutside, onClose],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [enabled, handlePointerDown]);
}
