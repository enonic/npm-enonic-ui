import { type RefObject, useEffect, useState } from 'react';

const VIEWPORT_PADDING = 10;

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right';

export type CollisionStrategy = 'flip' | 'shift' | 'shrink';

export type FloatingPosition = {
  top: number;
  left?: number;
  right?: number;
  /**
   * The side the popup is actually positioned on. Equals `preferredSide`
   * unless `collisionStrategy` is `'flip'` and the popup was flipped to fit.
   */
  side: FloatingSide;
  /** The `side` requested via config — useful when `flipped` is true. */
  preferredSide: FloatingSide;
  /** True iff `side !== preferredSide` (i.e. a flip occurred). */
  flipped: boolean;
  /**
   * Maximum height the popup should be clamped to, in pixels. Set only when
   * `collisionStrategy` is `'shrink'` AND the preferred side cannot fit the
   * full content height. Consumers apply via inline style on the popup wrapper.
   */
  maxHeight?: number;
};

export type UseFloatingPositionConfig = {
  /** Whether the floating element is open/visible */
  enabled: boolean;
  /** Reference to the anchor element to position relative to */
  anchorRef: RefObject<HTMLElement> | null;
  /** Reference to the floating content element */
  contentRef: RefObject<HTMLElement> | null;
  /**
   * Preferred side relative to the anchor.
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
  /**
   * How to react when the preferred side cannot fit the popup:
   * - `'flip'` (default) — flip to the opposite side if it fits; else stay on
   *   preferred side and overflow.
   * - `'shift'` — keep preferred side; do not flip; do not clamp height. The
   *   popup may extend past the viewport. Consumer is expected to handle
   *   scroll (page scroll or its own internal scroll bound).
   * - `'shrink'` — keep preferred side; compute available height and return
   *   it as `maxHeight`. Consumer applies it via inline style on the popup
   *   wrapper to enable internal scroll.
   *
   * @default 'flip'
   */
  collisionStrategy?: CollisionStrategy;
};

/**
 * Shared prop surface for popup components that build on `useFloatingPosition`.
 * Mix into a component's `*Props` type to expose consistent positioning controls
 * across the library.
 */
export type FloatingProps = {
  /** Preferred side relative to the anchor. @default 'bottom' */
  side?: FloatingSide;
  /** Alignment along the perpendicular axis. @default 'start' */
  align?: 'start' | 'end';
  /** Collision behavior when the preferred side does not fit. @default 'flip' */
  collisionStrategy?: CollisionStrategy;
};

/**
 * Calculates optimal position for floating elements (menus, dropdowns, submenus) relative
 * to an anchor, with viewport collision handling controlled by `collisionStrategy`.
 *
 * Supports four preferred sides (top/bottom/left/right). Perpendicular-axis alignment is
 * always adjusted to keep the content within the viewport, regardless of strategy.
 *
 * @param config - Configuration object for positioning behavior
 * @returns Position object with coordinates and side info, or null if not yet calculated
 */
export function useFloatingPosition({
  enabled,
  anchorRef,
  contentRef,
  side: preferredSide = 'bottom',
  align = 'start',
  collisionStrategy = 'flip',
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
      let maxHeight: number | undefined;

      if (isVerticalSide) {
        const availableBelow = viewportHeight - anchorRect.bottom - VIEWPORT_PADDING;
        const availableAbove = anchorRect.top - VIEWPORT_PADDING;

        if (preferredSide === 'bottom') {
          top = anchorRect.bottom;
          const overflowsBelow = top + contentHeight > viewportHeight - VIEWPORT_PADDING;
          if (overflowsBelow) {
            if (collisionStrategy === 'flip') {
              const topPosition = anchorRect.top - contentHeight;
              if (topPosition >= VIEWPORT_PADDING) {
                top = topPosition;
                side = 'top';
              }
            } else if (collisionStrategy === 'shrink') {
              maxHeight = Math.max(0, availableBelow);
            }
          }
        } else {
          top = anchorRect.top - contentHeight;
          const overflowsAbove = top < VIEWPORT_PADDING;
          if (overflowsAbove) {
            if (collisionStrategy === 'flip') {
              const bottomPosition = anchorRect.bottom;
              if (bottomPosition + contentHeight <= viewportHeight - VIEWPORT_PADDING) {
                top = bottomPosition;
                side = 'bottom';
              }
            } else if (collisionStrategy === 'shrink') {
              top = anchorRect.top - Math.max(0, availableAbove);
              maxHeight = Math.max(0, availableAbove);
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
        // ? Horizontal sides only honor 'flip'. 'shift' and 'shrink' collapse
        // to "stay on preferred side" — width-clamping a submenu reads worse
        // than letting it overflow.
        if (preferredSide === 'right') {
          left = anchorRect.right;
          if (left + contentWidth > viewportWidth - VIEWPORT_PADDING && collisionStrategy === 'flip') {
            const leftPosition = anchorRect.left - contentWidth;
            if (leftPosition >= VIEWPORT_PADDING) {
              left = leftPosition;
              side = 'left';
            }
          }
        } else {
          const leftPosition = anchorRect.left - contentWidth;
          if (leftPosition < VIEWPORT_PADDING && collisionStrategy === 'flip') {
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

      setPosition({
        top,
        left,
        right,
        side,
        preferredSide,
        flipped: side !== preferredSide,
        maxHeight,
      });
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
  }, [enabled, preferredSide, align, collisionStrategy, anchorRef, contentRef]);

  return position;
}
