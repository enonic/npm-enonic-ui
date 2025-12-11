import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

export type ContextMenuContextValue = {
  baseId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  active: string | undefined;
  setActive: (id: string | undefined) => void;
  registerItem: (id: string, disabled?: boolean) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  // Context menu specific: mouse position instead of triggerRef
  position: { x: number; y: number } | null;
  setPosition: (pos: { x: number; y: number } | null) => void;
};

const ContextMenuContext = createContext<ContextMenuContextValue | undefined>(undefined);

export type ContextMenuProviderProps = {
  value: ContextMenuContextValue;
  children?: ReactNode;
};

export const ContextMenuProvider = ({ value, children }: ContextMenuProviderProps): ReactElement => {
  return <ContextMenuContext.Provider value={value}>{children}</ContextMenuContext.Provider>;
};

export const useContextMenu = (): ContextMenuContextValue => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};
