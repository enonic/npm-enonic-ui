import { createContext, useContext } from 'react';

import type { ReactElement, ReactNode } from 'react';

type PortalContextValue = {
  container: HTMLElement | null;
};

const PortalContext = createContext<PortalContextValue | undefined>(undefined);

export type PortalProviderProps = {
  children: ReactNode;
  /** The element every overlay in the subtree portals into. `null` falls back to `document.body`. */
  container: HTMLElement | null;
};

/**
 * Overrides where overlays (dialogs, menus, tooltips, popups) portal to. Without a provider they
 * portal to `document.body`, which lies outside any shadow root.
 */
export const PortalProvider = ({ children, container }: PortalProviderProps): ReactElement => {
  return <PortalContext.Provider value={{ container }}>{children}</PortalContext.Provider>;
};

PortalProvider.displayName = 'PortalProvider';

/**
 * Resolves the portal container: an explicit `container` prop wins, then the nearest
 * `PortalProvider`, then `document.body`.
 *
 * `null` means there is no document (server render) — callers must not portal until it is set.
 */
export const usePortalContainer = (container?: HTMLElement | null): HTMLElement | null => {
  const context = useContext(PortalContext);
  return container ?? context?.container ?? (typeof document === 'undefined' ? null : document.body);
};
