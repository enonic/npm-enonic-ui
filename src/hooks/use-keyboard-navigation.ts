import { useCallback } from 'react';

export type KeyboardNavigationConfig = {
  /**
   * Get all item IDs in order
   */
  getItems: () => string[];

  /**
   * Check if an item is disabled
   */
  isItemDisabled: (id: string) => boolean;

  /**
   * Currently active item ID
   */
  active: string | undefined;

  /**
   * Set the active item ID
   */
  setActive: (id: string | undefined) => void;

  /**
   * Whether to loop navigation (wrap around at start/end)
   * @default false
   */
  loop?: boolean;

  /**
   * Orientation of navigation
   * @default 'vertical'
   */
  orientation?: 'vertical' | 'horizontal';

  /**
   * Called when user requests selection (Enter/Space)
   * Receives the active item ID
   */
  onSelect?: (id: string) => void;

  /**
   * Called when user presses Escape
   */
  onEscape?: () => void;
};

export type UseKeyboardNavigationReturn = {
  /**
   * Move active item by delta (1 for next, -1 for previous)
   */
  moveActive: (delta: number) => void;

  /**
   * Keyboard event handler to attach to the container
   */
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
};

/**
 * Hook for keyboard navigation through a list of items.
 * Handles arrow keys, Home/End, Enter/Space, and Escape.
 *
 * Supports:
 * - ArrowUp/ArrowDown (or ArrowLeft/ArrowRight for horizontal)
 * - Home/End keys
 * - Loop navigation (optional)
 * - Disabled item skipping
 * - Enter/Space for selection
 * - Escape key handling
 *
 * @param config - Configuration object
 * @returns Object with navigation methods
 *
 * @example
 * ```tsx
 * function MyList() {
 *   const { getItems, isItemDisabled } = useItemRegistry();
 *   const [active, setActive] = useState<string>();
 *
 *   const { handleKeyDown } = useKeyboardNavigation({
 *     getItems,
 *     isItemDisabled,
 *     active,
 *     setActive,
 *     loop: true,
 *     onSelect: (id) => console.log('Selected:', id),
 *   });
 *
 *   return <div onKeyDown={handleKeyDown}>...</div>;
 * }
 * ```
 */
export function useKeyboardNavigation(config: KeyboardNavigationConfig): UseKeyboardNavigationReturn {
  const {
    getItems,
    isItemDisabled,
    active,
    setActive,
    loop = false,
    orientation = 'vertical',
    onSelect,
    onEscape,
  } = config;

  const moveActive = useCallback(
    (delta: number): void => {
      const items = getItems();
      if (!items.length) {
        return;
      }

      const currentIndex = active ? items.indexOf(active) : -1;
      let newIndex: number;
      let attempts = 0;
      const maxAttempts = items.length;

      if (currentIndex === -1) {
        // No active item, start from first or last depending on direction
        newIndex = delta > 0 ? 0 : items.length - 1;
      } else {
        newIndex = currentIndex + delta;
      }

      // Find next non-disabled item
      while (attempts < maxAttempts) {
        // Handle looping and bounds
        if (loop) {
          if (newIndex < 0) {
            newIndex = items.length - 1;
          } else if (newIndex >= items.length) {
            newIndex = 0;
          }
        } else {
          // Clamp to bounds
          if (newIndex < 0 || newIndex >= items.length) {
            return; // Can't move further without looping
          }
        }

        // Check if item is not disabled
        if (!isItemDisabled(items[newIndex])) {
          setActive(items[newIndex]);
          return;
        }

        // Try next item in the same direction
        newIndex += delta;
        attempts++;
      }

      // All items are disabled, do nothing
    },
    [getItems, active, setActive, loop, isItemDisabled],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      const items = getItems();
      if (!items.length) {
        return;
      }

      const isVertical = orientation === 'vertical';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          moveActive(1);
          break;

        case prevKey:
          e.preventDefault();
          moveActive(-1);
          break;

        case 'Home':
          e.preventDefault();
          {
            const firstEnabled = items.find(id => !isItemDisabled(id));
            if (firstEnabled) {
              setActive(firstEnabled);
            }
          }
          break;

        case 'End':
          e.preventDefault();
          {
            const lastEnabled = [...items].reverse().find(id => !isItemDisabled(id));
            if (lastEnabled) {
              setActive(lastEnabled);
            }
          }
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (active && !isItemDisabled(active)) {
            onSelect?.(active);
          }
          break;

        case 'Escape':
          e.preventDefault();
          onEscape?.();
          break;

        // TODO: Implement type-ahead search (ARIA optional feature)
        // See: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboard-interaction
      }
    },
    [getItems, active, moveActive, setActive, isItemDisabled, orientation, onSelect, onEscape],
  );

  return {
    moveActive,
    handleKeyDown,
  };
}
