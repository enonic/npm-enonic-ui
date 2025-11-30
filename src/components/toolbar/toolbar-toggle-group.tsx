import { Slot } from '@radix-ui/react-slot';
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, type ButtonProps } from '@/components/button';
import { useActiveItemFocus, useControlledState, useRovingTabIndex } from '@/hooks';
import { usePrefixedId } from '@/providers';
import { cn, useComposedRefs } from '@/utils';

import { useToolbar } from './toolbar';

//
// * ToolbarToggleGroupContext
//

type ToolbarToggleGroupContextValue = {
  selectionMode: 'single' | 'multiple';
  value: string | string[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  // Map value → id for active state management
  valueToId: Map<string, string>;
  registerValueId: (value: string, id: string) => void;
  unregisterValue: (value: string) => void;
};

const ToolbarToggleGroupContext = createContext<ToolbarToggleGroupContextValue | undefined>(undefined);

function useToolbarToggleGroup(): ToolbarToggleGroupContextValue {
  const context = useContext(ToolbarToggleGroupContext);
  if (!context) {
    throw new Error('useToolbarToggleGroup must be used within a ToolbarToggleGroup');
  }
  return context;
}

//
// * Toolbar.ToggleGroup - Single Selection
//

type ToolbarToggleGroupRootSingleProps = {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onSelect'>;

//
// * Toolbar.ToggleGroup - Multiple Selection
//

type ToolbarToggleGroupRootMultipleProps = {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onSelect'>;

//
// * Toolbar.ToggleGroup.Root
//

const ToolbarToggleGroupRootSingle = forwardRef<HTMLDivElement, ToolbarToggleGroupRootSingleProps>(
  (props, ref): ReactElement => {
    const { value: controlledValue, defaultValue, onValueChange, disabled, children, className, ...restProps } = props;

    const { orientation } = useToolbar();
    const groupId = usePrefixedId(undefined, 'toolbar-toggle-group');
    const containerRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, containerRef);

    // Map to track value → id relationships
    const [valueToId] = useState(() => new Map<string, string>());

    const registerValueId = useCallback(
      (value: string, id: string) => {
        valueToId.set(value, id);
      },
      [valueToId],
    );

    const unregisterValue = useCallback(
      (value: string) => {
        valueToId.delete(value);
      },
      [valueToId],
    );

    const [value, setValue] = useControlledState<string>(controlledValue, defaultValue ?? '', onValueChange);

    const handleValueChange = useCallback(
      (newValue: string) => {
        // In single selection, clicking the selected item deselects it
        const nextValue = value === newValue ? '' : newValue;
        setValue(nextValue);
      },
      [value, setValue],
    );

    const contextValue: ToolbarToggleGroupContextValue = useMemo(
      () => ({
        selectionMode: 'single',
        value,
        onValueChange: handleValueChange,
        disabled,
        orientation,
        valueToId,
        registerValueId,
        unregisterValue,
      }),
      [value, handleValueChange, disabled, orientation, valueToId, registerValueId, unregisterValue],
    );

    return (
      <ToolbarToggleGroupContext.Provider value={contextValue}>
        <div
          ref={composedRef}
          role='radiogroup'
          id={groupId}
          aria-orientation={orientation}
          data-orientation={orientation}
          className={cn('inline-flex gap-2', orientation === 'vertical' && 'flex-col', className)}
          {...restProps}
        >
          {children}
        </div>
      </ToolbarToggleGroupContext.Provider>
    );
  },
);
ToolbarToggleGroupRootSingle.displayName = 'Toolbar.ToggleGroup.RootSingle';

const ToolbarToggleGroupRootMultiple = forwardRef<HTMLDivElement, ToolbarToggleGroupRootMultipleProps>(
  (props, ref): ReactElement => {
    const { value: controlledValue, defaultValue, onValueChange, disabled, children, className, ...restProps } = props;

    const { orientation } = useToolbar();
    const groupId = usePrefixedId(undefined, 'toolbar-toggle-group');
    const containerRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, containerRef);

    // Map to track value → id relationships
    const [valueToId] = useState(() => new Map<string, string>());

    const registerValueId = useCallback(
      (value: string, id: string) => {
        valueToId.set(value, id);
      },
      [valueToId],
    );

    const unregisterValue = useCallback(
      (value: string) => {
        valueToId.delete(value);
      },
      [valueToId],
    );

    const [value, setValue] = useControlledState<string[]>(controlledValue, defaultValue ?? [], onValueChange);

    const handleValueChange = useCallback(
      (itemValue: string) => {
        const nextValue = value.includes(itemValue) ? value.filter(v => v !== itemValue) : [...value, itemValue];
        setValue(nextValue);
      },
      [value, setValue],
    );

    const contextValue: ToolbarToggleGroupContextValue = useMemo(
      () => ({
        selectionMode: 'multiple',
        value,
        onValueChange: handleValueChange,
        disabled,
        orientation,
        valueToId,
        registerValueId,
        unregisterValue,
      }),
      [value, handleValueChange, disabled, orientation, valueToId, registerValueId, unregisterValue],
    );

    return (
      <ToolbarToggleGroupContext.Provider value={contextValue}>
        <div
          ref={composedRef}
          role='group'
          id={groupId}
          data-orientation={orientation}
          className={cn('inline-flex gap-2', orientation === 'vertical' && 'flex-col', className)}
          {...restProps}
        >
          {children}
        </div>
      </ToolbarToggleGroupContext.Provider>
    );
  },
);
ToolbarToggleGroupRootMultiple.displayName = 'Toolbar.ToggleGroup.RootMultiple';

export type ToolbarToggleGroupRootProps = ToolbarToggleGroupRootSingleProps | ToolbarToggleGroupRootMultipleProps;

const ToolbarToggleGroupRoot = forwardRef<HTMLDivElement, ToolbarToggleGroupRootProps>((props, ref): ReactElement => {
  return props.type === 'single' ? (
    <ToolbarToggleGroupRootSingle {...props} ref={ref} />
  ) : (
    <ToolbarToggleGroupRootMultiple {...props} ref={ref} />
  );
});
ToolbarToggleGroupRoot.displayName = 'Toolbar.ToggleGroup';

//
// * Toolbar.ToggleItem
//

/**
 * A toggleable item within a toolbar toggle group.
 *
 * Integrates with both toolbar navigation and toggle group selection.
 * Supports single or multiple selection modes.
 *
 * @example
 * ```tsx
 * <Toolbar.ToggleGroup type="single" value={alignment}>
 *   <Toolbar.ToggleItem value="left">
 *     <AlignLeft />
 *   </Toolbar.ToggleItem>
 *   <Toolbar.ToggleItem value="center" asChild>
 *     <CustomButton><AlignCenter /></CustomButton>
 *   </Toolbar.ToggleItem>
 * </Toolbar.ToggleGroup>
 * ```
 *
 * @remarks
 * When using `asChild`, do not set the `disabled` prop on the child component.
 * The `Toolbar.ToggleItem`'s `disabled` prop should be the single source of truth.
 * Due to Radix UI Slot's prop merging behavior, child props can override parent props.
 */
export type ToolbarToggleItemProps = {
  value: string;
  asChild?: boolean;
} & Omit<ButtonProps, 'onClick' | 'aria-pressed' | 'aria-checked'>;

const ToolbarToggleItem = forwardRef<HTMLButtonElement, ToolbarToggleItemProps>(
  ({ value, disabled: itemDisabled, asChild, className, ...props }, ref): ReactElement => {
    const groupContext = useToolbarToggleGroup();
    const toolbarContext = useToolbar();

    const {
      selectionMode,
      value: groupValue,
      onValueChange,
      disabled: groupDisabled,
      registerValueId,
      unregisterValue,
    } = groupContext;

    const { active, setActive, registerItem, unregisterItem, getItems, isItemDisabled } = toolbarContext;

    const id = usePrefixedId(undefined, 'toolbar-toggle-item');
    const itemRef = useRef<HTMLButtonElement>(null);
    const composedRef = useComposedRefs(ref, itemRef);

    const disabled = itemDisabled ?? groupDisabled ?? false;

    // Register with Toolbar using ID
    useEffect(() => {
      registerItem(id, disabled);
      return () => unregisterItem(id);
    }, [id, disabled, registerItem, unregisterItem]);

    // Register value → id mapping
    useEffect(() => {
      registerValueId(value, id);
      return () => unregisterValue(value);
    }, [value, id, registerValueId, unregisterValue]);

    const isSelected = selectionMode === 'single' ? groupValue === value : (groupValue as string[]).includes(value);
    const isActive = active === id;

    const handleClick = useCallback(() => {
      if (!disabled) {
        onValueChange(value);
        setActive(id);
      }
    }, [disabled, onValueChange, value, setActive, id]);

    const handleFocus = useCallback(() => {
      if (!disabled) {
        setActive(id);
      }
    }, [disabled, setActive, id]);

    useActiveItemFocus({
      ref: itemRef,
      isActive,
      disabled,
    });

    // Use roving tabindex hook with proper fallback logic
    const { tabIndex } = useRovingTabIndex({
      id,
      active,
      disabled,
      getItems,
      isItemDisabled,
    });

    const Comp = asChild ? Slot : Button;

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={composedRef}
        id={id}
        {...(selectionMode === 'single' ? { 'aria-pressed': isSelected } : { 'aria-checked': isSelected })}
        data-state={isSelected ? 'on' : 'off'}
        data-active={isSelected || undefined}
        disabled={disabled}
        tabIndex={tabIndex}
        onClick={handleClick}
        onFocus={handleFocus}
        className={className}
        {...props}
      />
    );
  },
);
ToolbarToggleItem.displayName = 'Toolbar.ToggleItem';

//
// * Exports
//

export const ToolbarToggleGroup = Object.assign(ToolbarToggleGroupRoot, {
  Root: ToolbarToggleGroupRoot,
  Item: ToolbarToggleItem,
});

export { ToolbarToggleItem };
