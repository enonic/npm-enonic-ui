import { cva } from 'class-variance-authority';
import { Check, ChevronDown } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  useClickOutside,
  useControlledState,
  useFloatingPosition,
  useItemRegistry,
  useItemTextRegistry,
  usePortalFocusContainer,
  useScrollActiveIntoView,
  useSelectorKeyboard,
} from '@/hooks';
import { type SelectorContextValue, SelectorProvider, usePrefixedId, useSelector } from '@/providers';
import { cn, useComposedRefs } from '@/utils';

//
// * Selector Root
//

export type SelectorRootProps = {
  children?: ReactNode;
  // Value control
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  // Open state control
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  // States
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  // Form integration
  name?: string;
  form?: string;
};

const SelectorRoot = ({
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  error = false,
  required = false,
  name,
  form,
}: SelectorRootProps): ReactElement => {
  const baseId = usePrefixedId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpenInternal] = useControlledState(controlledOpen, defaultOpen, onOpenChange);
  // Wrap onValueChange to only call when value is defined
  const handleValueChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue !== undefined) {
        onValueChange?.(newValue);
      }
    },
    [onValueChange],
  );
  const [value, setValueInternal] = useControlledState(controlledValue, defaultValue, handleValueChange);
  const [active, setActive] = useState<string | undefined>(undefined);

  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  // Item text registry for type-ahead
  const { registerItemText, unregisterItemText, getItemText } = useItemTextRegistry();

  // Close and return focus to trigger (for Escape key, selection)
  const closeWithFocus = useCallback(() => {
    setOpenInternal(false);
    // Use setTimeout to ensure DOM updates before focus
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, [setOpenInternal]);

  // Set open state (no automatic focus return - use closeWithFocus when focus return is needed)
  const setOpen = useCallback(
    (next: boolean) => {
      setOpenInternal(next);
    },
    [setOpenInternal],
  );

  // Selection handler
  const handleSelect = useCallback(
    (id: string) => {
      setValueInternal(id);
      closeWithFocus();
    },
    [setValueInternal, closeWithFocus],
  );

  // Keyboard handling
  const { keyHandler } = useSelectorKeyboard({
    getItems,
    isItemDisabled,
    getItemText,
    active,
    setActive,
    value,
    open,
    setOpenInternal,
    setOpen,
    closeWithFocus,
    disabled,
    onSelect: handleSelect,
  });

  // Auto-activate selected or first item when opening
  useEffect(() => {
    if (open && active === undefined) {
      const items = getItems();
      if (items.length > 0) {
        // Prefer currently selected value, otherwise first enabled item
        const initialActive =
          (value && items.includes(value) && !isItemDisabled(value) ? value : null) ||
          items.find(id => !isItemDisabled(id));
        if (initialActive) {
          setActive(initialActive);
        }
      }
    }
  }, [open, active, value, getItems, isItemDisabled]);

  // Reset active when closing
  useEffect(() => {
    if (!open) {
      setActive(undefined);
    }
  }, [open]);

  const context = useMemo<SelectorContextValue>(
    () => ({
      baseId,
      value,
      setValue: setValueInternal,
      open,
      setOpen,
      active,
      setActive,
      disabled,
      error,
      required,
      name,
      form,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      registerItemText,
      unregisterItemText,
      getItemText,
      keyHandler,
      triggerRef,
    }),
    [
      baseId,
      value,
      setValueInternal,
      open,
      setOpen,
      active,
      disabled,
      error,
      required,
      name,
      form,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      registerItemText,
      unregisterItemText,
      getItemText,
      keyHandler,
    ],
  );

  return <SelectorProvider value={context}>{children}</SelectorProvider>;
};
SelectorRoot.displayName = 'Selector';

//
// * Selector Trigger
//

const selectorTriggerVariants = cva(
  [
    'flex w-full items-center justify-between gap-2.5',
    'h-12 rounded-sm border bg-surface-neutral px-4',
    'cursor-pointer select-none text-left',
    'hover:-outline-offset-1 hover:outline-2',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring',
    'focus-visible:ring-offset-3 focus-visible:ring-offset-ring-offset',
    'transition-highlight',
  ],
  {
    variants: {
      error: {
        true: 'border-error hover:outline-error focus-visible:border-error focus-visible:ring-error',
        false: 'border-bdr-subtle hover:outline-bdr-subtle',
      },
      open: {
        true: '',
        false: null,
      },
      disabled: {
        true: 'pointer-events-none cursor-not-allowed select-none opacity-30 hover:outline-none focus-visible:outline-none',
        false: null,
      },
    },
    defaultVariants: {
      error: false,
      open: false,
      disabled: false,
    },
  },
);

export type SelectorTriggerProps = {
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children'>;

const SelectorTrigger = forwardRef<HTMLButtonElement, SelectorTriggerProps>(
  ({ className, children, onClick, ...props }, ref): ReactElement => {
    const { baseId, open, setOpen, active, disabled, error, keyHandler, triggerRef } = useSelector();
    const contentId = `${baseId}-content`;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>): void => {
        onClick?.(e);
        if (!disabled) {
          setOpen(!open);
        }
      },
      [onClick, disabled, setOpen, open],
    );

    return (
      <button
        data-component='Selector.Trigger'
        ref={useComposedRefs(ref, triggerRef)}
        type='button'
        id={`${baseId}-trigger`}
        role='combobox'
        aria-controls={contentId}
        aria-expanded={open}
        aria-haspopup='listbox'
        aria-activedescendant={open && active ? `${baseId}-option-${active}` : undefined}
        aria-disabled={disabled || undefined}
        aria-invalid={error || undefined}
        disabled={disabled}
        data-state={open ? 'open' : 'closed'}
        className={cn(selectorTriggerVariants({ error, open, disabled }), className)}
        onClick={handleClick}
        onKeyDown={keyHandler}
        {...props}
      >
        {children}
      </button>
    );
  },
);
SelectorTrigger.displayName = 'Selector.Trigger';

//
// * Selector Value
//

export type SelectorValueProps = {
  className?: string;
  placeholder?: string;
  /**
   * Content to display for the selected value.
   * Can be a render function `(value: string) => ReactNode` for dynamic display text,
   * or a static ReactNode. If not provided, falls back to raw value.
   *
   * **Recommended**: Use a render function to display proper labels instead of raw values.
   * This ensures the correct text is shown even before the dropdown is opened.
   *
   * @example
   * ```tsx
   * // Render function (recommended)
   * <Selector.Value placeholder="Select...">
   *   {(value) => items.find(i => i.value === value)?.label}
   * </Selector.Value>
   *
   * // Falls back to raw value when no children provided
   * <Selector.Value placeholder="Select..." />
   * ```
   */
  children?: ReactNode | ((value: string) => ReactNode);
} & Omit<ComponentPropsWithoutRef<'span'>, 'children'>;

/** Type guard for render function children */
function isRenderFunction(children: SelectorValueProps['children']): children is (value: string) => ReactNode {
  return typeof children === 'function';
}

const SelectorValue = forwardRef<HTMLSpanElement, SelectorValueProps>(
  ({ className, placeholder, children, ...props }, ref): ReactElement => {
    const { value } = useSelector();

    // Get display text: render function > static children > raw value
    let displayText: ReactNode = null;
    if (value) {
      if (isRenderFunction(children)) {
        displayText = children(value);
      } else {
        displayText = children ?? value;
      }
    }
    const showPlaceholder = !displayText && placeholder;

    return (
      <span
        data-component='Selector.Value'
        ref={ref}
        className={cn('flex-1 truncate', showPlaceholder && 'text-subtle', className)}
        data-placeholder={showPlaceholder || undefined}
        {...props}
      >
        {displayText ?? placeholder}
      </span>
    );
  },
);
SelectorValue.displayName = 'Selector.Value';

//
// * Selector Icon
//

export type SelectorIconProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'span'>;

const SelectorIcon = forwardRef<HTMLSpanElement, SelectorIconProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    const { open } = useSelector();

    return (
      <span
        data-component='Selector.Icon'
        ref={ref}
        aria-hidden='true'
        className={cn('shrink-0 text-subtle transition-transform', open && 'rotate-180', className)}
        {...props}
      >
        {children ?? <ChevronDown className='size-5' />}
      </span>
    );
  },
);
SelectorIcon.displayName = 'Selector.Icon';

//
// * Selector Content
//

export type SelectorContentProps = {
  className?: string;
  children?: ReactNode;
  align?: 'start' | 'end';
  /** Whether to render in a portal to document.body. Defaults to true. Set to false when used inside another portaled component (e.g., DatePicker/TimePicker inside Dialog). */
  portal?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onInteractOutside?: (event: Event) => void;
} & ComponentPropsWithoutRef<'div'>;

const SelectorContent = forwardRef<HTMLDivElement, SelectorContentProps>(
  (
    {
      className,
      children,
      align = 'start',
      portal = true,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      ...props
    },
    ref,
  ): ReactElement | null => {
    const { baseId, open, setOpen, active, triggerRef } = useSelector();
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, contentRef);
    const [mounted, setMounted] = useState(false);
    const [isPortalMode, setIsPortalMode] = useState(false);

    const position = useFloatingPosition({
      enabled: open,
      anchorRef: triggerRef,
      contentRef,
      align,
    });

    useEffect(() => {
      setMounted(true);
    }, []);

    // Detect portal mode (only when portal prop is true)
    useLayoutEffect(() => {
      if (!portal || !open || !contentRef.current) return;
      setIsPortalMode(contentRef.current.parentElement === document.body);
    }, [portal, open]);

    // Register with parent focus trap (e.g., Dialog) when in portal mode
    usePortalFocusContainer(contentRef, portal && isPortalMode);

    useClickOutside({
      enabled: open,
      contentRef,
      excludeRefs: [triggerRef],
      onPointerDownOutside,
      onInteractOutside,
      onClose: () => setOpen(false),
    });

    const buildOptionId = useCallback((id: string) => `${baseId}-option-${id}`, [baseId]);

    useScrollActiveIntoView({
      containerRef: contentRef,
      activeId: active,
      orientation: 'vertical',
      buildElementId: buildOptionId,
    });

    if (!mounted || !open) {
      return null;
    }

    const { side: _side, ...positionStyle } = position ?? { side: 'bottom' };

    const content = (
      <div
        data-component='Selector.Content'
        ref={composedRefs}
        id={`${baseId}-content`}
        role='listbox'
        aria-labelledby={`${baseId}-trigger`}
        tabIndex={-1}
        data-state='open'
        data-side={position?.side}
        className={cn(
          'fixed z-50 flex w-fit min-w-(--trigger-width) flex-col overflow-hidden',
          'data-[side=top]:-mt-2 data-[side=bottom]:mt-2',
          'rounded-sm border border-bdr-subtle bg-surface-neutral shadow-lg outline-none',
          'data-[state=closed]:animate-out data-[state=open]:animate-in',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          !position && 'pointer-events-none opacity-0',
          className,
        )}
        style={{
          ...positionStyle,
          '--trigger-width': triggerRef.current ? `${triggerRef.current.offsetWidth}px` : undefined,
        }}
        {...props}
      >
        {children}
      </div>
    );

    return portal ? createPortal(content, document.body) : content;
  },
);
SelectorContent.displayName = 'Selector.Content';

//
// * Selector Viewport
//

export type SelectorViewportProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const SelectorViewport = forwardRef<HTMLDivElement, SelectorViewportProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    return (
      <div
        data-component='Selector.Viewport'
        ref={ref}
        className={cn('flex max-h-80 flex-col gap-y-1 overflow-y-auto p-1', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SelectorViewport.displayName = 'Selector.Viewport';

//
// * Selector Item
//

const selectorItemVariants = cva(
  [
    'group relative z-0 flex w-full cursor-pointer items-center gap-x-2.5 px-4.5 py-2 outline-none transition-highlight',
    // Click target expansion: -inset-y-{n} where n = gap / 2
    'after:-inset-y-0.5 after:-z-10 after:pointer-events-auto after:absolute after:inset-x-0 after:rounded-sm after:content-[""]',
  ],
  {
    variants: {
      selected: {
        true: 'bg-surface-selected text-alt',
        false: 'hover:bg-surface-neutral-hover',
      },
      active: {
        true: null,
        false: null,
      },
      disabled: {
        true: 'pointer-events-none cursor-not-allowed opacity-30',
        false: '',
      },
    },
    compoundVariants: [
      {
        active: true,
        selected: false,
        disabled: false,
        class: 'bg-surface-neutral-hover',
      },
      {
        active: true,
        selected: true,
        disabled: false,
        class: 'bg-surface-selected-hover',
      },
    ],
    defaultVariants: {
      selected: false,
      active: false,
      disabled: false,
    },
  },
);

export type SelectorItemProps = {
  value: string;
  disabled?: boolean;
  textValue?: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

const SelectorItem = forwardRef<HTMLDivElement, SelectorItemProps>(
  (
    { value, disabled = false, textValue, className, children, onClick, onPointerMove, ...props },
    ref,
  ): ReactElement => {
    const {
      baseId,
      value: selectedValue,
      setValue,
      setOpen,
      active,
      setActive,
      disabled: selectorDisabled,
      registerItem,
      registerItemText,
    } = useSelector();

    const isSelected = selectedValue === value;
    const isActive = active === value;
    const isDisabled = disabled || selectorDisabled;
    const itemRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, itemRef);

    // Register item and text for type-ahead and HiddenSelect
    // NOTE: Items are intentionally NOT unregistered on unmount.
    // This allows HiddenSelect to display options when the dropdown is closed,
    // and SelectorValue to show the correct label without re-rendering items.
    useEffect(() => {
      registerItem(value, isDisabled, itemRef.current);
      const text = textValue ?? (typeof children === 'string' ? children : undefined);
      if (text) {
        registerItemText(value, text);
      }
    }, [value, isDisabled, textValue, children, registerItem, registerItemText]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>): void => {
        onClick?.(e);
        if (!isDisabled) {
          setValue(value);
          setOpen(false);
        }
      },
      [onClick, isDisabled, setValue, value, setOpen],
    );

    const handlePointerMove = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'div'>['onPointerMove']>>[0]): void => {
        onPointerMove?.(e);
        if (!isActive && !isDisabled) {
          setActive(value);
        }
      },
      [onPointerMove, isActive, isDisabled, setActive, value],
    );

    return (
      // Keyboard navigation is handled at the trigger level via aria-activedescendant pattern
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
      <div
        data-component='Selector.Item'
        ref={composedRefs}
        id={`${baseId}-option-${value}`}
        role='option'
        aria-selected={isSelected}
        aria-disabled={isDisabled || undefined}
        data-value={value}
        data-active={isActive || undefined}
        data-disabled={isDisabled || undefined}
        data-state={isSelected ? 'selected' : undefined}
        data-tone={isSelected ? 'inverse' : undefined}
        className={cn(
          selectorItemVariants({ selected: isSelected, active: isActive, disabled: isDisabled }),
          className,
        )}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SelectorItem.displayName = 'Selector.Item';

//
// * Selector Item Text
//

export type SelectorItemTextProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'span'>;

const SelectorItemText = forwardRef<HTMLSpanElement, SelectorItemTextProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    return (
      <span data-component='Selector.ItemText' ref={ref} className={cn('flex-1', className)} {...props}>
        {children}
      </span>
    );
  },
);
SelectorItemText.displayName = 'Selector.ItemText';

//
// * Selector Item Indicator
//

export type SelectorItemIndicatorProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'span'>;

const SelectorItemIndicator = forwardRef<HTMLSpanElement, SelectorItemIndicatorProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    return (
      <span
        data-component='Selector.ItemIndicator'
        ref={ref}
        className={cn(
          'inline-flex shrink-0 items-center justify-center',
          'opacity-0 [[data-state=selected]>&]:opacity-100',
          className,
        )}
        {...props}
      >
        {children ?? <Check className='size-4' />}
      </span>
    );
  },
);
SelectorItemIndicator.displayName = 'Selector.ItemIndicator';

//
// * Selector Group
//

export type SelectorGroupProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const SelectorGroup = forwardRef<HTMLDivElement, SelectorGroupProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    const groupId = usePrefixedId(undefined, 'selector-group');

    return (
      <div
        data-component='Selector.Group'
        ref={ref}
        role='group'
        aria-labelledby={`${groupId}-label`}
        className={cn('w-full', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SelectorGroup.displayName = 'Selector.Group';

//
// * Selector Label
//

export type SelectorLabelProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const SelectorLabel = forwardRef<HTMLDivElement, SelectorLabelProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    return (
      <div
        data-component='Selector.Label'
        ref={ref}
        className={cn('px-4.5 py-1.5 font-semibold text-subtle text-xs', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SelectorLabel.displayName = 'Selector.Label';

//
// * Selector Separator
//

export type SelectorSeparatorProps = {
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const SelectorSeparator = forwardRef<HTMLDivElement, SelectorSeparatorProps>(
  ({ className, ...props }, ref): ReactElement => {
    return (
      <div
        data-component='Selector.Separator'
        ref={ref}
        role='separator'
        aria-orientation='horizontal'
        className={cn('my-1 h-px bg-bdr-subtle', className)}
        {...props}
      />
    );
  },
);
SelectorSeparator.displayName = 'Selector.Separator';

//
// * Selector Hidden Select
//

export type SelectorHiddenSelectProps = ComponentPropsWithoutRef<'select'>;

const SelectorHiddenSelect = forwardRef<HTMLSelectElement, SelectorHiddenSelectProps>(
  ({ className, ...props }, ref): ReactElement => {
    const { value, disabled, required, name, form, getItems, getItemText } = useSelector();

    const items = getItems();

    return (
      <select
        data-component='Selector.HiddenSelect'
        ref={ref}
        name={name}
        form={form}
        disabled={disabled}
        required={required}
        value={value ?? ''}
        onChange={() => {
          /* no-op, controlled by parent */
        }}
        tabIndex={-1}
        aria-hidden='true'
        className={cn(
          'absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0',
          '[clip:rect(0,0,0,0)]',
          className,
        )}
        style={{ margin: '-1px' }}
        {...props}
      >
        <option value='' disabled={required}>
          {/* Empty option for required validation */}
        </option>
        {items.map(itemValue => (
          <option key={itemValue} value={itemValue}>
            {getItemText(itemValue) ?? itemValue}
          </option>
        ))}
      </select>
    );
  },
);
SelectorHiddenSelect.displayName = 'Selector.HiddenSelect';

export const Selector = Object.assign(SelectorRoot, {
  Root: SelectorRoot,
  Trigger: SelectorTrigger,
  Value: SelectorValue,
  Icon: SelectorIcon,
  Content: SelectorContent,
  Viewport: SelectorViewport,
  Item: SelectorItem,
  ItemText: SelectorItemText,
  ItemIndicator: SelectorItemIndicator,
  Group: SelectorGroup,
  Label: SelectorLabel,
  Separator: SelectorSeparator,
  HiddenSelect: SelectorHiddenSelect,
});
