import { type RefObject, useLayoutEffect } from 'react';

export type UseScrollActiveIntoViewConfig = {
  /** Reference to the container element */
  containerRef: RefObject<HTMLElement> | null;
  /** ID of the currently active item (undefined if no active item) */
  activeId: string | undefined;
  /**
   * Scroll orientation:
   * - 'vertical': Only scroll vertically (block: 'nearest')
   * - 'horizontal': Scroll both horizontally and vertically (block + inline: 'nearest')
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Optional function to construct the element ID from the active ID.
   * If not provided, uses activeId directly.
   *
   * @example
   * // For Listbox, which prefixes IDs:
   * buildElementId: (id) => `${baseId}-listbox-option-${id}`
   */
  buildElementId?: (activeId: string) => string;
};

/**
 * Reactive scroll-into-view for keyboard navigation. Uses `block: 'nearest'`
 * for minimal scroll travel. For the open-transition "center on selected"
 * behavior, see `useActiveOnOpen` which performs an imperative center-scroll.
 */
export function useScrollActiveIntoView({
  containerRef,
  activeId,
  orientation = 'vertical',
  buildElementId,
}: UseScrollActiveIntoViewConfig): void {
  useLayoutEffect(() => {
    if (!activeId || !containerRef?.current) {
      return;
    }

    const elementId = buildElementId ? buildElementId(activeId) : activeId;
    const element = containerRef.current.querySelector<HTMLElement>(`#${CSS.escape(elementId)}`);
    if (!element) return;

    element.scrollIntoView({
      block: 'nearest',
      inline: orientation === 'horizontal' ? 'nearest' : undefined,
      behavior: 'auto',
    });
  }, [activeId, containerRef, orientation, buildElementId]);
}
