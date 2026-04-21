import { createContext, type RefObject, useContext } from 'react';

import type { ContextMenuContentContextValue } from './context-menu-content-provider';

/**
 * Context value for a single `ContextMenu.Sub` wrapper.
 *
 * Coordinates between the submenu's local open state and the parent content's
 * navigation state (so ArrowLeft from a submenu can restore active on its trigger).
 */
export type ContextMenuSubContextValue = {
  /** Unique ID used by the SubTrigger (also the registry key in the parent content) */
  subId: string;
  /** ID of the submenu content element (for aria-controls) */
  contentId: string;
  /** Whether the submenu is currently open */
  open: boolean;
  /** Open/close the submenu */
  setOpen: (open: boolean) => void;
  /** Ref to the SubTrigger DOM node (for ArrowLeft refocus and collision anchoring) */
  triggerRef: RefObject<HTMLDivElement> | null;
  /**
   * Snapshot of the parent content context captured at mount time.
   * Used by SubContent's ArrowLeft handler to set parent `active` back to the trigger.
   */
  parentContent: ContextMenuContentContextValue;
};

const ContextMenuSubContext = createContext<ContextMenuSubContextValue | undefined>(undefined);

export const ContextMenuSubProvider = ContextMenuSubContext.Provider;

export const useContextMenuSub = (): ContextMenuSubContextValue => {
  const context = useContext(ContextMenuSubContext);
  if (!context) {
    throw new Error('useContextMenuSub must be used within a ContextMenu.Sub');
  }
  return context;
};

export const useContextMenuSubOptional = (): ContextMenuSubContextValue | undefined => {
  return useContext(ContextMenuSubContext);
};
