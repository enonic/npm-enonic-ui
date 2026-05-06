import { type RefObject, useLayoutEffect, useRef } from 'react';

type VirtuosoLikeHandle = {
  scrollToIndex: (
    location: number | { index: number; align?: 'start' | 'center' | 'end'; behavior?: 'auto' | 'smooth' },
  ) => void;
};

export type UseScrollSelectedToVirtuosoConfig<TItem extends { id: string }> = {
  /** Whether the dropdown is open. The hook fires on the rising edge. */
  open: boolean;
  /** The single selected ID to center on open, or undefined to skip. */
  selectedId: string | undefined;
  /**
   * Setter called with `selectedId` on the rising edge so navigation
   * resumes from there. Pass the active setter from the wrapped list
   * (e.g., `VirtualizedTreeList`'s `onActiveChange` consumer).
   */
  setActive: (id: string) => void;
  /** Flat items in render order. Used to look up the index for `scrollToIndex`. */
  items: readonly TItem[];
  /** Ref to the Virtuoso instance for scroll operations. */
  virtuosoRef: RefObject<VirtuosoLikeHandle | null> | undefined;
};

const MAX_RETRIES = 8;

/**
 * Centers the selected item in a Virtuoso-backed virtualized list when its
 * containing dropdown opens, and sets the consumer's active state to match.
 *
 * Retries on `requestAnimationFrame` while the Virtuoso ref is still null
 * (Virtuoso typically attaches within a frame of mount). Bails after a small
 * cap to avoid infinite loops.
 *
 * Use inside a consumer that wraps `VirtualizedTreeList` in `Combobox.TreeContent`
 * (or any other open/close container) when the same UX as `Combobox.ListContent`
 * is desired: open with selection → centered, arrow keys → nearest.
 */
export function useScrollSelectedToVirtuoso<TItem extends { id: string }>({
  open,
  selectedId,
  setActive,
  items,
  virtuosoRef,
}: UseScrollSelectedToVirtuosoConfig<TItem>): void {
  const wasOpenRef = useRef(false);

  useLayoutEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;
    if (!justOpened) return;

    if (!selectedId) return;

    const index = items.findIndex(item => item.id === selectedId);
    if (index < 0) return;

    setActive(selectedId);

    let attempt = 0;
    let rafId = 0;
    const tryScroll = (): void => {
      const handle = virtuosoRef?.current;
      if (handle) {
        handle.scrollToIndex({ index, align: 'center', behavior: 'auto' });
        return;
      }
      if (attempt++ >= MAX_RETRIES) return;
      rafId = requestAnimationFrame(tryScroll);
    };

    tryScroll();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [open, selectedId, items, setActive, virtuosoRef]);
}
