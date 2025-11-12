import { createContext, type ReactElement, type ReactNode, type RefObject, useContext } from 'react';

export type SearchFieldContextValue = {
  id: string;
  value: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  clearLabel: string;
  setValue: (v: string) => void;
  inputRef: RefObject<HTMLInputElement>;
};

const SearchFieldContext = createContext<SearchFieldContextValue | undefined>(undefined);

export type SearchFieldProviderProps = {
  value: SearchFieldContextValue;
  children?: ReactNode;
};

export const SearchFieldProvider = ({ value, children }: SearchFieldProviderProps): ReactElement => {
  return <SearchFieldContext.Provider value={value}>{children}</SearchFieldContext.Provider>;
};

SearchFieldProvider.displayName = 'SearchFieldProvider';

export const useSearchField = (): SearchFieldContextValue => {
  const context = useContext(SearchFieldContext);
  if (!context) {
    throw new Error('useSearchField must be used within a SearchFieldProvider');
  }
  return context;
};
