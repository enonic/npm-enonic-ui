import { createContext, type ReactElement, type ReactNode, useContext } from 'react';

/**
 * Root-level context for ContextMenu. Holds menu-wide state that every level
 * (top content, submenus) needs access to.
 *
 * Navigation state (active item, item registry) lives in a per-level
 * `ContextMenuContentContextValue` — each Content and SubContent owns its own.
 */
export type ContextMenuContextValue = {
  baseId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Coordinates where the menu was opened, from the pointer or keyboard target. */
  position: { x: number; y: number } | null;
  setPosition: (pos: { x: number; y: number } | null) => void;
  /**
   * Tracks whether the user has started keyboard navigation.
   *
   * Keyboard openings show focus-visible rings immediately. Pointer openings
   * show them once the user presses a navigation key (Arrow keys, Home, End).
   * The state resets to `false` when the menu closes.
   */
  isUsingKeyboard: boolean;
  setIsUsingKeyboard: (value: boolean) => void;
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
