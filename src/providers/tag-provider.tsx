import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type TagContextValue = {
  disabled: boolean;
};

const TagContext = createContext<TagContextValue | undefined>(undefined);

export type TagProviderProps = {
  value: TagContextValue;
  children?: ReactNode;
};

export const TagProvider = ({ value, children }: TagProviderProps): ReactElement => {
  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
};

TagProvider.displayName = 'TagProvider';

export const useTag = (): TagContextValue => {
  const ctx = useContext(TagContext);

  if (!ctx) {
    throw new Error('useTag must be used within a Tag');
  }

  return ctx;
};
