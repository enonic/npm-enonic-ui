import { createContext, type ReactElement, type ReactNode, type RefObject, useContext } from 'react';

export type TreeListUIContextValue = {
  baseId: string;
  active: string | undefined;
  setActive: (id: string | undefined) => void;
  isFocused: boolean;
  selection: ReadonlySet<string>;
  toggleSelection: (id: string) => void;
  selectionMode: 'single' | 'multiple';
  registerItem: (id: string, disabled?: boolean) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

const TreeListUIContext = createContext<TreeListUIContextValue | undefined>(undefined);

export type TreeListUIProviderProps = {
  value: TreeListUIContextValue;
  children?: ReactNode;
};

export const TreeListUIProvider = ({ value, children }: TreeListUIProviderProps): ReactElement => {
  return <TreeListUIContext.Provider value={value}>{children}</TreeListUIContext.Provider>;
};

export const useTreeListUI = (): TreeListUIContextValue => {
  const context = useContext(TreeListUIContext);
  if (!context) {
    throw new Error('useTreeListUI must be used within a TreeListUIProvider');
  }
  return context;
};
