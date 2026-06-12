import type { ReactElement, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

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

// ? Generated ids back DOM ids, registry keys, and aria targets, so they must be globally
// ? unique. useId() collides across portal roots; a module counter fixes that within one
// ? loaded copy, and SEED (random per module load) keeps duplicate/separately bundled copies apart.
const SEED = Math.random().toString(36).slice(2, 8).padEnd(6, '0');
let idCounter = 0;

/**
 * Prefix provided or generated id with a prefix from the context
 * @param providedId - The id to prefix. A unique id is generated when omitted.
 * @param prefix - A custom prefix used in addition to the one from context.
 * @returns The prefixed id
 */
export const usePrefixedId = (providedId?: string, prefix?: string): string => {
  const [generatedId] = useState(() => `id-${SEED}-${++idCounter}`);
  const baseId = providedId ?? generatedId;
  const context = useContext(IdContext);
  return [context?.prefix, prefix, baseId].filter(Boolean).join('-');
};
