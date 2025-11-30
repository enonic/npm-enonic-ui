import { useCallback, useRef, useState } from 'react';

export type ItemMetadata = {
  disabled: boolean;
};

export type UseItemRegistryReturn = {
  /**
   * Registers an item with the registry.
   * @param id - Unique identifier for the item
   * @param disabled - Whether the item is disabled
   */
  registerItem: (id: string, disabled?: boolean) => void;

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
 *   useEffect(() => {
 *     registerItem(id, disabled);
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
  const [_registryVersion, setRegistryVersion] = useState(0);

  const bumpRegistryVersion = useCallback((): void => {
    setRegistryVersion(version => version + 1);
  }, []);

  const registerItem = useCallback(
    (id: string, disabled = false): void => {
      itemsRef.current.set(id, { disabled });
      // Always bump version to ensure dependent hooks recalculate
      // This handles new items, disabled changes, and re-registrations
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
    const itemIds = Array.from(itemsRef.current.keys());

    // Sort items by their DOM position to preserve visual order
    // This ensures items maintain their position even after re-registration
    return itemIds.sort((a, b) => {
      const elementA = document.getElementById(a);
      const elementB = document.getElementById(b);

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
  }, []);

  const isItemDisabled = useCallback((id: string): boolean => {
    return itemsRef.current.get(id)?.disabled ?? false;
  }, []);

  return {
    registerItem,
    unregisterItem,
    getItems,
    isItemDisabled,
  };
}
