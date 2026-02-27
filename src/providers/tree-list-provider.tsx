import { createContext, type ReactElement, type ReactNode, type RefObject, useContext } from 'react';

export type SelectionMode = 'single' | 'multiple' | 'none';

export type RowClickSelection = 'select' | 'toggle' | 'clear';

export type TreeListContextValue = {
  baseId: string;
  active: string | undefined;
  setActive: (id: string | undefined) => void;
  isFocused: boolean;
  selection: ReadonlySet<string>;
  toggleSelection: (id: string) => void;
  selectOnly: (id: string) => void;
  selectRange: (fromId: string, toId: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  selectionMode: SelectionMode;
  anchorId: string | undefined;
  setAnchorId: (id: string | undefined) => void;
  registerItem: (id: string, disabled?: boolean, element?: HTMLElement | null) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  // Tree navigation (optional - provided by consumer for tree behavior)
  getParentId?: (id: string) => string | undefined;
  getFirstChildId?: (id: string) => string | undefined;
  isExpanded?: (id: string) => boolean;
  toggleExpanded?: (id: string) => void;
  // Activation callback
  onActivate?: (id: string) => void;
  // Action mode (F2 to focus interactive elements within a row)
  actionModeRowId: string | undefined;
  enterActionMode: () => void;
  exitActionMode: () => void;
  // Clear active on reclick when selection is empty
  clearActiveOnReclick: boolean;
  // Controls plain-click selection behavior
  rowClickSelection: RowClickSelection;
};

const TreeListContext = createContext<TreeListContextValue | undefined>(undefined);

export type TreeListProviderProps = {
  value: TreeListContextValue;
  children?: ReactNode;
};

export const TreeListProvider = ({ value, children }: TreeListProviderProps): ReactElement => {
  return <TreeListContext.Provider value={value}>{children}</TreeListContext.Provider>;
};

export const useTreeList = (): TreeListContextValue => {
  const context = useContext(TreeListContext);
  if (!context) {
    throw new Error('useTreeList must be used within a TreeListProvider');
  }
  return context;
};
