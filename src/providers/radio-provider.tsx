import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type RadioGroupContextValue = {
  baseId: string;
  name: string;
  value?: string;
  onValueChange: (value: string) => void;
  registerItem: (id: string, disabled?: boolean) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  registryVersion: number;
};

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

export type RadioGroupProviderProps = {
  value: RadioGroupContextValue;
  children?: ReactNode;
};

export const RadioGroupProvider = ({ value, children }: RadioGroupProviderProps): ReactElement => {
  return <RadioGroupContext.Provider value={value}>{children}</RadioGroupContext.Provider>;
};

RadioGroupProvider.displayName = 'RadioGroupProvider';

export const useRadioGroup = (): RadioGroupContextValue => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('useRadioGroup must be used within a RadioGroupProvider');
  }
  return context;
};
