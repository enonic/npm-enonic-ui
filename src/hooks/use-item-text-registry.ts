import { useCallback, useRef } from 'react';

export type UseItemTextRegistryReturn = {
  /**
   * Register text content for an item (for type-ahead matching)
   */
  registerItemText: (id: string, text: string) => void;
  /**
   * Unregister text content for an item
   */
  unregisterItemText: (id: string) => void;
  /**
   * Get the text content for an item
   */
  getItemText: (id: string) => string | undefined;
};

/**
 * Hook for managing item text content registry.
 * Used for type-ahead search functionality.
 *
 * @example
 * ```tsx
 * const { registerItemText, getItemText } = useItemTextRegistry();
 *
 * // In item component:
 * useEffect(() => {
 *   registerItemText(id, textContent);
 * }, [id, textContent]);
 * ```
 */
export function useItemTextRegistry(): UseItemTextRegistryReturn {
  const itemTextMapRef = useRef<Map<string, string>>(new Map());

  const registerItemText = useCallback((id: string, text: string) => {
    itemTextMapRef.current.set(id, text);
  }, []);

  const unregisterItemText = useCallback((id: string) => {
    itemTextMapRef.current.delete(id);
  }, []);

  const getItemText = useCallback((id: string): string | undefined => {
    return itemTextMapRef.current.get(id);
  }, []);

  return { registerItemText, unregisterItemText, getItemText };
}
