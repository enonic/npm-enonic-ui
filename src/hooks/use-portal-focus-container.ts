import { type RefObject, useCallback, useEffect } from 'react';

import { useFocusContainerRegistry } from '@/providers';

/**
 * Registers a portal element with a parent focus trap (e.g., Dialog).
 * Call this in portaled popup components to allow focus within the popup
 * when rendered inside a focus-trapped container.
 *
 * @param elementRef - Ref to the popup element to register
 * @param isEnabled - Whether registration is active (typically: open && isPortalMode)
 * @returns A stable callback for cancellable focus after the parent trap acknowledges the container.
 *
 * @example
 * ```tsx
 * const contentRef = useRef<HTMLDivElement>(null);
 * const [isPortalMode, setIsPortalMode] = useState(false);
 * const portalContainer = usePortalContainer();
 *
 * useLayoutEffect(() => {
 *   if (!open || !contentRef.current) return;
 *   setIsPortalMode(contentRef.current.parentElement === portalContainer);
 * }, [open, portalContainer]);
 *
 * const requestFocus = usePortalFocusContainer(contentRef, open && isPortalMode);
 * useLayoutEffect(() => {
 *   if (open) return requestFocus(() => contentRef.current?.focus());
 * }, [open, requestFocus]);
 * ```
 */
export const usePortalFocusContainer = (
  elementRef: RefObject<HTMLElement | null>,
  isEnabled: boolean,
): ((focus: () => void) => () => void) => {
  const focusContainerRegistry = useFocusContainerRegistry();

  useEffect(() => {
    const element = elementRef.current;
    if (element && isEnabled && focusContainerRegistry) {
      focusContainerRegistry.register(element);
      return () => focusContainerRegistry.unregister(element);
    }
  }, [elementRef, isEnabled, focusContainerRegistry]);

  return useCallback(
    (focus: () => void): (() => void) => {
      const element = elementRef.current;
      if (!element?.isConnected) return () => undefined;
      if (focusContainerRegistry?.requestFocus) {
        return focusContainerRegistry.requestFocus(element, focus);
      }
      // No Dialog, or a consumer registry implementing only the original registration contract.
      focus();
      return () => undefined;
    },
    [elementRef, focusContainerRegistry],
  );
};
