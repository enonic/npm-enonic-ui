import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

export type UseOverflowDetectionReturn = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  hasOverflow: boolean;
  scrollBy: (offset: number) => void;
};

export function useOverflowDetection(containerRef: RefObject<HTMLElement | null>): UseOverflowDetectionReturn {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const rafId = useRef(0);

  const update = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      setHasOverflow(false);
      return;
    }

    setHasOverflow(el.scrollWidth > el.clientWidth);
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
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

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(el);

    // Also observe children for size changes (e.g. tab content changes)
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i];
      if (child) observer.observe(child);
    }

    return () => {
      el.removeEventListener('scroll', scheduleUpdate);
      observer.disconnect();
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
    canScrollLeft,
    canScrollRight,
    hasOverflow,
    scrollBy,
  };
}
