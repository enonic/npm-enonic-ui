import { cva } from 'class-variance-authority';
import { ChevronRight, Loader2, Square, SquareCheck } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
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
import { usePrefixedId } from '@/providers';
import { TreeListUIProvider, useTreeListUI } from '@/providers/tree-list-ui-provider';
import type { LucideIcon } from '@/types';
import { cn } from '@/utils';

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
  selectionMode?: 'single' | 'multiple';
  active?: string;
  defaultActive?: string;
  onActiveChange?: (active: string | undefined) => void;
  loop?: boolean;
  className?: string;
  children?: ReactNode;
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

    const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

    const toggleSelection = useCallback(
      (id: string) => {
        // Selection uses logical IDs
        if (isItemDisabled(toDomId(id))) {
          return;
        }

        const isSelected = selection.has(id);
        const newSelection = new Set(selectionMode === 'multiple' ? selection : []);

        if (isSelected) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }

        setSelection(newSelection);
      },
      [selection, selectionMode, isItemDisabled, setSelection, toDomId],
    );

    const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
      getItems,
      isItemDisabled,
      active,
      setActive,
      loop,
      orientation: 'vertical',
      onSelect: domId => {
        setActive(domId);
        toggleSelection(fromDomId(domId));
      },
    });

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        handleNavKeyDown(e);
      },
      [handleNavKeyDown],
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
        selectionMode,
        registerItem,
        unregisterItem,
        getItems,
        isItemDisabled,
        scrollContainerRef,
      }),
      [
        baseId,
        active,
        setActive,
        isFocused,
        selection,
        toggleSelection,
        selectionMode,
        registerItem,
        unregisterItem,
        getItems,
        isItemDisabled,
      ],
    );

    return (
      <TreeListUIProvider value={contextValue}>
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
            'focus-within:ring-2 focus-within:ring-ring/25 focus-within:ring-inset',
            className,
          )}
          role='listbox'
          aria-activedescendant={active || undefined}
          aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        >
          {children}
        </div>
      </TreeListUIProvider>
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
    const { baseId, scrollContainerRef } = useTreeListUI();

    return (
      <div
        id={`${baseId}-scroll-root`}
        ref={node => {
          (scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
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
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRow = forwardRef<HTMLDivElement, TreeListRowProps>(
  ({ id, disabled = false, selectable = true, className, children, ...props }, ref): ReactElement => {
    const {
      selection,
      selectionMode,
      toggleSelection,
      setActive,
      active,
      baseId,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
    } = useTreeListUI();

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
    useActiveItemFocus({
      ref: innerRef,
      isActive,
      disabled,
      focusMode: 'roving-tabindex',
      checkFocusWithin: {
        enabled: true,
        containerRole: 'listbox',
      },
    });

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        id={rowDomId}
        ref={node => {
          (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        role='option'
        aria-selected={isSelected ? true : selectionMode === 'multiple' ? false : undefined}
        aria-disabled={disabled || undefined}
        data-tone={isSelected ? 'inverse' : undefined}
        data-active={isActive || undefined}
        onClick={() => {
          if (disabled) return;
          setActive(rowDomId);
          if (selectable) {
            toggleSelection(id);
          }
        }}
        className={cn(
          treeListRowVariants({
            active: isActive,
            selected: isSelected,
            disabled,
            selectable: selectable && !disabled,
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
  expanded?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
  icon?: LucideIcon;
  selected?: boolean;
  className?: string;
} & Omit<IconButtonProps, 'icon' | 'onClick'>;

export const TreeListRowExpandControl = forwardRef<HTMLButtonElement, TreeListRowExpandControlProps>(
  (
    { expanded = false, hasChildren = false, onToggle, icon = ChevronRight, selected = false, className, ...props },
    ref,
  ): ReactElement => {
    if (!hasChildren) {
      return <span className='size-5 shrink-0' />;
    }

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
        onClick={e => {
          onToggle?.();
          e.stopPropagation();
        }}
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
  selected?: boolean;
  selectable?: boolean;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

export const TreeListRowSelectionControl = forwardRef<HTMLDivElement, TreeListRowSelectionControlProps>(
  ({ selected = false, selectable = true, className, ...props }, ref): ReactElement => {
    if (!selectable) {
      return <div ref={ref} className={cn('w-3.5', className)} {...props} />;
    }

    return (
      <div ref={ref} className={cn('flex w-3.5 items-center', className)} {...props}>
        {selected ? <SquareCheck /> : <Square />}
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
    <div ref={ref} className={cn('flex items-center gap-2.5 px-2.5 py-1 opacity-50', className)} {...props}>
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
  RowLevelSpacer: TreeListRowLevelSpacer,
  RowExpandControl: TreeListRowExpandControl,
  RowContent: TreeListRowContent,
  RowSelectionControl: TreeListRowSelectionControl,
  RowLoading: TreeListRowLoading,
  RowPlaceholder: TreeListRowPlaceholder,
});
