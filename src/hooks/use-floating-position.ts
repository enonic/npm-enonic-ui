import { type RefObject, useEffect, useState } from 'react';

const VIEWPORT_PADDING = 10;

export type FloatingPosition = {
  top: number;
  left?: number;
  right?: number;
  /** Which side the popup is positioned relative to the trigger */
  side: 'top' | 'bottom';
};

export type UseFloatingPositionConfig = {
  /** Whether the floating element is open/visible */
  enabled: boolean;
  /** Reference to the trigger element */
  triggerRef: RefObject<HTMLElement> | null;
  /** Reference to the floating content element */
  contentRef: RefObject<HTMLElement> | null;
  /** Horizontal alignment relative to trigger */
  align?: 'start' | 'end';
};

/**
 * Calculates optimal position for floating elements (menus, dropdowns) relative to a trigger,
 * with automatic viewport collision detection and flip behavior.
 *
 * This hook handles:
 * - Positioning below trigger with configurable alignment
 * - Vertical flipping when overflowing bottom edge
 * - Horizontal adjustment to stay within viewport bounds
 * - Automatic repositioning on window resize and scroll
 *
 * @param config - Configuration object for positioning behavior
 * @returns Position object with top and left/right coordinates, or null if not yet calculated
 *
 * @example
 * ```tsx
 * function Menu() {
 *   const triggerRef = useRef<HTMLButtonElement>(null);
 *   const contentRef = useRef<HTMLDivElement>(null);
 *   const position = useFloatingPosition({
 *     enabled: open,
 *     triggerRef,
 *     contentRef,
 *     align: 'start'
 *   });
 *
 *   return (
 *     <div
 *       ref={contentRef}
 *       style={{
 *         position: 'fixed',
 *         top: position ? `${position.top}px` : '0',
 *         left: position?.left !== undefined ? `${position.left}px` : undefined,
 *         right: position?.right !== undefined ? `${position.right}px` : undefined,
 *       }}
 *     >
 *       Menu content
 *     </div>
 *   );
 * }
 * ```
 */
export function useFloatingPosition({
  enabled,
  triggerRef,
  contentRef,
  align = 'start',
}: UseFloatingPositionConfig): FloatingPosition | null {
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  useEffect(() => {
    if (!enabled || !triggerRef?.current || !contentRef?.current) {
      return;
    }

    const updatePosition = (): void => {
      if (!triggerRef.current || !contentRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = triggerRect.bottom;
      let left: number | undefined;
      let right: number | undefined;
      let side: 'top' | 'bottom' = 'bottom';

      // Vertical positioning: flip if overflows bottom
      if (top + contentRect.height > viewportHeight - VIEWPORT_PADDING) {
        const topPosition = triggerRect.top - contentRect.height;
        if (topPosition >= VIEWPORT_PADDING) {
          top = topPosition;
          side = 'top';
        }
      }

      // Horizontal positioning based on align
      if (align === 'start') {
        left = triggerRect.left;
        // Flip to right if overflows
        if (left + contentRect.width > viewportWidth - VIEWPORT_PADDING) {
          left = undefined;
          right = viewportWidth - triggerRect.right;
        }
      } else {
        // align === 'end'
        right = viewportWidth - triggerRect.right;
        // Flip to left if overflows
        if (triggerRect.right - contentRect.width < VIEWPORT_PADDING) {
          right = undefined;
          left = triggerRect.left;
        }
      }

      setPosition({ top, left, right, side });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [enabled, align, triggerRef, contentRef]);

  return position;
}
