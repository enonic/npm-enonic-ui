import { type RefObject, useLayoutEffect, useRef } from 'react';

import { scrollIntoCenter } from '@/utils/scroll';

export type UseActiveOnOpenConfig = {
  /**
   * Whether the dropdown is open. Pass `true` for always-open contexts
   * like a standalone Listbox — the rising edge fires once on mount.
   */
  open: boolean;
  /**
   * Current selection set. The hook picks the first selected item in
   * DOM order (according to `getItems()`) as the activation target.
   */
  selection: ReadonlySet<string>;
  /** Setter for active item. */
  setActive: (id: string | undefined) => void;
  /** Returns DOM-ordered IDs from the item registry. */
  getItems: () => readonly string[];
  /** Returns whether an item is disabled. */
  isItemDisabled: (id: string) => boolean;
  /**
   * Container element to scroll. The hook centers the activated selection
   * inside this container by querying for the option element and calling
   * `scrollIntoView({ block: 'center' })`. When omitted, only state is
   * updated (useful for tests or virtualized consumers handling scroll
   * through their own adapter).
   */
  containerRef?: RefObject<HTMLElement> | null;
  /**
   * Build the option element's DOM id from a registry id. Defaults to
   * identity. Match the consumer's `buildElementId` used elsewhere.
   */
  buildElementId?: (id: string) => string;
  /**
   * When `false`, the hook does nothing. Used by Combobox when `active`
   * is controlled externally — the consumer owns activation.
   * @default true
   */
  enabled?: boolean;
};

/**
 * Activates the selected item (or first enabled fallback) when a dropdown
 * opens, and centers the activated selection in the viewport.
 *
 * Trigger: `open` rising edge. On rising edge, the hook unconditionally
 * rewrites active even if a stale value persists from the previous open.
 * If the item registry is empty at that moment (popup mounts items lazily,
 * common with Portals), the hook re-runs on subsequent renders until items
 * appear — `getItems` callback identity is coupled to the registry version,
 * so listing it as a dep covers lazy-mount cases.
 *
 * Behavior:
 * - Selection has any enabled item present in the registry → activate it
 *   and call `scrollIntoView({ block: 'center' })` on the option element.
 * - Otherwise → set active to first enabled item; no scroll (the default
 *   `'nearest'` from `useScrollActiveIntoView` will apply on next nav).
 * - No items registered yet → wait; the next `getItems` identity change
 *   re-runs the effect (covers the lazy-mount case).
 *
 * The imperative scroll is owned by this hook so the open-transition center
 * behavior is independent of whether `setActive` actually changed the value
 * — if `active` already pointed at the target, `useScrollActiveIntoView`
 * would not re-fire, and a coordination-via-ref scheme would silently fail.
 */
export function useActiveOnOpen({
  open,
  selection,
  setActive,
  getItems,
  isItemDisabled,
  containerRef,
  buildElementId,
  enabled = true,
}: UseActiveOnOpenConfig): void {
  const wasOpenRef = useRef(false);
  const activatedThisOpenRef = useRef(false);

  useLayoutEffect(() => {
    if (!enabled || !open) {
      wasOpenRef.current = open;
      activatedThisOpenRef.current = false;
      return;
    }

    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;
    if (justOpened) {
      activatedThisOpenRef.current = false;
    }
    if (activatedThisOpenRef.current) return;

    const items = getItems();
    if (items.length === 0) return;

    const firstSelected = items.find(id => selection.has(id) && !isItemDisabled(id));
    if (firstSelected) {
      setActive(firstSelected);
      activatedThisOpenRef.current = true;
      const container = containerRef?.current;
      if (container) {
        const elementId = buildElementId ? buildElementId(firstSelected) : firstSelected;
        const element = container.querySelector<HTMLElement>(`#${CSS.escape(elementId)}`);
        if (element) scrollIntoCenter(element);
      }
      return;
    }

    const firstEnabled = items.find(id => !isItemDisabled(id));
    if (firstEnabled) {
      setActive(firstEnabled);
      activatedThisOpenRef.current = true;
    }
  }, [open, enabled, selection, setActive, getItems, isItemDisabled, containerRef, buildElementId]);
}
