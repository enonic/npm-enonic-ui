import { useCallback } from 'react';
import { useKeyboardNavigation } from './use-keyboard-navigation';
import { useTypeAhead } from './use-type-ahead';

export type UseSelectorKeyboardConfig = {
  /**
   * Get all item IDs in order
   */
  getItems: () => string[];

  /**
   * Check if an item is disabled
   */
  isItemDisabled: (id: string) => boolean;

  /**
   * Get the text content for an item (for type-ahead matching)
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
   * Currently selected value
   */
  value: string | undefined;

  /**
   * Whether the dropdown is open
   */
  open: boolean;

  /**
   * Set open state (internal, doesn't return focus)
   */
  setOpenInternal: (open: boolean) => void;

  /**
   * Set open state (with focus return handling)
   */
  setOpen: (open: boolean) => void;

  /**
   * Whether the selector is disabled
   */
  disabled: boolean;

  /**
   * Called when an item is selected
   */
  onSelect: (id: string) => void;
};

export type UseSelectorKeyboardReturn = {
  /**
   * Combined keyboard event handler
   */
  keyHandler: (e: React.KeyboardEvent<HTMLElement>) => void;
};

/**
 * Hook for Selector keyboard handling.
 *
 * Combines keyboard navigation, type-ahead, and selector-specific behaviors:
 * - Arrow keys, Home/End for navigation
 * - Enter/Space for selection
 * - Escape to close
 * - Tab to select and close
 * - PageUp/PageDown for large jumps
 * - Type-ahead search (single char cycling, multi-char search)
 * - Opens dropdown on navigation keys when closed
 *
 * @param config - Configuration object
 * @returns Object with keyHandler
 */
export function useSelectorKeyboard(config: UseSelectorKeyboardConfig): UseSelectorKeyboardReturn {
  const {
    getItems,
    isItemDisabled,
    getItemText,
    active,
    setActive,
    value,
    open,
    setOpenInternal,
    setOpen,
    disabled,
    onSelect,
  } = config;

  // Keyboard navigation
  const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
    getItems,
    isItemDisabled,
    active,
    setActive,
    loop: false,
    orientation: 'vertical',
    onSelect,
    onEscape: () => setOpen(false),
  });

  // Type-ahead
  const { handleTypeAhead } = useTypeAhead({
    getItems,
    isItemDisabled,
    getItemText,
    active,
    setActive,
  });

  // Combined keyboard handler
  const keyHandler = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      if (disabled) {
        return;
      }

      // Handle opening when closed
      if (!open) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
          setOpenInternal(true);

          // Set initial active item based on key (retry until items are registered)
          const goToEnd = e.key === 'End';
          const maxRetries = 10;
          let retryCount = 0;

          const setInitialActive = (): void => {
            const items = getItems();
            if (items.length > 0) {
              if (goToEnd) {
                const lastEnabled = [...items].reverse().find(id => !isItemDisabled(id));
                if (lastEnabled) setActive(lastEnabled);
              } else {
                // ArrowDown, ArrowUp, Enter, Space, Home - go to selected or first
                const selectedOrFirst =
                  (value && items.includes(value) && !isItemDisabled(value) ? value : null) ||
                  items.find(id => !isItemDisabled(id));
                if (selectedOrFirst) setActive(selectedOrFirst);
              }
            } else if (retryCount < maxRetries) {
              retryCount++;
              requestAnimationFrame(setInitialActive);
            }
          };
          requestAnimationFrame(setInitialActive);
          return;
        }
      }

      // Handle Tab when open - select and close
      if (open && e.key === 'Tab') {
        if (active) {
          onSelect(active);
        } else {
          setOpen(false);
        }
        return;
      }

      // Handle PageUp/PageDown
      if (open && (e.key === 'PageUp' || e.key === 'PageDown')) {
        e.preventDefault();
        const items = getItems();
        if (items.length === 0) return;

        const currentIndex = active ? items.indexOf(active) : -1;
        const delta = e.key === 'PageDown' ? 10 : -10;
        let targetIndex = currentIndex + delta;

        // Clamp to bounds
        if (targetIndex < 0) targetIndex = 0;
        if (targetIndex >= items.length) targetIndex = items.length - 1;

        // Find nearest non-disabled item
        const searchDirection = delta > 0 ? 1 : -1;
        let targetItem = items[targetIndex];
        while (targetIndex >= 0 && targetIndex < items.length && targetItem && isItemDisabled(targetItem)) {
          targetIndex += searchDirection;
          targetItem = items[targetIndex];
        }

        if (targetIndex >= 0 && targetIndex < items.length && targetItem && !isItemDisabled(targetItem)) {
          setActive(targetItem);
        }
        return;
      }

      // Handle printable characters for type-ahead (exclude Space which is used for selection)
      if (e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (!open) {
          setOpenInternal(true);
          // Retry type-ahead until items are registered (React needs time to render)
          const maxRetries = 10;
          let retryCount = 0;
          const tryTypeAhead = (): void => {
            if (getItems().length > 0) {
              handleTypeAhead(e.key);
            } else if (retryCount < maxRetries) {
              retryCount++;
              requestAnimationFrame(tryTypeAhead);
            }
          };
          requestAnimationFrame(tryTypeAhead);
        } else {
          handleTypeAhead(e.key);
        }
        return;
      }

      // Delegate to navigation handler
      handleNavKeyDown(e);
    },
    [
      disabled,
      open,
      active,
      value,
      getItems,
      isItemDisabled,
      setOpenInternal,
      setOpen,
      setActive,
      onSelect,
      handleTypeAhead,
      handleNavKeyDown,
    ],
  );

  return { keyHandler };
}
