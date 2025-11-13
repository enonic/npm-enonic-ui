import type { TreeNode } from '@/components/tree-list/tree-list';
import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type TreeListContextValue<T extends TreeNode = TreeNode> = {
  baseId: string;
  items: readonly T[];
  loadMore: (parent?: string) => void | Promise<void>;
  isItemSelectable: (item: T) => boolean;
  active?: string;
  selection?: ReadonlySet<string>;
  expanded?: ReadonlySet<string>;
  toggleSelection?: (id: string) => void;
  toggleExpanded: (id: string) => void;
  selectionMode: 'single' | 'multiple';
  isFocused: boolean;
};

const TreeListContext = createContext<TreeListContextValue | undefined>(undefined);

export type TreeListProviderProps<T extends TreeNode = TreeNode> = {
  value: TreeListContextValue<T>;
  children?: ReactNode;
};

export const TreeListProvider = <T extends TreeNode = TreeNode>({
  value,
  children,
}: TreeListProviderProps<T>): ReactElement => {
  return (
    <TreeListContext.Provider value={value as unknown as TreeListContextValue}>{children}</TreeListContext.Provider>
  );
};

export const useTreeList = <T extends TreeNode = TreeNode>(): TreeListContextValue<T> => {
  const context = useContext(TreeListContext);
  if (!context) {
    throw new Error('useTreeList must be used within a TreeListProvider');
  }
  return context as unknown as TreeListContextValue<T>;
};
