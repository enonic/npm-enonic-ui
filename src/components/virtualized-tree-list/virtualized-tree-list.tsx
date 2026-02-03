import { ChevronRight, Circle, Square } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconButton, type IconButtonProps } from '@/components/icon-button';
import {
  TreeListRowContent,
  type TreeListRowContentProps,
  TreeListRowLeft,
  type TreeListRowLeftProps,
  TreeListRowLevelSpacer,
  type TreeListRowLevelSpacerProps,
  TreeListRowLoading,
  type TreeListRowLoadingProps,
  TreeListRowPlaceholder,
  type TreeListRowPlaceholderProps,
  TreeListRowRight,
  type TreeListRowRightProps,
  treeListRowVariants,
} from '@/components/tree-list/tree-list';
import { useControlledState, useControlledStateWithNull, useVirtualizedKeyboardNavigation } from '@/hooks';
import { CircleDisc, FilledSquareCheck } from '@/icons';
import { usePrefixedId } from '@/providers';
import { useVirtualizedTreeList, VirtualizedTreeListProvider } from '@/providers/virtualized-tree-list-provider';
import type { ItemInteraction, LucideIcon } from '@/types';
import { cn } from '@/utils';

//
// * Types
//

/**
 * Flat node type for virtualized tree list.
 * This represents a single node in a flattened tree structure.
 */
export type FlatNode<TData = unknown> = {
  /** Unique identifier for the node */
  id: string;
  /** User data associated with the node */
  data: TData;
  /** Nesting level (1 = root level) */
  level: number;
  /** Parent node ID, null for root nodes */
  parentId: string | null;
  /** Whether the node has children */
  hasChildren: boolean;
  /** Whether the node is currently expanded */
  isExpanded: boolean;
  /** Whether the node is in a loading state */
  isLoading?: boolean;
};

/**
 * Props returned by getItemProps for a row item.
 */
export type VirtualizedTreeListItemProps = {
  id: string;
  'data-index': number;
  role: 'treeitem';
  'aria-selected': boolean | undefined;
  'aria-expanded': boolean | undefined;
  'aria-level': number;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  /**
   * Double-click handler (Preact). Preact uses `onDblClick`, React uses `onDoubleClick`.
   * Both are provided for cross-framework compatibility. See architecture.md.
   */
  onDblClick: () => void;
  /** Double-click handler (React). See `onDblClick` comment above. */
  onDoubleClick: () => void;
  active: boolean;
  selected: boolean;
};

/**
 * Props passed to the render function.
 */
export type VirtualizedTreeListRenderProps<TData> = {
  /** The flat list of nodes to render */
  items: readonly FlatNode<TData>[];
  /** Function to get props for each row item */
  getItemProps: (index: number, node: FlatNode<TData>) => VirtualizedTreeListItemProps;
  /** Current active item index */
  activeIndex: number | null;
  /**
   * Props to spread on the Virtuoso container for keyboard navigation, ARIA, and focus management.
   *
   * IMPORTANT: The `className` includes `group/tree` which is required for keyboard focus rings.
   * When using custom Virtuoso components, you MUST preserve this className by merging it:
   *
   * @example
   * ```tsx
   * <Virtuoso
   *   {...containerProps}
   *   className={cn('your-classes', containerProps.className)}
   *   components={{
   *     Scroller: forwardRef(({ className, ...props }, ref) => (
   *       <div ref={ref} {...props} className={cn('scroller-styles', className)} />
   *     )),
   *   }}
   * />
   * ```
   */
  containerProps: {
    role: 'tree';
    'aria-label'?: string;
    'aria-activedescendant': string | undefined;
    'aria-multiselectable': boolean | undefined;
    tabIndex: 0;
    /**
     * Contains `group/tree` class for CSS-based keyboard focus detection.
     * Must be preserved when customizing Virtuoso's Scroller component.
     */
    className: string;
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
  };
};

/**
 * Virtuoso handle type for scroll operations.
 * This matches the VirtuosoHandle from react-virtuoso.
 */
export type VirtuosoHandle = {
  scrollToIndex: (
    location: number | { index: number; align?: 'start' | 'center' | 'end'; behavior?: 'auto' | 'smooth' },
  ) => void;
  scrollIntoView?: (location: {
    index: number;
    align?: 'start' | 'center' | 'end';
    behavior?: 'auto' | 'smooth';
  }) => void;
};

export type VirtualizedTreeListRootProps<TData = unknown> = {
  /** Flat list of tree nodes to render */
  items: readonly FlatNode<TData>[];

  /** Controlled selection state */
  selection?: ReadonlySet<string>;
  /** Default selection for uncontrolled mode */
  defaultSelection?: ReadonlySet<string>;
  /** Callback when selection changes */
  onSelectionChange?: (selection: ReadonlySet<string>) => void;
  /** Selection mode: 'single', 'multiple', or 'none' (navigation only) */
  selectionMode?: 'single' | 'multiple' | 'none';

  /** Controlled active item ID (null = no active item in controlled mode) */
  active?: string | null;
  /** Default active item ID for uncontrolled mode */
  defaultActive?: string;
  /** Callback when active item changes (null = no active item) */
  onActiveChange?: (active: string | null) => void;

  /** Callback when a node should be expanded */
  onExpand?: (id: string) => void;
  /** Callback when a node should be collapsed */
  onCollapse?: (id: string) => void;

  /** Callback when an item is activated (Enter key or double-click) */
  onActivate?: (id: string) => void;

  /** Ref to Virtuoso component for scroll operations */
  virtuosoRef?: RefObject<VirtuosoHandle | null>;

  /** Whether navigation should loop at start/end */
  loop?: boolean;

  /**
   * Controls how users can interact with each item.
   *
   * Returns:
   * - `'full'`: Item can be navigated to and selected (default)
   * - `'navigate-only'`: Item can receive focus but cannot be selected
   * - `'none'`: Item is completely non-interactive (skipped in navigation, cannot be selected)
   *
   * Default behavior when not provided:
   * - `'none'` for loading items (`isLoading === true`) or placeholder items (`data == null`)
   * - `'full'` for all other items
   *
   * **Note:** Unlike TreeList, VirtualizedTreeList doesn't track disabled state internally.
   * To make disabled items non-interactive, you must provide this callback explicitly.
   *
   * @example
   * // Loading/placeholder items non-interactive
   * getItemInteraction={(node) => node.isLoading || !node.data ? 'none' : 'full'}
   *
   * @example
   * // Disabled items non-interactive
   * getItemInteraction={(node) => {
   *   if (node.isLoading || !node.data) return 'none';
   *   if (disabledIds.has(node.id)) return 'none';
   *   return 'full';
   * }}
   */
  getItemInteraction?: (node: FlatNode<TData>) => ItemInteraction;

  /**
   * When true, single-clicking the active item while selection is empty
   * will clear the active state. Double-clicks are not affected.
   * Default: false.
   *
   * This enables "toggle active" behavior where users can deactivate
   * an item by clicking it again when nothing is selected.
   */
  clearActiveOnReclick?: boolean;

  /**
   * When true, selection is preserved even when items are filtered.
   * Use this when `items` represents a filtered view of a larger dataset.
   *
   * When false (default), selection is cleaned up when items change -
   * selected IDs not present in `items` are removed from selection.
   *
   * @default false
   */
  preserveFilteredSelection?: boolean;

  /**
   * When true (default), pressing Escape clears the selection.
   * Set to false when using inside a Combobox where Escape should
   * only close the dropdown without clearing selection.
   *
   * @default true
   */
  clearSelectionOnEscape?: boolean;

  /** Accessible label for the tree */
  'aria-label'?: string;

  /** Render function that receives items and helper props */
  children: (props: VirtualizedTreeListRenderProps<TData>) => ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

//
// * VirtualizedTreeListRoot
//

const VirtualizedTreeListRoot = forwardRef(
  <TData = unknown>(
    {
      items,
      selection: controlledSelection,
      defaultSelection,
      onSelectionChange,
      selectionMode = 'single',
      active: controlledActive,
      defaultActive,
      onActiveChange,
      onExpand,
      onCollapse,
      onActivate,
      virtuosoRef,
      loop = false,
      getItemInteraction,
      clearActiveOnReclick = false,
      preserveFilteredSelection = false,
      clearSelectionOnEscape = true,
      'aria-label': ariaLabel,
      className,
      children,
      ...props
    }: VirtualizedTreeListRootProps<TData>,
    ref: React.ForwardedRef<HTMLDivElement>,
  ): ReactElement => {
    const baseId = usePrefixedId(undefined, 'virtualized-tree-list');
    const innerRef = useRef<HTMLDivElement>(null);

    const [selection, setSelection] = useControlledState<ReadonlySet<string>>(
      controlledSelection,
      defaultSelection ?? new Set(),
      onSelectionChange,
    );

    const [activeId, setActiveId] = useControlledStateWithNull(controlledActive, defaultActive, onActiveChange);

    // Track anchor for shift+click range selection
    const selectionAnchorRef = useRef<number | null>(null);

    const activeIndex = useMemo(() => {
      if (!activeId) return null;
      const index = items.findIndex(item => item.id === activeId);
      return index === -1 ? null : index;
    }, [activeId, items]);

    const setActiveIndex = useCallback(
      (index: number | null) => {
        if (index === null) {
          setActiveId(null);
        } else {
          const item = items[index] as FlatNode<TData> | undefined;
          if (item) {
            setActiveId(item.id);
          }
        }
      },
      [items, setActiveId],
    );

    const [isFocused, setFocused] = useState(false);

    const scrollToIndex = useCallback(
      (index: number) => {
        virtuosoRef?.current?.scrollToIndex({
          index,
          align: 'center',
          behavior: 'auto',
        });
      },
      [virtuosoRef],
    );

    // Interaction helpers
    const getInteraction = useCallback(
      (node: FlatNode<TData>): ItemInteraction => {
        if (getItemInteraction) return getItemInteraction(node);
        // Default: loading or placeholder items (null/undefined data) are non-interactive
        return node.isLoading || node.data == null ? 'none' : 'full';
      },
      [getItemInteraction],
    );

    const canNavigate = useCallback(
      (node: FlatNode<TData>): boolean => getInteraction(node) !== 'none',
      [getInteraction],
    );

    const canSelect = useCallback(
      (node: FlatNode<TData>): boolean => getInteraction(node) === 'full',
      [getInteraction],
    );

    const toggleSelection = useCallback(
      (id: string, index: number) => {
        if (selectionMode === 'none') return;

        // Check if item can be selected
        const item = items[index];
        if (!item || !canSelect(item)) return;

        const newSelection = new Set(selectionMode === 'multiple' ? selection : []);
        const isSelected = selection.has(id);

        if (isSelected) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }

        // Update anchor for range selection
        if (!isSelected) {
          selectionAnchorRef.current = index;
        }

        setSelection(newSelection);
      },
      [selection, selectionMode, setSelection, items, canSelect],
    );

    const rangeSelect = useCallback(
      (fromIndex: number, toIndex: number) => {
        if (selectionMode !== 'multiple') return;

        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);
        const rangeIds = items
          .slice(start, end + 1)
          .filter(item => canSelect(item))
          .map(item => item.id);

        setSelection(new Set([...selection, ...rangeIds]));
      },
      [items, selection, selectionMode, setSelection, canSelect],
    );

    const getItemIndex = useCallback((id: string): number => items.findIndex(item => item.id === id), [items]);

    // Action mode state (F2 to focus interactive elements within a row)
    const [actionModeRowId, setActionModeRowId] = useState<string | undefined>(undefined);

    const FOCUSABLE_SELECTOR =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const exitActionMode = useCallback(() => {
      setActionModeRowId(undefined);
      // Focus the tree container (Virtuoso element with role="tree")
      const treeElement = innerRef.current?.querySelector('[role="tree"]') as HTMLElement | null;
      treeElement?.focus();
    }, []);

    // Handle action mode row being virtualized away (removed from DOM by Virtuoso)
    // When the focused element is removed, browser moves focus to body, losing tree focus
    useEffect(() => {
      if (!actionModeRowId) return;

      const rowId = `${baseId}-item-${actionModeRowId}`;

      // Use MutationObserver to detect when the row is removed from DOM
      const observer = new MutationObserver(() => {
        const rowElement = document.getElementById(rowId);
        if (!rowElement) {
          // Row was virtualized away - exit action mode and restore focus
          setActionModeRowId(undefined);
          observer.disconnect();
          requestAnimationFrame(() => {
            const treeElement = innerRef.current?.querySelector('[role="tree"]') as HTMLElement | null;
            treeElement?.focus();
          });
        }
      });

      // Observe the container for child list changes (Virtuoso adding/removing items)
      const container = innerRef.current;
      if (container) {
        observer.observe(container, { childList: true, subtree: true });
      }

      return () => observer.disconnect();
    }, [actionModeRowId, baseId]);

    // State invalidation: clean up selection when items change
    // biome-ignore lint/correctness/useExhaustiveDependencies: Only run when items array identity changes
    useEffect(() => {
      const currentIds = new Set(items.map(item => item.id));

      // Skip selection cleanup if preserveFilteredSelection is enabled
      // This allows selection to persist when items are filtered (but still exist in the data source)
      if (!preserveFilteredSelection) {
        // Remove selection for items that no longer exist
        let selectionChanged = false;
        const validSelection = new Set<string>();
        for (const id of selection) {
          if (currentIds.has(id)) {
            validSelection.add(id);
          } else {
            selectionChanged = true;
          }
        }

        if (selectionChanged) {
          setSelection(validSelection);
        }
      }

      // Reset active if it no longer exists (always needed for keyboard navigation)
      if (activeId && !currentIds.has(activeId)) {
        const firstId = items[0]?.id ?? null;
        setActiveId(firstId);
      }

      // Reset anchor if it no longer exists
      if (selectionAnchorRef.current !== null) {
        const anchoredItem = items[selectionAnchorRef.current];
        if (!anchoredItem || !currentIds.has(anchoredItem.id)) {
          selectionAnchorRef.current = null;
        }
      }
    }, [items, preserveFilteredSelection]);

    const findNextEnabledIndex = useCallback(
      (currentIndex: number | null, delta: number): number | null => {
        if (!items.length) return null;

        const startIndex = currentIndex ?? (delta > 0 ? -1 : items.length);
        let newIndex = startIndex + delta;

        while (newIndex >= 0 && newIndex < items.length) {
          const item = items[newIndex];
          if (item && canNavigate(item)) {
            return newIndex;
          }
          newIndex += delta;
        }

        return null;
      },
      [items, canNavigate],
    );

    const { handleKeyDown: baseHandleKeyDown } = useVirtualizedKeyboardNavigation({
      items,
      activeIndex,
      setActiveIndex,
      scrollToIndex,
      onExpand,
      onCollapse,
      onSelect: (id, index) => toggleSelection(id, index),
      loop,
      isItemDisabled: node => !canNavigate(node),
    });

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLElement>) => {
        // In action mode, let Space/Enter activate the focused button
        if (actionModeRowId && (e.key === ' ' || e.key === 'Enter')) {
          return;
        }

        // Handle F2 for action mode
        if (e.key === 'F2') {
          e.preventDefault();

          if (activeIndex === null) return;
          const activeItem = items[activeIndex];
          if (!activeItem) return;

          // Scroll to ensure row is in DOM
          scrollToIndex(activeIndex);

          // Wait for render, then focus first interactive element
          requestAnimationFrame(() => {
            const rowId = `${baseId}-item-${activeItem.id}`;
            const rowElement = document.getElementById(rowId);
            if (!rowElement) return;

            const focusables = rowElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            const firstFocusable = focusables[0];

            if (firstFocusable) {
              setActionModeRowId(activeItem.id);
              firstFocusable.focus();
            }
          });
          return;
        }

        // Handle Tab in action mode
        if (e.key === 'Tab' && actionModeRowId) {
          e.preventDefault();

          const rowId = `${baseId}-item-${actionModeRowId}`;
          const rowElement = document.getElementById(rowId);
          if (!rowElement) {
            exitActionMode();
            return;
          }

          const focusables = Array.from(rowElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
          if (focusables.length === 0) {
            exitActionMode();
            return;
          }

          const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);

          if (e.shiftKey) {
            if (currentIndex <= 0) {
              exitActionMode();
            } else {
              focusables[currentIndex - 1]?.focus();
            }
          } else {
            if (currentIndex === -1 || currentIndex === focusables.length - 1) {
              exitActionMode();
            } else {
              focusables[currentIndex + 1]?.focus();
            }
          }
          return;
        }

        // Handle Escape - exit action mode first, then optionally clear selection
        if (e.key === 'Escape') {
          e.preventDefault();
          if (actionModeRowId) {
            exitActionMode();
          } else if (clearSelectionOnEscape && selectionMode !== 'none') {
            setSelection(new Set());
          }
          return;
        }

        // Handle Enter for activation (only for selectable items)
        if (e.key === 'Enter' && activeIndex !== null) {
          e.preventDefault();
          const item = items[activeIndex];
          if (item && canSelect(item)) {
            onActivate?.(item.id);
          }
          return;
        }

        // Handle Shift+Arrow for range selection (multiple mode only)
        if (e.shiftKey && selectionMode === 'multiple' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          e.preventDefault();

          if (activeIndex === null) return;

          // Set anchor if not set
          const anchor = selectionAnchorRef.current ?? activeIndex;
          if (selectionAnchorRef.current === null) {
            selectionAnchorRef.current = activeIndex;
          }

          // Move active
          const delta = e.key === 'ArrowDown' ? 1 : -1;
          const newIndex = findNextEnabledIndex(activeIndex, delta);
          if (newIndex !== null) {
            setActiveIndex(newIndex);
            scrollToIndex(newIndex);

            // Select range from anchor to new position (only selectable items)
            const [start, end] = [Math.min(anchor, newIndex), Math.max(anchor, newIndex)];
            const rangeIds = items
              .slice(start, end + 1)
              .filter(item => canSelect(item))
              .map(item => item.id);
            setSelection(new Set(rangeIds));
          }
          return;
        }

        // Handle Ctrl+A for select all/toggle (multiple mode only, only selectable items)
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && selectionMode === 'multiple') {
          e.preventDefault();

          const selectableIds = items.filter(item => canSelect(item)).map(item => item.id);
          const allSelected = selectableIds.every(id => selection.has(id));

          if (allSelected) {
            setSelection(new Set());
          } else {
            setSelection(new Set(selectableIds));
          }
          return;
        }

        // Delegate to base handler for standard navigation
        baseHandleKeyDown(e);
      },
      [
        actionModeRowId,
        activeIndex,
        items,
        scrollToIndex,
        baseId,
        exitActionMode,
        selectionMode,
        setSelection,
        onActivate,
        findNextEnabledIndex,
        setActiveIndex,
        selection,
        baseHandleKeyDown,
        canSelect,
        clearSelectionOnEscape,
      ],
    );

    // Handle row click
    const handleRowClick = useCallback(
      (id: string, index: number, e: React.MouseEvent<HTMLElement>) => {
        // Don't handle clicks on interactive elements (let them handle it themselves)
        const target = e.target as Element;
        if (target.closest('button, a, input, select, textarea, [role="button"]')) {
          return;
        }

        // Check if item allows navigation
        const item = items[index];
        if (!item || !canNavigate(item)) return;

        // Focus tree container for keyboard navigation
        const tree = e.currentTarget.closest<HTMLElement>('[role="tree"]');
        tree?.focus();

        // Clear active on reclick: single-click on active item clears active
        // e.detail === 1 ensures we only clear on single clicks, not double-clicks
        if (clearActiveOnReclick && activeIndex === index && e.detail === 1) {
          setActiveIndex(null);
          return;
        }

        // Skip setting active on double-click's second event when clearActiveOnReclick is enabled
        // (the first click already cleared active, don't re-activate on the second)
        if (clearActiveOnReclick && e.detail > 1) return;

        // Set this item as active
        setActiveIndex(index);

        // When clearActiveOnReclick is enabled, row clicks only affect active state
        if (clearActiveOnReclick) return;

        // Check if item allows selection
        if (!canSelect(item)) return;

        // Skip selection handling if mode is 'none'
        if (selectionMode === 'none') return;

        if (selectionMode === 'multiple') {
          if (e.shiftKey && selectionAnchorRef.current !== null) {
            // Range selection
            rangeSelect(selectionAnchorRef.current, index);
          } else if (e.metaKey || e.ctrlKey) {
            // Toggle selection
            toggleSelection(id, index);
          } else {
            // Single item selection (clears others)
            selectionAnchorRef.current = index;
            setSelection(new Set([id]));
          }
        } else {
          // Single mode: just select this item
          toggleSelection(id, index);
        }
      },
      [
        selectionMode,
        setActiveIndex,
        toggleSelection,
        rangeSelect,
        setSelection,
        items,
        canNavigate,
        canSelect,
        clearActiveOnReclick,
        activeIndex,
      ],
    );

    // Build getItemProps function
    const getItemProps = useCallback(
      (index: number, node: FlatNode<TData>): VirtualizedTreeListItemProps => {
        const isActive = activeIndex === index;
        const isSelected = selection.has(node.id);

        // aria-selected: don't set for 'none' mode, set true/false for 'multiple', only true for 'single'
        let ariaSelected: boolean | undefined;
        if (selectionMode !== 'none') {
          ariaSelected = isSelected ? true : selectionMode === 'multiple' ? false : undefined;
        }

        return {
          id: `${baseId}-item-${node.id}`,
          'data-index': index,
          role: 'treeitem',
          'aria-selected': ariaSelected,
          'aria-expanded': node.hasChildren ? node.isExpanded : undefined,
          'aria-level': node.level,
          onClick: (e: React.MouseEvent<HTMLElement>) => handleRowClick(node.id, index, e),
          onDblClick: () => onActivate?.(node.id),
          onDoubleClick: () => onActivate?.(node.id),
          active: isActive,
          selected: isSelected,
        };
      },
      [baseId, activeIndex, selection, selectionMode, handleRowClick, onActivate],
    );

    const handleContainerFocus = useCallback(() => {
      setFocused(true);
    }, []);

    const handleContainerBlur = useCallback(() => {
      setFocused(false);
    }, []);

    // Container props for Virtuoso
    // The 'group/tree' class enables CSS-based keyboard focus detection for rows.
    // When this element has :focus-visible, descendant rows with group-focus-visible/tree:*
    // classes will show their focus rings. Users must preserve className when customizing Scroller.
    const containerProps = useMemo(
      () => ({
        role: 'tree' as const,
        'aria-label': ariaLabel,
        'aria-activedescendant': activeId ? `${baseId}-item-${activeId}` : undefined,
        'aria-multiselectable': selectionMode === 'multiple' ? true : undefined,
        tabIndex: 0 as const,
        className: 'group/tree outline-none',
        onKeyDown: handleKeyDown,
        onFocus: handleContainerFocus,
        onBlur: handleContainerBlur,
      }),
      [ariaLabel, activeId, baseId, selectionMode, handleKeyDown, handleContainerFocus, handleContainerBlur],
    );

    // Render props
    const renderProps: VirtualizedTreeListRenderProps<TData> = useMemo(
      () => ({
        items,
        getItemProps,
        activeIndex,
        containerProps,
      }),
      [items, getItemProps, activeIndex, containerProps],
    );

    // Context value
    const contextValue = useMemo(
      () => ({
        baseId,
        activeIndex,
        activeId: activeId ?? null,
        setActiveIndex,
        selection,
        toggleSelection,
        selectionMode,
        isFocused,
        items,
        getItemIndex,
        scrollToIndex,
        onExpand,
        onCollapse,
        onActivate,
        actionModeRowId,
        exitActionMode,
      }),
      [
        baseId,
        activeIndex,
        activeId,
        setActiveIndex,
        selection,
        toggleSelection,
        selectionMode,
        isFocused,
        items,
        getItemIndex,
        scrollToIndex,
        onExpand,
        onCollapse,
        onActivate,
        actionModeRowId,
        exitActionMode,
      ],
    );

    return (
      <VirtualizedTreeListProvider value={contextValue}>
        <div
          id={baseId}
          ref={node => {
            (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={cn(
            // Soft focus ring on container (like Toolbar)
            'outline-none focus-within:ring-2 focus-within:ring-ring/10 focus-within:ring-inset',
            className,
          )}
          {...props}
        >
          {children(renderProps)}
        </div>
      </VirtualizedTreeListProvider>
    );
  },
) as <TData = unknown>(
  props: VirtualizedTreeListRootProps<TData> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReactElement;

(VirtualizedTreeListRoot as React.FC).displayName = 'VirtualizedTreeList';

//
// * VirtualizedTreeListRow
//

/**
 * Row component for VirtualizedTreeList.
 *
 * Focus Ring Behavior:
 * The focus ring uses CSS `group-focus-visible/tree` to detect keyboard focus.
 * This requires the Virtuoso container's Scroller to have the `group/tree` class
 * (provided via `containerProps.className`). When the Scroller has keyboard focus
 * (`:focus-visible`), active rows will show their focus rings automatically.
 *
 * This approach was chosen over JavaScript state tracking because:
 * 1. The browser's `:focus-visible` heuristic correctly handles keyboard vs mouse focus
 * 2. It doesn't require additional state management
 * 3. It matches TreeList's native behavior (which uses `:focus-visible` directly)
 *
 * IMPORTANT: If you customize Virtuoso's Scroller component, you must preserve
 * the `className` prop by merging it with your custom classes. See containerProps docs.
 */
export type VirtualizedTreeListRowProps = {
  /** Whether this row is the active (focused) row */
  active?: boolean;
  /** Whether this row is selected */
  selected?: boolean;
  /** Whether this row is disabled */
  disabled?: boolean;
  /** Whether this row is selectable */
  selectable?: boolean;
  /** Additional class names */
  className?: string;
  /** Row content */
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const VirtualizedTreeListRow = forwardRef<HTMLDivElement, VirtualizedTreeListRowProps>(
  (
    { active = false, selected = false, disabled = false, selectable = true, className, children, ...props },
    ref,
  ): ReactElement => {
    return (
      <div
        ref={ref}
        data-tone={selected ? 'inverse' : undefined}
        data-active={active || undefined}
        aria-disabled={disabled || undefined}
        className={cn(
          treeListRowVariants({
            active,
            selected,
            disabled,
            selectable: selectable && !disabled,
          }),
          // Focus ring for keyboard navigation (uses CSS group-focus-visible to detect keyboard focus on container)
          active &&
            !disabled && [
              'group-focus-visible/tree:ring-3 group-focus-visible/tree:ring-ring-offset group-focus-visible/tree:ring-inset',
              'group-focus-visible/tree:ring-offset-3 group-focus-visible/tree:ring-offset-ring',
            ],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

VirtualizedTreeListRow.displayName = 'VirtualizedTreeList.Row';

//
// * VirtualizedTreeListAction
//

export type VirtualizedTreeListActionProps = {
  /** Interactive element to exclude from normal tab order (use F2 action mode) */
  children: ReactElement;
};

/**
 * Wrapper for interactive elements inside VirtualizedTreeList rows.
 * Removes the element from normal tab order (tabIndex={-1}) so it's only
 * accessible via F2 action mode.
 */
export const VirtualizedTreeListAction = ({ children }: VirtualizedTreeListActionProps): ReactElement => {
  return cloneElement(children, { tabIndex: -1 });
};

VirtualizedTreeListAction.displayName = 'VirtualizedTreeList.Action';

//
// * VirtualizedTreeListRowExpandControl
//

export type VirtualizedTreeListRowExpandControlProps = {
  /** Row ID - if provided, clicking will also set this row as active */
  rowId?: string;
  expanded?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
  icon?: LucideIcon;
  selected?: boolean;
  className?: string;
} & Omit<IconButtonProps, 'icon' | 'onClick'>;

export const VirtualizedTreeListRowExpandControl = forwardRef<
  HTMLButtonElement,
  VirtualizedTreeListRowExpandControlProps
>(
  (
    {
      rowId,
      expanded = false,
      hasChildren = false,
      onToggle,
      icon = ChevronRight,
      selected = false,
      className,
      ...props
    },
    ref,
  ): ReactElement => {
    // Access context to set active when expand control is clicked
    const context = useVirtualizedTreeList();

    if (!hasChildren) {
      return <span className='size-5 shrink-0' />;
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
      onToggle?.();
      // Also set this row as active so keyboard navigation works
      if (rowId) {
        const index = context.getItemIndex(rowId);
        if (index !== -1) {
          context.setActiveIndex(index);
        }
      }
      e.stopPropagation();
    };

    return (
      <IconButton
        ref={ref}
        icon={icon}
        variant='text'
        title={expanded ? 'Collapse' : 'Expand'}
        tabIndex={-1}
        className={cn(
          'size-5 bg-transparent transition-transform duration-150 hover:bg-transparent active:bg-transparent active:text-main',
          selected && 'text-alt hover:text-alt active:text-alt',
          expanded && 'rotate-90',
          className,
        )}
        onClick={handleClick}
        // Preact/React dual event handler. See architecture.md for details.
        onDblClick={e => e.stopPropagation()}
        {...{ onDoubleClick: (e: MouseEvent) => e.stopPropagation() }}
        {...props}
      />
    );
  },
);

VirtualizedTreeListRowExpandControl.displayName = 'VirtualizedTreeList.RowExpandControl';

//
// * VirtualizedTreeListRowSelectionControl
//

export type VirtualizedTreeListRowSelectionControlProps = {
  /** Row ID - required for toggle selection to work */
  rowId: string;
  /** Override selection state. If not provided, reads from VirtualizedTreeList selection context. */
  selected?: boolean;
  selectable?: boolean;
  /** Override indicator style. Default: checkbox for multiple, none for single */
  variant?: 'checkbox' | 'radio';
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onClick'>;

export const VirtualizedTreeListRowSelectionControl = forwardRef<
  HTMLDivElement,
  VirtualizedTreeListRowSelectionControlProps
>(({ rowId, selected, selectable = true, variant, className, ...props }, ref): ReactElement | null => {
  const { selection, toggleSelection, setActiveIndex, selectionMode, getItemIndex } = useVirtualizedTreeList();

  // Use prop if provided, otherwise read from context
  const isSelected = selected ?? selection.has(rowId);

  // Determine effective variant: checkbox for multiple, undefined (no indicator) for single
  const effectiveVariant = variant ?? (selectionMode === 'multiple' ? 'checkbox' : undefined);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const index = getItemIndex(rowId);
      if (index !== -1) {
        setActiveIndex(index);
        toggleSelection(rowId, index);
      }
      // Focus tree container for keyboard navigation
      const tree = e.currentTarget.closest<HTMLElement>('[role="tree"]');
      tree?.focus();
    },
    [rowId, setActiveIndex, toggleSelection, getItemIndex],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const index = getItemIndex(rowId);
        if (index !== -1) {
          setActiveIndex(index);
          toggleSelection(rowId, index);
        }
      }
    },
    [rowId, setActiveIndex, toggleSelection, getItemIndex],
  );

  // No indicator: single mode default, none mode, or not selectable
  if (!selectable || selectionMode === 'none' || !effectiveVariant) {
    return null;
  }

  // Radio variant (opt-in for single selection)
  if (effectiveVariant === 'radio') {
    return (
      <div
        ref={ref}
        role='radio'
        aria-checked={isSelected}
        aria-label={isSelected ? 'Selected' : 'Select row'}
        tabIndex={-1}
        className={cn('flex size-4 cursor-pointer items-center', className)}
        onKeyDown={handleKeyDown}
        // Preact/React dual event handler. See architecture.md for details.
        onDblClick={e => e.stopPropagation()}
        {...{ onDoubleClick: (e: MouseEvent) => e.stopPropagation() }}
        {...props}
        onClick={handleClick}
      >
        {isSelected ? <CircleDisc className='size-4' /> : <Circle className='size-4' strokeWidth={2} />}
      </div>
    );
  }

  // Checkbox variant (default for multiple selection)
  return (
    <div
      ref={ref}
      role='checkbox'
      aria-checked={isSelected}
      aria-label={isSelected ? 'Deselect row' : 'Select row'}
      tabIndex={-1}
      className={cn(
        'flex size-4 cursor-pointer items-center',
        'after:-inset-1 after:-z-10 relative z-0 after:pointer-events-auto after:absolute after:rounded-sm after:content-[""]',
        className,
      )}
      onKeyDown={handleKeyDown}
      // Preact/React dual event handler. See architecture.md for details.
      onDblClick={e => e.stopPropagation()}
      {...{ onDoubleClick: (e: MouseEvent) => e.stopPropagation() }}
      {...props}
      onClick={handleClick}
    >
      {isSelected ? <FilledSquareCheck /> : <Square />}
    </div>
  );
});

VirtualizedTreeListRowSelectionControl.displayName = 'VirtualizedTreeList.RowSelectionControl';

//
// * VirtualizedTreeList Export
//

export const VirtualizedTreeList = Object.assign(VirtualizedTreeListRoot, {
  Row: VirtualizedTreeListRow,
  RowLeft: TreeListRowLeft,
  RowRight: TreeListRowRight,
  RowContent: TreeListRowContent,
  RowLevelSpacer: TreeListRowLevelSpacer,
  RowExpandControl: VirtualizedTreeListRowExpandControl,
  RowSelectionControl: VirtualizedTreeListRowSelectionControl,
  RowLoading: TreeListRowLoading,
  RowPlaceholder: TreeListRowPlaceholder,
  Action: VirtualizedTreeListAction,
});

// Re-export types from TreeList for convenience (excluding ExpandControl and SelectionControl which have their own types)
export type {
  TreeListRowContentProps as VirtualizedTreeListRowContentProps,
  TreeListRowLeftProps as VirtualizedTreeListRowLeftProps,
  TreeListRowLevelSpacerProps as VirtualizedTreeListRowLevelSpacerProps,
  TreeListRowLoadingProps as VirtualizedTreeListRowLoadingProps,
  TreeListRowPlaceholderProps as VirtualizedTreeListRowPlaceholderProps,
  TreeListRowRightProps as VirtualizedTreeListRowRightProps,
};
