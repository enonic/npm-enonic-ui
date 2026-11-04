import { type RefObject, useCallback, useLayoutEffect, useRef } from 'react';

import { containsDeep, getRoot, isShadowRoot } from '@/utils/dom';

const listenForFocus = (root: Document | ShadowRoot, onFocus: (event: Event) => void): (() => void) => {
  root.addEventListener('focusin', onFocus, true);
  // Focus can stay inside a shadow boundary when both targets retarget to its host.
  const unlistenParent = isShadowRoot(root)
    ? listenForFocus(getRoot(root.host) ?? root.host.ownerDocument, onFocus)
    : undefined;
  return () => {
    root.removeEventListener('focusin', onFocus, true);
    unlistenParent?.();
  };
};

type UseFocusOutsideConfig = {
  enabled: boolean;
  contentRef: RefObject<HTMLElement | null>;
  onInteractOutside?: (event: Event) => void;
  onClose?: () => void;
};

export const useFocusOutside = ({
  enabled,
  contentRef,
  onInteractOutside,
  onClose,
}: UseFocusOutsideConfig): ((branch: HTMLElement) => () => void) => {
  const configRef = useRef({ enabled, contentRef, onInteractOutside, onClose });
  // Child layout effects can move focus before this hook's layout effects run.
  // Keep callbacks current during render, matching useClickOutside's latest-ref pattern.
  configRef.current = { enabled, contentRef, onInteractOutside, onClose };
  const branchesRef = useRef(new Set<HTMLElement>());
  const hasFocusedRef = useRef(false);
  const handledEventsRef = useRef(new WeakSet<Event>());

  const handleFocusIn = useCallback((event: Event): void => {
    const config = configRef.current;
    if (!config.enabled || handledEventsRef.current.has(event)) return;
    handledEventsRef.current.add(event);
    const target = event.composedPath()[0];
    if (!target || !('nodeType' in target)) return;
    const node = target as Node;
    const containers = [config.contentRef.current, ...branchesRef.current];
    if (
      containers.some(container => {
        if (containsDeep(container, node)) return true;
        const root = getRoot(container);
        // A document listener sees only the host of a closed shadow root.
        return isShadowRoot(root) && containsDeep(container, root.activeElement);
      })
    ) {
      hasFocusedRef.current = true;
      return;
    }
    // A parent dialog can autofocus before this menu's opening autofocus runs.
    if (!hasFocusedRef.current) return;

    // Cancel dismissal without trying to cancel the browser's focus change.
    const outsideEvent = new CustomEvent('focusOutside', {
      cancelable: true,
      detail: { originalEvent: event },
    });
    // Shadow-root event targets are cleared after dispatch, so invoke the callback during dispatch.
    const handleOutside = (event: Event): void => config.onInteractOutside?.(event);
    target.addEventListener(outsideEvent.type, handleOutside, { once: true });
    try {
      target.dispatchEvent(outsideEvent);
    } finally {
      target.removeEventListener(outsideEvent.type, handleOutside);
    }
    if (!outsideEvent.defaultPrevented) config.onClose?.();
  }, []);

  const listen = useCallback(
    (element: HTMLElement): (() => void) => {
      // Each registration owns its listener, even when a submenu shares the same root.
      const handleFocus = (event: Event): void => handleFocusIn(event);
      return listenForFocus(getRoot(element) ?? element.ownerDocument, handleFocus);
    },
    [handleFocusIn],
  );

  useLayoutEffect(() => {
    hasFocusedRef.current = false;
    const content = contentRef.current;
    if (!enabled || !content) return;
    hasFocusedRef.current = [content, ...branchesRef.current].some(container =>
      containsDeep(container, getRoot(container)?.activeElement),
    );
    return listen(content);
  }, [enabled, contentRef, listen]);

  return useCallback(
    (branch: HTMLElement): (() => void) => {
      branchesRef.current.add(branch);
      const unlisten = listen(branch);
      return () => {
        branchesRef.current.delete(branch);
        unlisten();
      };
    },
    [listen],
  );
};
