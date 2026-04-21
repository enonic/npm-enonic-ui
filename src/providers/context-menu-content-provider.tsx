import { createContext, type MutableRefObject, type ReactElement, type ReactNode, useContext } from 'react';

/**
 * Navigation-related state scoped to a single `ContextMenu.Content` (or `SubContent`).
 *
 * Each menu level owns its own item registry and active-item state so nested submenus
 * don't share navigation state with their parent. Selection-related state like `setOpen`
 * (which closes the entire menu) still lives on the root `ContextMenuContextValue`.
 */
export type ContextMenuContentContextValue = {
  active: string | undefined;
  setActive: (id: string | undefined) => void;
  registerItem: (id: string, disabled?: boolean, element?: HTMLElement | null) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  /**
   * Safe-triangle check registered by a currently-open child `Sub`. When non-null,
   * the Content's pointer-move capture handler consults it to decide whether to
   * suppress sibling hover activation while the user is traveling toward the submenu.
   * Null when no submenu is open at this level.
   */
  safeAreaCheckRef: MutableRefObject<((x: number, y: number) => boolean) | null>;
};

const ContextMenuContentContext = createContext<ContextMenuContentContextValue | undefined>(undefined);

export type ContextMenuContentProviderProps = {
  value: ContextMenuContentContextValue;
  children?: ReactNode;
};

export const ContextMenuContentProvider = ({ value, children }: ContextMenuContentProviderProps): ReactElement => {
  return <ContextMenuContentContext.Provider value={value}>{children}</ContextMenuContentContext.Provider>;
};

export const useContextMenuContent = (): ContextMenuContentContextValue => {
  const context = useContext(ContextMenuContentContext);
  if (!context) {
    throw new Error('useContextMenuContent must be used within a ContextMenu.Content or ContextMenu.SubContent');
  }
  return context;
};
