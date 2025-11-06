import { useCallback } from 'react';

import { useControlledState } from './use-controlled-state';

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
 * @returns A tuple containing the current value and a setter function
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
 * ```
 */
export function useControlledStateWithNull<T extends string>(
  controlledValue: T | null | undefined,
  defaultValue: T | undefined,
  onChange?: (value: T | null) => void,
): [T | undefined, (value: T | null | undefined) => void] {
  // Convert external null to internal undefined for useControlledState
  const internalControlled = controlledValue === null ? undefined : controlledValue;

  // Wrap onChange to convert internal undefined back to external null
  const internalOnChange = useCallback(
    (value: T | undefined) => {
      // Convert undefined to null for external API
      onChange?.(value ?? null);
    },
    [onChange],
  );

  const [internalValue, setInternalValue] = useControlledState(internalControlled, defaultValue, internalOnChange);

  // Wrap setter to convert external null to internal undefined
  const setValue = useCallback(
    (value: T | null | undefined) => {
      // Convert null to undefined for internal state
      setInternalValue(value ?? undefined);
    },
    [setInternalValue],
  );

  return [internalValue, setValue];
}
