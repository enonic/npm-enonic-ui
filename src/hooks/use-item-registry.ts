import { useCallback, useRef, useState } from 'react';

export type ItemMetadata = {
  disabled: boolean;
  element: HTMLElement | null;
};

export type UseItemRegistryReturn = {
  /**
   * Registers an item with the registry.
   * @param id - Unique identifier for the item
   * @param disabled - Whether the item is disabled
   * @param element - Optional DOM element reference for efficient sorting
   */
  registerItem: (id: string, disabled?: boolean, element?: HTMLElement | null) => void;

  /**
   * Unregisters an item from the registry.
   * @param id - Unique identifier for the item to remove
   */
  unregisterItem: (id: string) => void;

  /**
   * Gets all registered item IDs sorted by DOM position.
   * @returns Array of item IDs in visual order
   */
  getItems: () => string[];

  /**
   * Checks if an item is disabled.
   * @param id - Item ID to check
   * @returns True if the item is disabled
   */
  isItemDisabled: (id: string) => boolean;

  /**
   * Returns the registered DOM element for an item.
   *
   * Resolves through the in-memory registry so it works inside Shadow DOM
   * (where `document.getElementById` does not pierce shadow root boundaries).
   *
   * @param id - Item ID to look up
   * @returns The element passed to `registerItem`, or `null` if the item is
   *   unregistered or was registered without an element reference
   */
  getItemElement: (id: string) => HTMLElement | null;

  /**
   * Version counter that increments when items are registered or unregistered.
   * Use as a dependency in useEffect to react to item changes.
   */
  registryVersion: number;
};

/**
 * Hook for managing a registry of items (menu items, listbox options, etc.).
 * Provides a more reliable alternative to DOM queries for item discovery.
 *
 * This pattern is superior to `querySelectorAll` because:
 * - No stale queries from DOM changes
 * - Type-safe item metadata
 * - Better performance (minimal DOM traversal)
 * - Preserves DOM order even when items re-register
 *
 * Items are automatically sorted by their DOM position, ensuring navigation
 * order matches visual order even when items are dynamically enabled/disabled.
 *
 * @returns Object with registry methods
 *
 * @example
 * ```tsx
 * function MyList() {
 *   const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();
 *
 *   // In child components:
 *   const itemRef = useRef<HTMLDivElement>(null);
 *   useEffect(() => {
 *     registerItem(id, disabled, itemRef.current);
 *     return () => unregisterItem(id);
 *   }, [id, disabled]);
 *
 *   // Navigate through items
 *   const items = getItems();
 *   const enabledItems = items.filter(id => !isItemDisabled(id));
 * }
 * ```
 */
export function useItemRegistry(): UseItemRegistryReturn {
  const itemsRef = useRef<Map<string, ItemMetadata>>(new Map());
  const [registryVersion, setRegistryVersion] = useState(0);

  // Cache for sorted items to avoid re-sorting when version unchanged
  const sortedCacheRef = useRef<{ version: number; ids: string[] } | null>(null);

  // Pending bump flag for batching multiple registrations into single update
  const pendingBumpRef = useRef(false);

  // Batched version bump - coalesces multiple registrations into single render
  const bumpRegistryVersion = useCallback((): void => {
    if (pendingBumpRef.current) return;
    pendingBumpRef.current = true;
    queueMicrotask(() => {
      pendingBumpRef.current = false;
      setRegistryVersion(version => version + 1);
    });
  }, []);

  const registerItem = useCallback(
    (id: string, disabled = false, element: HTMLElement | null = null): void => {
      // Skip bump if item exists with same state
      const existing = itemsRef.current.get(id);
      if (existing && existing.disabled === disabled && existing.element === element) return;

      itemsRef.current.set(id, { disabled, element });
      bumpRegistryVersion();
    },
    [bumpRegistryVersion],
  );

  const unregisterItem = useCallback(
    (id: string): void => {
      const isDeleted = itemsRef.current.delete(id);
      if (isDeleted) {
        bumpRegistryVersion();
      }
    },
    [bumpRegistryVersion],
  );

  const getItems = useCallback((): string[] => {
    // Return cached copy if version unchanged
    if (sortedCacheRef.current?.version === registryVersion) {
      return [...sortedCacheRef.current.ids];
    }

    const entries = Array.from(itemsRef.current.entries());

    // Build element map - use stored refs when available, fall back to DOM query
    const elementMap = new Map<string, Element | null>();
    for (const [id, meta] of entries) {
      if (meta.element) {
        elementMap.set(id, meta.element);
      } else {
        // Fallback: DOM query for backwards compatibility
        const element = document.querySelector(`[data-registry-id="${id}"]`) ?? document.getElementById(id);
        elementMap.set(id, element);
      }
    }

    const itemIds = entries.map(([id]) => id);

    // Sort items by their DOM position to preserve visual order
    const sorted = itemIds.sort((a, b) => {
      const elementA = elementMap.get(a);
      const elementB = elementMap.get(b);

      // If either element doesn't exist in DOM, keep original order
      if (!elementA || !elementB) {
        return 0;
      }

      // Use compareDocumentPosition to determine DOM order
      const position = elementA.compareDocumentPosition(elementB);

      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1; // a comes before b
      }
      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1; // b comes before a
      }

      return 0; // Same position (shouldn't happen)
    });

    sortedCacheRef.current = { version: registryVersion, ids: sorted };
    return [...sorted]; // Return copy to prevent cache mutation
  }, [registryVersion]);

  const isItemDisabled = useCallback((id: string): boolean => {
    return itemsRef.current.get(id)?.disabled ?? false;
  }, []);

  const getItemElement = useCallback((id: string): HTMLElement | null => {
    return itemsRef.current.get(id)?.element ?? null;
  }, []);

  return {
    registerItem,
    unregisterItem,
    getItems,
    isItemDisabled,
    getItemElement,
    registryVersion,
  };
}
