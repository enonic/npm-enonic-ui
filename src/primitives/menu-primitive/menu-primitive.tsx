import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { Circle, CircleDot } from 'lucide-react';
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
} from 'react';
import { useActiveItemFocus, useControlledState, useRovingTabIndex } from '@/hooks';
import { usePrefixedId } from '@/providers';
import { cn, useComposedRefs } from '@/utils';

//
// * Shared Context Operations Type
//

export type MenuContextOperations = {
  active: string | undefined;
  setActive: (id: string | undefined) => void;
  setOpen: (open: boolean) => void;
  registerItem: (id: string, disabled?: boolean) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
};

//
// * Item Variants
//

export const menuItemVariants = cva(
  [
    'relative z-0 flex w-full cursor-pointer items-center gap-x-1.25 px-4.5 py-2.5 text-sm outline-none transition-highlight',
    'after:-inset-0.5 after:-z-10 after:pointer-events-auto after:absolute after:rounded-sm after:content-[""]',
  ],
  {
    variants: {
      active: {
        true: 'bg-surface-neutral-hover',
        false: 'hover:bg-surface-neutral-hover',
      },
      disabled: {
        true: 'pointer-events-none select-none opacity-30 hover:bg-transparent',
        false: '',
      },
    },
    compoundVariants: [
      {
        active: true,
        disabled: false,
        class: [
          // ring and offset colors are swapped for inset ring focus
          'focus-visible:ring-3 focus-visible:ring-ring-offset focus-visible:ring-inset',
          'focus-visible:ring-offset-3 focus-visible:ring-offset-ring',
        ],
      },
    ],
    defaultVariants: {
      active: false,
      disabled: false,
    },
  },
);

//
// * MenuPrimitiveItem
//

/** Public API props for menu items (without context operations) */
export type MenuItemOwnProps = {
  id?: string;
  asChild?: boolean;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

/** Internal primitive props (own props + context operations for dependency injection) */
export type MenuPrimitiveItemProps = MenuItemOwnProps & MenuContextOperations;

export const MenuPrimitiveItem = forwardRef<HTMLDivElement, MenuPrimitiveItemProps>(
  (
    {
      id: providedId,
      asChild = false,
      disabled = false,
      onSelect,
      className,
      children,
      // Context operations
      active,
      setActive,
      setOpen,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      // Event handlers
      onClick,
      onPointerMove,
      onPointerLeave,
      onFocus,
      ...props
    },
    ref,
  ): ReactElement => {
    const id = usePrefixedId(providedId, providedId ? undefined : 'menu-item');
    const isActive = active === id;
    const itemRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, itemRef);

    useEffect(() => {
      registerItem(id, disabled);
      return () => unregisterItem(id);
    }, [id, disabled, registerItem, unregisterItem]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>): void => {
        onClick?.(e);
        if (disabled) {
          return;
        }
        const event = new Event('select', { bubbles: true, cancelable: true });
        onSelect?.(event);
        if (!event.defaultPrevented) {
          setOpen(false);
        }
      },
      [disabled, onSelect, setOpen, onClick],
    );

    const handlePointerMove = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'div'>['onPointerMove']>>[0]): void => {
        onPointerMove?.(e);
        if (!isActive && !disabled) {
          setActive(id);
        }
      },
      [isActive, setActive, id, disabled, onPointerMove],
    );

    const handlePointerLeave = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'div'>['onPointerLeave']>>[0]): void => {
        onPointerLeave?.(e);
        if (document.activeElement !== itemRef.current) {
          setActive(undefined);
        }
      },
      [setActive, onPointerLeave],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLDivElement>): void => {
        onFocus?.(e);
        if (disabled) return;
        setActive(id);
      },
      [onFocus, disabled, setActive, id],
    );

    const { tabIndex } = useRovingTabIndex({
      id,
      active,
      disabled,
      getItems,
      isItemDisabled,
    });

    useActiveItemFocus({
      ref: itemRef,
      isActive,
      disabled,
    });

    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={composedRefs}
        id={id}
        role='menuitem'
        tabIndex={tabIndex}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        data-active={isActive || undefined}
        data-disabled={disabled || undefined}
        data-tone={isActive ? 'inverse' : undefined}
        className={cn(menuItemVariants({ active: isActive, disabled }), className)}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
MenuPrimitiveItem.displayName = 'MenuPrimitive.Item';

//
// * MenuPrimitiveLabel
//

export type MenuPrimitiveLabelProps = {
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

export const MenuPrimitiveLabel = forwardRef<HTMLDivElement, MenuPrimitiveLabelProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    return (
      <div ref={ref} role='none' className={cn('px-3 py-1.5 font-semibold text-subtle text-xs', className)} {...props}>
        {children}
      </div>
    );
  },
);
MenuPrimitiveLabel.displayName = 'MenuPrimitive.Label';

//
// * MenuPrimitiveSeparator
//

export type MenuPrimitiveSeparatorProps = {
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

export const MenuPrimitiveSeparator = forwardRef<HTMLDivElement, MenuPrimitiveSeparatorProps>(
  ({ className, ...props }, ref): ReactElement => {
    return (
      <div
        ref={ref}
        role='separator'
        aria-orientation='horizontal'
        className={cn('my-1 h-px bg-bdr-subtle', className)}
        {...props}
      />
    );
  },
);
MenuPrimitiveSeparator.displayName = 'MenuPrimitive.Separator';

//
// * RadioGroup Context
//

type RadioGroupContextValue = {
  value: string | undefined;
  setValue: (value: string) => void;
  closeOnSelect: boolean;
  setOpen: (open: boolean) => void;
};

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

export const useRadioGroup = (): RadioGroupContextValue => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioGroup components must be used within a RadioGroup');
  }
  return context;
};

//
// * MenuPrimitiveRadioGroup
//

/** Public API props for radio groups (without setOpen) */
export type MenuRadioGroupOwnProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  closeOnSelect?: boolean;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

/** Internal primitive props (own props + setOpen for dependency injection) */
export type MenuPrimitiveRadioGroupProps = MenuRadioGroupOwnProps & {
  setOpen: (open: boolean) => void;
};

export const MenuPrimitiveRadioGroup = forwardRef<HTMLDivElement, MenuPrimitiveRadioGroupProps>(
  (
    {
      value: controlledValue,
      defaultValue = undefined,
      onValueChange,
      closeOnSelect = false,
      setOpen,
      className,
      children,
      ...props
    },
    ref,
  ): ReactElement => {
    const [value, setValueInternal] = useControlledState<string | undefined>(controlledValue, defaultValue, undefined);

    const setValue = useCallback(
      (newValue: string) => {
        setValueInternal(newValue);
        onValueChange?.(newValue);
      },
      [setValueInternal, onValueChange],
    );

    const contextValue: RadioGroupContextValue = useMemo(
      () => ({
        value,
        setValue,
        closeOnSelect,
        setOpen,
      }),
      [value, setValue, closeOnSelect, setOpen],
    );

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div ref={ref} role='group' className={cn('flex w-full flex-col', className)} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
MenuPrimitiveRadioGroup.displayName = 'MenuPrimitive.RadioGroup';

//
// * RadioItem Variants
//

export const menuRadioItemVariants = cva(
  [
    'relative z-0 flex w-full cursor-pointer items-center gap-x-1.25 px-4.5 py-2.5 text-sm outline-none transition-highlight',
    'after:-inset-0.5 after:-z-10 after:pointer-events-auto after:absolute after:rounded-sm after:content-[""]',
  ],
  {
    variants: {
      active: {
        true: 'bg-surface-neutral-hover',
        false: '',
      },
      disabled: {
        true: 'pointer-events-none select-none opacity-30 hover:bg-transparent',
        false: '',
      },
      checked: {
        true: 'bg-surface-selected text-alt hover:bg-surface-selected-hover',
        false: 'hover:bg-surface-neutral-hover',
      },
    },
    compoundVariants: [
      {
        active: true,
        checked: true,
        disabled: false,
        class: 'bg-surface-selected text-alt hover:bg-surface-selected-hover',
      },
      {
        active: true,
        disabled: false,
        class: [
          // ring and offset colors are swapped for inset ring focus
          'focus-visible:ring-3 focus-visible:ring-ring-offset focus-visible:ring-inset',
          'focus-visible:ring-offset-3 focus-visible:ring-offset-ring',
        ],
      },
    ],
    defaultVariants: {
      active: false,
      disabled: false,
      checked: false,
    },
  },
);

//
// * MenuPrimitiveRadioItem
//

/** Public API props for radio items (without context operations) */
export type MenuRadioItemOwnProps = {
  id?: string;
  value: string;
  asChild?: boolean;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

/** Internal primitive props (own props + context operations except setOpen, which comes from RadioGroup) */
export type MenuPrimitiveRadioItemProps = MenuRadioItemOwnProps & Omit<MenuContextOperations, 'setOpen'>;

export const MenuPrimitiveRadioItem = forwardRef<HTMLDivElement, MenuPrimitiveRadioItemProps>(
  (
    {
      id: providedId,
      value,
      asChild = false,
      disabled = false,
      onSelect,
      className,
      children,
      // Context operations (setOpen comes from RadioGroup context)
      active,
      setActive,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      // Event handlers
      onClick,
      onPointerMove,
      onPointerLeave,
      onFocus,
      onKeyDown,
      ...props
    },
    ref,
  ): ReactElement => {
    const id = usePrefixedId(providedId, providedId ? undefined : 'menu-radio-item');
    const { value: selectedValue, setValue, closeOnSelect, setOpen } = useRadioGroup();
    const isActive = active === id;
    const isChecked = selectedValue === value;
    const itemRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, itemRef);

    useEffect(() => {
      registerItem(id, disabled);
      return () => unregisterItem(id);
    }, [id, disabled, registerItem, unregisterItem]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>): void => {
        onClick?.(e);
        if (disabled) {
          return;
        }
        setValue(value);
        const event = new Event('select', { bubbles: true, cancelable: true });
        onSelect?.(event);
        // Close menu if closeOnSelect is true
        if (closeOnSelect) {
          setOpen(false);
        }
      },
      [disabled, value, setValue, onSelect, onClick, closeOnSelect, setOpen],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        onKeyDown?.(e);
        // Space/Enter key selects the radio item
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!disabled) {
            setValue(value);
            const event = new Event('select', { bubbles: true, cancelable: true });
            onSelect?.(event);
            // Close menu if closeOnSelect is true
            if (closeOnSelect) {
              setOpen(false);
            }
          }
        }
      },
      [disabled, value, setValue, onSelect, onKeyDown, closeOnSelect, setOpen],
    );

    const handlePointerMove = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'div'>['onPointerMove']>>[0]): void => {
        onPointerMove?.(e);
        if (!isActive && !disabled) {
          setActive(id);
        }
      },
      [isActive, setActive, id, disabled, onPointerMove],
    );

    const handlePointerLeave = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'div'>['onPointerLeave']>>[0]): void => {
        onPointerLeave?.(e);
        if (document.activeElement !== itemRef.current) {
          setActive(undefined);
        }
      },
      [setActive, onPointerLeave],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLDivElement>): void => {
        onFocus?.(e);
        if (disabled) return;
        setActive(id);
      },
      [onFocus, disabled, setActive, id],
    );

    const { tabIndex } = useRovingTabIndex({
      id,
      active,
      disabled,
      getItems,
      isItemDisabled,
    });

    useActiveItemFocus({
      ref: itemRef,
      isActive,
      disabled,
    });

    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={composedRefs}
        id={id}
        role='menuitemradio'
        tabIndex={tabIndex}
        aria-checked={isChecked}
        aria-disabled={disabled || undefined}
        data-active={isActive || undefined}
        data-disabled={disabled || undefined}
        data-state={isChecked ? 'checked' : 'unchecked'}
        data-tone={isActive ? 'inverse' : undefined}
        className={cn('group', menuRadioItemVariants({ active: isActive, disabled, checked: isChecked }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
MenuPrimitiveRadioItem.displayName = 'MenuPrimitive.RadioItem';

//
// * MenuPrimitiveItemIndicator
//

export type MenuPrimitiveItemIndicatorProps = {
  forceMount?: boolean;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'span'>;

export const MenuPrimitiveItemIndicator = forwardRef<HTMLSpanElement, MenuPrimitiveItemIndicatorProps>(
  ({ forceMount, className, children, ...props }, ref): ReactElement | null => {
    const radioContext = useContext(RadioGroupContext);

    // If not within a RadioGroup, don't render (could extend for CheckboxItem later)
    if (!radioContext) {
      return null;
    }

    // If no children provided, use default Circle/CircleDot icons
    // The parent RadioItem has data-state attribute that controls which icon shows
    const defaultContent = (
      <>
        <Circle strokeWidth={1.5} className='size-3.5 group-data-[state=checked]:hidden' />
        <CircleDot
          strokeWidth={1.5}
          className='size-3.5 group-data-[state=unchecked]:hidden [&>circle:last-child]:origin-center [&>circle:last-child]:scale-[3.75] [&>circle:last-child]:fill-current'
        />
      </>
    );

    return (
      <span ref={ref} data-indicator className={cn('inline-flex items-center justify-center', className)} {...props}>
        {children ?? defaultContent}
      </span>
    );
  },
);
MenuPrimitiveItemIndicator.displayName = 'MenuPrimitive.ItemIndicator';
