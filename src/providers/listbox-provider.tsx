import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type ListboxContextValue = {
  baseId: string;
  /**
   * Active item ID (`undefined` when no item is active).
   * Note: Never `null` - the hook converts `null` to `undefined` internally.
   */
  active?: string;
  selection: ReadonlySet<string>;
  selectionMode: 'single' | 'multiple';
  disabled?: boolean;
  /**
   * Focus management mode:
   * - 'roving-tabindex': Items are individually focusable (default)
   * - 'activedescendant': Container manages focus via aria-activedescendant
   */
  focusMode?: 'roving-tabindex' | 'activedescendant';
  /**
   * Set active item.
   * Accepts `null` for compatibility with controlled prop API, but converts it to `undefined` internally.
   */
  setActive: (id?: string | null) => void;
  toggleValue: (value: string) => void;
  keyHandler?: (e: React.KeyboardEvent<HTMLElement>) => void;
  registerItem: (id: string, disabled?: boolean) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
};

const ListboxContext = createContext<ListboxContextValue | undefined>(undefined);

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
