import { type RefObject, useEffect } from 'react';

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
 * Automatically scrolls the active item into view within a scrollable container.
 *
 * This hook is commonly used in keyboard-navigable lists, menus, and navigation
 * components to ensure the currently active item is visible when it changes.
 *
 * Features:
 * - Smooth scrolling behavior with 'nearest' algorithm (minimal scroll distance)
 * - Supports both vertical and horizontal scrolling
 * - Supports custom ID construction for prefixed/namespaced IDs
 * - Only scrolls when activeId changes
 *
 * @param config - Configuration object for scroll behavior
 *
 * @example
 * ```tsx
 * // Vertical list (Menu)
 * function MenuContent() {
 *   const contentRef = useRef<HTMLDivElement>(null);
 *   const { active } = useMenu();
 *
 *   useScrollActiveIntoView({
 *     containerRef: contentRef,
 *     activeId: active,
 *     orientation: 'vertical',
 *   });
 *
 *   return <div ref={contentRef}>...</div>;
 * }
 *
 * // Horizontal navigation (Menubar)
 * function Menubar() {
 *   const menubarRef = useRef<HTMLDivElement>(null);
 *   const { active } = useMenubar();
 *
 *   useScrollActiveIntoView({
 *     containerRef: menubarRef,
 *     activeId: active,
 *     orientation: 'horizontal',
 *   });
 *
 *   return <div ref={menubarRef}>...</div>;
 * }
 *
 * // With ID prefix (Listbox)
 * function ListboxContent({ baseId }: { baseId: string }) {
 *   const contentRef = useRef<HTMLDivElement>(null);
 *   const { active } = useListbox();
 *
 *   useScrollActiveIntoView({
 *     containerRef: contentRef,
 *     activeId: active,
 *     orientation: 'vertical',
 *     buildElementId: (id) => `${baseId}-listbox-option-${id}`,
 *   });
 *
 *   return <div ref={contentRef}>...</div>;
 * }
 * ```
 */
export function useScrollActiveIntoView({
  containerRef,
  activeId,
  orientation = 'vertical',
  buildElementId,
}: UseScrollActiveIntoViewConfig): void {
  useEffect(() => {
    if (!activeId || !containerRef?.current) {
      return;
    }

    const elementId = buildElementId ? buildElementId(activeId) : activeId;
    const element = containerRef.current.querySelector<HTMLElement>(`#${elementId}`);

    if (element) {
      element.scrollIntoView({
        block: 'nearest',
        inline: orientation === 'horizontal' ? 'nearest' : undefined,
        behavior: 'auto',
      });
    }
  }, [activeId, containerRef, orientation, buildElementId]);
}
