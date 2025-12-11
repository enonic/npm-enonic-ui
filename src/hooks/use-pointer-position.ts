import { type RefObject, useEffect, useState } from 'react';

const VIEWPORT_PADDING = 10;

export type PointerPosition = {
  top: number;
  left: number;
};

export type UsePointerPositionConfig = {
  /** Whether positioning is enabled/active */
  enabled: boolean;
  /** Mouse/pointer position where the menu was triggered */
  mousePosition: { x: number; y: number } | null;
  /** Reference to the floating content element */
  contentRef: RefObject<HTMLElement> | null;
};

/**
 * Calculates optimal position for floating content relative to pointer coordinates,
 * with automatic viewport collision detection and flip behavior.
 *
 * This hook handles:
 * - Positioning at pointer cursor location
 * - Horizontal flipping when overflowing right edge
 * - Vertical flipping when overflowing bottom edge
 * - Automatic repositioning on window resize
 *
 * @param config - Configuration object for positioning behavior
 * @returns Position object with top and left coordinates, or null if not yet calculated
 *
 * @example
 * ```tsx
 * function ContextMenu() {
 *   const contentRef = useRef<HTMLDivElement>(null);
 *   const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
 *
 *   const position = usePointerPosition({
 *     enabled: open,
 *     mousePosition,
 *     contentRef,
 *   });
 *
 *   return (
 *     <div
 *       ref={contentRef}
 *       style={{
 *         position: 'fixed',
 *         top: position ? `${position.top}px` : '0',
 *         left: position ? `${position.left}px` : '0',
 *       }}
 *     >
 *       Context menu content
 *     </div>
 *   );
 * }
 * ```
 */
export function usePointerPosition({
  enabled,
  mousePosition,
  contentRef,
}: UsePointerPositionConfig): PointerPosition | null {
  const [position, setPosition] = useState<PointerPosition | null>(null);

  useEffect(() => {
    if (!enabled || !mousePosition || !contentRef?.current) {
      return;
    }

    const updatePosition = (): void => {
      if (!contentRef.current) return;

      const contentRect = contentRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = mousePosition.y;
      let left = mousePosition.x;

      // Vertical positioning: flip if overflows bottom
      if (top + contentRect.height > viewportHeight - VIEWPORT_PADDING) {
        const topPosition = mousePosition.y - contentRect.height;
        if (topPosition >= VIEWPORT_PADDING) {
          top = topPosition;
        } else {
          // If it doesn't fit above either, position at viewport edge with padding
          top = Math.max(VIEWPORT_PADDING, viewportHeight - contentRect.height - VIEWPORT_PADDING);
        }
      }

      // Horizontal positioning: flip if overflows right
      if (left + contentRect.width > viewportWidth - VIEWPORT_PADDING) {
        const leftPosition = mousePosition.x - contentRect.width;
        if (leftPosition >= VIEWPORT_PADDING) {
          left = leftPosition;
        } else {
          // If it doesn't fit on left either, position at viewport edge with padding
          left = Math.max(VIEWPORT_PADDING, viewportWidth - contentRect.width - VIEWPORT_PADDING);
        }
      }

      setPosition({ top, left });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [enabled, mousePosition, contentRef]);

  // Reset position when menu closes
  useEffect(() => {
    if (!enabled) {
      setPosition(null);
    }
  }, [enabled]);

  return position;
}
