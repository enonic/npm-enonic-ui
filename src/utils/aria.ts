/**
 * Generates ARIA-compliant IDs for component parts.
 * Helps maintain consistent ID patterns across components.
 *
 * @param baseId - The base ID for the component
 * @param suffix - The suffix to append (e.g., 'trigger', 'content', 'option')
 * @returns The generated ID
 *
 * @example
 * ```tsx
 * const baseId = 'menu-1';
 * const triggerId = generateAriaId(baseId, 'trigger'); // 'menu-1-trigger'
 * const contentId = generateAriaId(baseId, 'content'); // 'menu-1-content'
 * ```
 */
export function generateAriaId(baseId: string, suffix: string): string {
  return `${baseId}-${suffix}`;
}

/**
 * Generates multiple ARIA IDs at once from a base ID.
 * Useful for components with multiple parts.
 *
 * @param baseId - The base ID for the component
 * @param parts - Array of part names
 * @returns Object mapping part names to generated IDs
 *
 * @example
 * ```tsx
 * const ids = generateAriaIds('menu-1', ['trigger', 'content', 'item']);
 * // { trigger: 'menu-1-trigger', content: 'menu-1-content', item: 'menu-1-item' }
 *
 * <button id={ids.trigger} aria-controls={ids.content}>Menu</button>
 * <div id={ids.content} role="menu">...</div>
 * ```
 */
export function generateAriaIds<T extends readonly string[]>(baseId: string, parts: T): Record<T[number], string> {
  return parts.reduce(
    (acc, part) => {
      acc[part as T[number]] = generateAriaId(baseId, part);
      return acc;
    },
    {} as Record<T[number], string>,
  );
}

/**
 * Generates an ARIA ID for an item within a list (menu, listbox, etc.).
 *
 * @param baseId - The base ID for the component
 * @param componentType - The type of component ('menu', 'listbox', etc.)
 * @param itemValue - The value/ID of the specific item
 * @returns The generated item ID
 *
 * @example
 * ```tsx
 * const itemId = generateItemId('menu-1', 'menu', 'file-open');
 * // 'menu-1-menu-item-file-open'
 *
 * <div id={itemId} role="menuitem">Open File</div>
 * ```
 */
export function generateItemId(baseId: string, componentType: string, itemValue: string): string {
  return `${baseId}-${componentType}-item-${itemValue}`;
}

/**
 * Generates aria-activedescendant ID based on component configuration.
 * Returns undefined if no active item.
 *
 * @param baseId - The base ID for the component
 * @param componentType - The type of component ('menu', 'listbox', etc.)
 * @param activeValue - The currently active item value (undefined if none)
 * @returns The active descendant ID or undefined
 *
 * @example
 * ```tsx
 * const activeId = getActiveDescendantId('listbox-1', 'listbox', 'option-2');
 * // 'listbox-1-listbox-item-option-2'
 *
 * <div role="listbox" aria-activedescendant={activeId}>...</div>
 * ```
 */
export function getActiveDescendantId(
  baseId: string,
  componentType: string,
  activeValue: string | undefined,
): string | undefined {
  if (!activeValue) {
    return undefined;
  }
  return generateItemId(baseId, componentType, activeValue);
}
