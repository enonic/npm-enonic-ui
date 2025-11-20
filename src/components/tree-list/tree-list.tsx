import { IconButton, type IconButtonProps } from '@/components';
import { useControlledState, useControlledStateWithNull, useKeyboardNavigation } from '@/hooks';
import { usePrefixedId } from '@/providers';
import { type TreeListContextValue, TreeListProvider, useTreeList } from '@/providers/tree-list-provider';
import type { LucideIcon } from '@/types';
import { cn } from '@/utils';
import { ChevronRight, Loader2, Square, SquareCheck } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const LOADING_SUFFIX = '__loading__';

const calcSpacerWidth = (level: number): number => Math.max(0, 10 + 20 * (level - 1));

export type TreeListProps<T extends TreeNode = TreeNode> = {
  className?: string;
  items?: T[];
  setItems?: (items: T[]) => void;
  isItemSelectable?: (item: T) => boolean;
  fetchChildren: (parentNode: T | undefined, offset: number) => Promise<{ items: T[]; total: number }>;
  expanded?: ReadonlySet<string>;
  onExpandedChange?: (expanded: ReadonlySet<string>) => void;
  selection?: ReadonlySet<string>;
  onSelectionChange?: (selection: ReadonlySet<string>) => void;
  selectionMode?: 'single' | 'multiple';
  active?: string | null;
  defaultActive?: string;
  setActive?: (active: string | null | undefined) => void;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

function findNode<T extends TreeNode>(nodes: T[], id: string): T | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNode<T>(node.children as T[], id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

function updateTreeWithChildren<T extends TreeNode>(
  nodes: readonly T[],
  parentId: string | undefined,
  newChildren: readonly T[],
  hasMore: boolean,
): T[] {
  if (parentId == null) {
    return nodes.concat(
      newChildren.map(c => ({
        ...c,
        hasMoreChildren: hasMore,
      })),
    );
  }

  return nodes.map(n => {
    if (n.id === parentId) {
      const children = [...(n.children ?? []), ...newChildren].map(c => ({
        ...c,
        parentId,
        path: [...n.path, n.id],
      }));
      return { ...n, children, hasMoreChildren: hasMore };
    }
    if (n.children) {
      return { ...n, children: updateTreeWithChildren<T>(n.children as T[], parentId, newChildren, hasMore) };
    }
    return n;
  });
}

function getRootNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.filter(node => node.path.length === 0);
}

function flattenTree<T extends TreeNode>(
  nodes: readonly T[],
  expandedSet: ReadonlySet<string>,
  baseId: string,
  hasMoreRoot: boolean,
): readonly T[] {
  const result: T[] = [];

  const walk = (items: readonly T[], parentPath: readonly string[]): void => {
    for (const item of items) {
      const path = [...parentPath, item.id];
      result.push(item);
      const hasChildren = Array.isArray(item.children) && item.children.length > 0;
      const isExpanded = expandedSet.has(item.id);
      if (isExpanded && hasChildren) {
        walk((item.children ?? []) as T[], path);
        if (item.hasMoreChildren) {
          result.push({
            id: `${item.id}${LOADING_SUFFIX}`,
            path,
          } as T);
        }
      }
    }
  };

  walk(nodes, []);

  if (hasMoreRoot) {
    result.push({
      id: `${baseId}${LOADING_SUFFIX}`,
      path: [] as string[],
    } as T);
  }

  return result;
}

export type TreeListContentProps = {
  children?: ReactNode;
  load?: boolean;
} & ComponentPropsWithoutRef<'div'>;

const TreeListContent = ({ children, load = true }: TreeListContentProps): ReactElement => {
  const { items, loadMore } = useTreeList();

  useEffect(() => {
    if (load && items.length === 0) {
      loadMore();
    }
  }, [load, items.length, loadMore]);

  return <>{children}</>;
};

TreeListContent.displayName = 'TreeList.Content';

type TreeListContainerProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListContainer = ({
  children,
  className,
  ...props
}: TreeListContainerProps): ReactElement<TreeListContainerProps> => {
  const { baseId } = useTreeList();

  return (
    <div
      id={`${baseId}-scroll-root`}
      className={cn('flex flex-col relative h-full p-1 gap-y-1 overflow-y-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
};

TreeListContainer.displayName = 'TreeList.Container';

type TreeListRowLeftProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRowLeft = ({
  children,
  className,
  ...props
}: TreeListRowLeftProps): ReactElement<TreeListRowLeftProps> => (
  <div className={cn('flex items-center gap-2.5', className)} {...props}>
    {children}
  </div>
);

TreeListRowLeft.displayName = 'TreeList.RowLeft';

type TreeListRowRightProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRowRight = ({
  children,
  className,
  ...props
}: TreeListRowRightProps): ReactElement<TreeListRowLeftProps> => (
  <div className={cn('flex items-center gap-2.5', className)} {...props}>
    {children}
  </div>
);

TreeListRowRight.displayName = 'TreeList.RowRight';

type TreeListRowLevelSpacerProps = {
  level?: number;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRowLevelSpacer = ({
  level = 0,
  className,
  ...props
}: TreeListRowLevelSpacerProps): ReactElement<TreeListRowLeftProps> | undefined => {
  if (level === 0) {
    return undefined;
  }

  return (
    <div
      style={{ '--level-indent': `${calcSpacerWidth(level)}px` }}
      className={cn('pl-(--level-indent)', className)}
      {...props}
    />
  );
};

TreeListRowLevelSpacer.displayName = 'TreeList.RowLevelSpacer';

type TreeListRowExpandControlProps = {
  data: TreeNode;
  icon?: LucideIcon;
} & Omit<IconButtonProps, 'icon'>;

const TreeListRowExpandControl = ({
  data,
  icon = ChevronRight,
  className,
  ...props
}: TreeListRowExpandControlProps): ReactElement<TreeListRowExpandControlProps> => {
  if (!data.hasChildren) {
    return <span className='h-5 w-5 shrink-0' />; // placeholder for expand icon;
  }

  const { expanded, toggleExpanded, selection } = useTreeList();
  const isExpanded = expanded?.has(data.id);
  const isSelected = selection?.has(data.id);

  return (
    <IconButton
      icon={icon}
      variant='text'
      title='Text variant'
      tabIndex={-1}
      className={cn(
        'w-5 h-5 transition-transform duration-150',
        isSelected
          ? 'bg-surface-selected text-alt hover:bg-surface-selected-hover group-hover:bg-surface-selected-hover'
          : 'group-hover:bg-surface-neutral-hover group-data-[active=true]:bg-surface-neutral-hover',
        isExpanded && 'rotate-90',
        className,
      )}
      onClick={e => {
        toggleExpanded(data.id);
        e.stopPropagation();
      }}
      {...props}
    />
  );
};

TreeListRowExpandControl.displayName = 'TreeList.RowExpandControl';

type TreeListRowContentProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRowContent = ({
  className,
  children,
  ...props
}: TreeListRowContentProps): ReactElement<TreeListRowContentProps> => {
  return (
    <div className={cn('flex-1 min-w-0', className)} {...props}>
      {children}
    </div>
  );
};

TreeListRowContent.displayName = 'TreeList.RowContent';

type TreeListRowSelectionControlProps = {
  data: TreeNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRowSelectionControl = ({ data, className, ...props }: TreeListRowSelectionControlProps): ReactElement => {
  const { selection, isItemSelectable } = useTreeList();
  const isSelected = selection?.has(data.id);

  if (isLoadingPlaceholder(data) || !isItemSelectable(data)) {
    return <span className={cn('w-3.5', className)} {...props}></span>;
  }

  return (
    <div className={cn('flex items-center w-3.5', className)} {...props}>
      {isSelected ? <SquareCheck /> : <Square />}
    </div>
  );
};

TreeListRowSelectionControl.displayName = 'TreeList.RowSelectionControl';

type TreeListRowProps<T extends TreeNode> = {
  item: T;
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRow = <T extends TreeNode>({
  item,
  children,
  className,
  ...props
}: TreeListRowProps<T>): ReactElement => {
  const { selection, selectionMode, expanded, toggleSelection, active, baseId, isFocused } = useTreeList<T>();
  const isExpanded = expanded?.has(item.id);
  const isSelected = selection?.has(item.id);
  const isActive = isFocused && active === item.id;
  const rowDomId = `${baseId}-item-${item.id}`;

  return (
    // ARIA treeview pattern: options are not individually focusable
    // Parent root list element handles all keyboard interactions
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
    <div
      id={rowDomId}
      role='treeitem'
      aria-expanded={item.hasChildren ? isExpanded : undefined}
      aria-selected={isSelected ? true : selectionMode === 'multiple' ? false : undefined}
      aria-level={item.path.length}
      data-tone={isSelected ? 'inverse' : undefined}
      data-active={isActive || undefined}
      onClick={() => toggleSelection?.(item.id)}
      className={cn(
        'relative z-0 group flex gap-2.5 items-center px-2.5 py-1 hover:bg-surface-primary-hover focus-within:outline-none cursor-pointer',
        'after:absolute after:-inset-0.5 after:content-[""] after:rounded-sm after:pointer-events-auto after:-z-10',
        isSelected
          ? 'bg-surface-selected text-alt hover:bg-surface-selected-hover'
          : 'hover:bg-surface-neutral-hover data-[active=true]:bg-surface-neutral-hover',
        className,
      )}
      tabIndex={undefined}
      {...props}
    >
      {children}
    </div>
  );
};

TreeListRow.displayName = 'TreeList.Row';

export type TreeListLoadingRowProps = {
  item: TreeNode;
  children?: ReactNode;
  intersectionProps?: IntersectionObserverInit;
} & ComponentPropsWithoutRef<'div'>;

const TreeListLoadingRow = ({ item, children, intersectionProps, ...props }: TreeListLoadingRowProps): ReactElement => {
  const ref = useRef<HTMLDivElement | null>(null);

  const { loadMore, baseId } = useTreeList();

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadMore(item.path[item.path.length - 1]);
          }
        }
      },
      intersectionProps ?? {
        root: document.querySelector(`#${baseId}-scroll-root`),
        rootMargin: '120px',
      },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [item, loadMore, baseId, intersectionProps]);

  const level = item.path.length;

  return (
    <div ref={ref} className='flex items-center gap-2 py-1 px-2 text-sm' {...props}>
      {level > 0 && (
        <span className='spacer' style={{ '--level-indent': `${calcSpacerWidth(level)}px` }}>
          <span className='inline-block w-(--level-indent)' />
        </span>
      )}
      <Loader2 size={14} className='animate-spin' />
      {children ?? <span>Loading...</span>}
    </div>
  );
};

TreeListLoadingRow.displayName = 'TreeList.LoadingRow';

export const TreeListRoot = <T extends TreeNode = TreeNode>({
  className,
  items: controlledItems,
  setItems: setItemsControlled,
  fetchChildren,
  selection: controlledSelection,
  expanded: controlledExpanded,
  onSelectionChange,
  onExpandedChange,
  active: controlledActive,
  defaultActive,
  setActive,
  selectionMode = 'single',
  isItemSelectable = () => true,
  children,
  ...props
}: TreeListProps<T>): ReactElement => {
  const baseId = usePrefixedId(undefined, 'tree-list');
  const [selection, setSelection] = useControlledState<ReadonlySet<string>>(
    controlledSelection,
    new Set(),
    onSelectionChange,
  );
  const [expanded, setExpanded] = useControlledState<ReadonlySet<string>>(
    controlledExpanded,
    new Set(),
    onExpandedChange,
  );
  const [items, setItems] = useControlledState<T[]>(controlledItems, [], setItemsControlled);
  const [active, updateActive] = useControlledStateWithNull(controlledActive, defaultActive, setActive);
  const [isFocused, setFocused] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const [hasMoreRoot, setHasMoreRoot] = useState(false);

  const loadMore = useCallback(
    async (parentId?: string): Promise<void> => {
      const targetParent: string | undefined = parentId ?? undefined;
      const parentNode = targetParent ? findNode(items, targetParent) : undefined;
      const offset = parentNode ? (parentNode.children ? parentNode.children.length : 0) : getRootNodes(items).length;

      const { items: newChildren, total } = await fetchChildren(parentNode, offset);
      const hasMore = offset + newChildren.length < total;

      const updatedItems = updateTreeWithChildren(items, targetParent, newChildren, hasMore);

      if (!parentId) {
        setHasMoreRoot(hasMore);
      }

      setItems(updatedItems);
    },
    [fetchChildren, items, setItems, setHasMoreRoot],
  ) as (parentId?: string) => void;

  const flattenedItems = useMemo(
    () => flattenTree(items, expanded, baseId, hasMoreRoot),
    [items, expanded, baseId, hasMoreRoot],
  );

  const toggleSelection = useCallback(
    (id: string) => {
      const item = flattenedItems.find(node => node.id === id);
      updateActive(id);
      if (!item || !isItemSelectable(item)) {
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
    [selection, selectionMode, flattenedItems, isItemSelectable],
  );

  const toggleExpanded = useCallback(
    (id: string) => {
      const isExpanded = expanded.has(id);
      const newExpanded = new Set(expanded);

      if (isExpanded) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);

        const node = flattenedItems.find((node: TreeNode) => node.id === id);
        if (node && (!node.children || node.children.length === 0)) {
          loadMore(id);
        }
      }

      setExpanded(newExpanded);
    },
    [flattenedItems, loadMore, expanded, setExpanded],
  );

  const getNavItems = useCallback(
    () => flattenedItems.filter(item => !isLoadingPlaceholder(item)).map(item => item.id),
    [flattenedItems],
  );
  const isItemDisabled = useCallback((id: string) => {
    void id;
    return false;
  }, []);

  const { handleKeyDown, moveActive } = useKeyboardNavigation({
    getItems: getNavItems,
    isItemDisabled,
    active,
    setActive: updateActive,
    loop: false,
    orientation: 'vertical',
    onSelect: id => {
      toggleSelection(id);
    },
  });

  const keyHandler = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      if (e.key === 'ArrowRight') {
        const activeNode = active ? flattenedItems.find(item => item.id === active) : null;

        if (activeNode) {
          const hasChildren = activeNode.hasChildren;

          if (hasChildren) {
            const isExpanded = expanded.has(activeNode.id);

            if (isExpanded) {
              moveActive(1);
            } else {
              toggleExpanded(activeNode.id);
            }
          }
        }

        return;
      }

      if (e.key === 'ArrowLeft') {
        const activeNode = active ? flattenedItems.find(item => item.id === active) : null;

        if (activeNode) {
          const hasChildren = activeNode.hasChildren;
          const isExpanded = expanded.has(activeNode.id);

          if (hasChildren && isExpanded) {
            toggleExpanded(activeNode.id);
          } else {
            const parentId = activeNode.path[activeNode.path.length - 1];

            if (parentId) {
              updateActive(parentId);
            }
          }
        }

        return;
      }

      handleKeyDown(e);
    },
    [active, flattenedItems, expanded, handleKeyDown, moveActive, toggleExpanded],
  );

  useEffect(() => {
    if (!active || !innerRef.current) {
      return;
    }
    const el = document.getElementById(`${baseId}-item-${active}`);
    if (el) {
      el.scrollIntoView({
        block: 'nearest',
        behavior: 'auto',
      });
    }
  }, [active]);

  const contextValue = useMemo<TreeListContextValue<T>>(
    () => ({
      baseId,
      items: flattenedItems,
      active,
      loadMore,
      selection,
      expanded,
      toggleSelection,
      toggleExpanded,
      selectionMode,
      isFocused,
      isItemSelectable,
    }),
    [
      baseId,
      flattenedItems,
      loadMore,
      selection,
      expanded,
      active,
      toggleSelection,
      toggleExpanded,
      selectionMode,
      isFocused,
      isItemSelectable,
    ],
  );

  return (
    <TreeListProvider value={contextValue}>
      <div
        id={baseId}
        ref={innerRef}
        className={className}
        role='tree'
        aria-activedescendant={active ? `${baseId}-item-${active}` : undefined}
        aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
        tabIndex={0}
        onKeyDown={keyHandler}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      >
        {children}
      </div>
    </TreeListProvider>
  );
};

export type TreeNode = {
  id: string;
  hasChildren?: boolean;
  children?: TreeNode[];
  hasMoreChildren?: boolean;
  path: string[]; // array of ancestor IDs
};

export function isLoadingPlaceholder(node: TreeNode): boolean {
  return node.id.endsWith(LOADING_SUFFIX);
}

export const TreeList = Object.assign(TreeListRoot, {
  Root: TreeListRoot,
  Container: TreeListContainer,
  Content: TreeListContent,
  Row: TreeListRow,
  LoadingRow: TreeListLoadingRow,
  RowLeft: TreeListRowLeft,
  RowRight: TreeListRowRight,
  RowLevelSpacer: TreeListRowLevelSpacer,
  RowExpandControl: TreeListRowExpandControl,
  RowContent: TreeListRowContent,
  RowSelectionControl: TreeListRowSelectionControl,
});
