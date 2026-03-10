import { Slot } from '@radix-ui/react-slot';
import { ChevronDown, Clock } from 'lucide-react';
import {
  type ChangeEvent,
  Children,
  type ComponentPropsWithoutRef,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconButton } from '@/components/icon-button';
import { Selector } from '@/components/selector';
import {
  useActiveItemFocus,
  useClickOutside,
  useControlledState,
  useControlledStateWithNull,
  useFloatingPosition,
  useItemRegistry,
  useKeyboardNavigation,
  useRovingTabIndex,
} from '@/hooks';
import { type TimePickerContextValue, TimePickerProvider, usePrefixedId, useTimePicker } from '@/providers';
import { cn, getIsMobile, subscribeToMobileChanges, useComposedRefs } from '@/utils';

const padZero = (num: number): string => String(num).padStart(2, '0');

const isValidTime = (hour: number, minute: number): boolean => {
  return Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour < 24 && minute >= 0 && minute < 60;
};

const getNowParts = (): { hour: number; minute: number } => {
  const now = new Date();
  return { hour: now.getHours(), minute: now.getMinutes() };
};

const getTimezoneOffsetString = (referenceDate: Date): string => {
  const offset = referenceDate.getTimezoneOffset();
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;
  const sign = offset <= 0 ? '+' : '-';
  return `UTC${sign}${padZero(hours)}:${padZero(minutes)}`;
};

const parseTimeValue = (
  value: string | undefined,
  timezone: boolean,
  referenceDate: Date,
): { hour: number; minute: number } => {
  if (!value) {
    return getNowParts();
  }

  if (timezone && value.endsWith('Z')) {
    // UTC format: "HH:MM:SSZ" or "HH:MMZ"
    const timePart = value.slice(0, -1);
    const [hourStr, minuteStr] = timePart.split(':');
    const utcHour = Number.parseInt(hourStr ?? '0', 10);
    const utcMinute = Number.parseInt(minuteStr ?? '0', 10);
    if (!isValidTime(utcHour, utcMinute)) {
      return getNowParts();
    }
    // Convert UTC to local using reference date (for correct DST offset)
    const date = new Date(referenceDate);
    date.setUTCHours(utcHour, utcMinute, 0, 0);
    return { hour: date.getHours(), minute: date.getMinutes() };
  }

  // Local format: "HH:MM"
  const [hourStr, minuteStr] = value.split(':');
  const hour = Number.parseInt(hourStr ?? '0', 10);
  const minute = Number.parseInt(minuteStr ?? '0', 10);
  if (!isValidTime(hour, minute)) {
    return getNowParts();
  }
  return { hour, minute };
};

const formatTimeValue = (hour: number, minute: number, timezone: boolean, referenceDate: Date): string => {
  if (timezone) {
    // Convert local to UTC using reference date (for correct DST offset)
    const date = new Date(referenceDate);
    date.setHours(hour, minute, 0, 0);
    return `${padZero(date.getUTCHours())}:${padZero(date.getUTCMinutes())}Z`;
  }
  return `${padZero(hour)}:${padZero(minute)}`;
};

// Native input helpers

/** Format time value for native input (always HH:MM local time) */
const formatNativeInputTime = (value: string | null, timezone: boolean, referenceDate: Date): string => {
  if (!value) return '';
  const { hour, minute } = parseTimeValue(value, timezone, referenceDate);
  return `${padZero(hour)}:${padZero(minute)}`;
};

/** Parse native input value (HH:MM local time) to stored format */
const parseNativeInputTime = (inputValue: string, timezone: boolean, referenceDate: Date): string | null => {
  if (!inputValue) return null;
  const [hourStr, minuteStr] = inputValue.split(':');
  const hour = Number.parseInt(hourStr ?? '0', 10);
  const minute = Number.parseInt(minuteStr ?? '0', 10);
  if (!isValidTime(hour, minute)) return null;
  return formatTimeValue(hour, minute, timezone, referenceDate);
};

//
// * Hour Select
//

export type TimePickerHourSelectProps = {
  className?: string;
  contentClassName?: string;
} & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

const TimePickerHourSelect = forwardRef<HTMLButtonElement, TimePickerHourSelectProps>(
  ({ className, contentClassName, disabled, onFocus, onPointerDown, ...props }, ref): ReactElement => {
    const {
      hour,
      setHour,
      selectorActive,
      setSelectorActive,
      registerSelectorItem,
      unregisterSelectorItem,
      getSelectorItems,
      isSelectorItemDisabled,
      hourSelectOpen,
      setHourSelectOpen,
      setMinuteSelectOpen,
      hourSelectId,
      hourTriggerRef,
      invalid,
    } = useTimePicker();
    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
    const isDisabled = disabled as boolean | undefined;
    const isActive = selectorActive === hourSelectId;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const composedRefs = useComposedRefs(ref, triggerRef, hourTriggerRef);

    useEffect(() => {
      registerSelectorItem(hourSelectId, isDisabled);
      return () => unregisterSelectorItem(hourSelectId);
    }, [hourSelectId, isDisabled, registerSelectorItem, unregisterSelectorItem]);

    const { tabIndex } = useRovingTabIndex({
      id: hourSelectId,
      active: selectorActive,
      disabled: Boolean(isDisabled),
      getItems: getSelectorItems,
      isItemDisabled: isSelectorItemDisabled,
    });

    useActiveItemFocus({
      ref: triggerRef,
      isActive,
      disabled: Boolean(isDisabled),
    });

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLButtonElement>): void => {
        onFocus?.(event);
        if (isDisabled) return;
        setSelectorActive(hourSelectId);
        setMinuteSelectOpen(false);
      },
      [onFocus, isDisabled, setSelectorActive, hourSelectId, setMinuteSelectOpen],
    );

    const handlePointerDown = useCallback(
      (event: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerDown']>>[0]): void => {
        onPointerDown?.(event);
        if (isDisabled) return;
        setSelectorActive(hourSelectId);
        setMinuteSelectOpen(false);
      },
      [onPointerDown, isDisabled, setSelectorActive, hourSelectId, setMinuteSelectOpen],
    );

    const handleOpenChange = useCallback(
      (nextOpen: boolean): void => {
        setHourSelectOpen(nextOpen);
        if (nextOpen) {
          setSelectorActive(hourSelectId);
          setMinuteSelectOpen(false);
        }
      },
      [setHourSelectOpen, setMinuteSelectOpen, setSelectorActive, hourSelectId],
    );

    return (
      <Selector.Root
        value={String(hour)}
        onValueChange={v => setHour(Number(v))}
        disabled={isDisabled}
        error={invalid}
        open={hourSelectOpen}
        onOpenChange={handleOpenChange}
      >
        <Selector.Trigger
          ref={composedRefs}
          className={cn('h-10 gap-1 bg-btn-primary px-3 font-normal text-sm', className)}
          aria-label='Hour'
          tabIndex={tabIndex}
          data-registry-id={hourSelectId}
          onFocus={handleFocus}
          onPointerDown={handlePointerDown}
          {...props}
        >
          <Selector.Value>{() => padZero(hour)}</Selector.Value>
          <Selector.Icon>
            <ChevronDown className='size-5' />
          </Selector.Icon>
        </Selector.Trigger>
        <Selector.Content align='end' portal={false} className={cn('gap-y-0.5', contentClassName)}>
          <Selector.Viewport className='max-h-60 gap-y-0.5 p-0.5'>
            {hours.map(h => (
              <Selector.Item key={h} value={String(h)} textValue={padZero(h)} className='px-3 py-2'>
                <Selector.ItemText>{padZero(h)}</Selector.ItemText>
              </Selector.Item>
            ))}
          </Selector.Viewport>
        </Selector.Content>
      </Selector.Root>
    );
  },
);

TimePickerHourSelect.displayName = 'TimePicker.HourSelect';

//
// * Minute Select
//

export type TimePickerMinuteSelectProps = {
  className?: string;
  contentClassName?: string;
} & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

const TimePickerMinuteSelect = forwardRef<HTMLButtonElement, TimePickerMinuteSelectProps>(
  ({ className, contentClassName, disabled, onFocus, onPointerDown, ...props }, ref): ReactElement => {
    const {
      minute,
      setMinute,
      selectorActive,
      setSelectorActive,
      registerSelectorItem,
      unregisterSelectorItem,
      getSelectorItems,
      isSelectorItemDisabled,
      minuteSelectOpen,
      setMinuteSelectOpen,
      setHourSelectOpen,
      minuteSelectId,
      minuteTriggerRef,
      invalid,
    } = useTimePicker();
    const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
    const isDisabled = disabled as boolean | undefined;
    const isActive = selectorActive === minuteSelectId;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const composedRefs = useComposedRefs(ref, triggerRef, minuteTriggerRef);

    useEffect(() => {
      registerSelectorItem(minuteSelectId, isDisabled);
      return () => unregisterSelectorItem(minuteSelectId);
    }, [minuteSelectId, isDisabled, registerSelectorItem, unregisterSelectorItem]);

    const { tabIndex } = useRovingTabIndex({
      id: minuteSelectId,
      active: selectorActive,
      disabled: Boolean(isDisabled),
      getItems: getSelectorItems,
      isItemDisabled: isSelectorItemDisabled,
    });

    useActiveItemFocus({
      ref: triggerRef,
      isActive,
      disabled: Boolean(isDisabled),
    });

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLButtonElement>): void => {
        onFocus?.(event);
        if (isDisabled) return;
        setSelectorActive(minuteSelectId);
        setHourSelectOpen(false);
      },
      [onFocus, isDisabled, setSelectorActive, minuteSelectId, setHourSelectOpen],
    );

    const handlePointerDown = useCallback(
      (event: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerDown']>>[0]): void => {
        onPointerDown?.(event);
        if (isDisabled) return;
        setSelectorActive(minuteSelectId);
        setHourSelectOpen(false);
      },
      [onPointerDown, isDisabled, setSelectorActive, minuteSelectId, setHourSelectOpen],
    );

    const handleOpenChange = useCallback(
      (nextOpen: boolean): void => {
        setMinuteSelectOpen(nextOpen);
        if (nextOpen) {
          setSelectorActive(minuteSelectId);
          setHourSelectOpen(false);
        }
      },
      [setMinuteSelectOpen, setHourSelectOpen, setSelectorActive, minuteSelectId],
    );

    return (
      <Selector.Root
        value={String(minute)}
        onValueChange={v => setMinute(Number(v))}
        disabled={isDisabled}
        error={invalid}
        open={minuteSelectOpen}
        onOpenChange={handleOpenChange}
      >
        <Selector.Trigger
          ref={composedRefs}
          className={cn('h-10 gap-1 bg-btn-primary px-3 font-normal text-sm', className)}
          aria-label='Minute'
          tabIndex={tabIndex}
          data-registry-id={minuteSelectId}
          onFocus={handleFocus}
          onPointerDown={handlePointerDown}
          {...props}
        >
          <Selector.Value>{() => padZero(minute)}</Selector.Value>
          <Selector.Icon>
            <ChevronDown className='size-5' />
          </Selector.Icon>
        </Selector.Trigger>
        <Selector.Content align='end' portal={false} className={cn('gap-y-0.5', contentClassName)}>
          <Selector.Viewport className='max-h-60 gap-y-0.5 p-0.5'>
            {minutes.map(m => (
              <Selector.Item key={m} value={String(m)} textValue={padZero(m)} className='px-3 py-2'>
                <Selector.ItemText>{padZero(m)}</Selector.ItemText>
              </Selector.Item>
            ))}
          </Selector.Viewport>
        </Selector.Content>
      </Selector.Root>
    );
  },
);

TimePickerMinuteSelect.displayName = 'TimePicker.MinuteSelect';

//
// * Timezone Display
//

export type TimePickerTimezoneProps = {
  className?: string;
} & Omit<ComponentPropsWithoutRef<'span'>, 'className' | 'children'>;

const TimePickerTimezone = ({ className, ...props }: TimePickerTimezoneProps): ReactElement | null => {
  const { timezone, timezoneOffset } = useTimePicker();

  if (!timezone) {
    return null;
  }

  return (
    <span className={cn('text-xs underline', className)} {...props}>
      {timezoneOffset}
    </span>
  );
};

TimePickerTimezone.displayName = 'TimePicker.Timezone';

//
// * Hidden Input
//

export type TimePickerHiddenInputProps = {
  className?: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'type' | 'value' | 'defaultValue' | 'onChange'>;

const TimePickerHiddenInput = forwardRef<HTMLInputElement, TimePickerHiddenInputProps>(
  ({ className, name, form, disabled, ...props }, ref): ReactElement => {
    const { value, name: contextName, form: contextForm } = useTimePicker();

    return (
      <input
        ref={ref}
        type='hidden'
        name={name ?? contextName}
        form={form ?? contextForm}
        disabled={disabled}
        value={value ?? ''}
        onChange={() => {
          /* no-op, controlled by TimePicker */
        }}
        className={className}
        {...props}
      />
    );
  },
);

TimePickerHiddenInput.displayName = 'TimePicker.HiddenInput';

//
// * Native Input
//

export type TimePickerNativeInputProps = {
  className?: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'type' | 'value' | 'defaultValue'>;

const TimePickerNativeInput = forwardRef<HTMLInputElement, TimePickerNativeInputProps>(
  (
    { className, onChange, required, 'aria-required': ariaRequiredProp, 'aria-invalid': ariaInvalidProp, ...props },
    ref,
  ): ReactElement => {
    const { value, setValue, timezone, referenceDate, invalid } = useTimePicker();
    const ariaRequired = ariaRequiredProp ?? (required ? true : undefined);
    const ariaInvalid = ariaInvalidProp ?? invalid ?? undefined;

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      onChange?.(event);
      const nextValue = parseNativeInputTime(event.currentTarget.value, timezone, referenceDate);
      setValue(nextValue);
    };

    return (
      <input
        ref={ref}
        type='time'
        className={cn(
          'h-12 w-full rounded-sm border border-bdr-subtle bg-surface-neutral px-4 text-base text-main',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring',
          'focus-visible:ring-offset-3 focus-visible:ring-offset-ring-offset',
          ariaInvalid && 'border-error focus-visible:border-error focus-visible:ring-error',
          className,
        )}
        aria-label={props['aria-label'] ?? 'Select time'}
        aria-required={ariaRequired}
        aria-invalid={ariaInvalid || undefined}
        value={formatNativeInputTime(value, timezone, referenceDate)}
        onChange={handleChange}
        required={required}
        {...props}
      />
    );
  },
);

TimePickerNativeInput.displayName = 'TimePicker.NativeInput';

//
// * Trigger
//

export type TimePickerTriggerProps = {
  asChild?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

const TimePickerTrigger = forwardRef<HTMLButtonElement, TimePickerTriggerProps>(
  ({ asChild, className, children, onClick, onKeyDown, title, disabled, ...props }, ref): ReactElement => {
    const { baseId, open, setOpen, triggerRef, setShouldFocusSelectors, invalid } = useTimePicker();
    const composedRefs = useComposedRefs(ref, triggerRef);
    const triggerId = `${baseId}-trigger`;
    const contentId = `${baseId}-content`;

    const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      setOpen(!open);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if ((event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') && !open) {
        event.preventDefault();
        setShouldFocusSelectors(true);
        setOpen(true);
      }
    };

    if (!asChild && !children) {
      return (
        <IconButton
          ref={composedRefs}
          icon={Clock}
          variant='text'
          size='md'
          title={title ?? 'Open time picker'}
          id={triggerId}
          aria-haspopup='dialog'
          aria-expanded={open}
          aria-controls={open ? contentId : undefined}
          aria-invalid={invalid || undefined}
          data-active={open}
          // Cast: Preact Signalish<boolean> from ComponentPropsWithoutRef vs boolean
          disabled={disabled as boolean | undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn('data-[active=true]:bg-btn-active data-[active=true]:text-alt', className)}
          {...props}
        />
      );
    }

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        // @ts-expect-error - Radix Slot ref type is incompatible with ForwardedRef
        ref={composedRefs}
        id={triggerId}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        aria-invalid={invalid || undefined}
        data-active={open}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn('data-[active=true]:bg-btn-active data-[active=true]:text-alt', className)}
        {...(!asChild && { type: 'button' })}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

TimePickerTrigger.displayName = 'TimePicker.Trigger';

//
// * Content
//

export type TimePickerContentProps = {
  align?: 'start' | 'end';
  /** Optional reference to an anchor element for positioning (defaults to trigger) */
  anchorRef?: RefObject<HTMLElement>;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

const TimePickerContent = forwardRef<HTMLDivElement, TimePickerContentProps>(
  ({ align = 'start', anchorRef, className, children, onKeyDown, ...props }, ref): ReactElement | null => {
    const {
      baseId,
      open,
      setOpen,
      triggerRef,
      setSelectorActive,
      getSelectorItems,
      isSelectorItemDisabled,
      handleSelectorKeyDown,
      hourSelectId,
      minuteSelectId,
      hourTriggerRef,
      minuteTriggerRef,
      setHourSelectOpen,
      setMinuteSelectOpen,
      shouldFocusSelectors,
      setShouldFocusSelectors,
    } = useTimePicker();
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, contentRef);
    const contentId = `${baseId}-content`;

    const position = useFloatingPosition({
      enabled: open,
      anchorRef: anchorRef ?? triggerRef,
      contentRef,
      align,
    });

    useClickOutside({
      enabled: open,
      contentRef,
      excludeRefs: [triggerRef],
      onClose: () => setOpen(false),
    });

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const target = event.target as HTMLElement | null;
      const selectorTrigger = target?.closest(
        `[data-registry-id="${hourSelectId}"], [data-registry-id="${minuteSelectId}"]`,
      );
      if (!selectorTrigger) return;
      setHourSelectOpen(false);
      setMinuteSelectOpen(false);
      handleSelectorKeyDown(event);
    };

    useEffect(() => {
      if (!open || !shouldFocusSelectors) return;
      let canceled = false;
      let attempts = 0;
      const maxAttempts = 10;

      const focusFirstSelector = (): void => {
        if (canceled) return;
        const items = getSelectorItems();
        if (items.length === 0) {
          if (attempts < maxAttempts) {
            attempts += 1;
            requestAnimationFrame(focusFirstSelector);
            return;
          }
          setShouldFocusSelectors(false);
          return;
        }

        const firstEnabled = items.find(id => !isSelectorItemDisabled(id)) ?? items[0];
        if (!firstEnabled) {
          setShouldFocusSelectors(false);
          return;
        }

        setSelectorActive(firstEnabled);
        if (firstEnabled === hourSelectId) {
          hourTriggerRef.current?.focus();
        } else if (firstEnabled === minuteSelectId) {
          minuteTriggerRef.current?.focus();
        } else {
          const element = document.querySelector(`[data-registry-id="${firstEnabled}"]`);
          if (element instanceof HTMLElement) {
            element.focus();
          }
        }
        setShouldFocusSelectors(false);
      };

      requestAnimationFrame(focusFirstSelector);
      return () => {
        canceled = true;
      };
    }, [
      open,
      shouldFocusSelectors,
      getSelectorItems,
      isSelectorItemDisabled,
      setSelectorActive,
      hourSelectId,
      minuteSelectId,
      hourTriggerRef,
      minuteTriggerRef,
      setShouldFocusSelectors,
    ]);

    if (!open) return null;

    const content = children ?? (
      <>
        <TimePickerHourSelect />
        <span className='text-base text-main'>:</span>
        <TimePickerMinuteSelect />
        <TimePickerTimezone />
      </>
    );

    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div
        ref={composedRefs}
        id={contentId}
        role='dialog'
        aria-modal='false'
        data-side={position?.side}
        onKeyDown={handleKeyDown}
        className={cn(
          'fixed flex w-fit items-center gap-1.5 rounded-sm border border-bdr-subtle bg-surface-neutral p-3 shadow-md',
          'data-[side=top]:-mt-2 data-[side=bottom]:mt-2',
          className,
        )}
        style={{
          top: position ? `${position.top}px` : '0',
          left: position?.left !== undefined ? `${position.left}px` : undefined,
          right: position?.right !== undefined ? `${position.right}px` : undefined,
        }}
        {...props}
      >
        {content}
      </div>
    );
  },
);

TimePickerContent.displayName = 'TimePicker.Content';

//
// * Root
//

export type TimePickerRootProps = {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Reference date for timezone offset calculation. Useful for combined date-time pickers where DST may vary. */
  referenceDate?: Date;
  timezone?: boolean;
  name?: string;
  form?: string;
  /** Use native time input. Defaults to true on mobile devices. */
  native?: boolean;
  /** Props passed to the native input when native mode is active. */
  nativeInputProps?: TimePickerNativeInputProps;
  /** Mark the input as invalid for accessibility. */
  invalid?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

const TimePickerRoot = ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  referenceDate: referenceDateProp,
  timezone = false,
  name,
  form,
  native,
  nativeInputProps,
  invalid,
  className,
  children,
  onKeyDown,
  ...props
}: TimePickerRootProps): ReactElement => {
  const baseId = usePrefixedId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hourTriggerRef = useRef<HTMLButtonElement>(null);
  const minuteTriggerRef = useRef<HTMLButtonElement>(null);
  const hourSelectId = `${baseId}-hour-select`;
  const minuteSelectId = `${baseId}-minute-select`;

  // Use provided reference date or fallback to current date
  const referenceDate = useMemo(() => referenceDateProp ?? new Date(), [referenceDateProp]);

  // Compute timezone offset based on reference date (handles DST correctly)
  const timezoneOffset = useMemo(() => getTimezoneOffsetString(referenceDate), [referenceDate]);

  // Mobile detection for native input fallback
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => subscribeToMobileChanges(setIsMobile), []);

  const shouldUseNative = native ?? isMobile;

  // Open state management
  const [open, setOpen] = useControlledState<boolean>(controlledOpen, defaultOpen, onOpenChange);

  const [hourSelectOpen, setHourSelectOpen] = useState(false);
  const [minuteSelectOpen, setMinuteSelectOpen] = useState(false);
  const [shouldFocusSelectors, setShouldFocusSelectors] = useState(false);
  const [selectorActive, setSelectorActive] = useState<string | undefined>(undefined);
  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  const { handleKeyDown: handleSelectorKeyDown } = useKeyboardNavigation({
    getItems,
    isItemDisabled,
    active: selectorActive,
    setActive: setSelectorActive,
    loop: true,
    orientation: 'horizontal',
  });

  useEffect(() => {
    if (!open) {
      setHourSelectOpen(false);
      setMinuteSelectOpen(false);
      setShouldFocusSelectors(false);
      setSelectorActive(undefined);
    }
  }, [open]);

  // Compute default value for uncontrolled mode
  const computedDefault = useMemo((): string | undefined => {
    if (defaultValue === null) return undefined;
    if (defaultValue !== undefined) return defaultValue;
    const now = new Date();
    return formatTimeValue(now.getHours(), now.getMinutes(), timezone, referenceDate);
  }, [defaultValue, timezone, referenceDate]);

  const [value, setValue] = useControlledStateWithNull(controlledValue, computedDefault, onValueChange);

  // Derive hour and minute from value
  const { hour, minute } = useMemo(
    () => parseTimeValue(value, timezone, referenceDate),
    [value, timezone, referenceDate],
  );

  const setHour = useCallback(
    (newHour: number) => {
      setValue(formatTimeValue(newHour, minute, timezone, referenceDate));
    },
    [minute, timezone, referenceDate, setValue],
  );

  const setMinute = useCallback(
    (newMinute: number) => {
      setValue(formatTimeValue(hour, newMinute, timezone, referenceDate));
    },
    [hour, timezone, referenceDate, setValue],
  );

  const contextValue = useMemo<TimePickerContextValue>(
    () => ({
      baseId,
      open,
      setOpen,
      triggerRef,
      hourTriggerRef,
      minuteTriggerRef,
      hourSelectId,
      minuteSelectId,
      selectorActive,
      setSelectorActive,
      registerSelectorItem: registerItem,
      unregisterSelectorItem: unregisterItem,
      getSelectorItems: getItems,
      isSelectorItemDisabled: isItemDisabled,
      handleSelectorKeyDown,
      hourSelectOpen,
      setHourSelectOpen,
      minuteSelectOpen,
      setMinuteSelectOpen,
      shouldFocusSelectors,
      setShouldFocusSelectors,
      referenceDate,
      value: value ?? null,
      setValue,
      hour,
      minute,
      setHour,
      setMinute,
      timezone,
      timezoneOffset,
      name,
      form,
      invalid,
    }),
    [
      baseId,
      open,
      setOpen,
      referenceDate,
      value,
      setValue,
      hour,
      minute,
      setHour,
      setMinute,
      timezone,
      timezoneOffset,
      name,
      form,
      invalid,
      hourSelectId,
      minuteSelectId,
      selectorActive,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      handleSelectorKeyDown,
      hourSelectOpen,
      minuteSelectOpen,
      shouldFocusSelectors,
    ],
  );

  const handleInlineKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const target = event.target as HTMLElement | null;
      const selectorTrigger = target?.closest(
        `[data-registry-id="${hourSelectId}"], [data-registry-id="${minuteSelectId}"]`,
      );
      if (!selectorTrigger) return;
      setHourSelectOpen(false);
      setMinuteSelectOpen(false);
      handleSelectorKeyDown(event);
    },
    [onKeyDown, handleSelectorKeyDown, hourSelectId, minuteSelectId],
  );

  const hasTriggerPattern = Children.toArray(children).some(child => {
    if (!isValidElement(child)) return false;
    const displayName = (child.type as { displayName?: string }).displayName;
    return displayName === 'TimePicker.Trigger' || displayName === 'TimePicker.Content';
  });
  const hasCustomLayout = children != null && !hasTriggerPattern;

  if (hasTriggerPattern) {
    // Render just the provider wrapper - children handle the UI
    return <TimePickerProvider value={contextValue}>{children}</TimePickerProvider>;
  }

  if (hasCustomLayout) {
    return (
      <TimePickerProvider value={contextValue}>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div className={className} onKeyDown={handleInlineKeyDown} {...props}>
          {children}
        </div>
      </TimePickerProvider>
    );
  }

  // Default inline rendering
  const content = (
    <>
      <TimePickerHourSelect />
      <span className='text-base text-main'>:</span>
      <TimePickerMinuteSelect />
      <TimePickerTimezone />
    </>
  );

  return (
    <TimePickerProvider value={contextValue}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className={cn(
          'flex w-fit items-center gap-2 rounded-sm border border-bdr-subtle bg-surface-neutral p-3',
          shouldUseNative && 'border-none bg-transparent p-0',
          className,
        )}
        onKeyDown={shouldUseNative ? onKeyDown : handleInlineKeyDown}
        {...props}
      >
        {shouldUseNative ? <TimePickerNativeInput {...nativeInputProps} /> : content}
      </div>
    </TimePickerProvider>
  );
};

TimePickerRoot.displayName = 'TimePicker.Root';

//

export const TimePicker = Object.assign(TimePickerRoot, {
  Root: TimePickerRoot,
  Trigger: TimePickerTrigger,
  Content: TimePickerContent,
  HourSelect: TimePickerHourSelect,
  MinuteSelect: TimePickerMinuteSelect,
  Timezone: TimePickerTimezone,
  NativeInput: TimePickerNativeInput,
  HiddenInput: TimePickerHiddenInput,
});
