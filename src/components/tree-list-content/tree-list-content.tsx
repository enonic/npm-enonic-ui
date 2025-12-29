import { ChevronRight, Loader2 } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  Fragment,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TreeList } from '@/components/tree-list';
import { useControlledState, useControlledStateWithNull, useKeyboardNavigation } from '@/hooks';
import { usePrefixedId } from '@/providers';
import {
  type FlatTreeNode,
  type TreeData,
  type TreeItems,
  TreeListContentProvider,
  useTreeListContent,
} from '@/providers/tree-list-content-provider';
import type { LucideIcon } from '@/types';
import { cn } from '@/utils';

export type { FlatTreeNode, TreeData, TreeItems } from '@/providers/tree-list-content-provider';

export const LOADING_SUFFIX = '__loading__';
export const ROOT_PARENT_ID = '__root__';

const calcSpacerWidth = (level: number): number => Math.max(0, 10 + 20 * (level - 1));

function createDefaultTreeItems<TData extends TreeData>(): TreeItems<TData> {
  return {
    nodes: {},
    children: {},
    hasMore: {},
  };
}

function flattenTree<TData extends TreeData>(
  items: TreeItems<TData>,
  expandedSet: ReadonlySet<string>,
  baseId: string,
  loadingById: Map<string | null, boolean>,
  errorById: Map<string | null, Error | string>,
): FlatTreeNode<TData>[] {
  const result: FlatTreeNode<TData>[] = [];

  const rootIds = items.children[ROOT_PARENT_ID] ?? [];
  const hasMoreRoot = items.hasMore[ROOT_PARENT_ID] ?? false;

  const visit = (id: string, level: number, parentId: string | null): void => {
    const data = items.nodes[id];

    if (!data) {
      return;
    }

    const hasMoreChildren = items.hasMore[id] ?? false;

    result.push({
      id,
      data,
      level,
      parentId,
      nodeType: 'node',
    });

    const isExpanded = expandedSet.has(id);

    if (isExpanded && data.hasChildren) {
      const children = items.children[id] ?? [];

      for (const childId of children) {
        visit(childId, level + 1, id);
      }

      const hasErrorLoadingChildren = !!errorById.get(id);

      if (hasErrorLoadingChildren) {
        const errorId = `${id}${LOADING_SUFFIX}error`;

        result.push({
          id: errorId,
          data: {
            id: errorId,
            hasChildren: false,
          } as TData,
          level: level + 1,
          parentId: id,
          nodeType: 'error',
        });

        return;
      }

      const isLoading = loadingById.get(id) === true;
      const childrenLoaded = Object.hasOwn(items.children, id);
      const shouldShowLoadingRow =
        isLoading || // show loading row
        !childrenLoaded || // expanded for the first time
        hasMoreChildren; // pagination

      if (shouldShowLoadingRow) {
        const loadingId = `${id}${LOADING_SUFFIX}${children.length}`;

        result.push({
          id: loadingId,
          data: {
            id: loadingId,
            hasChildren: false,
          } as TData,
          level: level + 1,
          parentId: id,
          nodeType: 'loading',
        });
      }
    }
  };

  for (const rootId of rootIds) {
    visit(rootId, 1, null);
  }

  const hasRootLoadingError = !!errorById.get(null);
  const isRootLoading = loadingById.get(null) === true;

  if (hasRootLoadingError) {
    const loadingId = `${baseId}${LOADING_SUFFIX}error`;
    result.push({
      id: loadingId,
      data: {
        id: loadingId,
        hasChildren: false,
      } as TData,
      level: 1,
      parentId: null,
      nodeType: 'error',
    });
  } else if (hasMoreRoot || isRootLoading) {
    const loadingId = `${baseId}${LOADING_SUFFIX}${rootIds.length}`;
    result.push({
      id: loadingId,
      parentId: null,
      data: {
        id: loadingId,
        hasChildren: false,
      } as TData,
      level: 1,
      nodeType: 'loading',
    });
  }

  return result;
}

// #region TreeListContentRoot

export type TreeListContentProps<TData extends TreeData = TreeData> = {
  className?: string;
  fetchChildren: (
    parentId: string | undefined,
    offset: number,
  ) => Promise<{
    items: TData[];
    hasMore: boolean;
  }>;
  expanded?: ReadonlySet<string>;
  onExpandedChange?: (expanded: ReadonlySet<string>) => void;
  selection?: ReadonlySet<string>;
  onSelectionChange?: (selection: ReadonlySet<string>) => void;
  selectionMode?: 'single' | 'multiple';
  active?: string | null;
  defaultActive?: string;
  setActive?: (active: string | null | undefined) => void;
  isItemSelectable?: (item: TData) => boolean;
  items?: TreeItems<TData>;
  onItemsChange?: (items: TreeItems<TData>) => void;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const TreeListContentRoot = <TData extends TreeData = TreeData>({
  className,
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
  items: controlledItems,
  onItemsChange,
  children,
  ...props
}: TreeListContentProps<TData>): ReactElement => {
  const baseId = usePrefixedId(undefined, 'tree-list-content');

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

  const [active, updateActive] = useControlledStateWithNull(controlledActive, defaultActive, setActive);
  const [isFocused, setFocused] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useControlledState<TreeItems<TData>>(
    controlledItems,
    createDefaultTreeItems<TData>(),
    onItemsChange,
  );

  const [loadingById, setLoadingById] = useState<Map<string | null, boolean>>(() => new Map());
  const [errorById, setErrorById] = useState<Map<string | null, Error | string>>(() => new Map());

  const loadMore = useCallback(
    async (parentId?: string) => {
      if (loadingById.get(parentId ?? null) === true) {
        return;
      }

      const key = parentId ?? ROOT_PARENT_ID;
      const offset = (items.children[parentId ?? ROOT_PARENT_ID] ?? []).length;

      setLoadingById(prev => {
        const next = new Map(prev);
        next.set(parentId ?? null, true);
        return next;
      });

      setErrorById(prev => {
        const next = new Map(prev);
        next.delete(parentId ?? null);
        return next;
      });

      try {
        const { items: newItems, hasMore } = await fetchChildren(parentId, offset);

        setItems(prev => {
          const nodes = { ...prev.nodes };
          const children = { ...prev.children };
          const hasMoreMap = { ...prev.hasMore };

          for (const item of newItems) {
            nodes[item.id] = item;
          }

          const prevChildren = children[key] ?? [];
          const newIds = newItems.map(item => item.id);

          children[key] = offset === 0 ? newIds : [...prevChildren, ...newIds];
          hasMoreMap[key] = hasMore;

          return { nodes, children, hasMore: hasMoreMap };
        });
      } catch (error) {
        setErrorById(prev => {
          const next = new Map(prev);
          next.set(parentId ?? null, error instanceof Error ? error : String(error));
          return next;
        });
      } finally {
        setLoadingById(prev => {
          const next = new Map(prev);
          next.set(parentId ?? null, false);
          return next;
        });
      }
    },
    [fetchChildren, items.children, setItems, loadingById],
  );

  const flattenedItems = useMemo(
    () => flattenTree<TData>(items, expanded, baseId, loadingById, errorById),
    [items, expanded, baseId, loadingById, errorById],
  );

  const toggleSelection = useCallback(
    (id: string) => {
      const item = items.nodes[id];

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
    [selection, selectionMode, isItemSelectable, items, setSelection],
  );

  const toggleExpanded = useCallback(
    (id: string) => {
      if (id.includes(LOADING_SUFFIX)) {
        return;
      }

      const isExpanded = expanded.has(id);
      const newExpanded = new Set(expanded);

      if (isExpanded) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }

      setExpanded(newExpanded);
    },
    [expanded, setExpanded],
  );

  const getNavItems = useCallback(
    () => flattenedItems.filter(item => item.nodeType !== 'loading').map(item => item.id),
    [flattenedItems],
  );

  const isItemDisabled = useCallback((_id: string) => false, []);

  const { handleKeyDown, moveActive } = useKeyboardNavigation({
    getItems: getNavItems,
    isItemDisabled,
    active,
    setActive: updateActive,
    loop: false,
    orientation: 'vertical',
    onSelect: id => {
      updateActive(id);
      toggleSelection(id);
    },
  });

  const keyHandler = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      if (e.key === 'ArrowRight') {
        const activeNode = active ? flattenedItems.find(item => item.id === active) : null;

        if (activeNode && activeNode.nodeType !== 'loading') {
          if (activeNode.data.hasChildren) {
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

        if (activeNode && activeNode.nodeType !== 'loading') {
          if (activeNode.data.hasChildren && expanded.has(activeNode.id)) {
            toggleExpanded(activeNode.id);
          } else if (activeNode.parentId) {
            updateActive(activeNode.parentId);
          }
        }

        return;
      }

      handleKeyDown(e);
    },
    [active, flattenedItems, expanded, handleKeyDown, moveActive, toggleExpanded, updateActive],
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
  }, [active, baseId]);

  const hasAnyNodes = useMemo(() => Object.keys(items.nodes).length > 0, [items.nodes]);

  useEffect(() => {
    if (!hasAnyNodes) {
      void loadMore();
    }
  }, [hasAnyNodes, loadMore]);

  const contextValue = useMemo(
    () => ({
      baseId,
      items: flattenedItems,
      treeItems: items,
      active,
      loadMore,
      selection,
      expanded,
      toggleSelection,
      toggleExpanded,
      setActive: updateActive,
      selectionMode,
      isFocused,
      isItemSelectable,
      loadingById,
      errorById,
    }),
    [
      baseId,
      flattenedItems,
      items,
      loadMore,
      selection,
      expanded,
      active,
      toggleSelection,
      toggleExpanded,
      updateActive,
      selectionMode,
      isFocused,
      isItemSelectable,
      loadingById,
      errorById,
    ],
  );

  return (
    <TreeListContentProvider value={contextValue}>
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
    </TreeListContentProvider>
  );
};

TreeListContentRoot.displayName = 'TreeListContent.Root';

// #endregion

// #region TreeListContentContainer

export type TreeListContentContainerProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListContentContainer = forwardRef<HTMLDivElement, TreeListContentContainerProps>(
  ({ children, className, ...props }, ref): ReactElement => {
    const { baseId } = useTreeListContent();

    return (
      <div
        id={`${baseId}-scroll-root`}
        ref={ref}
        className={cn('relative flex h-full flex-col gap-y-1 overflow-y-auto p-1', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TreeListContentContainer.displayName = 'TreeListContent.Container';

// #endregion

// #region TreeListContentItems

export type TreeListContentItemsProps<TData extends TreeData> = {
  renderNode: (item: FlatTreeNode<TData>) => ReactNode;
  renderLoading?: (item: FlatTreeNode<TData>) => ReactNode;
  renderError?: (item: FlatTreeNode<TData>) => ReactNode;
};

const TreeListContentItems = <TData extends TreeData>({
  renderNode,
  renderLoading,
  renderError,
}: TreeListContentItemsProps<TData>): ReactElement => {
  const { items, loadMore } = useTreeListContent<TData>();

  return (
    <>
      {items.map(item => {
        if (item.nodeType === 'error') {
          return (
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            <TreeListContentErrorRow
              key={item.id}
              item={item}
              renderError={renderError}
              onRetry={() => void loadMore(item.parentId ?? undefined)}
            />
          );
        }

        if (item.nodeType === 'loading') {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          return <TreeListContentLoadingRow key={item.id} item={item} renderLoading={renderLoading} />;
        }

        return <Fragment key={item.id}>{renderNode(item)}</Fragment>;
      })}
    </>
  );
};

TreeListContentItems.displayName = 'TreeListContent.Items';

// #endregion

// #region TreeListContentRow

export type TreeListContentRowProps<TData extends TreeData> = {
  item: FlatTreeNode<TData>;
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListContentRow = <TData extends TreeData>({
  item,
  children,
  className,
  ...props
}: TreeListContentRowProps<TData>): ReactElement => {
  const {
    selection,
    selectionMode,
    expanded,
    toggleSelection,
    isItemSelectable,
    setActive,
    active,
    baseId,
    isFocused,
  } = useTreeListContent<TData>();
  const isExpanded = expanded.has(item.id);
  const isSelected = selection.has(item.id);
  const isSelectable = isItemSelectable(item.data);
  const isActive = isFocused && active === item.id;
  const rowDomId = `${baseId}-item-${item.id}`;

  if (item.nodeType === 'loading') {
    return (
      <div
        id={rowDomId}
        role='none'
        className={cn('relative z-0 flex items-center gap-2.5 px-2.5 py-1 text-sm text-subtle', className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
    <div
      id={rowDomId}
      role='treeitem'
      aria-expanded={item.data.hasChildren ? isExpanded : undefined}
      aria-selected={isSelected ? true : selectionMode === 'multiple' ? false : undefined}
      aria-level={item.level}
      data-tone={isSelected ? 'inverse' : undefined}
      data-active={isActive || undefined}
      onClick={() => {
        setActive(item.id);
        toggleSelection(item.id);
      }}
      className={cn(
        'group relative z-0 flex items-center gap-2.5 px-2.5 py-1 focus-within:outline-none hover:bg-surface-primary-hover',
        'after:-inset-0.5 after:-z-10 after:pointer-events-auto after:absolute after:rounded-sm after:content-[""]',
        'data-[active=true]:ring-2 data-[active=true]:ring-offset-0',
        isSelectable && 'cursor-pointer',
        isSelected
          ? 'bg-surface-selected text-alt hover:bg-surface-selected-hover data-[active=true]:ring-main'
          : 'hover:bg-surface-neutral-hover',
        className,
      )}
      tabIndex={undefined}
      {...props}
    >
      {children}
    </div>
  );
};

TreeListContentRow.displayName = 'TreeListContent.Row';

// #endregion

// #region TreeListContentLoadingRow

export type DefaultTreeListContentLoadingRowViewProps<TData extends TreeData> = {
  item: FlatTreeNode<TData>;
} & ComponentPropsWithoutRef<'div'>;

const DefaultTreeListContentLoadingRowView = <TData extends TreeData>({
  item,
  className,
  children,
  ...props
}: DefaultTreeListContentLoadingRowViewProps<TData>): ReactElement => {
  return (
    <div className={cn('flex items-center gap-2 px-2 py-1 text-sm', className)} {...props}>
      {item.level > 1 && (
        <span className='spacer' style={{ '--level-indent': `${calcSpacerWidth(item.level)}px` }}>
          <span className='inline-block w-(--level-indent)' />
        </span>
      )}
      <Loader2 size={14} className='animate-spin' />
      {children ?? <span>Loading...</span>}
    </div>
  );
};

export type TreeListContentLoadingRowProps<TData extends TreeData> = {
  item: FlatTreeNode<TData>;
  renderLoading?: (item: FlatTreeNode<TData>) => ReactNode;
  children?: ReactNode;
  intersectionProps?: IntersectionObserverInit;
} & ComponentPropsWithoutRef<'div'>;

const TreeListContentLoadingRow = <TData extends TreeData>({
  item,
  renderLoading,
  className,
  children,
  intersectionProps,
  ...props
}: TreeListContentLoadingRowProps<TData>): ReactElement => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { loadMore, baseId } = useTreeListContent<TData>();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const scrollRoot = document.getElementById(`${baseId}-scroll-root`);

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            const parentId = item.parentId ?? undefined;
            void loadMore(parentId);
          }
        }
      },
      intersectionProps ?? {
        root: scrollRoot ?? undefined,
        rootMargin: '120px',
      },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [item.parentId, loadMore, intersectionProps, baseId]);

  return (
    <div ref={ref} className={className} {...props}>
      {renderLoading ? renderLoading(item) : <DefaultTreeListContentLoadingRowView item={item} />}
    </div>
  );
};

TreeListContentLoadingRow.displayName = 'TreeListContent.LoadingRow';

// #endregion

// #region TreeListContentErrorRow

export type TreeListContentErrorRowProps<TData extends TreeData> = {
  item: FlatTreeNode<TData>;
  renderError?: (item: FlatTreeNode<TData>) => ReactNode;
  className?: string;
  onRetry?: () => void;
} & ComponentPropsWithoutRef<'div'>;

const TreeListContentErrorRow = <TData extends TreeData>({
  item,
  onRetry,
  renderError,
  className,
  ...props
}: TreeListContentErrorRowProps<TData>): ReactElement => {
  return (
    <div
      tabIndex={-1}
      role={'button'}
      className={cn('flex cursor-pointer items-center gap-2 px-2 py-1 text-red-600 text-sm', className)}
      onClick={onRetry}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onRetry?.();
        }
      }}
      {...props}
    >
      {renderError ? (
        renderError(item)
      ) : (
        <>
          {item.level > 1 && (
            <span className='spacer' style={{ '--level-indent': `${calcSpacerWidth(item.level)}px` }}>
              <span className='inline-block w-(--level-indent)' />
            </span>
          )}
          <span>Failed to load. Click to retry.</span>
        </>
      )}
    </div>
  );
};

TreeListContentErrorRow.displayName = 'TreeListContent.ErrorRow';

// #endregion

// #region TreeListContentRowExpandControl

export type TreeListContentRowExpandControlProps<TData extends TreeData> = {
  data: FlatTreeNode<TData>;
  icon?: LucideIcon;
  className?: string;
};

const TreeListContentRowExpandControl = <TData extends TreeData>({
  data,
  icon = ChevronRight,
  className,
}: TreeListContentRowExpandControlProps<TData>): ReactElement => {
  const { expanded, toggleExpanded, selection, setActive } = useTreeListContent<TData>();
  const isExpanded = expanded.has(data.id);
  const isSelected = selection.has(data.id);

  if (data.nodeType === 'loading' || !data.data.hasChildren) {
    return <span className='size-5 shrink-0' />;
  }

  return (
    <TreeList.RowExpandControl
      expanded={isExpanded}
      hasChildren={data.data.hasChildren}
      selected={isSelected}
      icon={icon}
      className={className}
      onToggle={() => {
        toggleExpanded(data.id);
        setActive(data.id);
      }}
    />
  );
};

TreeListContentRowExpandControl.displayName = 'TreeListContent.RowExpandControl';

// #endregion

// #region TreeListContentRowSelectionControl

export type TreeListContentRowSelectionControlProps<TData extends TreeData> = {
  data: FlatTreeNode<TData>;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListContentRowSelectionControl = <TData extends TreeData>({
  data,
  className,
  ...props
}: TreeListContentRowSelectionControlProps<TData>): ReactElement => {
  const { selection, isItemSelectable } = useTreeListContent<TData>();
  const isSelected = selection.has(data.id);
  const selectable = data.nodeType !== 'loading' && isItemSelectable(data.data);

  return (
    <TreeList.RowSelectionControl selected={isSelected} selectable={selectable} className={className} {...props} />
  );
};

TreeListContentRowSelectionControl.displayName = 'TreeListContent.RowSelectionControl';

// #endregion

// #region TreeListContent Export

export const TreeListContent = Object.assign(TreeListContentRoot, {
  Root: TreeListContentRoot,
  Container: TreeListContentContainer,
  Items: TreeListContentItems,
  Row: TreeListContentRow,
  LoadingRow: TreeListContentLoadingRow,
  DefaultLoadingRowView: DefaultTreeListContentLoadingRowView,
  ErrorRow: TreeListContentErrorRow,
  RowLeft: TreeList.RowLeft,
  RowRight: TreeList.RowRight,
  RowLevelSpacer: TreeList.RowLevelSpacer,
  RowExpandControl: TreeListContentRowExpandControl,
  RowContent: TreeList.RowContent,
  RowSelectionControl: TreeListContentRowSelectionControl,
});

// #endregion
