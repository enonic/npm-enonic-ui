import { createContext, type ReactElement, type ReactNode, type RefObject, useContext } from 'react';

export type ContentType = 'listbox' | 'tree' | 'auto';

export type ComboboxContextValue = {
  baseId: string;
  controlRef: RefObject<HTMLDivElement> | null;

  open: boolean;
  setOpen: (next: boolean) => void;
  closeOnBlur: boolean;

  inputValue: string;
  setInputValue: (value: string) => void;

  selection: ReadonlySet<string>;
  appliedSelection: readonly string[];
  stagedSelection: readonly string[];
  stagingEnabled: boolean;
  hasStagedChanges: boolean;
  applyStagedSelection: () => void;
  resetStagedSelection: () => void;

  active?: string | null;
  setActive: (active: string | null | undefined) => void;
  keyHandler: (e: React.KeyboardEvent<HTMLElement>) => void;

  disabled?: boolean;
  error?: boolean;

  // Content type for composable pattern (prop, not state)
  contentType: ContentType;

  // Selection mode and change handler for ListContent
  selectionMode: 'single' | 'multiple';
  onSelectionChange: (selection: readonly string[]) => void;

  // Item registry functions for ListContent
  registerItem: (id: string, disabled?: boolean, element?: HTMLElement | null) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;

  // Value component registration
  hasValue: boolean;
  setHasValue: (has: boolean) => void;
};

const ComboboxContext = createContext<ComboboxContextValue | undefined>(undefined);

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
