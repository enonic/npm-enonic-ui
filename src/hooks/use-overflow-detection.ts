import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

export type UseOverflowDetectionReturn = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  hasOverflow: boolean;
  scrollBy: (offset: number) => void;
};

type OverflowState = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  hasOverflow: boolean;
};

const INITIAL_STATE: OverflowState = { canScrollLeft: false, canScrollRight: false, hasOverflow: false };

export function useOverflowDetection(containerRef: RefObject<HTMLElement | null>): UseOverflowDetectionReturn {
  const [state, setState] = useState<OverflowState>(INITIAL_STATE);
  const rafId = useRef(0);

  const update = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      setState(INITIAL_STATE);
      return;
    }

    const threshold = 1;
    setState({
      hasOverflow: el.scrollWidth - el.clientWidth > threshold,
      canScrollLeft: el.scrollLeft > threshold,
      canScrollRight: el.scrollLeft < el.scrollWidth - el.clientWidth - threshold,
    });
  }, [containerRef]);

  const scheduleUpdate = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(update);
  }, [update]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    update();

    el.addEventListener('scroll', scheduleUpdate, { passive: true });

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(el);

    const observeChildren = (): void => {
      for (const child of Array.from(el.children)) {
        resizeObserver.observe(child);
      }
    };

    observeChildren();

    const mutationObserver = new MutationObserver(() => {
      observeChildren();
      scheduleUpdate();
    });
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener('scroll', scheduleUpdate);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      cancelAnimationFrame(rafId.current);
    };
  }, [containerRef, update, scheduleUpdate]);

  const scrollBy = useCallback(
    (offset: number) => {
      containerRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
    },
    [containerRef],
  );

  return {
    ...state,
    scrollBy,
  };
}
