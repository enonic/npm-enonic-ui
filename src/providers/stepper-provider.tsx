import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type StepperContextValue = {
  baseId: string;
  value: string | undefined;
  maxVisible?: number;
  smallOnEdges?: boolean;
  onValueChange: (value: string) => void;
  registerItem: (id: string, disabled?: boolean, element?: HTMLElement | null) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  registryVersion: number;
};

const StepperContext = createContext<StepperContextValue | undefined>(undefined);

export type StepperProviderProps = {
  value: StepperContextValue;
  children?: ReactNode;
};

export const StepperProvider = ({ value, children }: StepperProviderProps): ReactElement => {
  return <StepperContext.Provider value={value}>{children}</StepperContext.Provider>;
};

StepperProvider.displayName = 'StepperProvider';

export const useStepper = (): StepperContextValue => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a StepperProvider');
  }
  return context;
};
