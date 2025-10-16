import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type AvatarImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

export type AvatarContextValue = {
  imageLoadingStatus: AvatarImageLoadingStatus;
  onImageLoadingStatusChange: (status: AvatarImageLoadingStatus) => void;
};

const AvatarContext = createContext<AvatarContextValue | null>(null);

export type AvatarProviderProps = {
  value: AvatarContextValue;
  children?: ReactNode;
};

export const AvatarProvider = ({ value, children }: AvatarProviderProps): ReactElement => {
  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
};

AvatarProvider.displayName = 'AvatarProvider';

export const useAvatar = (): AvatarContextValue => {
  const ctx = useContext(AvatarContext);

  if (!ctx) {
    throw new Error('useAvatar must be used within an Avatar');
  }

  return ctx;
};
