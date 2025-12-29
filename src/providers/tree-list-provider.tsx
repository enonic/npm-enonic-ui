import { createContext, type ReactElement, type ReactNode, type RefObject, useContext } from 'react';
import type { FlatTreeNode, TreeData } from '@/providers/tree-list-content-provider';

export type TreeListContextValue<T extends TreeData = TreeData> = {
  baseId: string;
  items: readonly FlatTreeNode<T>[];
  loadMore: (parent?: string) => Promise<void>;
  isItemSelectable: (item: T) => boolean;
  active?: string;
  selection?: ReadonlySet<string>;
  expanded?: ReadonlySet<string>;
  toggleSelection: (id: string) => void;
  toggleExpanded: (id: string) => void;
  updateActive: (id: string | undefined) => void;
  selectionMode: 'single' | 'multiple';
  isFocused: boolean;
  scrollRootRef?: RefObject<HTMLDivElement>;
};

const TreeListContext = createContext<TreeListContextValue | undefined>(undefined);

export type TreeListProviderProps<T extends TreeData = TreeData> = {
  value: TreeListContextValue<T>;
  children?: ReactNode;
};

export const TreeListProvider = <T extends TreeData = TreeData>({
  value,
  children,
}: TreeListProviderProps<T>): ReactElement => {
  return (
    <TreeListContext.Provider value={value as unknown as TreeListContextValue}>{children}</TreeListContext.Provider>
  );
};

export const useTreeList = <T extends TreeData = TreeData>(): TreeListContextValue<T> => {
  const context = useContext(TreeListContext);
  if (!context) {
    throw new Error('useTreeList must be used within a TreeListProvider');
  }
  return context as unknown as TreeListContextValue<T>;
};
