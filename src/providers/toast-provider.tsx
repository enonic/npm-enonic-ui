import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type ToastContextValue = {
  setOpen?: (open: boolean) => void;
  setIconSlot?: (node: ReactNode | null) => void;
  tone?: 'success' | 'info' | 'warning' | 'error';
  setTone?: (tone?: 'success' | 'info' | 'warning' | 'error') => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export type ToastProviderProps = {
  value: ToastContextValue;
  children?: ReactNode;
};

export const ToastProvider = ({ value, children }: ToastProviderProps): ReactElement => {
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

ToastProvider.displayName = 'ToastProvider';

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
