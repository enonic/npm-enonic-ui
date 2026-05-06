import { type RefObject, useEffect, useState } from 'react';

const VIEWPORT_PADDING = 10;

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right';

export type FloatingPosition = {
  top: number;
  left?: number;
  right?: number;
  /** Which side the popup is positioned relative to the anchor (post-flip) */
  side: FloatingSide;
};

export type UseFloatingPositionConfig = {
  /** Whether the floating element is open/visible */
  enabled: boolean;
  /** Reference to the anchor element to position relative to */
  anchorRef: RefObject<HTMLElement> | null;
  /** Reference to the floating content element */
  contentRef: RefObject<HTMLElement> | null;
  /**
   * Preferred side relative to the anchor. Flips to the opposite side when
   * the content would overflow the viewport.
   * @default 'bottom'
   */
  side?: FloatingSide;
  /**
   * Alignment along the perpendicular axis:
   * - For `side` top/bottom: horizontal alignment ('start' = left, 'end' = right)
   * - For `side` left/right: vertical alignment ('start' = top, 'end' = bottom)
   * @default 'start'
   */
  align?: 'start' | 'end';
};

/**
 * Calculates optimal position for floating elements (menus, dropdowns, submenus) relative
 * to an anchor, with automatic viewport collision detection and flip behavior.
 *
 * Supports four preferred sides (top/bottom/left/right). When the content would overflow
 * the viewport on the preferred side, it flips to the opposite side. Perpendicular-axis
 * alignment is adjusted to keep the content within the viewport.
 *
 * @param config - Configuration object for positioning behavior
 * @returns Position object with top and left/right coordinates, or null if not yet calculated
 */
export function useFloatingPosition({
  enabled,
  anchorRef,
  contentRef,
  side: preferredSide = 'bottom',
  align = 'start',
}: UseFloatingPositionConfig): FloatingPosition | null {
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  useEffect(() => {
    if (!enabled || !anchorRef?.current || !contentRef?.current) {
      return;
    }

    const updatePosition = (): void => {
      if (!anchorRef.current || !contentRef.current) return;

      const anchorRect = anchorRef.current.getBoundingClientRect();
      // ! offsetWidth/offsetHeight (layout box), not getBoundingClientRect() — the
      // latter includes CSS transforms, so a popup mid-zoom-in animation reports
      // ~95% of its real size and gets placed too close to the anchor.
      const contentWidth = contentRef.current.offsetWidth;
      const contentHeight = contentRef.current.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const isVerticalSide = preferredSide === 'top' || preferredSide === 'bottom';

      let top: number;
      let left: number | undefined;
      let right: number | undefined;
      let side: FloatingSide = preferredSide;

      if (isVerticalSide) {
        // Vertical sides (top/bottom): primary axis is Y, align is horizontal
        if (preferredSide === 'bottom') {
          top = anchorRect.bottom;
          if (top + contentHeight > viewportHeight - VIEWPORT_PADDING) {
            const topPosition = anchorRect.top - contentHeight;
            if (topPosition >= VIEWPORT_PADDING) {
              top = topPosition;
              side = 'top';
            }
          }
        } else {
          top = anchorRect.top - contentHeight;
          if (top < VIEWPORT_PADDING) {
            const bottomPosition = anchorRect.bottom;
            if (bottomPosition + contentHeight <= viewportHeight - VIEWPORT_PADDING) {
              top = bottomPosition;
              side = 'bottom';
            }
          }
        }

        if (align === 'start') {
          left = anchorRect.left;
          if (left + contentWidth > viewportWidth - VIEWPORT_PADDING) {
            left = undefined;
            right = viewportWidth - anchorRect.right;
          }
        } else {
          right = viewportWidth - anchorRect.right;
          if (anchorRect.right - contentWidth < VIEWPORT_PADDING) {
            right = undefined;
            left = anchorRect.left;
          }
        }
      } else {
        // Horizontal sides (left/right): primary axis is X, align is vertical
        if (preferredSide === 'right') {
          left = anchorRect.right;
          if (left + contentWidth > viewportWidth - VIEWPORT_PADDING) {
            const leftPosition = anchorRect.left - contentWidth;
            if (leftPosition >= VIEWPORT_PADDING) {
              left = leftPosition;
              side = 'left';
            }
          }
        } else {
          const leftPosition = anchorRect.left - contentWidth;
          if (leftPosition < VIEWPORT_PADDING) {
            const rightPosition = anchorRect.right;
            if (rightPosition + contentWidth <= viewportWidth - VIEWPORT_PADDING) {
              left = rightPosition;
              side = 'right';
            } else {
              left = leftPosition;
            }
          } else {
            left = leftPosition;
          }
        }

        if (align === 'start') {
          top = anchorRect.top;
          if (top + contentHeight > viewportHeight - VIEWPORT_PADDING) {
            top = Math.max(VIEWPORT_PADDING, viewportHeight - contentHeight - VIEWPORT_PADDING);
          }
        } else {
          top = anchorRect.bottom - contentHeight;
          if (top < VIEWPORT_PADDING) {
            top = VIEWPORT_PADDING;
          }
        }
      }

      setPosition({ top, left, right, side });
    };

    updatePosition();

    // Recompute when the floating content or anchor resizes — e.g. dropdown
    // shrinks after filtering. Without this, a popup placed above its anchor
    // detaches from it because `top` is stored against the old height.
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(contentRef.current);
    resizeObserver.observe(anchorRef.current);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [enabled, preferredSide, align, anchorRef, contentRef]);

  return position;
}
