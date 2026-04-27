import { type RefObject, useCallback, useEffect, useRef } from 'react';

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
  /** Which event should trigger `onClose`. Outside callbacks still fire on pointerdown. Defaults to pointerdown. */
  closeOn?: 'pointerdown' | 'click';
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
 * - Can close immediately on outside pointerdown, or wait for the matching click
 * - Waiting for click helps avoid mobile tap clicks reaching elements behind a closing overlay
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
  closeOn = 'pointerdown',
  onClose,
}: UseClickOutsideConfig): void {
  const pendingOutsideClickRef = useRef(false);
  const contentRefRef = useRef(contentRef);
  const excludeRefsRef = useRef(excludeRefs);
  const onPointerDownOutsideRef = useRef(onPointerDownOutside);
  const onInteractOutsideRef = useRef(onInteractOutside);
  const onCloseRef = useRef(onClose);
  const closeOnRef = useRef(closeOn);

  contentRefRef.current = contentRef;
  excludeRefsRef.current = excludeRefs;
  onPointerDownOutsideRef.current = onPointerDownOutside;
  onInteractOutsideRef.current = onInteractOutside;
  onCloseRef.current = onClose;
  closeOnRef.current = closeOn;

  const isOutside = useCallback((event: Event): boolean => {
    const path = event.composedPath();
    const target = path[0];
    const currentContentRef = contentRefRef.current;

    if (!(target instanceof Node)) {
      return false;
    }

    if (currentContentRef.current && path.includes(currentContentRef.current)) {
      return false;
    }

    for (const excludeRef of excludeRefsRef.current) {
      const element = excludeRef?.current;
      if (element && path.includes(element)) {
        return false;
      }
    }

    return !path.some(node => node instanceof Element && node.hasAttribute('data-click-outside-ignore'));
  }, []);

  const handlePointerDown = useCallback(
    (event: PointerEvent): void => {
      pendingOutsideClickRef.current = false;
      const currentCloseOn = closeOnRef.current;

      if (!isOutside(event)) {
        return;
      }

      onPointerDownOutsideRef.current?.(event);
      onInteractOutsideRef.current?.(event);

      if (currentCloseOn === 'pointerdown') {
        if (!event.defaultPrevented) {
          onCloseRef.current?.();
        }
        return;
      }

      if (!event.defaultPrevented) {
        pendingOutsideClickRef.current = true;
      }
    },
    [isOutside],
  );

  const handleClick = useCallback(
    (event: MouseEvent): void => {
      const shouldClose = pendingOutsideClickRef.current;
      pendingOutsideClickRef.current = false;

      // Guard the stable listener while effect cleanup catches up after closeOn changes.
      if (closeOnRef.current !== 'click' || !shouldClose || !isOutside(event)) {
        return;
      }

      if (!event.defaultPrevented) {
        onCloseRef.current?.();
      }
    },
    [isOutside],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    document.addEventListener('pointerdown', handlePointerDown);
    if (closeOn === 'click') {
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('click', handleClick);
    };
  }, [closeOn, enabled, handleClick, handlePointerDown]);

  // Separate reset for actual mode/active-state changes
  useEffect(() => {
    if (!enabled || closeOn !== 'click') {
      pendingOutsideClickRef.current = false;
    }
  }, [enabled, closeOn]);
}
