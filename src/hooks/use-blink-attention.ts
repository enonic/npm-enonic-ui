import { type RefObject, useEffect, useState } from 'react';

export type UseBlinkAttentionConfig = {
  /** Scroll the target into view before the blink starts. Defaults to `true`. */
  scrollIntoView?: boolean;
};

// 0.6s × 2 iterations of the `input-blink-ring` keyframe.
const BLINK_DURATION_MS = 1200;
const BLINK_CLASS = 'input-blink-attention';

/**
 * Draws attention to an element by scrolling it into view and pulsing a one-shot ring around it.
 * The hook owns the `input-blink-attention` class on the ref'd element — the ref must point to
 * the element that wears the ring (typically a field's container, e.g. `Input.highlightRef` /
 * `TextArea.highlightRef`). A boolean is also returned for callers that need to react to the
 * blink in their own UI.
 *
 * The trigger is edge-driven: every time `trigger` flips to truthy, the animation restarts —
 * even when the previous blink is still in progress. Restarts go through a class-remove → reflow
 * → class-add cycle rather than React state alone, because React can coalesce a false→true
 * toggle into a single commit and the browser would then see one uninterrupted animation.
 */
export const useBlinkAttention = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  trigger: unknown,
  { scrollIntoView = true }: UseBlinkAttentionConfig = {},
): boolean => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!trigger) return undefined;
    const el = ref.current;
    if (el == null) return undefined;

    if (scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Force a fresh CSS animation cycle: drop the class, flush layout so the
    // browser registers the removal, then re-add. This bypasses React's state
    // batching, which would otherwise let a rapid re-trigger keep the class on
    // the element across renders and the animation would never restart.
    el.classList.remove(BLINK_CLASS);
    void el.offsetWidth;
    el.classList.add(BLINK_CLASS);
    setIsBlinking(true);

    const stopId = window.setTimeout(() => {
      setIsBlinking(false);
      ref.current?.classList.remove(BLINK_CLASS);
    }, BLINK_DURATION_MS);

    return () => {
      window.clearTimeout(stopId);
    };
  }, [trigger, scrollIntoView, ref]);

  return isBlinking;
};
