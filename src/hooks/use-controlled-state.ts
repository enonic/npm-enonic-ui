import { type SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

/** Type guard to check if action is an updater function */
function isUpdater<T>(action: SetStateAction<T>): action is (prev: T) => T {
  return typeof action === 'function';
}

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
 * @returns A tuple containing the current value and a setter function.
 * The setter accepts either a direct value or an updater function `(prev) => next`,
 * matching React's `useState` API. The setter reference is stable across renders.
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
 * **Note on function values:**
 * If `T` is a function type, you must wrap the value in an updater function
 * to avoid it being interpreted as an updater: `setValue(() => myFunction)`.
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
 * // Using updater function (safe for batched updates)
 * function Counter() {
 *   const [count, setCount] = useControlledState(undefined, 0);
 *   const incrementTwice = () => {
 *     setCount(prev => prev + 1);
 *     setCount(prev => prev + 1); // Correctly results in +2
 *   };
 *   return <button onClick={incrementTwice}>{count}</button>;
 * }
 *
 * // Toggle pattern
 * function Toggle() {
 *   const [pressed, setPressed] = useControlledState(undefined, false);
 *   return <button onClick={() => setPressed(prev => !prev)}>{pressed ? 'On' : 'Off'}</button>;
 * }
 * ```
 */

export function useControlledState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
  // ? Override controlledness detection. Used by useControlledStateWithNull to mark
  // controlled mode while passing undefined as the value (external null).
  isControlled: boolean = controlledValue !== undefined,
): [T, (action: SetStateAction<T>) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);

  const value = (isControlled ? controlledValue : uncontrolledValue) as T;

  // Sync uncontrolled value when controlled value changes or when
  // transitioning between controlled/uncontrolled modes.
  // This ensures correct behavior when parent sets value to undefined
  // (e.g., to "clear" the selection in a controlled selector).
  const prevControlledRef = useRef(controlledValue);
  const prevIsControlledRef = useRef(isControlled);
  useEffect(() => {
    // Sync when controlled value changes (skip undefined — controlled "no value" leaves the fallback alone)
    if (isControlled && controlledValue !== prevControlledRef.current && controlledValue !== undefined) {
      setUncontrolledValue(controlledValue);
    }
    // Reset to default when transitioning from controlled → uncontrolled
    if (prevIsControlledRef.current && !isControlled) {
      setUncontrolledValue(defaultValue);
    }
    prevControlledRef.current = controlledValue;
    prevIsControlledRef.current = isControlled;
  }, [isControlled, controlledValue, defaultValue]);

  // Refs to track latest values for stable setValue callback
  const valueRef = useRef(value);
  const isControlledRef = useRef(isControlled);
  const onChangeRef = useRef(onChange);

  // Sync refs on every render
  valueRef.current = value;
  isControlledRef.current = isControlled;
  onChangeRef.current = onChange;

  const setValue = useCallback((action: SetStateAction<T>) => {
    const prevValue = valueRef.current;
    const nextValue = isUpdater(action) ? action(prevValue) : action;

    // Update ref immediately for subsequent calls in same batch
    valueRef.current = nextValue;

    if (!isControlledRef.current) {
      setUncontrolledValue(nextValue);
    }

    onChangeRef.current?.(nextValue);
  }, []);

  return [value, setValue];
}
