import { type ForwardedRef, type MutableRefObject, type Ref, useCallback } from 'react';

/** Type guard to check if a ref is a mutable ref object */
function isMutableRefObject<T>(ref: Ref<T>): ref is MutableRefObject<T | null> {
  return ref !== null && typeof ref === 'object' && 'current' in ref;
}

export function setRef<T>(ref: Ref<T> | undefined | null, value: T | null): void {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
  } else if (isMutableRefObject(ref)) {
    try {
      ref.current = value;
    } catch {
      // ignore in case of readonly refs
    }
  }
}

export function useComposedRefs<T>(...refs: (Ref<T> | undefined | null)[]): ForwardedRef<T> {
  return useCallback(
    (node: T | null) => {
      refs.forEach(ref => {
        setRef(ref, node);
      });
    },
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- refs is spread as deps for callback stability
    refs,
  );
}
