import { createContext, type ReactElement, type ReactNode, useContext } from 'react';
import type { FlatNodeBase } from '@/hooks/use-virtualized-keyboard-navigation';

export type VirtualizedTreeListContextValue = {
  baseId: string;
  // Active state
  activeIndex: number | null;
  activeId: string | null;
  setActiveIndex: (index: number | null) => void;
  // Selection
  selection: ReadonlySet<string>;
  toggleSelection: (id: string, index: number) => void;
  selectionMode: 'single' | 'multiple' | 'none';
  // Focus
  isFocused: boolean;
  // True when the most recent interaction was via keyboard
  // (used to gate the focus ring so it doesn't show after mouse clicks)
  keyboardActive: boolean;
  // Items
  items: readonly FlatNodeBase[];
  getItemIndex: (id: string) => number;
  // Scroll
  scrollToIndex: (index: number) => void;
  // Expansion callbacks
  onExpand?: (id: string) => void;
  onCollapse?: (id: string) => void;
  // Activation callback
  onActivate?: (id: string) => void;
  // Action mode (F2)
  actionModeRowId: string | undefined;
  exitActionMode: () => void;
};

const VirtualizedTreeListContext = createContext<VirtualizedTreeListContextValue | undefined>(undefined);

export type VirtualizedTreeListProviderProps = {
  value: VirtualizedTreeListContextValue;
  children?: ReactNode;
};

export const VirtualizedTreeListProvider = ({ value, children }: VirtualizedTreeListProviderProps): ReactElement => {
  return <VirtualizedTreeListContext.Provider value={value}>{children}</VirtualizedTreeListContext.Provider>;
};

export const useVirtualizedTreeList = (): VirtualizedTreeListContextValue => {
  const context = useContext(VirtualizedTreeListContext);
  if (!context) {
    throw new Error('useVirtualizedTreeList must be used within a VirtualizedTreeListProvider');
  }
  return context;
};
