import { createContext, useContext } from 'react';

/**
 * Registry for portaled content to register with a parent focus trap.
 *
 * Used by Dialog.Content to extend focus-trap-react's containerElements
 * to include portaled popups (e.g., Combobox.Popup in portal mode).
 *
 * @see .claude/rules/patterns.md — "Focus Trap with Portaled Content"
 */
export type FocusContainerRegistry = {
  register: (element: HTMLElement) => void;
  unregister: (element: HTMLElement) => void;
  /** Focus once the trap has acknowledged this container. Returns a cancellation callback. */
  requestFocus?: (container: HTMLElement, focus: () => void) => () => void;
};

export const FocusContainerContext = createContext<FocusContainerRegistry | null>(null);

/**
 * Hook for portaled components to register with a parent focus trap.
 * Returns null when not inside a focus container provider (e.g., Dialog.Content).
 *
 * @example
 * ```tsx
 * const focusContainerRegistry = useFocusContainerRegistry();
 *
 * useEffect(() => {
 *   if (element && isPortalMode && focusContainerRegistry) {
 *     focusContainerRegistry.register(element);
 *     return () => focusContainerRegistry.unregister(element);
 *   }
 * }, [isPortalMode, focusContainerRegistry]);
 * ```
 */
export const useFocusContainerRegistry = (): FocusContainerRegistry | null => useContext(FocusContainerContext);
