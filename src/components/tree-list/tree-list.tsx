import { Checkbox, IconButton } from '@/components';
import { useControlledState, useControlledStateWithNull, useKeyboardNavigation } from '@/hooks';
import { usePrefixedId } from '@/providers';
import { type TreeListContextValue, TreeListProvider, useTreeList } from '@/providers/tree-list-provider';
import { cn } from '@/utils';
import { cva } from 'class-variance-authority';
import { ChevronRight, Loader2 } from 'lucide-react';
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
import { Virtuoso } from 'react-virtuoso';

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
      false: 'group-hover:bg-surface-neutral-hover',
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

export type SelectionOptions = {
  mode: 'single' | 'multiple';
  align?: 'left' | 'right';
};

const defaultSelectionOptions: SelectionOptions = {
  mode: 'multiple',
  align: 'left',
};

export type TreeListProps<T extends TreeNode = TreeNode> = {
  className?: string;
  items?: T[];
  setItems?: (items: T[]) => void;
  itemToView: (item: T) => ReactNode;
  isItemSelectable?: (item: T) => boolean;
  fetchChildren: (parentNode: T | undefined, offset: number) => Promise<{ items: T[]; total: number }>;
  expanded?: ReadonlySet<string>;
  onExpandedChange?: (expanded: ReadonlySet<string>) => void;
  selection?: ReadonlySet<string>;
  onSelectionChange?: (selection: ReadonlySet<string>) => void;
  selectionOptions?: SelectionOptions;
  active?: string | null;
  defaultActive?: string;
  setActive?: (active: string | null | undefined) => void;
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
  data: TreeNode;
} & ComponentPropsWithoutRef<'div'>;

const TreeRowLevelSpacer = ({ data }: TreeRowLevelSpacerProps): ReactElement<TreeRowLeftProps> => {
  const level = data.path.length;

  return (
    <>
      {level > 0 && (
        <div style={{ '--level-indent': `${calcSpacerWidth(level)}px` }} className='pl-[var(--level-indent)]' />
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
};

const TreeRowSelectionControl = ({ data, className }: TreeRowSelectionControlProps): ReactElement => {
  const { selection, isItemSelectable } = useTreeList();
  const isSelected = selection?.has(data.id);

  if (!isItemSelectable(data)) {
    return <span className={'w-3.5'}></span>;
  }

  return (
    <Checkbox
      className={className}
      checked={isSelected}
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
      }}
      tabIndex={-1}
    />
  );
};

// ===== TreeRow ==============================================================
type TreeRowProps<T extends TreeNode> = {
  item: T;
  children: ReactNode;
  className?: string;
};

const TreeRow = <T extends TreeNode>({ item, children, className }: TreeRowProps<T>): ReactElement => {
  const { selection, expanded, toggleSelection, active, baseId, isFocused } = useTreeList<T>();
  const isExpanded = expanded?.has(item.id);
  const isSelected = selection?.has(item.id);
  const isActive = isFocused && active === item.id;
  const rowDomId = `${baseId}-item-${item.id}`;

  return (
    // ARIA treeview pattern: options are not individually focusable
    // Parent root list element handles all keyboard interactions
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      id={rowDomId}
      role='treeitem'
      aria-expanded={item.hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-level={item.path.length + 1}
      data-tone={isSelected ? 'inverse' : undefined}
      data-active={isActive || undefined}
      onClick={() => toggleSelection?.(item.id)}
      className={cn(treeListItemVariants({ selected: isSelected, active: isActive }), className)}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

TreeRow.displayName = 'TreeRow';

const LoadingRow = ({ item }: { item: TreeNode }): ReactElement => {
  const ref = useRef<HTMLDivElement | null>(null);

  const { loadMore } = useTreeList();

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const parentId = item.path[item.path.length - 1];
          if (entry.isIntersecting && parentId) {
            void loadMore(parentId);
          }
        }
      },
      { rootMargin: '200px' },
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

// eslint-disable-next-line
const TreeListContent = <T extends TreeNode>(): ReactElement => {
  const { items, itemToView, loadMore, selectionOptions } = useTreeList<T>();

  return (
    <Virtuoso
      data={items}
      increaseViewportBy={200}
      endReached={() => {
        void loadMore();
      }}
      itemContent={(index, item) => {
        void index; // lint

        if (isLoadingPlaceholder(item)) {
          return <LoadingRow item={item} />;
        }

        return (
          <TreeRow<T> key={item.id} item={item}>
            <TreeRowLeft>
              {selectionOptions.mode === 'multiple' && selectionOptions.align === 'left' && (
                <TreeRowSelectionControl data={item} />
              )}
              <TreeRowLevelSpacer data={item} />
              <TreeRowExpandControl data={item} />
            </TreeRowLeft>
            <TreeRowContent>{itemToView(item)}</TreeRowContent>
            {selectionOptions.mode === 'multiple' && selectionOptions.align === 'right' && (
              <TreeRowRight>
                <TreeRowSelectionControl data={item} />
              </TreeRowRight>
            )}
          </TreeRow>
        );
      }}
    />
  );
};

export const TreeList = <T extends TreeNode = TreeNode>({
  className,
  items: controlledItems,
  setItems: setItemsControlled,
  itemToView,
  fetchChildren,
  selection: controlledSelection,
  expanded: controlledExpanded,
  onSelectionChange,
  onExpandedChange,
  active: controlledActive,
  defaultActive,
  setActive,
  selectionOptions = defaultSelectionOptions,
  isItemSelectable = () => true,
  ...props
}: TreeListProps<T>): ReactElement => {
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

  const loadMore = useCallback(
    async (parentId?: string): Promise<void> => {
      const targetParent: string | undefined = parentId ?? undefined;
      const parentNode = targetParent ? findNode(items, targetParent) : undefined;
      const offset = parentNode ? (parentNode.children ? parentNode.children.length : 0) : getRootNodes(items).length;

      const { items: newChildren, total } = await fetchChildren(parentNode, offset);
      const hasMore = offset + newChildren.length < total;
      const updatedItems = updateTreeWithChildren(items, targetParent, newChildren, hasMore);
      setItems(updatedItems);
    },
    [fetchChildren, items],
  );

  const flattenedItems = useMemo(() => flattenTree(items, expanded), [items, expanded]);

  const toggleSelection = useCallback(
    (id: string) => {
      const item = flattenedItems.find(node => node.id === id);
      if (!item || !isItemSelectable(item)) {
        return;
      }

      const isSelected = selection.has(id);
      const newSelection = new Set(selectionOptions.mode === 'multiple' ? selection : []);

      if (isSelected) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }

      setSelection(newSelection);
      updateActive(id);
    },
    [selection, selectionOptions, flattenedItems],
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
    [flattenedItems, loadMore],
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
    const el = innerRef.current.querySelector<HTMLDivElement>('.active-tree-list-item');
    if (el) {
      el.scrollIntoView({
        block: 'nearest',
        behavior: 'auto',
      });
    }
  }, [active]);

  const baseId = usePrefixedId('tree-list');

  const contextValue = useMemo<TreeListContextValue<T>>(
    () => ({
      baseId,
      items: flattenedItems,
      active,
      loadMore,
      itemToView,
      selection,
      expanded,
      toggleSelection,
      toggleExpanded,
      selectionOptions,
      isFocused,
      isItemSelectable,
    }),
    [
      baseId,
      flattenedItems,
      loadMore,
      itemToView,
      selection,
      expanded,
      active,
      toggleSelection,
      toggleExpanded,
      selectionOptions,
      isFocused,
      isItemSelectable,
    ],
  );

  return (
    <div
      ref={innerRef}
      className={cn(
        className,
        'focus-within:outline-none focus-within:ring-1 focus-within:ring-bdr-strong focus-within:ring-offset-1 focus-within:ring-offset-surface-neutral',
      )}
      role='tree'
      aria-activedescendant={active ? `${baseId}-item-${active}` : undefined}
      aria-multiselectable={selectionOptions.mode === 'multiple' ? true : undefined}
      tabIndex={0}
      onKeyDown={keyHandler}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    >
      <TreeListProvider value={contextValue}>
        <TreeListContent<T> />
      </TreeListProvider>
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

function isLoadingPlaceholder(node: TreeNode): boolean {
  return node.id.endsWith(LOADING_SUFFIX);
}

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
  return result;
}
