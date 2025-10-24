import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type ComboboxContextValue = {
  baseId: string;

  open: boolean;
  setOpen: (next: boolean) => void;
  closeOnBlur: boolean;

  inputValue: string;
  setInputValue: (value: string) => void;

  selection: ReadonlySet<string>;

  active?: string;
  keyHandler: (e: React.KeyboardEvent<HTMLElement>) => void;

  disabled?: boolean;
  error?: boolean;
};

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

export type ComboboxProviderProps = {
  value: ComboboxContextValue;
  children?: ReactNode;
};

export const ComboboxProvider = ({ value, children }: ComboboxProviderProps): ReactElement => {
  return <ComboboxContext.Provider value={value}>{children}</ComboboxContext.Provider>;
};

ComboboxProvider.displayName = 'ComboboxProvider';

export const useCombobox = (): ComboboxContextValue => {
  const ctx = useContext(ComboboxContext);

  if (!ctx) {
    throw new Error('useCombobox must be used within a ComboboxProvider');
  }

  return ctx;
};
