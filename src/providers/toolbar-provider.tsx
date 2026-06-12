import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type ToolbarContextValue = {
  toolbarId: string;
  toolbarRef: React.RefObject<HTMLDivElement>;
  active: string | undefined;
  setActive: (id: string | undefined) => void;
  registerItem: (id: string, disabled?: boolean, element?: HTMLElement | null) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  getItemElement: (id: string) => HTMLElement | null;
  orientation: 'horizontal' | 'vertical';
  loop: boolean;
};

const ToolbarContext = createContext<ToolbarContextValue | undefined>(undefined);

export type ToolbarProviderProps = {
  value: ToolbarContextValue;
  children?: ReactNode;
};

export const ToolbarProvider = ({ value, children }: ToolbarProviderProps): ReactElement => {
  return <ToolbarContext.Provider value={value}>{children}</ToolbarContext.Provider>;
};

export const useToolbar = (): ToolbarContextValue => {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error('Toolbar components must be used within Toolbar.Root');
  }
  return context;
};

/**
 * Hook to optionally access Toolbar context.
 * Returns undefined if not within a Toolbar, allowing components to adapt their behavior.
 */
export const useToolbarOptional = (): ToolbarContextValue | undefined => useContext(ToolbarContext);
