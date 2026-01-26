import { createContext, type ReactElement, type ReactNode, type RefObject, useContext } from 'react';

/**
 * Context value for Menubar component.
 * Manages horizontal navigation between menubar items (buttons and menu triggers).
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/menubar/} - ARIA Menubar Pattern
 */
export type MenubarContextValue = {
  /**
   * Currently active menubar item ID (keyboard navigation focus).
   * This tracks which button or menu trigger is currently highlighted.
   * `undefined` when no item is active.
   */
  active: string | undefined;
  setActive: (id: string | undefined) => void;

  /**
   * Registry for menubar items to enable keyboard navigation.
   * Items are tracked in insertion order for left/right arrow navigation.
   */
  registerItem: (id: string, disabled?: boolean, element?: HTMLElement | null) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;

  /**
   * ID of the currently open menu (if any).
   * Tracks which menu is expanded in the menubar for conditional hover behavior.
   */
  openMenuId: string | undefined;
  setOpenMenuId: (id: string | undefined) => void;

  /**
   * Base ID for the menubar container.
   */
  menubarId: string;

  /**
   * Ref to the menubar container element for focus management.
   */
  menubarRef: RefObject<HTMLDivElement> | null;
};

const MenubarContext = createContext<MenubarContextValue | undefined>(undefined);

export type MenubarProviderProps = {
  value: MenubarContextValue;
  children?: ReactNode;
};

/**
 * Provider component that supplies menubar context to child components.
 * Should wrap all Menubar.* components.
 */
export const MenubarProvider = ({ value, children }: MenubarProviderProps): ReactElement => {
  return <MenubarContext.Provider value={value}>{children}</MenubarContext.Provider>;
};

MenubarProvider.displayName = 'MenubarProvider';

/**
 * Hook to access menubar context.
 * Must be used within a MenubarProvider.
 *
 * @throws {Error} If used outside of MenubarProvider
 * @returns {MenubarContextValue} The menubar context
 *
 * @example
 * ```tsx
 * const { active, setActive, registerItem } = useMenubar();
 * ```
 */
export const useMenubar = (): MenubarContextValue => {
  const context = useContext(MenubarContext);
  if (!context) {
    throw new Error('useMenubar must be used within a MenubarProvider');
  }
  return context;
};

/**
 * Hook to optionally access menubar context.
 * Returns undefined if not within a MenubarProvider.
 *
 * Useful for components that can work both inside and outside a menubar.
 *
 * @returns {MenubarContextValue | undefined} The menubar context or undefined
 */
export const useMenubarOptional = (): MenubarContextValue | undefined => {
  return useContext(MenubarContext);
};
