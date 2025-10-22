import { useCallback, useState } from 'react';

/**
 * Manages state that can be either controlled or uncontrolled.
 * Follows the pattern for controlled/uncontrolled state management.
 *
 * @template T - The type of the state value
 *
 * @param controlledValue - The controlled value from props (e.g., `value`, `open`, `checked`)
 * @param defaultValue - The default value for uncontrolled mode (e.g., `defaultValue`, `defaultOpen`)
 * @param onChange - Callback invoked when the value changes
 *
 * @returns A tuple containing the current value and a setter function
 *
 * @example
 * ```tsx
 * // Uncontrolled usage
 * function Component({ defaultOpen = false, onOpenChange }) {
 *   const [open, setOpen] = useControlledState(undefined, defaultOpen, onOpenChange);
 *   return <div>{open ? 'Open' : 'Closed'}</div>;
 * }
 *
 * // Controlled usage
 * function Component({ open, onOpenChange }) {
 *   const [value, setValue] = useControlledState(open, false, onOpenChange);
 *   return <div>{value ? 'Open' : 'Closed'}</div>;
 * }
 * ```
 */
export function useControlledState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  return [value, setValue];
}
