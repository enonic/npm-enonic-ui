import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type ListboxContextValue = {
  active?: string;
  selection: ReadonlySet<string>;
  selectionMode: 'single' | 'multiple';
  disabled?: boolean;
  setActive: (id?: string) => void;
  toggleValue: (value: string) => void;
  registerItem: (value: string) => void;
  unregisterItem: (value: string) => void;
  getItems: () => string[];
  listboxId: string;
};

const ListboxContext = createContext<ListboxContextValue | null>(null);

export type ListboxProviderProps = {
  value: ListboxContextValue;
  children?: ReactNode;
};

export const ListboxProvider = ({ value, children }: ListboxProviderProps): ReactElement => {
  return <ListboxContext.Provider value={value}>{children}</ListboxContext.Provider>;
};

ListboxProvider.displayName = 'ListboxProvider';

export const useListbox = (): ListboxContextValue => {
  const ctx = useContext(ListboxContext);

  if (!ctx) {
    throw new Error('useListbox must be used within a Listbox');
  }

  return ctx;
};
