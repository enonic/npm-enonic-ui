import { useCallback } from 'react';

export function setRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
  } else {
    try {
      (ref as React.MutableRefObject<T | null>).current = value;
    } catch {
      // ignore in case of readonly refs
    }
  }
}

export function useComposedRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.ForwardedRef<T> {
  return useCallback((node: T | null) => {
    refs.forEach(ref => setRef(ref, node));
  }, refs);
}
