import { cva } from 'class-variance-authority';
import { ChevronRight, Loader2, Square } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconButton, type IconButtonProps } from '@/components/icon-button';
import {
  useActiveItemFocus,
  useControlledState,
  useItemRegistry,
  useKeyboardNavigation,
  useRovingTabIndex,
} from '@/hooks';
import { FilledSquareCheck } from '@/icons';
import { usePrefixedId } from '@/providers';
import { type SelectionMode, TreeListProvider, useTreeList } from '@/providers/tree-list-provider';
import type { ItemInteraction, LucideIcon } from '@/types';
import { cn, setRef } from '@/utils';

const calcSpacerWidth = (level: number): number => Math.max(0, 10 + 20 * (level - 1));

//
// * Row Variants
//

export const treeListRowVariants = cva(
  [
    'group relative z-0 flex items-center gap-2.5 px-2.5 py-1 outline-none',
    // Click target expansion: -inset-y-{n} where n = gap / 2
    'after:-inset-y-0.75 after:-z-10 after:pointer-events-auto after:absolute after:inset-x-0 after:rounded-sm after:content-[""]',
  ],
  {
    variants: {
      active: {
        true: 'bg-surface-neutral-hover',
        false: 'hover:bg-surface-neutral-hover',
      },
      selected: {
        true: 'bg-surface-selected text-alt hover:bg-surface-selected-hover',
        false: '',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
        false: '',
      },
      selectable: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    compoundVariants: [
      {
        active: true,
        selected: true,
        disabled: false,
        class: 'bg-surface-selected-hover',
      },
      {
        active: true,
        disabled: false,
        class: [
          'focus-visible:ring-3 focus-visible:ring-ring-offset focus-visible:ring-inset',
          'focus-visible:ring-offset-3 focus-visible:ring-offset-ring',
        ],
      },
    ],
    defaultVariants: {
      active: false,
      selected: false,
      disabled: false,
      selectable: true,
    },
  },
);

//
// * TreeListRoot
//

export type TreeListRootProps = {
  selection?: ReadonlySet<string>;
  defaultSelection?: ReadonlySet<string>;
  onSelectionChange?: (selection: ReadonlySet<string>) => void;
  selectionMode?: SelectionMode;
  active?: string;
  defaultActive?: string;
  onActiveChange?: (active: string | undefined) => void;
  loop?: boolean;
  className?: string;
  children?: ReactNode;
  // Activation callback
  onActivate?: (id: string) => void;
  // Tree navigation (optional - for tree behavior)
  getParentId?: (id: string) => string | undefined;
  getFirstChildId?: (id: string) => string | undefined;
  expanded?: ReadonlySet<string>;
  onExpandedChange?: (expanded: ReadonlySet<string>) => void;
  /**
   * Controls how users can interact with each item.
   *
   * Returns:
   * - `'full'`: Item can be navigated to and selected (default)
   * - `'navigate-only'`: Item can receive focus but cannot be selected
   * - `'none'`: Item is completely non-interactive (skipped in navigation, cannot be selected)
   *
   * Default behavior when not provided:
   * - Uses the `disabled` prop from TreeListRow (disabled = 'none', enabled = 'full')
   */
  getItemInteraction?: (id: string) => ItemInteraction;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRoot = forwardRef<HTMLDivElement, TreeListRootProps>(
  (
    {
      selection: controlledSelection,
      defaultSelection,
      onSelectionChange,
      selectionMode = 'single',
      active: controlledActive,
      defaultActive,
      onActiveChange,
      loop = false,
      className,
      children,
      onActivate,
      getParentId,
      getFirstChildId,
      expanded: controlledExpanded,
      onExpandedChange,
      getItemInteraction,
      ...props
    },
    ref,
  ): ReactElement => {
    const baseId = usePrefixedId(undefined, 'tree-list');
    const innerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Helper to convert between logical IDs and DOM IDs
    const toDomId = useCallback((id: string) => `${baseId}-item-${id}`, [baseId]);
    const fromDomId = useCallback((domId: string) => domId.replace(`${baseId}-item-`, ''), [baseId]);

    const [selection, setSelection] = useControlledState<ReadonlySet<string>>(
      controlledSelection,
      defaultSelection ?? new Set(),
      onSelectionChange,
    );

    // Internal active state uses DOM IDs for compatibility with useItemRegistry
    const [active, setActiveInternal] = useControlledState<string | undefined>(
      controlledActive ? toDomId(controlledActive) : undefined,
      defaultActive ? toDomId(defaultActive) : undefined,
      domId => onActiveChange?.(domId ? fromDomId(domId) : undefined),
    );

    const setActive = useCallback(
      (id: string | undefined) => {
        setActiveInternal(id);
      },
      [setActiveInternal],
    );

    const [isFocused, setFocused] = useState(false);

    // Anchor ID for range selection (uses logical IDs)
    const [anchorId, setAnchorId] = useState<string | undefined>(undefined);

    const [expanded, setExpanded] = useControlledState<ReadonlySet<string>>(
      controlledExpanded,
      new Set(),
      onExpandedChange,
    );

    // Action mode state (F2 to focus interactive elements within a row)
    const [actionModeRowId, setActionModeRowId] = useState<string | undefined>(undefined);

    const { registerItem, unregisterItem, getItems, isItemDisabled, registryVersion } = useItemRegistry();

    // Interaction helpers
    const getInteraction = useCallback(
      (id: string): ItemInteraction => {
        if (getItemInteraction) return getItemInteraction(id);
        // Default: check registry's disabled flag
        return isItemDisabled(toDomId(id)) ? 'none' : 'full';
      },
      [getItemInteraction, isItemDisabled, toDomId],
    );

    const canNavigateById = useCallback((id: string): boolean => getInteraction(id) !== 'none', [getInteraction]);

    const canSelectById = useCallback((id: string): boolean => getInteraction(id) === 'full', [getInteraction]);

    //
    // * Selection Methods
    //

    const toggleSelection = useCallback(
      (id: string) => {
        if (selectionMode === 'none') return;
        if (!canSelectById(id)) return;

        const isSelected = selection.has(id);
        const newSelection = new Set(selectionMode === 'multiple' ? selection : []);

        if (isSelected) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }

        setSelection(newSelection);
      },
      [selection, selectionMode, canSelectById, setSelection],
    );

    const selectOnly = useCallback(
      (id: string) => {
        if (selectionMode === 'none') return;
        if (!canSelectById(id)) return;
        setSelection(new Set([id]));
      },
      [selectionMode, canSelectById, setSelection],
    );

    const selectRange = useCallback(
      (fromId: string, toId: string) => {
        if (selectionMode !== 'multiple') return;

        const items = getItems();
        const fromIndex = items.indexOf(toDomId(fromId));
        const toIndex = items.indexOf(toDomId(toId));

        if (fromIndex === -1 || toIndex === -1) return;

        const [start, end] = fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];

        const rangeIds = items
          .slice(start, end + 1)
          .map(domId => fromDomId(domId))
          .filter(id => canSelectById(id));

        setSelection(new Set(rangeIds));
      },
      [selectionMode, getItems, canSelectById, setSelection, toDomId, fromDomId],
    );

    const clearSelection = useCallback(() => {
      if (selectionMode === 'none') return;
      setSelection(new Set());
    }, [selectionMode, setSelection]);

    const selectAll = useCallback(() => {
      if (selectionMode !== 'multiple') return;

      const allIds = getItems()
        .map(domId => fromDomId(domId))
        .filter(id => canSelectById(id));

      setSelection(new Set(allIds));
    }, [selectionMode, getItems, canSelectById, setSelection, fromDomId]);

    //
    // * Tree Navigation Helpers
    //

    const isExpandedById = useCallback(
      (id: string) => {
        return expanded.has(id);
      },
      [expanded],
    );

    const toggleExpanded = useCallback(
      (id: string) => {
        const newExpanded = new Set(expanded);
        if (newExpanded.has(id)) {
          newExpanded.delete(id);
        } else {
          newExpanded.add(id);
        }
        setExpanded(newExpanded);
      },
      [expanded, setExpanded],
    );

    // State invalidation when items change (e.g., removed, collapsed, filtered)
    // biome-ignore lint/correctness/useExhaustiveDependencies: registryVersion triggers revalidation; other deps would cause loops
    useEffect(() => {
      const registeredDomIds = getItems();
      const registeredDomIdSet = new Set(registeredDomIds);

      // 1. Invalidate activeId if item no longer exists
      if (active && !registeredDomIdSet.has(active)) {
        const newActive = registeredDomIds.length > 0 ? registeredDomIds[0] : undefined;
        setActive(newActive);
      }

      // 2. Invalidate selection - remove non-existent items
      let selectionChanged = false;
      const validSelection = new Set<string>();
      for (const id of selection) {
        if (registeredDomIdSet.has(toDomId(id))) {
          validSelection.add(id);
        } else {
          selectionChanged = true;
        }
      }
      if (selectionChanged) {
        setSelection(validSelection);
      }

      // 3. Invalidate anchorId if item no longer exists
      if (anchorId && !registeredDomIdSet.has(toDomId(anchorId))) {
        setAnchorId(active ? fromDomId(active) : undefined);
      }
    }, [registryVersion]);

    // Focusable elements selector for action mode
    const FOCUSABLE_SELECTOR =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Action mode: enter - focus first interactive element in active row
    const enterActionMode = useCallback(() => {
      if (!active || !canNavigateById(fromDomId(active))) return;

      const rowElement = document.getElementById(active);
      if (!rowElement) return;

      const focusables = rowElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const firstFocusable = focusables[0];

      if (firstFocusable) {
        setActionModeRowId(fromDomId(active));
        firstFocusable.focus();
      }
    }, [active, canNavigateById, fromDomId]);

    // Action mode: exit - return focus to tree container
    const exitActionMode = useCallback(() => {
      setActionModeRowId(undefined);
      innerRef.current?.focus();
    }, []);

    const { handleKeyDown: handleNavKeyDown, moveActive } = useKeyboardNavigation({
      getItems,
      isItemDisabled: domId => !canNavigateById(fromDomId(domId)),
      active,
      setActive,
      loop,
      orientation: 'vertical',
      onSelect: domId => {
        if (selectionMode === 'none') return;
        setActive(domId);
        const logicalId = fromDomId(domId);
        toggleSelection(logicalId);
        // Set anchor on Space toggle (for future range selection)
        setAnchorId(logicalId);
      },
    });

    // Calculate page size for PageUp/PageDown navigation
    const getPageSize = useCallback((): number => {
      const container = scrollContainerRef.current;
      if (!container) return 10;

      // Estimate row height from first item or use default
      const firstItem = container.querySelector('[role="treeitem"]');
      const rowHeight = firstItem?.getBoundingClientRect().height ?? 32;

      // Calculate how many items fit in viewport
      return Math.max(1, Math.floor(container.clientHeight / rowHeight));
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        // In action mode, let Space/Enter activate the focused button (don't intercept)
        if (actionModeRowId && (e.key === ' ' || e.key === 'Enter')) {
          // Don't preventDefault - let the button handle it natively
          return;
        }

        // Handle F2 for action mode (focus interactive elements in active row)
        if (e.key === 'F2') {
          e.preventDefault();

          // If no active item yet (e.g., just tabbed in), compute one
          let targetActive = active;
          if (!targetActive) {
            const items = getItems();
            const firstSelected = items.find(domId => selection.has(fromDomId(domId)));
            targetActive = firstSelected ?? items.find(domId => canNavigateById(fromDomId(domId)));
            if (targetActive) {
              setActive(targetActive);
            }
          }

          if (!targetActive || !canNavigateById(fromDomId(targetActive))) return;

          // Enter action mode directly (can't rely on enterActionMode due to stale closure)
          const rowElement = document.getElementById(targetActive);
          if (!rowElement) return;

          const focusables = rowElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
          const firstFocusable = focusables[0];

          if (firstFocusable) {
            setActionModeRowId(fromDomId(targetActive));
            firstFocusable.focus();
          }
          return;
        }

        // Handle Tab in action mode (manually cycle through interactives or exit)
        if (e.key === 'Tab' && actionModeRowId) {
          e.preventDefault(); // Always prevent default - we manage focus manually in action mode

          const rowDomId = toDomId(actionModeRowId);
          const rowElement = document.getElementById(rowDomId);
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
            // Shift+Tab: go to previous or exit action mode
            if (currentIndex <= 0) {
              exitActionMode();
            } else {
              focusables[currentIndex - 1]?.focus();
            }
          } else {
            // Tab: go to next or exit action mode
            if (currentIndex === -1 || currentIndex === focusables.length - 1) {
              exitActionMode();
            } else {
              focusables[currentIndex + 1]?.focus();
            }
          }
          return;
        }

        // Handle Escape - exit action mode first, otherwise clear selection
        if (e.key === 'Escape') {
          e.preventDefault();
          if (actionModeRowId) {
            exitActionMode();
          } else if (selectionMode !== 'none') {
            clearSelection();
          }
          return;
        }

        // Handle Shift+Arrow for range selection (multi mode only)
        if (e.shiftKey && selectionMode === 'multiple' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          e.preventDefault();

          if (!active) return;

          // If anchor is null, set it to current active position
          const currentAnchor = anchorId ?? fromDomId(active);
          if (!anchorId) {
            setAnchorId(currentAnchor);
          }

          const delta = e.key === 'ArrowDown' ? 1 : -1;
          const items = getItems();
          const currentIndex = items.indexOf(active);

          if (currentIndex === -1) return;

          // Find next navigable item
          let newIndex = currentIndex + delta;
          while (newIndex >= 0 && newIndex < items.length) {
            const item = items[newIndex];
            if (item && canNavigateById(fromDomId(item))) {
              break;
            }
            newIndex += delta;
          }

          if (newIndex < 0 || newIndex >= items.length) return;

          const newActive = items[newIndex];
          if (!newActive) return;
          setActive(newActive);

          selectRange(currentAnchor, fromDomId(newActive));
          return;
        }

        // Handle PageUp/PageDown before delegating to nav handler
        if (e.key === 'PageUp') {
          e.preventDefault();
          moveActive(-getPageSize());
          return;
        }

        if (e.key === 'PageDown') {
          e.preventDefault();
          moveActive(getPageSize());
          return;
        }

        // Handle ArrowRight for tree navigation (expand or move to child)
        if (e.key === 'ArrowRight' && active) {
          e.preventDefault();
          const logicalId = fromDomId(active);
          const nodeIsExpanded = isExpandedById(logicalId);

          // Collapsed node: expand it
          if (!nodeIsExpanded) {
            toggleExpanded(logicalId);
            return;
          }

          // Expanded node: try to move to first child (if callback provided)
          if (getFirstChildId) {
            const childId = getFirstChildId(logicalId);
            if (childId) {
              setActive(toDomId(childId));
            }
          }
          return;
        }

        // Handle ArrowLeft for tree navigation (collapse or move to parent)
        if (e.key === 'ArrowLeft' && active) {
          e.preventDefault();
          const logicalId = fromDomId(active);
          const nodeIsExpanded = isExpandedById(logicalId);

          // Expanded node: collapse it
          if (nodeIsExpanded) {
            toggleExpanded(logicalId);
            return;
          }

          // Collapsed or leaf node: move to parent (if callback provided)
          if (getParentId) {
            const parentId = getParentId(logicalId);
            if (parentId) {
              setActive(toDomId(parentId));
            }
          }
          return;
        }

        // Handle Ctrl+A for select all / clear selection toggle
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && selectionMode === 'multiple') {
          e.preventDefault();

          const selectableItems = getItems().filter(domId => canSelectById(fromDomId(domId)));
          const allSelected = selectableItems.every(domId => selection.has(fromDomId(domId)));

          if (allSelected) {
            clearSelection();
          } else {
            selectAll();
          }
          return;
        }

        // Handle Enter for activation
        if (e.key === 'Enter' && active && canSelectById(fromDomId(active))) {
          e.preventDefault();
          onActivate?.(fromDomId(active));
          return;
        }

        handleNavKeyDown(e);
      },
      [
        handleNavKeyDown,
        moveActive,
        getPageSize,
        active,
        fromDomId,
        toDomId,
        setActive,
        isExpandedById,
        toggleExpanded,
        getParentId,
        getFirstChildId,
        selectionMode,
        anchorId,
        getItems,
        canNavigateById,
        canSelectById,
        selectRange,
        selection,
        clearSelection,
        selectAll,
        onActivate,
        exitActionMode,
        actionModeRowId,
      ],
    );

    useEffect(() => {
      if (!active || !innerRef.current) {
        return;
      }

      // active is already a DOM ID
      const el = document.getElementById(active);
      if (el) {
        el.scrollIntoView({
          block: 'nearest',
          behavior: 'auto',
        });
      }
    }, [active]);

    const contextValue = useMemo(
      () => ({
        baseId,
        active,
        setActive,
        isFocused,
        selection,
        toggleSelection,
        selectOnly,
        selectRange,
        clearSelection,
        selectAll,
        selectionMode,
        anchorId,
        setAnchorId,
        registerItem,
        unregisterItem,
        getItems,
        isItemDisabled,
        scrollContainerRef,
        getParentId,
        getFirstChildId,
        isExpanded: isExpandedById,
        toggleExpanded,
        onActivate,
        actionModeRowId,
        enterActionMode,
        exitActionMode,
      }),
      [
        baseId,
        active,
        setActive,
        isFocused,
        selection,
        toggleSelection,
        selectOnly,
        selectRange,
        clearSelection,
        selectAll,
        selectionMode,
        anchorId,
        registerItem,
        unregisterItem,
        getItems,
        isItemDisabled,
        getParentId,
        getFirstChildId,
        isExpandedById,
        toggleExpanded,
        onActivate,
        actionModeRowId,
        enterActionMode,
        exitActionMode,
      ],
    );

    return (
      <TreeListProvider value={contextValue}>
        <div
          id={baseId}
          ref={node => {
            setRef(innerRef, node);
            setRef(ref, node);
          }}
          className={cn(
            // Soft focus ring on container (like Toolbar)
            'outline-none focus-within:ring-2 focus-within:ring-ring/25 focus-within:ring-inset',
            className,
          )}
          role='tree'
          aria-activedescendant={active || undefined}
          aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        >
          {children}
        </div>
      </TreeListProvider>
    );
  },
);

TreeListRoot.displayName = 'TreeList.Root';

//
// * TreeListContainer
//

export type TreeListContainerProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListContainer = forwardRef<HTMLDivElement, TreeListContainerProps>(
  ({ children, className, ...props }, ref): ReactElement => {
    const { baseId, scrollContainerRef } = useTreeList();

    return (
      <div
        id={`${baseId}-scroll-root`}
        ref={node => {
          setRef(scrollContainerRef, node);
          setRef(ref, node);
        }}
        className={cn('relative flex h-full flex-col gap-y-1.5 overflow-y-auto p-1', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TreeListContainer.displayName = 'TreeList.Container';

//
// * TreeListRow
//

export type TreeListRowProps = {
  id: string;
  disabled?: boolean;
  selectable?: boolean;
  /** ARIA level for tree hierarchy (1-based, optional for accessibility) */
  level?: number;
  /** Whether this node has children (affects aria-expanded) */
  hasChildren?: boolean;
  /** Whether this node is expanded (required if hasChildren=true) */
  expanded?: boolean;
  /**
   * Position of this item within its siblings (1-indexed).
   * Used for `aria-posinset`. Optional - only set if you have this data.
   */
  posinset?: number;
  /**
   * Total number of siblings at this level.
   * Used for `aria-setsize`. Optional - only set if you have this data.
   */
  setsize?: number;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRow = forwardRef<HTMLDivElement, TreeListRowProps>(
  (
    {
      id,
      disabled = false,
      selectable = true,
      level,
      hasChildren,
      expanded,
      posinset,
      setsize,
      className,
      children,
      ...props
    },
    ref,
  ): ReactElement => {
    const {
      selection,
      selectionMode,
      toggleSelection,
      selectOnly,
      selectRange,
      clearSelection,
      setActive,
      active,
      baseId,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      anchorId,
      setAnchorId,
      onActivate,
      actionModeRowId,
    } = useTreeList();

    const innerRef = useRef<HTMLDivElement>(null);
    const rowDomId = `${baseId}-item-${id}`;
    const isSelected = selection.has(id);
    const isActive = active === rowDomId;

    useEffect(() => {
      registerItem(rowDomId, disabled);
      return () => unregisterItem(rowDomId);
    }, [rowDomId, disabled, registerItem, unregisterItem]);

    // Use roving tabindex hook to compute tabIndex
    const { tabIndex } = useRovingTabIndex({
      id: rowDomId,
      active,
      disabled,
      getItems,
      isItemDisabled,
      focusMode: 'roving-tabindex',
    });

    // Auto-focus active item when keyboard navigating
    // Disable when in action mode to prevent stealing focus from interactive elements
    const isInActionMode = actionModeRowId !== undefined;
    useActiveItemFocus({
      ref: innerRef,
      isActive,
      disabled: disabled || isInActionMode,
      focusMode: 'roving-tabindex',
      checkFocusWithin: {
        enabled: true,
        containerRole: 'tree',
      },
    });

    // Helper to get the logical ID from a DOM ID
    const fromDomId = useCallback((domId: string) => domId.replace(`${baseId}-item-`, ''), [baseId]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;

        // Don't handle clicks on interactive elements (let them handle it themselves)
        const target = e.target as HTMLElement;
        if (target.closest('button, a, input, select, textarea, [role="button"]')) {
          return;
        }

        setActive(rowDomId);

        if (selectionMode === 'none' || !selectable) return;

        if (selectionMode === 'single') {
          // Single mode: click selects only
          selectOnly(id);
          return;
        }

        // Multiple mode with modifiers
        if (e.shiftKey) {
          // Shift+Click: Range select from anchor to clicked item
          // Per spec: If anchorId null, set anchorId = activeId. Replace selection with range.
          const anchor = anchorId ?? (active ? fromDomId(active) : id);
          selectRange(anchor, id);
          // Don't update anchor on shift+click, keep it stable for extending range
        } else if (e.ctrlKey || e.metaKey) {
          // Ctrl/Cmd+Click: Toggle selection without clearing, set anchor
          toggleSelection(id);
          setAnchorId(id);
        } else {
          // Regular click in multiple mode:
          // - If clicking the only selected item → deselect it
          // - Otherwise → select only this item
          const isOnlySelected = selection.has(id) && selection.size === 1;
          if (isOnlySelected) {
            clearSelection();
          } else {
            selectOnly(id);
          }
          setAnchorId(id);
        }
      },
      [
        disabled,
        setActive,
        rowDomId,
        selectionMode,
        selectable,
        selectOnly,
        id,
        toggleSelection,
        selectRange,
        anchorId,
        active,
        fromDomId,
        setAnchorId,
        selection,
        clearSelection,
      ],
    );

    const handleDoubleClick = useCallback(() => {
      if (disabled) return;
      onActivate?.(id);
    }, [disabled, onActivate, id]);

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        id={rowDomId}
        ref={node => {
          setRef(innerRef, node);
          setRef(ref, node);
        }}
        role='treeitem'
        aria-selected={isSelected ? true : selectionMode === 'multiple' ? false : undefined}
        aria-disabled={disabled || undefined}
        aria-level={level}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-posinset={posinset}
        aria-setsize={setsize}
        data-tone={isSelected ? 'inverse' : undefined}
        data-active={isActive || undefined}
        onClick={handleClick}
        // eslint-disable-next-line react/no-unknown-property -- Preact uses onDblClick
        onDblClick={handleDoubleClick}
        className={cn(
          treeListRowVariants({
            active: isActive,
            selected: isSelected,
            disabled,
            selectable: selectable && !disabled && selectionMode !== 'none',
          }),
          className,
        )}
        tabIndex={tabIndex}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TreeListRow.displayName = 'TreeList.Row';

//
// * TreeListRowLeft
//

export type TreeListRowLeftProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

export const TreeListRowLeft = forwardRef<HTMLDivElement, TreeListRowLeftProps>(
  ({ children, className, ...props }, ref): ReactElement => (
    <div ref={ref} className={cn('flex items-center gap-2.5', className)} {...props}>
      {children}
    </div>
  ),
);

TreeListRowLeft.displayName = 'TreeList.RowLeft';

//
// * TreeListRowRight
//

export type TreeListRowRightProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

export const TreeListRowRight = forwardRef<HTMLDivElement, TreeListRowRightProps>(
  ({ children, className, ...props }, ref): ReactElement => (
    <div ref={ref} className={cn('flex items-center gap-2.5', className)} {...props}>
      {children}
    </div>
  ),
);

TreeListRowRight.displayName = 'TreeList.RowRight';

//
// * TreeListRowContent
//

export type TreeListRowContentProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

export const TreeListRowContent = forwardRef<HTMLDivElement, TreeListRowContentProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    return (
      <div ref={ref} className={cn('min-w-0 flex-1', className)} {...props}>
        {children}
      </div>
    );
  },
);

TreeListRowContent.displayName = 'TreeList.RowContent';

//
// * TreeListAction
//

export type TreeListActionProps = {
  /** Interactive element to exclude from normal tab order (use F2 action mode) */
  children: ReactElement;
};

/**
 * Wrapper for interactive elements inside TreeList rows.
 * Removes the element from normal tab order (tabIndex={-1}) so it's only
 * accessible via F2 action mode.
 */
export const TreeListAction = ({ children }: TreeListActionProps): ReactElement => {
  return cloneElement(children, { tabIndex: -1 });
};

TreeListAction.displayName = 'TreeList.Action';

//
// * TreeListRowLevelSpacer
//

export type TreeListRowLevelSpacerProps = {
  level?: number;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

export const TreeListRowLevelSpacer = forwardRef<HTMLDivElement, TreeListRowLevelSpacerProps>(
  ({ level = 1, className, ...props }, ref): ReactElement | null => {
    if (level === 1) {
      return null;
    }

    return (
      <div
        ref={ref}
        style={{ '--level-indent': `${calcSpacerWidth(level)}px` }}
        className={cn('pl-(--level-indent)', className)}
        {...props}
      />
    );
  },
);

TreeListRowLevelSpacer.displayName = 'TreeList.RowLevelSpacer';

//
// * TreeListRowExpandControl
//

export type TreeListRowExpandControlProps = {
  /** Row ID - if provided, clicking will also set this row as active */
  rowId?: string;
  expanded?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
  icon?: LucideIcon;
  selected?: boolean;
  className?: string;
} & Omit<IconButtonProps, 'icon' | 'onClick'>;

export const TreeListRowExpandControl = forwardRef<HTMLButtonElement, TreeListRowExpandControlProps>(
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
    const context = useTreeList();

    if (!hasChildren) {
      return <span className='size-5 shrink-0' />;
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
      onToggle?.();
      // Also set this row as active so keyboard navigation works
      if (rowId) {
        const rowDomId = `${context.baseId}-item-${rowId}`;
        context.setActive(rowDomId);
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
        {...props}
      />
    );
  },
);

TreeListRowExpandControl.displayName = 'TreeList.RowExpandControl';

//
// * TreeListRowSelectionControl
//

export type TreeListRowSelectionControlProps = {
  /** Row ID - required for toggle selection to work */
  rowId: string;
  /** Override selection state. If not provided, reads from TreeList selection context. */
  selected?: boolean;
  selectable?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onClick'>;

export const TreeListRowSelectionControl = forwardRef<HTMLDivElement, TreeListRowSelectionControlProps>(
  ({ rowId, selected, selectable = true, className, ...props }, ref): ReactElement => {
    const { selection, toggleSelection, setActive, baseId, setAnchorId, selectionMode } = useTreeList();

    // Use prop if provided, otherwise read from context
    const isSelected = selected ?? selection.has(rowId);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        const rowDomId = `${baseId}-item-${rowId}`;
        setActive(rowDomId);
        toggleSelection(rowId);
        setAnchorId(rowId);
      },
      [baseId, rowId, setActive, toggleSelection, setAnchorId],
    );

    if (!selectable || selectionMode === 'none') {
      return <div ref={ref} className={cn('size-4', className)} {...props} />;
    }

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        ref={ref}
        className={cn('flex size-4 cursor-pointer items-center', className)}
        onClick={handleClick}
        {...props}
      >
        {isSelected ? <FilledSquareCheck /> : <Square />}
      </div>
    );
  },
);

TreeListRowSelectionControl.displayName = 'TreeList.RowSelectionControl';

//
// * TreeListRowLoading
//

export type TreeListRowLoadingProps = {
  level?: number;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

export const TreeListRowLoading = forwardRef<HTMLDivElement, TreeListRowLoadingProps>(
  ({ level = 1, className, children, ...props }, ref): ReactElement => (
    <div ref={ref} className={cn('flex items-center gap-2.5 px-2.5 py-1', className)} {...props}>
      <TreeListRowLevelSpacer level={level} />
      {children ?? <Loader2 className='size-4 animate-spin text-subtle' />}
    </div>
  ),
);

TreeListRowLoading.displayName = 'TreeList.RowLoading';

//
// * TreeListRowPlaceholder
//

export type TreeListRowPlaceholderProps = {
  level?: number;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

export const TreeListRowPlaceholder = forwardRef<HTMLDivElement, TreeListRowPlaceholderProps>(
  ({ level = 1, className, children, ...props }, ref): ReactElement => (
    <div
      ref={ref}
      className={cn('flex cursor-default items-center gap-2.5 px-2.5 py-1 opacity-50', className)}
      {...props}
    >
      <TreeListRowLevelSpacer level={level} />
      {children ?? <span className='text-sm text-subtle italic'>Placeholder</span>}
    </div>
  ),
);

TreeListRowPlaceholder.displayName = 'TreeList.RowPlaceholder';

//
// * TreeList Export
//

export const TreeList = Object.assign(TreeListRoot, {
  Root: TreeListRoot,
  Container: TreeListContainer,
  Row: TreeListRow,
  RowLeft: TreeListRowLeft,
  RowRight: TreeListRowRight,
  RowContent: TreeListRowContent,
  RowLevelSpacer: TreeListRowLevelSpacer,
  RowExpandControl: TreeListRowExpandControl,
  RowSelectionControl: TreeListRowSelectionControl,
  RowLoading: TreeListRowLoading,
  RowPlaceholder: TreeListRowPlaceholder,
  Action: TreeListAction,
});
