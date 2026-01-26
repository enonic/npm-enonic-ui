import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type TabContextValue = {
  baseId: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  activationMode: 'automatic' | 'manual';
  registerItem: (id: string, disabled?: boolean, element?: HTMLElement | null) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  active: string | undefined;
  setActive: (id: string | undefined) => void;
};

const TabContext = createContext<TabContextValue | undefined>(undefined);

export type TabProviderProps = {
  value: TabContextValue;
  children?: ReactNode;
};

export const TabProvider = ({ value, children }: TabProviderProps): ReactElement => {
  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};

TabProvider.displayName = 'TabProvider';

export const useTab = (): TabContextValue => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
};
