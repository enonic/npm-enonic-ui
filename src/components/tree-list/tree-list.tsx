import { ChevronRight, Loader2, Square, SquareCheck } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  Fragment,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconButton, type IconButtonProps } from '@/components/icon-button';
import { useControlledState, useControlledStateWithNull, useKeyboardNavigation } from '@/hooks';
import { usePrefixedId } from '@/providers';
import { type TreeListContextValue, TreeListProvider, useTreeList } from '@/providers/tree-list-provider';
import type { LucideIcon } from '@/types';
import { cn } from '@/utils';

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

export type TreeData = {
  id: string;
  hasChildren: boolean;
};

export type TreeItems<TreeData> = {
  nodes: Record<string, TreeData | undefined>;
  children: Record<string, string[] | undefined>;
  hasMore: Record<string, boolean | undefined>;
};

export type FlatTreeNode<TData extends TreeData> = {
  id: string;
  data: TData;
  level: number;
  parentId: string | null;
  nodeType: 'node' | 'loading' | 'error';
};

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

export type TreeListProps<TData extends TreeData = TreeData> = {
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

export type TreeListContainerProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListContainer = ({
  children,
  className,
  ...props
}: TreeListContainerProps): ReactElement<TreeListContainerProps> => {
  const { baseId, scrollRootRef } = useTreeList();

  return (
    <div
      id={`${baseId}-scroll-root`}
      ref={scrollRootRef}
      className={cn('relative flex h-full flex-col gap-y-1 overflow-y-auto p-1', className)}
      {...props}
    >
      {children}
    </div>
  );
};

TreeListContainer.displayName = 'TreeList.Container';

export type DefaultTreeListLoadingRowViewProps<TData extends TreeData> = {
  item: FlatTreeNode<TData>;
} & ComponentPropsWithoutRef<'div'>;

const DefaultTreeListLoadingRowView = <TData extends TreeData>({
  item,
  className,
  children,
  ...props
}: DefaultTreeListLoadingRowViewProps<TData>): ReactElement => {
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

export type TreeListLoadingRowProps<TData extends TreeData> = {
  item: FlatTreeNode<TData>;
  renderLoading?: (item: FlatTreeNode<TData>) => ReactNode;
  children?: ReactNode;
  intersectionProps?: IntersectionObserverInit;
} & ComponentPropsWithoutRef<'div'>;

const TreeListLoadingRow = <TData extends TreeData>({
  item,
  renderLoading,
  className,
  children,
  intersectionProps,
  ...props
}: TreeListLoadingRowProps<TData>): ReactElement => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { loadMore, scrollRootRef } = useTreeList<TData>();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

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
        root: scrollRootRef?.current ?? undefined,
        rootMargin: '120px',
      },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [item.parentId, loadMore, intersectionProps, scrollRootRef]);

  return (
    <div ref={ref} className={className} {...props}>
      {renderLoading ? renderLoading(item) : <DefaultTreeListLoadingRowView item={item} />}
    </div>
  );
};

TreeListLoadingRow.displayName = 'TreeList.LoadingRow';

export type TreeListErrorRowProps<TData extends TreeData> = {
  item: FlatTreeNode<TData>;
  renderError?: (item: FlatTreeNode<TData>) => ReactNode;
  className?: string;
  onRetry?: () => void;
} & ComponentPropsWithoutRef<'div'>;

const TreeListErrorRow = <TData extends TreeData>({
  item,
  onRetry,
  renderError,
  className,
  ...props
}: TreeListErrorRowProps<TData>): ReactElement => {
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

TreeListErrorRow.displayName = 'TreeList.ErrorRow';

export type TreeListContentProps<TData extends TreeData> = {
  renderNode: (item: FlatTreeNode<TData>) => ReactNode;
  renderLoading?: (item: FlatTreeNode<TData>) => ReactNode;
  renderError?: (item: FlatTreeNode<TData>) => ReactNode;
};

const TreeListContent = <TData extends TreeData>({
  renderNode,
  renderLoading,
  renderError,
}: TreeListContentProps<TData>): ReactElement => {
  const { items, loadMore } = useTreeList<TData>();

  return (
    <>
      {items.map(item => {
        if (item.nodeType === 'error') {
          return (
            <TreeListErrorRow
              key={item.id}
              item={item}
              renderError={renderError}
              onRetry={() => void loadMore(item.parentId ?? undefined)}
            />
          );
        }

        if (item.nodeType === 'loading') {
          return <TreeListLoadingRow key={item.id} item={item} renderLoading={renderLoading} />;
        }

        return <Fragment key={item.id}>{renderNode(item)}</Fragment>;
      })}
    </>
  );
};

TreeListContent.displayName = 'TreeList.Content';

export type TreeListRowLeftProps = {
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

export type TreeListRowRightProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRowRight = ({
  children,
  className,
  ...props
}: TreeListRowRightProps): ReactElement<TreeListRowRightProps> => (
  <div className={cn('flex items-center gap-2.5', className)} {...props}>
    {children}
  </div>
);

TreeListRowRight.displayName = 'TreeList.RowRight';

export type TreeListRowLevelSpacerProps = {
  level?: number;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRowLevelSpacer = ({
  level = 1,
  className,
  ...props
}: TreeListRowLevelSpacerProps): ReactElement<TreeListRowLevelSpacerProps> | null => {
  if (level === 1) {
    return null; // no spacer needed for level 1
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

export type TreeListRowExpandControlProps<TData extends TreeData> = {
  data: FlatTreeNode<TData>;
  icon?: LucideIcon;
} & Omit<IconButtonProps, 'icon'>;

const TreeListRowExpandControl = <TData extends TreeData>({
  data,
  icon = ChevronRight,
  className,
  ...props
}: TreeListRowExpandControlProps<TData>): ReactElement<TreeListRowExpandControlProps<TData>> => {
  const { expanded, toggleExpanded, selection, updateActive } = useTreeList<TData>();
  const isExpanded = expanded?.has(data.id);
  const isSelected = selection?.has(data.id);

  if (data.nodeType === 'loading' || !data.data.hasChildren) {
    return <span className='size-5 shrink-0' />;
  }

  return (
    <IconButton
      icon={icon}
      variant='text'
      title='Expand'
      tabIndex={-1}
      className={cn(
        'size-5 bg-transparent transition-transform duration-150 hover:bg-transparent active:bg-transparent active:text-main',
        isSelected && 'text-alt hover:text-alt active:text-alt',
        isExpanded && 'rotate-90',
        className,
      )}
      onClick={e => {
        toggleExpanded(data.id);
        updateActive(data.id);
        e.stopPropagation();
      }}
      {...props}
    />
  );
};

TreeListRowExpandControl.displayName = 'TreeList.RowExpandControl';

export type TreeListRowContentProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRowContent = ({
  className,
  children,
  ...props
}: TreeListRowContentProps): ReactElement<TreeListRowContentProps> => {
  return (
    <div className={cn('min-w-0 flex-1', className)} {...props}>
      {children}
    </div>
  );
};

TreeListRowContent.displayName = 'TreeList.RowContent';

export type TreeListRowSelectionControlProps<TData extends TreeData> = {
  data: FlatTreeNode<TData>;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRowSelectionControl = <TData extends TreeData>({
  data,
  className,
  ...props
}: TreeListRowSelectionControlProps<TData>): ReactElement => {
  const { selection, isItemSelectable } = useTreeList<TData>();
  const isSelected = selection?.has(data.id);

  if (data.nodeType === 'loading' || !isItemSelectable(data.data)) {
    return <span className={cn('w-3.5', className)} {...props} />;
  }

  return (
    <div className={cn('flex w-3.5 items-center', className)} {...props}>
      {isSelected ? <SquareCheck /> : <Square />}
    </div>
  );
};

TreeListRowSelectionControl.displayName = 'TreeList.RowSelectionControl';

export type TreeListRowProps<TData extends TreeData> = {
  item: FlatTreeNode<TData>;
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const TreeListRow = <TData extends TreeData>({
  item,
  children,
  className,
  ...props
}: TreeListRowProps<TData>): ReactElement => {
  const {
    selection,
    selectionMode,
    expanded,
    toggleSelection,
    isItemSelectable,
    updateActive,
    active,
    baseId,
    isFocused,
  } = useTreeList<TData>();
  const isExpanded = expanded?.has(item.id);
  const isSelected = selection?.has(item.id);
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
        updateActive(item.id);
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

TreeListRow.displayName = 'TreeList.Row';

const TreeListRoot = <TData extends TreeData = TreeData>({
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
}: TreeListProps<TData>): ReactElement => {
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

  const scrollRootRef = useRef<HTMLDivElement>(null);

  const contextValue = useMemo<TreeListContextValue<TData>>(
    () => ({
      baseId,
      items: flattenedItems,
      active,
      loadMore,
      selection,
      expanded,
      toggleSelection,
      toggleExpanded,
      updateActive,
      selectionMode,
      isFocused,
      isItemSelectable,
      scrollRootRef,
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
      updateActive,
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

export const TreeList = Object.assign(TreeListRoot, {
  Root: TreeListRoot,
  Container: TreeListContainer,
  Content: TreeListContent,
  Row: TreeListRow,
  LoadingRow: TreeListLoadingRow,
  DefaultLoadingRowView: DefaultTreeListLoadingRowView,
  ErrorRow: TreeListErrorRow,
  RowLeft: TreeListRowLeft,
  RowRight: TreeListRowRight,
  RowLevelSpacer: TreeListRowLevelSpacer,
  RowExpandControl: TreeListRowExpandControl,
  RowContent: TreeListRowContent,
  RowSelectionControl: TreeListRowSelectionControl,
});
