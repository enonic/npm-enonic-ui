import { useMemo } from 'react';

export type UseRovingTabIndexConfig = {
  /** The ID of this item */
  id: string;
  /** Currently active item ID (undefined if no item is active) */
  active: string | undefined;
  /** Whether this item is disabled */
  disabled: boolean;
  /** Function to get all registered item IDs */
  getItems: () => string[];
  /** Function to check if a specific item is disabled */
  isItemDisabled: (id: string) => boolean;
  /**
   * Focus mode for the component
   * - 'roving-tabindex': Items are individually focusable (default)
   * - 'activedescendant': Container manages focus via aria-activedescendant
   */
  focusMode?: 'roving-tabindex' | 'activedescendant';
};

export type UseRovingTabIndexReturn = {
  /** Whether this item should be focusable (tabIndex=0) */
  isFocusable: boolean;
  /** The tabIndex value to apply to this item */
  tabIndex: number;
};

/**
 * Implements roving tabindex pattern for keyboard navigation.
 *
 * In roving tabindex, only one item in a list is focusable at a time (tabIndex=0),
 * while all other items have tabIndex=-1. This allows users to:
 * - Tab into the list (focuses the active or first available item)
 * - Use arrow keys to navigate within the list
 * - Tab out of the list
 *
 * The hook automatically determines which item should be focusable based on:
 * 1. The currently active item (if set and not disabled)
 * 2. The first non-disabled item (fallback)
 * 3. The first item in the list (if all items are disabled)
 * 4. This item itself (final fallback if no other items exist)
 *
 * @param config - Configuration object for roving tabindex behavior
 * @returns Object containing isFocusable flag and tabIndex value
 *
 * @example
 * ```tsx
 * function MenuItem({ id, disabled }: MenuItemProps) {
 *   const { active, getItems, isItemDisabled } = useMenu();
 *   const { isFocusable, tabIndex } = useRovingTabIndex({
 *     id,
 *     active,
 *     disabled,
 *     getItems,
 *     isItemDisabled,
 *   });
 *
 *   return (
 *     <div
 *       role="menuitem"
 *       tabIndex={tabIndex}
 *       data-focusable={isFocusable || undefined}
 *     >
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex}
 */
export function useRovingTabIndex({
  id,
  active,
  disabled,
  getItems,
  isItemDisabled,
  focusMode = 'roving-tabindex',
}: UseRovingTabIndexConfig): UseRovingTabIndexReturn {
  return useMemo(() => {
    // In activedescendant mode, items are not individually focusable
    if (focusMode === 'activedescendant') {
      return { isFocusable: false, tabIndex: -1 };
    }

    // Disabled items are never focusable
    if (disabled) {
      return { isFocusable: false, tabIndex: -1 };
    }

    const items = getItems();
    const firstItem = items.length > 0 ? items[0] : undefined;

    // Determine which item should be focusable:
    // 1. Active item (if set and not disabled)
    // 2. First non-disabled item
    // 3. First item (even if disabled)
    // 4. This item (if no other items exist)
    const fallbackFocusableId = active ?? items.find(itemId => !isItemDisabled(itemId)) ?? firstItem ?? id;

    const isFocusable = fallbackFocusableId === id;
    const tabIndex = isFocusable ? 0 : -1;

    return { isFocusable, tabIndex };
  }, [id, active, disabled, getItems, isItemDisabled, focusMode]);
}
