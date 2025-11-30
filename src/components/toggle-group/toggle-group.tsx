import { Slot } from '@radix-ui/react-slot';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, type ButtonProps } from '@/components/button';
import { useControlledState, useItemRegistry, useKeyboardNavigation, useRovingTabIndex, useSyncValue } from '@/hooks';
import { type ToggleGroupContextValue, ToggleGroupProvider, usePrefixedId, useToggleGroup } from '@/providers';
import { cn, useComposedRefs } from '@/utils';

//
// * ToggleGroup.Root - Single Selection
//

type ToggleGroupRootSingleProps = {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onSelect'>;

//
// * ToggleGroup.Root - Multiple Selection
//

type ToggleGroupRootMultipleProps = {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onSelect'>;

//
// * ToggleGroup.Root
//

const ToggleGroupRootSingle = forwardRef<HTMLDivElement, ToggleGroupRootSingleProps>((props, ref): ReactElement => {
  const {
    type,
    value: controlledValue,
    defaultValue,
    onValueChange,
    disabled,
    orientation = 'horizontal',
    children,
    className,
    ...restProps
  } = props;

  const groupId = usePrefixedId(undefined, 'toggle-group');
  const containerRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, containerRef);

  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  const [value, setValue] = useControlledState<string>(controlledValue, defaultValue ?? '', onValueChange);
  const [active, setActive] = useState<string | undefined>(value || undefined);
  const loop = props.loop ?? false;

  useSyncValue(value, setActive);

  const handleValueChange = useCallback(
    (newValue: string) => {
      // In single selection, clicking the selected item deselects it
      const nextValue = value === newValue ? '' : newValue;
      setValue(nextValue);
      // Keep the item active (focused) even if deselected
      setActive(newValue);
    },
    [value, setValue],
  );

  const { handleKeyDown } = useKeyboardNavigation({
    getItems,
    isItemDisabled,
    active,
    setActive,
    loop,
    orientation,
    onSelect: id => {
      handleValueChange(id);
    },
  });

  const contextValue: ToggleGroupContextValue = useMemo(
    () => ({
      selectionMode: type,
      value,
      onValueChange: handleValueChange,
      disabled,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      orientation,
      active,
      setActive,
    }),
    [
      type,
      value,
      handleValueChange,
      disabled,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      orientation,
      active,
    ],
  );

  return (
    <ToggleGroupProvider value={contextValue}>
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- Keyboard navigation is handled via roving tabindex on child items */}
      <div
        ref={composedRef}
        role='radiogroup'
        id={groupId}
        aria-orientation={orientation}
        data-orientation={orientation}
        className={cn('inline-flex gap-2', orientation === 'vertical' && 'flex-col', className)}
        onKeyDown={handleKeyDown}
        {...restProps}
      >
        {children}
      </div>
    </ToggleGroupProvider>
  );
});
ToggleGroupRootSingle.displayName = 'ToggleGroup.RootSingle';

const ToggleGroupRootMultiple = forwardRef<HTMLDivElement, ToggleGroupRootMultipleProps>((props, ref): ReactElement => {
  const {
    type,
    value: controlledValue,
    defaultValue,
    onValueChange,
    disabled,
    orientation = 'horizontal',
    children,
    className,
    ...restProps
  } = props;

  const groupId = usePrefixedId(undefined, 'toggle-group');
  const containerRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, containerRef);

  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  const [value, setValue] = useControlledState<string[]>(controlledValue, defaultValue ?? [], onValueChange);
  const [active, setActive] = useState<string | undefined>(() => value.at(0));

  const handleValueChange = useCallback(
    (itemValue: string) => {
      const nextValue = value.includes(itemValue) ? value.filter(v => v !== itemValue) : [...value, itemValue];
      setValue(nextValue);
    },
    [value, setValue],
  );

  const { handleKeyDown } = useKeyboardNavigation({
    getItems,
    isItemDisabled,
    active,
    setActive,
    loop: false,
    orientation,
    onSelect: id => {
      handleValueChange(id);
    },
  });

  const contextValue: ToggleGroupContextValue = useMemo(
    () => ({
      selectionMode: type,
      value,
      onValueChange: handleValueChange,
      disabled,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      orientation,
      active,
      setActive,
    }),
    [
      type,
      value,
      handleValueChange,
      disabled,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      orientation,
      active,
    ],
  );

  return (
    <ToggleGroupProvider value={contextValue}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Centralized keyboard handler for efficient roving tabindex pattern */}
      <div
        ref={composedRef}
        role='group'
        id={groupId}
        data-orientation={orientation}
        className={cn('inline-flex gap-2', orientation === 'vertical' && 'flex-col', className)}
        onKeyDown={handleKeyDown}
        {...restProps}
      >
        {children}
      </div>
    </ToggleGroupProvider>
  );
});
ToggleGroupRootMultiple.displayName = 'ToggleGroup.RootMultiple';

export type ToggleGroupRootProps = ToggleGroupRootSingleProps | ToggleGroupRootMultipleProps;

const ToggleGroupRoot = forwardRef<HTMLDivElement, ToggleGroupRootProps>((props, ref): ReactElement => {
  return props.type === 'single' ? (
    <ToggleGroupRootSingle {...props} ref={ref} />
  ) : (
    <ToggleGroupRootMultiple {...props} ref={ref} />
  );
});
ToggleGroupRoot.displayName = 'ToggleGroup.Root';

//
// * ToggleGroup.Item
//

/**
 * A toggleable item within a toggle group.
 *
 * Can be used in single or multiple selection modes.
 * Integrates with keyboard navigation and roving tabindex.
 *
 * @example
 * ```tsx
 * <ToggleGroup.Root type="single" value={alignment}>
 *   <ToggleGroup.Item value="left">
 *     <AlignLeft />
 *   </ToggleGroup.Item>
 *   <ToggleGroup.Item value="center" asChild>
 *     <CustomButton><AlignCenter /></CustomButton>
 *   </ToggleGroup.Item>
 * </ToggleGroup.Root>
 * ```
 *
 * @remarks
 * When using `asChild`, do not set the `disabled` prop on the child component.
 * The `ToggleGroup.Item`'s `disabled` prop should be the single source of truth.
 * Due to Radix UI Slot's prop merging behavior, child props can override parent props.
 */
export type ToggleGroupItemProps = {
  value: string;
  asChild?: boolean;
} & Omit<ButtonProps, 'onClick' | 'aria-pressed' | 'aria-checked'>;

const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, disabled: itemDisabled, asChild, ...props }, ref): ReactElement => {
    const context = useToggleGroup();
    const {
      selectionMode,
      value: groupValue,
      onValueChange,
      disabled: groupDisabled,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      active,
      setActive,
    } = context;

    const itemRef = useRef<HTMLButtonElement>(null);
    const composedRef = useComposedRefs(ref, itemRef);

    const disabled = itemDisabled ?? groupDisabled ?? false;

    useEffect(() => {
      registerItem(value, disabled);
      return () => unregisterItem(value);
    }, [value, disabled, registerItem, unregisterItem]);

    const isSelected = selectionMode === 'single' ? groupValue === value : (groupValue as string[]).includes(value);

    const handleClick = useCallback(() => {
      if (!disabled) {
        onValueChange(value);
        setActive?.(value);
      }
    }, [disabled, onValueChange, value, setActive]);

    const Comp = asChild ? Slot : Button;

    const { tabIndex } = useRovingTabIndex({
      id: value,
      active: active,
      disabled,
      getItems,
      isItemDisabled,
    });

    useEffect(() => {
      if (active === value && itemRef.current) {
        // Avoid unnecessary focus calls when element is already focused
        if (document.activeElement !== itemRef.current) {
          itemRef.current.focus();
        }
      }
    }, [active, value]);

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={composedRef}
        {...(selectionMode === 'single' ? { 'aria-pressed': isSelected } : { 'aria-checked': isSelected })}
        data-state={isSelected ? 'on' : 'off'}
        data-active={isSelected || undefined}
        disabled={disabled}
        tabIndex={tabIndex}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
ToggleGroupItem.displayName = 'ToggleGroup.Item';

//
// * ToggleGroup
//

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Root: ToggleGroupRoot,
  Item: ToggleGroupItem,
});
