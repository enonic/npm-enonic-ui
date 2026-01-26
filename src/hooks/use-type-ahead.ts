import { useCallback, useRef } from 'react';

export type UseTypeAheadConfig = {
  /**
   * Get all item IDs in order
   */
  getItems: () => string[];

  /**
   * Check if an item is disabled
   */
  isItemDisabled: (id: string) => boolean;

  /**
   * Get the text content for an item (for matching)
   */
  getItemText: (id: string) => string | undefined;

  /**
   * Currently active item ID
   */
  active: string | undefined;

  /**
   * Set the active item ID
   */
  setActive: (id: string | undefined) => void;

  /**
   * Called when a match is found
   */
  onMatch?: (id: string) => void;

  /**
   * Timeout in ms before search string resets
   * @default 500
   */
  timeout?: number;
};

export type UseTypeAheadReturn = {
  /**
   * Handle a typed character for type-ahead search
   */
  handleTypeAhead: (char: string) => void;

  /**
   * Reset the search string manually
   */
  resetSearch: () => void;
};

/**
 * Hook for type-ahead search in a list of items.
 *
 * Behavior:
 * - Single character: cycles through items starting with that character
 * - Multiple characters typed quickly: finds first match for full string
 * - Case-insensitive matching
 * - Skips disabled items
 * - Resets after timeout (default 500ms)
 *
 * **Important**: The `getItemText` function must return the searchable text for each item.
 * When using complex children (e.g., `<ItemText>{label}</ItemText>`), you must either:
 * 1. Provide a `textValue` prop to register searchable text explicitly
 * 2. Extract text from DOM after mount using `element.textContent`
 *
 * Plain string children work automatically, but wrapped content requires explicit registration.
 *
 * @example
 * ```tsx
 * const { handleTypeAhead } = useTypeAhead({
 *   getItems,
 *   isItemDisabled,
 *   getItemText,
 *   active,
 *   setActive,
 *   onMatch: (id) => console.log('Found:', id),
 * });
 *
 * // In keyboard handler:
 * if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
 *   handleTypeAhead(e.key);
 * }
 * ```
 */
export function useTypeAhead(config: UseTypeAheadConfig): UseTypeAheadReturn {
  const { getItems, isItemDisabled, getItemText, active, setActive, onMatch, timeout = 500 } = config;

  const searchStringRef = useRef('');
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetSearch = useCallback(() => {
    searchStringRef.current = '';
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const handleTypeAhead = useCallback(
    (char: string): void => {
      // Clear existing timeout
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      // Set new timeout to reset search
      timeoutIdRef.current = setTimeout(() => {
        searchStringRef.current = '';
        timeoutIdRef.current = null;
      }, timeout);

      const items = getItems();
      if (!items.length) {
        return;
      }

      const lowerChar = char.toLowerCase();
      const prevSearch = searchStringRef.current;
      const newSearch = prevSearch + lowerChar;
      searchStringRef.current = newSearch;

      // Check if user is cycling through same character
      const isSameChar = newSearch.length > 1 && newSearch.split('').every(c => c === lowerChar);

      if (isSameChar) {
        // Before cycling, check if the full search string matches an item (e.g., "22" should find "22")
        for (const id of items) {
          if (isItemDisabled(id)) continue;
          const text = getItemText(id);
          if (text?.toLowerCase().startsWith(newSearch)) {
            setActive(id);
            onMatch?.(id);
            return;
          }
        }

        // Cycling mode: find next item starting with this character
        const matchingItems = items.filter(id => {
          if (isItemDisabled(id)) return false;
          const text = getItemText(id);
          return text?.toLowerCase().startsWith(lowerChar);
        });

        if (matchingItems.length === 0) {
          return;
        }

        // Find current position and move to next
        const currentIndex = active ? matchingItems.indexOf(active) : -1;
        const nextIndex = (currentIndex + 1) % matchingItems.length;
        const nextId = matchingItems[nextIndex];

        if (nextId) {
          setActive(nextId);
          onMatch?.(nextId);
        }
      } else {
        // Multi-character search: find first item matching the full string
        const startIndex = active ? items.indexOf(active) : -1;

        // Search from current position first, then wrap around
        const searchOrder =
          startIndex >= 0 ? [...items.slice(startIndex + 1), ...items.slice(0, startIndex + 1)] : items;

        for (const id of searchOrder) {
          if (isItemDisabled(id)) continue;

          const text = getItemText(id);
          if (text?.toLowerCase().startsWith(newSearch)) {
            setActive(id);
            onMatch?.(id);
            return;
          }
        }

        // No match found for multi-char, try single char from beginning
        if (newSearch.length > 1) {
          for (const id of items) {
            if (isItemDisabled(id)) continue;

            const text = getItemText(id);
            if (text?.toLowerCase().startsWith(lowerChar)) {
              // Reset to single char and set match
              searchStringRef.current = lowerChar;
              setActive(id);
              onMatch?.(id);
              return;
            }
          }
        }
      }
    },
    [getItems, isItemDisabled, getItemText, active, setActive, onMatch, timeout],
  );

  return {
    handleTypeAhead,
    resetSearch,
  };
}
