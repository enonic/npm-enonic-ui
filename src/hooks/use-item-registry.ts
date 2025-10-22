import { useCallback, useRef } from 'react';

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
   * Gets all registered item IDs in insertion order.
   * @returns Array of item IDs
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
 * - Better performance (no DOM traversal)
 * - Consistent insertion order
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

  const registerItem = useCallback((id: string, disabled = false): void => {
    itemsRef.current.set(id, { disabled });
  }, []);

  const unregisterItem = useCallback((id: string): void => {
    itemsRef.current.delete(id);
  }, []);

  const getItems = useCallback((): string[] => {
    return Array.from(itemsRef.current.keys());
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
