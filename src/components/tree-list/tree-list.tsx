import { IconButton } from '@/components';
import { useControlledState, useControlledStateWithNull, useKeyboardNavigation } from '@/hooks';
import { usePrefixedId } from '@/providers';
import { type TreeListContextValue, TreeListProvider, useTreeList } from '@/providers/tree-list-provider';
import { cn } from '@/utils';
import { cva } from 'class-variance-authority';
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

const treeListItemVariants = cva(
  'group flex gap-2.5 items-center px-2.5 py-1 hover:bg-surface-primary-hover focus-within:outline-none cursor-pointer',
  {
    variants: {
      selected: {
        true: 'bg-surface-selected text-alt hover:bg-surface-selected-hover',
        false: 'hover:bg-surface-neutral-hover data-[active=true]:bg-surface-neutral-hover',
      },
      active: {
        true: 'active-tree-list-item',
        false: '',
      },
    },
    defaultVariants: {
      selected: false,
      active: false,
    },
  },
);

const expanderVariants = cva('w-5 h-5 transition-transform duration-150', {
  variants: {
    selected: {
      true: 'bg-surface-selected text-alt hover:bg-surface-selected-hover group-hover:bg-surface-selected-hover',
      false: 'group-hover:bg-surface-neutral-hover group-data-[active=true]:bg-surface-neutral-hover',
    },
    expanded: {
      true: 'rotate-90',
      false: '',
    },
  },
  defaultVariants: {
    selected: false,
    expanded: false,
  },
});

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

export type TreeContentProps = {
  children?: ReactNode;
  load?: boolean;
} & ComponentPropsWithoutRef<'div'>;

const TreeContent = ({ children, load = true }: TreeContentProps): ReactElement => {
  const { items, loadMore } = useTreeList();

  useEffect(() => {
    if (load && items.length === 0) {
      void loadMore();
    }
  }, [load, items.length, loadMore]);

  return <>{children}</>;
};

type TreeContainerProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeContainer = ({ children, className, ...props }: TreeContainerProps): ReactElement<TreeRowLeftProps> => {
  const { baseId } = useTreeList();

  return (
    <div id={`${baseId}-scroll-root`} className={cn('h-full relative overflow-y-auto', className)} {...props}>
      {children}
    </div>
  );
};

type TreeRowLeftProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeRowLeft = ({ children, className, ...props }: TreeRowLeftProps): ReactElement<TreeRowLeftProps> => (
  <div className={cn('flex items-center gap-2.5', className)} {...props}>
    {children}
  </div>
);

type TreeRowRightProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeRowRight = ({ children, className, ...props }: TreeRowRightProps): ReactElement<TreeRowLeftProps> => (
  <div className={cn('flex items-center gap-2.5', className)} {...props}>
    {children}
  </div>
);

type TreeRowLevelSpacerProps = {
  level?: number;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeRowLevelSpacer = ({ level = 0, className }: TreeRowLevelSpacerProps): ReactElement<TreeRowLeftProps> => {
  return (
    <>
      {level > 0 && (
        <div
          style={{ '--level-indent': `${calcSpacerWidth(level)}px` }}
          className={cn('pl-[var(--level-indent)]', className)}
        />
      )}
    </>
  );
};

type TreeRowExpandControlProps = {
  data: TreeNode;
} & ComponentPropsWithoutRef<'div'>;

const TreeRowExpandControl = ({ data }: TreeRowExpandControlProps): ReactElement<TreeRowLeftProps> => {
  const { expanded, toggleExpanded, selection } = useTreeList();
  const isExpanded = expanded?.has(data.id);
  const isSelected = selection?.has(data.id);

  return (
    <>
      {data.hasChildren ? (
        <IconButton
          icon={ChevronRight}
          variant='text'
          title='Text variant'
          tabIndex={-1}
          className={cn(expanderVariants({ selected: isSelected, expanded: isExpanded }))}
          onClick={e => {
            toggleExpanded(data.id);
            e.stopPropagation();
          }}
        />
      ) : (
        <span className='h-5 w-5 flex-shrink-0' /> // placeholder for expand icon
      )}
    </>
  );
};

type TreeRowContentProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeRowContent = ({ className, children, ...props }: TreeRowContentProps): ReactElement<TreeRowContentProps> => {
  return (
    <div className={cn('flex-1 min-w-0', className)} {...props}>
      {children}
    </div>
  );
};

type TreeRowSelectionControlProps = {
  data: TreeNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeRowSelectionControl = ({ data, className }: TreeRowSelectionControlProps): ReactElement => {
  const { selection, isItemSelectable } = useTreeList();
  const isSelected = selection?.has(data.id);

  if (isLoadingPlaceholder(data) || !isItemSelectable(data)) {
    return <span className={cn('w-3.5', className)}></span>;
  }

  return <div className={cn('flex items-center w-3.5', className)}>{isSelected ? <SquareCheck /> : <Square />}</div>;
};

// ===== TreeRow ==============================================================
type TreeRowProps<T extends TreeNode> = {
  item: T;
  children: ReactNode;
  className?: string;
};

const TreeRow = <T extends TreeNode>({ item, children, className }: TreeRowProps<T>): ReactElement => {
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
      className={cn(treeListItemVariants({ selected: isSelected, active: isActive }), className)}
      tabIndex={undefined}
    >
      {children}
    </div>
  );
};

TreeRow.displayName = 'TreeRow';

const LoadingRow = ({ item }: { item: TreeNode }): ReactElement => {
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
            const parentId = item.path[item.path.length - 1];
            void loadMore(parentId);
          }
        }
      },
      {
        root: document.querySelector(`#${baseId}-scroll-root`),
        rootMargin: '120px',
      },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [item, loadMore]);

  const level = item.path.length;

  return (
    <div ref={ref} className='flex items-center gap-2 py-1 px-2 text-muted-foreground text-sm'>
      {level > 0 && <span className={'spacer'} style={{ paddingLeft: calcSpacerWidth(level) }}></span>}
      <Loader2 size={14} className='animate-spin' />
      <span>Loading...</span>
    </div>
  );
};

LoadingRow.displayName = 'LoadingRow';

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

      if (!parentId) {
        setHasMoreRoot(hasMore);
      }

      setItems((prevItems: T[]) => updateTreeWithChildren(prevItems, targetParent, newChildren, hasMore));
    },
    [fetchChildren],
  );

  function flattenTree<T extends TreeNode>(nodes: readonly T[], expandedSet: ReadonlySet<string>): readonly T[] {
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

  const flattenedItems = useMemo(() => flattenTree(items, expanded), [items, expanded]);

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
          void loadMore(id);
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
    <div
      id={baseId}
      ref={innerRef}
      className={cn(
        className,
        'focus-within:outline-none focus-within:ring-1 focus-within:ring-bdr-strong focus-within:ring-offset-1 focus-within:ring-offset-surface-neutral',
      )}
      role='tree'
      aria-activedescendant={active ? `${baseId}-item-${active}` : undefined}
      aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
      tabIndex={0}
      onKeyDown={keyHandler}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    >
      <TreeListProvider value={contextValue}>{children}</TreeListProvider>
    </div>
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
  Container: TreeContainer,
  Content: TreeContent,
  Row: TreeRow,
  LoadingRow: LoadingRow,
  RowLeft: TreeRowLeft,
  RowRight: TreeRowRight,
  RowLevelSpacer: TreeRowLevelSpacer,
  RowExpandControl: TreeRowExpandControl,
  RowContent: TreeRowContent,
  RowSelectionControl: TreeRowSelectionControl,
});
