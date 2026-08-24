import { type CSSProperties, type RefObject, useEffect, useState } from 'react';

import { isShadowRoot } from '@/utils/dom';

const VIEWPORT_PADDING = 10;

/** Below this, `'shrink'` yields to the opposite side rather than render a sliver. */
const MIN_SHRINK_HEIGHT = 96;

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right';

export type CollisionStrategy = 'flip' | 'shrink';

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
  /** True when the popup could not use `preferredSide`. */
  flipped: boolean;
  /**
   * Maximum height the popup should be clamped to, in pixels. Set whenever
   * `collisionStrategy` is `'shrink'`. Consumers apply it via inline style on
   * the popup wrapper; it only takes effect when the content is taller.
   *
   * A popup whose items are direct children also needs `overflow-y-auto` to
   * scroll. One that wraps a scrollable child (a listbox or viewport) must not:
   * constraining the wrapper alone keeps the child the scroller, which is what
   * scroll-active-into-view relies on.
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
   *   the preferred side and overflow.
   * - `'shrink'` — keep the preferred side and return the available space as
   *   `maxHeight`, which the consumer applies to enable internal scroll. Falls
   *   back to the opposite side when the preferred one is too cramped to use.
   *
   * @default 'flip'
   */
  collisionStrategy?: CollisionStrategy;
};

/**
 * Projects a position into an inline style, keeping the coordinate fields and
 * dropping the descriptive ones (`side`, `preferredSide`, `flipped`) that would
 * otherwise leak into the DOM as invalid CSS.
 */
export function toFloatingStyle(position: FloatingPosition | null): CSSProperties {
  return {
    top: position?.top,
    left: position?.left,
    right: position?.right,
    maxHeight: position?.maxHeight,
  };
}

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

    // ! The anchor-gap margin (`mt-2` / `-mt-2`) sits outside the border box and
    // eats into the space a clamp may claim. Its magnitude is fixed for the
    // popup's lifetime, so read it once rather than on every scroll tick — and
    // never the signed value, which flips with `side` and would feed back.
    const anchorGap =
      collisionStrategy === 'shrink'
        ? Math.abs(Number.parseFloat(window.getComputedStyle(contentRef.current).marginTop)) || 0
        : 0;

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
        const availableBelow = viewportHeight - anchorRect.bottom - VIEWPORT_PADDING - anchorGap;
        const availableAbove = anchorRect.top - VIEWPORT_PADDING - anchorGap;

        if (collisionStrategy === 'shrink') {
          // ! Derive maxHeight from the anchor and viewport only. Gating it on
          // contentHeight feeds the clamp back into its own input through the
          // ResizeObserver, oscillating the popup every frame.
          const availablePreferred = preferredSide === 'bottom' ? availableBelow : availableAbove;
          const availableOpposite = preferredSide === 'bottom' ? availableAbove : availableBelow;

          if (availablePreferred < MIN_SHRINK_HEIGHT && availableOpposite > availablePreferred) {
            side = preferredSide === 'bottom' ? 'top' : 'bottom';
          }

          maxHeight = Math.max(0, side === 'bottom' ? availableBelow : availableAbove);
          top = side === 'bottom' ? anchorRect.bottom : anchorRect.top - Math.min(contentHeight, maxHeight);
        } else if (preferredSide === 'bottom') {
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
        // ? Horizontal sides always flip on overflow — clamping width would
        // truncate labels. collisionStrategy governs the height clamp instead.
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
          left = anchorRect.left - contentWidth;
          if (left < VIEWPORT_PADDING) {
            const rightPosition = anchorRect.right;
            if (rightPosition + contentWidth <= viewportWidth - VIEWPORT_PADDING) {
              left = rightPosition;
              side = 'right';
            }
          }
        }

        if (collisionStrategy === 'shrink') {
          maxHeight = Math.max(0, viewportHeight - 2 * VIEWPORT_PADDING);
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

      // ! `position: fixed` only resolves against the viewport while no ancestor of the portal
      // layer's host creates a fixed containing block (transform, filter, contain: paint, ...).
      // When one does, re-express the viewport-relative coordinates against its padding box.
      // `offsetParent` reports that ancestor for a fixed element in Chromium and WebKit; Gecko
      // returns `null` there and keeps the uncompensated position — the documented "keep such
      // properties off the host's ancestor chain" caveat applies. Offsets only; scale is not
      // compensated.
      const containingBlock = contentRef.current.offsetParent;
      if (containingBlock != null) {
        const blockRect = containingBlock.getBoundingClientRect();
        top -= blockRect.top + containingBlock.clientTop;
        if (left != null) {
          left -= blockRect.left + containingBlock.clientLeft;
        }
        if (right != null) {
          const borderRight = blockRect.width - containingBlock.clientWidth - containingBlock.clientLeft;
          right -= viewportWidth - blockRect.right + borderRight;
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

    // ! `scroll` is not a composed event: its path stops at each shadow boundary and never reaches
    // `window`. Every root between the anchor and the document has to be listened to separately.
    const shadowRoots: ShadowRoot[] = [];
    let node: Node | null = anchorRef.current;
    while (node != null) {
      const root = node.getRootNode();
      if (!isShadowRoot(root)) break;
      shadowRoots.push(root);
      node = root.host;
    }

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    for (const root of shadowRoots) {
      root.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      for (const root of shadowRoots) {
        root.removeEventListener('scroll', updatePosition, true);
      }
    };
  }, [enabled, preferredSide, align, collisionStrategy, anchorRef, contentRef]);

  return position;
}
