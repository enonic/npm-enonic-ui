import { type ClassValue, clsx } from 'clsx';
import type { JSX } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

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
