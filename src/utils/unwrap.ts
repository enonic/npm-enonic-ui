import type { JSX } from 'react';

function isSignal(v: unknown): v is JSX.SignalLike<unknown> {
  return !!(
    v &&
    typeof v === 'object' &&
    'value' in v &&
    'peek' in v &&
    typeof v.peek === 'function' &&
    'subscribe' in v &&
    typeof v.subscribe === 'function'
  );
}

export function unwrap<T>(v: JSX.Signalish<T>): T {
  return isSignal(v) ? v.value : v;
}
