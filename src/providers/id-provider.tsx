import type { ReactElement, ReactNode } from 'react';
import { createContext, useContext, useId } from 'react';

type IdContextValue = {
  prefix?: string;
};

const IdContext = createContext<IdContextValue | undefined>(undefined);

export type IdProviderProps = {
  children: ReactNode;
  prefix?: string;
};

export const IdProvider = ({ children, prefix }: IdProviderProps): ReactElement => {
  return <IdContext.Provider value={{ prefix }}>{children}</IdContext.Provider>;
};

IdProvider.displayName = 'IdProvider';

/**
 * Prefix provided or generated id with a prefix from the context
 * @param providedId - The id to prefix. Will use `useId()` if not provided.
 * @param prefix - A custom prefix used in addition to the one from context.
 * @returns The prefixed id
 */
export const usePrefixedId = (providedId?: string, prefix?: string): string => {
  const baseId = providedId ?? useId();
  const context = useContext(IdContext);
  return [context?.prefix, prefix, baseId].filter(Boolean).join('-');
};
