import { type Context, createContext, type RefObject, useContext } from 'react';

import type { MenubarContextValue } from './menubar-provider';

/**
 * Context value for individual menu within a menubar.
 *
 * Coordinates between the menu's state and the parent menubar's state.
 */
export type MenubarMenuContextValue = {
  /** Unique ID for this menu */
  menuId: string;
  /** ID for the menu content element */
  contentId: string;
  /** Whether this menu is currently open */
  open: boolean;
  /** Open/close this menu */
  setOpen: (open: boolean) => void;
  /** Reference to the parent menubar context */
  menubarContext: MenubarContextValue;
  /** Reference to the trigger element */
  triggerRef: RefObject<HTMLButtonElement | null> | null;
};

export const MenubarMenuContext = createContext<MenubarMenuContextValue | undefined>(undefined);

// `Context['Provider']` rather than the inferred `Provider` type, which `preact/compat` does not export.
export const MenubarMenuProvider: Context<MenubarMenuContextValue | undefined>['Provider'] =
  MenubarMenuContext.Provider;

/**
 * Access the menubar menu context.
 *
 * @throws Error if used outside MenubarMenuProvider
 */
export function useMenubarMenu(): MenubarMenuContextValue {
  const context = useContext(MenubarMenuContext);
  if (!context) {
    throw new Error('useMenubarMenu must be used within a Menubar.Menu component');
  }
  return context;
}

/**
 * Optionally access the menubar menu context.
 *
 * Returns undefined if used outside MenubarMenuProvider.
 * Useful for components that can work both inside and outside a menubar.
 */
export function useMenubarMenuOptional(): MenubarMenuContextValue | undefined {
  return useContext(MenubarMenuContext);
}
