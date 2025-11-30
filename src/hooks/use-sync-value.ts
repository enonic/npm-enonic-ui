import type { Signalish } from 'preact';
import { useEffect } from 'react';
import { unwrap } from '@/utils';

/**
 * Syncs a value related to a setter function with a value from arguments
 * @param value - The value to sync with
 * @param setValue - The setter function to update the value to be synced
 */
export const useSyncValue = <T>(value: Signalish<T> | undefined | null, setValue: (value: T) => void): void => {
  useEffect(() => {
    const unwrappedValue = unwrap(value);
    if (unwrappedValue) {
      setValue(unwrappedValue);
    }
  }, [value, setValue]);
};
