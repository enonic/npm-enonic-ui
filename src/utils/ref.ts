import { type ForwardedRef, type MutableRefObject, type Ref, useCallback } from 'react';

export function setRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
  } else {
    try {
      (ref as MutableRefObject<T | null>).current = value;
    } catch {
      // ignore in case of readonly refs
    }
  }
}

export function useComposedRefs<T>(...refs: (Ref<T> | undefined)[]): ForwardedRef<T> {
  return useCallback((node: T | null) => {
    refs.forEach(ref => setRef(ref, node));
  }, refs);
}
