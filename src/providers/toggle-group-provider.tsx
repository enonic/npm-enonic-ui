import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type ToggleGroupContextValue = {
  selectionMode: 'single' | 'multiple';
  value: string | string[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  registerItem: (id: string, disabled?: boolean) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  orientation?: 'horizontal' | 'vertical';
  active?: string;
  setActive?: (id: string | undefined) => void;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | undefined>(undefined);

export type ToggleGroupProviderProps = {
  value: ToggleGroupContextValue;
  children?: ReactNode;
};

export const ToggleGroupProvider = ({ value, children }: ToggleGroupProviderProps): ReactElement => {
  return <ToggleGroupContext.Provider value={value}>{children}</ToggleGroupContext.Provider>;
};

export const useToggleGroup = (): ToggleGroupContextValue => {
  const context = useContext(ToggleGroupContext);
  if (!context) {
    throw new Error('useToggleGroup must be used within a ToggleGroupProvider');
  }
  return context;
};
