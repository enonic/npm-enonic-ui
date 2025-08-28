import { createContext, useContext, useId } from 'react';
import type { ReactNode } from 'react';

type IdContextValue = {
  prefix?: string;
};

const IdContext = createContext<IdContextValue | undefined>(undefined);

export type IdProviderProps = {
  children: ReactNode;
  prefix?: string;
};

export const IdProvider = ({ children, prefix }: IdProviderProps): React.ReactElement => {
  return <IdContext.Provider value={{ prefix }}>{children}</IdContext.Provider>;
};

IdProvider.displayName = 'IdProvider';

export const usePrefixedId = (providedId?: string): string => {
  const baseId = useId();
  const context = useContext(IdContext);

  if (providedId) {
    return providedId;
  }

  const id = context?.prefix ? `${context.prefix}-${baseId}` : baseId;
  return id;
};
