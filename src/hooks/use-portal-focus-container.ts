import { type RefObject, useEffect } from 'react';

import { useFocusContainerRegistry } from '@/providers';

/**
 * Registers a portal element with a parent focus trap (e.g., Dialog).
 * Call this in portaled popup components to allow focus within the popup
 * when rendered inside a focus-trapped container.
 *
 * @param elementRef - Ref to the popup element to register
 * @param isEnabled - Whether registration is active (typically: open && isPortalMode)
 *
 * @example
 * ```tsx
 * const contentRef = useRef<HTMLDivElement>(null);
 * const [isPortalMode, setIsPortalMode] = useState(false);
 *
 * useLayoutEffect(() => {
 *   if (!open || !contentRef.current) return;
 *   setIsPortalMode(contentRef.current.parentElement === document.body);
 * }, [open]);
 *
 * usePortalFocusContainer(contentRef, isPortalMode);
 * ```
 */
export const usePortalFocusContainer = (elementRef: RefObject<HTMLElement | null>, isEnabled: boolean): void => {
  const focusContainerRegistry = useFocusContainerRegistry();

  useEffect(() => {
    const element = elementRef.current;
    if (element && isEnabled && focusContainerRegistry) {
      focusContainerRegistry.register(element);
      return () => focusContainerRegistry.unregister(element);
    }
  }, [elementRef, isEnabled, focusContainerRegistry]);
};
