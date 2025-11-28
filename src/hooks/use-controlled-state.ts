import { useCallback, useState } from 'react';

/**
 * Manages state that can be either controlled or uncontrolled.
 * Follows the React pattern for controlled/uncontrolled state management.
 *
 * @template T - The type of the state value (can include `null` for "no value" state)
 *
 * @param controlledValue - The controlled value from props (e.g., `value`, `open`, `checked`)
 * @param defaultValue - The default value for uncontrolled mode (e.g., `defaultValue`, `defaultOpen`)
 * @param onChange - Callback invoked when the value changes
 *
 * @returns A tuple containing the current value and a setter function
 *
 * **Controlled vs Uncontrolled Detection:**
 * - `undefined` = uncontrolled mode (prop not provided)
 * - Any other value (including `null`) = controlled mode
 *
 * **Supporting "No Value" in Controlled Mode:**
 * Use `null` to represent "no value" in controlled mode:
 * - `active={null}` → controlled with no active item
 * - `active="item-1"` → controlled with active item
 * - `active` not provided → uncontrolled mode
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
 *
 * // Controlled with null support (for "no value" state)
 * function Component({ active, onActiveChange }: { active?: string | null }) {
 *   const [value, setValue] = useControlledState(active, undefined, onActiveChange);
 *   // active={null} → controlled, value = null
 *   // active="item" → controlled, value = "item"
 *   // active not provided → uncontrolled, value from defaultActive
 * }
 * ```
 */

type SetStateAction<T> = T | ((prev: T) => T);

export function useControlledState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: SetStateAction<T>) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (next: SetStateAction<T>) => {
      const nextValue = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [isControlled, onChange, value],
  );

  return [value, setValue];
}
