import { createContext, type ReactElement, type ReactNode, type RefObject, useContext } from 'react';

export type MenuContextValue = {
  baseId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  active: string | undefined;
  setActive: (id: string | undefined) => void;
  registerItem: (id: string, disabled?: boolean, element?: HTMLElement | null) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  getItemElement: (id: string) => HTMLElement | null;
  triggerRef: RefObject<HTMLButtonElement> | null;
};

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export type MenuProviderProps = {
  value: MenuContextValue;
  children?: ReactNode;
};

export const MenuProvider = ({ value, children }: MenuProviderProps): ReactElement => {
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = (): MenuContextValue => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
