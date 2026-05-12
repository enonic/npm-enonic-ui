import { type RefObject, useEffect, useState } from 'react';

export type UseBlinkAttentionConfig = {
  /** Scroll the target into view before the blink starts. Defaults to `true`. */
  scrollIntoView?: boolean;
};

// 0.6s × 2 iterations of the `input-blink-ring` keyframe.
const BLINK_DURATION_MS = 1200;

/**
 * Draws attention to an element by scrolling it into view and pulsing a one-shot ring around it.
 * Returns a boolean — apply the `input-blink-attention` utility class while it's `true`.
 *
 * The trigger is edge-driven: every time `trigger` flips to truthy, the animation restarts.
 */
export const useBlinkAttention = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  trigger: unknown,
  { scrollIntoView = true }: UseBlinkAttentionConfig = {},
): boolean => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!trigger) return undefined;

    if (scrollIntoView) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setIsBlinking(false);
    const startId = window.requestAnimationFrame(() => setIsBlinking(true));
    const stopId = window.setTimeout(() => setIsBlinking(false), BLINK_DURATION_MS);

    return () => {
      window.cancelAnimationFrame(startId);
      window.clearTimeout(stopId);
    };
  }, [trigger, scrollIntoView, ref]);

  return isBlinking;
};
