import { type RefObject, useEffect, useState } from 'react';

import { type FocusContainerRegistry, useFocusContainerRegistry } from '@/providers';

/**
 * Registers a portal element with a parent focus trap (e.g., Dialog).
 * Call this in portaled popup components to allow focus within the popup
 * when rendered inside a focus-trapped container.
 *
 * @param elementRef - Ref to the popup element to register
 * @param isEnabled - Whether registration is active (typically: open && isPortalMode)
 * @returns Whether registration is ready for a passive autofocus effect.
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
 * usePortalFocusContainer(contentRef, isPortalMode);
 * ```
 */
export const usePortalFocusContainer = (elementRef: RefObject<HTMLElement | null>, isEnabled: boolean): boolean => {
  const focusContainerRegistry = useFocusContainerRegistry();
  const [registration, setRegistration] = useState<{
    element: HTMLElement;
    registry: FocusContainerRegistry;
  } | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element && isEnabled && focusContainerRegistry) {
      focusContainerRegistry.register(element);
      // Autofocus must wait for a render that also commits the trap's updated containers.
      setRegistration({ element, registry: focusContainerRegistry });
      return () => focusContainerRegistry.unregister(element);
    }
    setRegistration(null);
  }, [elementRef, isEnabled, focusContainerRegistry]);

  return (
    !isEnabled ||
    !focusContainerRegistry ||
    (registration?.element === elementRef.current && registration?.registry === focusContainerRegistry)
  );
};
