import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type TreeData = {
  id: string;
  hasChildren: boolean;
};

export type TreeItems<TData extends TreeData> = {
  nodes: Record<string, TData | undefined>;
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

export type TreeListContentContextValue<TData extends TreeData = TreeData> = {
  baseId: string;
  items: readonly FlatTreeNode<TData>[];
  treeItems: TreeItems<TData>;
  expanded: ReadonlySet<string>;
  toggleExpanded: (id: string) => void;
  loadMore: (parentId?: string) => Promise<void>;
  loadingById: Map<string | null, boolean>;
  errorById: Map<string | null, Error | string>;
  isItemSelectable: (item: TData) => boolean;
  selection: ReadonlySet<string>;
  toggleSelection: (id: string) => void;
  active: string | undefined;
  setActive: (id: string | undefined) => void;
  selectionMode: 'single' | 'multiple';
  isFocused: boolean;
};

const TreeListContentContext = createContext<TreeListContentContextValue | undefined>(undefined);

export type TreeListContentProviderProps<TData extends TreeData = TreeData> = {
  value: TreeListContentContextValue<TData>;
  children?: ReactNode;
};

export const TreeListContentProvider = <TData extends TreeData = TreeData>({
  value,
  children,
}: TreeListContentProviderProps<TData>): ReactElement => {
  return (
    <TreeListContentContext.Provider value={value as unknown as TreeListContentContextValue}>
      {children}
    </TreeListContentContext.Provider>
  );
};

export const useTreeListContent = <TData extends TreeData = TreeData>(): TreeListContentContextValue<TData> => {
  const context = useContext(TreeListContentContext);
  if (!context) {
    throw new Error('useTreeListContent must be used within a TreeListContentProvider');
  }
  return context as unknown as TreeListContentContextValue<TData>;
};
