import { useEffect } from 'react';

/**
 * Locks scroll on a specified element or document.body by default
 * @param lock - Whether to lock the scroll
 * @param element - The element to lock scroll on (defaults to document.body)
 */
export const useScrollLock = (lock: boolean, element?: HTMLElement | null): void => {
  useEffect(() => {
    if (!lock) {
      return;
    }

    const target = element ?? document.body;
    const originalOverflow = target.style.overflow;
    // oxlint-disable-next-line react/immutability -- locking the caller's element is this hook's purpose
    target.style.overflow = 'hidden';

    return () => {
      target.style.overflow = originalOverflow;
    };
  }, [lock, element]);
};
