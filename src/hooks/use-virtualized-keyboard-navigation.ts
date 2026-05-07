import { useCallback } from 'react';

export type FlatNodeBase = {
  id: string;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  isExpanded: boolean;
};

export type VirtualizedKeyboardNavigationConfig<TNode extends FlatNodeBase> = {
  /**
   * Flat list of all visible tree nodes
   */
  items: readonly TNode[];

  /**
   * Currently active item index
   */
  activeIndex: number | null;

  /**
   * Set the active item index
   */
  setActiveIndex: (index: number | null) => void;

  /**
   * Scroll to index using virtuoso's scrollToIndex API
   */
  scrollToIndex: (index: number) => void;

  /**
   * Called when user requests expand (ArrowRight on collapsed node with children)
   */
  onExpand?: (id: string) => void;

  /**
   * Called when user requests collapse (ArrowLeft on expanded node)
   */
  onCollapse?: (id: string) => void;

  /**
   * Called when user requests selection (Enter/Space)
   */
  onSelect?: (id: string, index: number) => void;

  /**
   * Called when user presses Escape
   */
  onEscape?: () => void;

  /**
   * Whether to loop navigation at start/end
   * @default false
   */
  loop?: boolean;

  /**
   * Check if an item is disabled
   * @default () => false
   */
  isItemDisabled?: (node: TNode) => boolean;

  /**
   * Returns the number of items to move for PageUp/PageDown navigation.
   * If not provided, defaults to 10.
   */
  getPageSize?: () => number;
};

export type UseVirtualizedKeyboardNavigationReturn = {
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
 * Hook for keyboard navigation through a virtualized tree list.
 * Works with array indices instead of DOM IDs since items may not be in DOM.
 *
 * Supports:
 * - ArrowUp/ArrowDown for moving between items
 * - ArrowRight for expand or move to first child
 * - ArrowLeft for collapse or move to parent
 * - Home/End keys for jumping to first/last
 * - Enter/Space for selection
 * - Escape key handling
 * - Loop navigation (optional)
 * - Disabled item skipping
 */
export function useVirtualizedKeyboardNavigation<TNode extends FlatNodeBase>(
  config: VirtualizedKeyboardNavigationConfig<TNode>,
): UseVirtualizedKeyboardNavigationReturn {
  const {
    items,
    activeIndex,
    setActiveIndex,
    scrollToIndex,
    onExpand,
    onCollapse,
    onSelect,
    onEscape,
    loop = false,
    isItemDisabled = () => false,
    getPageSize,
  } = config;

  const moveActive = useCallback(
    (delta: number): void => {
      if (!items.length) {
        return;
      }

      const currentIndex = activeIndex ?? -1;
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
        const item = items[newIndex];
        if (item && !isItemDisabled(item)) {
          setActiveIndex(newIndex);
          scrollToIndex(newIndex);
          return;
        }

        // Try next item in the same direction
        newIndex += delta;
        attempts++;
      }

      // All items are disabled, do nothing
    },
    [items, activeIndex, setActiveIndex, scrollToIndex, loop, isItemDisabled],
  );

  const findParentIndex = useCallback(
    (node: TNode): number | null => {
      if (!node.parentId) {
        return null;
      }
      return items.findIndex(item => item.id === node.parentId);
    },
    [items],
  );

  const findFirstChildIndex = useCallback(
    (nodeId: string, nodeIndex: number): number | null => {
      // First child should be the next item if it has a higher level
      const nextItem = items[nodeIndex + 1];
      if (nextItem?.parentId === nodeId) {
        return nodeIndex + 1;
      }
      return null;
    },
    [items],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      if (!items.length) {
        return;
      }

      const activeNode = activeIndex !== null ? items[activeIndex] : null;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveActive(1);
          break;

        case 'ArrowUp':
          e.preventDefault();
          moveActive(-1);
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (activeNode && activeIndex !== null) {
            if (activeNode.hasChildren && !activeNode.isExpanded) {
              // Expand the node
              onExpand?.(activeNode.id);
            } else if (activeNode.isExpanded) {
              // Move to first child
              const childIndex = findFirstChildIndex(activeNode.id, activeIndex);
              const childItem = childIndex !== null ? items[childIndex] : undefined;
              if (childIndex !== null && childItem && !isItemDisabled(childItem)) {
                setActiveIndex(childIndex);
                scrollToIndex(childIndex);
              }
            }
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (activeNode) {
            if (activeNode.isExpanded) {
              // Collapse the node
              onCollapse?.(activeNode.id);
            } else {
              // Move to parent
              const parentIndex = findParentIndex(activeNode);
              const parentItem = parentIndex !== null ? items[parentIndex] : undefined;
              if (parentIndex !== null && parentItem && !isItemDisabled(parentItem)) {
                setActiveIndex(parentIndex);
                scrollToIndex(parentIndex);
              }
            }
          }
          break;

        case 'Home':
          e.preventDefault();
          {
            const firstEnabled = items.findIndex(node => !isItemDisabled(node));
            if (firstEnabled !== -1) {
              setActiveIndex(firstEnabled);
              scrollToIndex(firstEnabled);
            }
          }
          break;

        case 'End':
          e.preventDefault();
          {
            // Find last enabled item
            for (let i = items.length - 1; i >= 0; i--) {
              const item = items[i];
              if (item && !isItemDisabled(item)) {
                setActiveIndex(i);
                scrollToIndex(i);
                break;
              }
            }
          }
          break;

        case 'PageUp':
          e.preventDefault();
          {
            const pageSize = getPageSize?.() ?? 10;
            moveActive(-pageSize);
          }
          break;

        case 'PageDown':
          e.preventDefault();
          {
            const pageSize = getPageSize?.() ?? 10;
            moveActive(pageSize);
          }
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (activeNode && activeIndex !== null && !isItemDisabled(activeNode)) {
            onSelect?.(activeNode.id, activeIndex);
          }
          break;

        case 'Escape':
          e.preventDefault();
          onEscape?.();
          break;
      }
    },
    [
      items,
      activeIndex,
      moveActive,
      setActiveIndex,
      scrollToIndex,
      onExpand,
      onCollapse,
      onSelect,
      onEscape,
      isItemDisabled,
      findParentIndex,
      findFirstChildIndex,
      getPageSize,
    ],
  );

  return {
    moveActive,
    handleKeyDown,
  };
}
