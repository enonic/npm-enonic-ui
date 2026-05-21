import { useCallback, useRef } from 'react';
import { useControlledState } from './use-controlled-state';

/**
 * The action type for the setter function.
 * Accepts either a direct value or an updater function.
 */
type SetStateActionWithNull<T> = T | null | undefined | ((prev: T | undefined) => T | null | undefined);

/**
 * A variant of `useControlledState` that handles `null` as "no value" in controlled mode.
 *
 * This hook provides a clean external API where `null` represents "no value" while
 * internally using `undefined` for consistency with React/Preact patterns.
 *
 * **External API (Component Props):**
 * - `undefined` = uncontrolled mode (prop not provided)
 * - `null` = controlled mode with no value
 * - `value` = controlled mode with value
 *
 * **Internal State:**
 * - `undefined` = no value (converted from external `null`)
 * - `value` = has value
 *
 * @template T - The type of the state value (typically `string`)
 *
 * @param controlledValue - The controlled value from props (e.g., `active`)
 * @param defaultValue - The default value for uncontrolled mode
 * @param onChange - Callback invoked when the value changes (receives `null` for no value)
 *
 * @returns A tuple containing the current value and a setter function.
 * The setter accepts either a direct value or an updater function `(prev) => next`,
 * matching React's `useState` API. The setter reference is stable across renders.
 *
 * @example
 * ```tsx
 * // Component with controlled "no active" support
 * function Listbox({ active, defaultActive, setActive }: {
 *   active?: string | null;
 *   defaultActive?: string;
 *   setActive?: (active: string | null) => void;
 * }) {
 *   const [activeInternal, setActiveInternal] = useControlledStateWithNull(
 *     active,
 *     defaultActive,
 *     setActive
 *   );
 *
 *   // activeInternal is string | undefined internally
 *   // But external API uses string | null
 *
 *   // active={null} → activeInternal = undefined
 *   // active="item" → activeInternal = "item"
 *   // active not provided → activeInternal from defaultActive
 * }
 *
 * // Using updater function
 * function Toggle({ active, onActiveChange }) {
 *   const [value, setValue] = useControlledStateWithNull(active, 'item-1', onActiveChange);
 *   const toggle = (id: string) => {
 *     setValue(prev => prev === id ? undefined : id); // undefined becomes null in onChange
 *   };
 *   return <button onClick={() => toggle('item-1')}>{value ?? 'None'}</button>;
 * }
 * ```
 */
export function useControlledStateWithNull<T extends string>(
  controlledValue: T | null | undefined,
  defaultValue: T | undefined,
  onChange?: (value: T | null) => void,
): [T | undefined, (action: SetStateActionWithNull<T>) => void] {
  // ? Track controlledness from the external prop. null is controlled "no value",
  // undefined is uncontrolled. We pass isControlled explicitly to useControlledState
  // so that null collapses to internal undefined without flipping the hook into
  // uncontrolled mode (which would leak the cached uncontrolledValue on transition).
  const isControlled = controlledValue !== undefined;
  const internalControlled = controlledValue === null ? undefined : controlledValue;

  // Ref to track latest onChange for stable callback
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Wrap onChange to convert internal undefined back to external null
  const internalOnChange = useCallback((value: T | undefined) => {
    // Convert undefined to null for external API
    onChangeRef.current?.(value ?? null);
  }, []);

  const [internalValue, setInternalValue] = useControlledState(
    internalControlled,
    defaultValue,
    internalOnChange,
    isControlled,
  );

  // Wrap setter to handle updater functions and convert null to undefined
  const setValue = useCallback(
    (action: SetStateActionWithNull<T>) => {
      if (typeof action === 'function') {
        // Wrap updater to convert null result to undefined
        setInternalValue((prev: T | undefined) => {
          const result = action(prev);
          return result ?? undefined;
        });
      } else {
        // Direct value: convert null to undefined
        setInternalValue(action ?? undefined);
      }
    },
    [setInternalValue],
  );

  return [internalValue, setValue];
}
