import { createContext, type ReactElement, type ReactNode, type RefObject, useContext } from 'react';

export type SelectorContextValue = {
  baseId: string;

  // Value state
  value: string | undefined;
  setValue: (value: string) => void;

  // Open state
  open: boolean;
  setOpen: (next: boolean) => void;

  // Active (highlighted) item for keyboard navigation
  active: string | undefined;
  setActive: (id: string | undefined) => void;

  // Component states
  disabled: boolean;
  error: boolean;
  required: boolean;

  // Form integration
  name?: string;
  form?: string;

  // Item registry
  registerItem: (id: string, disabled?: boolean) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;

  // Item text registry for type-ahead
  registerItemText: (id: string, text: string) => void;
  unregisterItemText: (id: string) => void;
  getItemText: (id: string) => string | undefined;

  // Keyboard handler
  keyHandler: (e: React.KeyboardEvent<HTMLElement>) => void;

  // Refs
  triggerRef: RefObject<HTMLButtonElement>;
};

const SelectorContext = createContext<SelectorContextValue | undefined>(undefined);

export type SelectorProviderProps = {
  value: SelectorContextValue;
  children?: ReactNode;
};

export const SelectorProvider = ({ value, children }: SelectorProviderProps): ReactElement => {
  return <SelectorContext.Provider value={value}>{children}</SelectorContext.Provider>;
};

SelectorProvider.displayName = 'SelectorProvider';

export const useSelector = (): SelectorContextValue => {
  const ctx = useContext(SelectorContext);

  if (!ctx) {
    throw new Error('useSelector must be used within a SelectorProvider');
  }

  return ctx;
};
