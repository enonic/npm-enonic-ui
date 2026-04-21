import { type RefObject, useCallback, useEffect, useRef } from 'react';

type Point = { x: number; y: number };

export type SafeAreaSide = 'left' | 'right';

export type UseSubmenuSafeAreaConfig = {
  /** Whether the submenu is open (tracking is active) */
  enabled: boolean;
  /** Reference to the submenu content element — used to compute its near edge */
  submenuRef: RefObject<HTMLElement>;
  /**
   * Which side the submenu sits on relative to its trigger.
   * - 'right': near edge is the submenu's LEFT edge; pointer travels right toward it
   * - 'left':  near edge is the submenu's RIGHT edge; pointer travels left toward it
   */
  side: SafeAreaSide;
  /**
   * How long (ms) after the submenu opens the safe zone remains valid without
   * a confirming pointer sample. Prevents a stale history from locking the zone.
   * @default 300
   */
  graceMs?: number;
};

export type UseSubmenuSafeAreaReturn = {
  /**
   * Returns true if the pointer at (x, y) is currently traveling toward the submenu's
   * near edge — i.e. inside the triangle formed by the previous pointer sample and
   * the two corners of that edge. Callers should skip sibling hover handling while
   * this is true.
   */
  isInSafeArea: (x: number, y: number) => boolean;
};

function pointInTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
  const sign = (p1: Point, p2: Point, p3: Point): number =>
    (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);

  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);

  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNeg && hasPos);
}

/**
 * Tracks pointer history while a submenu is open and computes whether the pointer
 * is inside the "safe triangle" — the region between the previous pointer position
 * and the submenu's near edge. Callers use this to suppress sibling-item hover
 * handling while the user is diagonally moving toward the submenu.
 *
 * Implements the classic Amazon.com menu heuristic popularized by Radix UI.
 */
export function useSubmenuSafeArea({
  enabled,
  submenuRef,
  side,
  graceMs = 300,
}: UseSubmenuSafeAreaConfig): UseSubmenuSafeAreaReturn {
  const prevPointRef = useRef<Point | null>(null);
  const lastSampleAtRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      prevPointRef.current = null;
      lastSampleAtRef.current = 0;
      return;
    }

    lastSampleAtRef.current = Date.now();

    const handlePointerMove = (event: PointerEvent): void => {
      prevPointRef.current = { x: event.clientX, y: event.clientY };
      lastSampleAtRef.current = Date.now();
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [enabled]);

  const isInSafeArea = useCallback(
    (x: number, y: number): boolean => {
      if (!enabled) return false;

      const rect = submenuRef.current?.getBoundingClientRect();
      if (!rect) return false;

      const prev = prevPointRef.current;
      if (!prev) {
        // No history yet — grant a brief grace window after open so the first
        // hover doesn't immediately steal focus from the submenu.
        return Date.now() - lastSampleAtRef.current < graceMs;
      }

      // Near-edge corners (the edge the pointer must cross to reach the submenu).
      const nearX = side === 'right' ? rect.left : rect.right;
      const nearTop: Point = { x: nearX, y: rect.top };
      const nearBottom: Point = { x: nearX, y: rect.bottom };

      // Reject if the pointer has already crossed the near edge (it's either
      // inside the submenu or past it — either way, not in the "traveling" zone).
      if (side === 'right' && x >= nearX) return false;
      if (side === 'left' && x <= nearX) return false;

      return pointInTriangle({ x, y }, prev, nearTop, nearBottom);
    },
    [enabled, submenuRef, side, graceMs],
  );

  return { isInSafeArea };
}
