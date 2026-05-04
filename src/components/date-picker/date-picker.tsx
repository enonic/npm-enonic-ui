import { Slot } from '@radix-ui/react-slot';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  forwardRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '@/components/icon-button';
import { Selector } from '@/components/selector';
import {
  useActiveItemFocus,
  useClickOutside,
  useControlledState,
  useFloatingPosition,
  useItemRegistry,
  useKeyboardNavigation,
  usePortalFocusContainer,
  useRovingTabIndex,
} from '@/hooks';
import { type DatePickerContextValue, DatePickerProvider, useDatePicker, usePrefixedId } from '@/providers';
import { cn, getIsMobile, subscribeToMobileChanges, useComposedRefs } from '@/utils';

const DAYS_IN_WEEK = 7;
const DEFAULT_WEEK_START = 1;
const DEFAULT_PAST_YEARS = 100;
const DEFAULT_FUTURE_YEARS = 10;

type DatePickerDayMeta = {
  date: Date;
  outside: boolean;
  disabled: boolean;
};

const getDateKey = (date: Date): string => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const getDayId = (baseId: string, date: Date): string => `${baseId}-day-${getDateKey(date)}`;

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const addDays = (date: Date, amount: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

const addMonths = (date: Date, amount: number): Date => new Date(date.getFullYear(), date.getMonth() + amount, 1);

const isSameMonth = (a: Date, b: Date): boolean => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const endOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const getDayDiff = (start: Date, end: Date): number => {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endUtc - startUtc) / 86_400_000);
};

const normalizeWeekStartsOn = (value: number): number => ((value % DAYS_IN_WEEK) + DAYS_IN_WEEK) % DAYS_IN_WEEK;

const getLocaleWeekStart = (locale?: Intl.LocalesArgument): number | undefined => {
  if (!locale) return undefined;
  if (typeof Intl === 'undefined' || !('Locale' in Intl)) return undefined;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const localeValue = Array.isArray(locale) ? locale[0] : locale;

  try {
    const intlLocale = new Intl.Locale(localeValue as string) as Intl.Locale & {
      getWeekInfo?: () => { firstDay?: number };
    };

    if (typeof intlLocale.getWeekInfo !== 'function') return undefined;

    const firstDay = intlLocale.getWeekInfo().firstDay;
    if (typeof firstDay === 'number') {
      return normalizeWeekStartsOn(firstDay);
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const resolveWeekStartsOn = (value: number | 'locale' | undefined, locale?: Intl.LocalesArgument): number => {
  if (value === 'locale') {
    return getLocaleWeekStart(locale) ?? DEFAULT_WEEK_START;
  }
  return normalizeWeekStartsOn(value ?? DEFAULT_WEEK_START);
};

const getWeekdayLabels = (locale: Intl.LocalesArgument | undefined, weekStartsOn: number): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const baseDate = new Date(2023, 0, 1);
  return Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
    const dayIndex = (weekStartsOn + index) % DAYS_IN_WEEK;
    const label = formatter.format(
      new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + dayIndex),
    );
    const trimmed = label.replace(/\./g, '');
    return Array.from(trimmed).slice(0, 2).join('');
  });
};

const getMonthLabel = (
  locale: Intl.LocalesArgument | undefined,
  month: number,
  monthFormat: 'short' | 'long',
): string => {
  const formatter = new Intl.DateTimeFormat(locale, { month: monthFormat });
  return formatter.format(new Date(2023, month, 1));
};

const getMonthOptions = (
  locale: Intl.LocalesArgument | undefined,
  monthFormat: 'short' | 'long',
): { value: number; label: string }[] => {
  return Array.from({ length: 12 }, (_, month) => ({
    value: month,
    label: getMonthLabel(locale, month, monthFormat),
  }));
};

const resolveYearRange = (minYear?: number, maxYear?: number): [number, number] => {
  const currentYear = new Date().getFullYear();
  const fallbackStart = currentYear - DEFAULT_PAST_YEARS;
  const fallbackEnd = currentYear + DEFAULT_FUTURE_YEARS;

  if (minYear == null && maxYear == null) {
    return [fallbackStart, fallbackEnd];
  }

  if (minYear != null && maxYear == null) {
    const fallbackMax = currentYear + DEFAULT_FUTURE_YEARS;
    return [Math.min(minYear, fallbackMax), Math.max(minYear, fallbackMax)];
  }

  if (minYear == null && maxYear != null) {
    const fallbackMin = currentYear - DEFAULT_PAST_YEARS;
    return [Math.min(fallbackMin, maxYear), Math.max(fallbackMin, maxYear)];
  }

  // @ts-expect-error - both are defined
  return [Math.min(minYear, maxYear), Math.max(minYear, maxYear)];
};

const clampMonthToRange = (date: Date, minYear: number, maxYear: number): Date => {
  const month = date.getMonth();
  if (date.getFullYear() < minYear) {
    return new Date(minYear, month, 1);
  }
  if (date.getFullYear() > maxYear) {
    return new Date(maxYear, month, 1);
  }
  return startOfMonth(date);
};

const getDatePickerDays = (
  month: Date,
  weekStartsOn: number,
  isDateDisabled: (date: Date) => boolean,
): DatePickerDayMeta[] => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const offset = (monthStart.getDay() - weekStartsOn + DAYS_IN_WEEK) % DAYS_IN_WEEK;
  const gridStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - offset);
  const lastWeekday = (weekStartsOn + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK;
  const endOffset = (lastWeekday - monthEnd.getDay() + DAYS_IN_WEEK) % DAYS_IN_WEEK;
  const gridEnd = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + endOffset);
  const totalDays = getDayDiff(gridStart, gridEnd) + 1;

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
    const outside = date.getMonth() !== month.getMonth();
    return {
      date,
      outside,
      disabled: isDateDisabled(date),
    };
  });
};

const getSameDayInMonth = (month: Date, date: Date): Date => {
  const maxDay = endOfMonth(month).getDate();
  const day = Math.min(date.getDate(), maxDay);
  return new Date(month.getFullYear(), month.getMonth(), day);
};

const getDefaultActiveDate = (month: Date, value: Date | null, isDateDisabled: (date: Date) => boolean): Date => {
  if (value && !isDateDisabled(value) && isSameMonth(value, month)) {
    return value;
  }

  const today = new Date();
  if (!isDateDisabled(today) && isSameMonth(today, month)) {
    return today;
  }

  const fallback = value ?? today;
  const next = getSameDayInMonth(month, fallback);
  return isDateDisabled(next) ? startOfMonth(month) : next;
};

const formatInputDate = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseInputDate = (value: string): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
};

//
// * Date Day
//

export type DatePickerDayProps = {
  date: Date;
  outside?: boolean;
  disabled?: boolean;
  active?: boolean;
  selected?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children' | 'type'>;

const DatePickerDay = forwardRef<HTMLButtonElement, DatePickerDayProps>(
  (
    {
      date,
      outside = false,
      disabled = false,
      active = false,
      selected: selectedProp,
      className,
      onClick,
      onMouseDown,
      role,
      tabIndex,
      ...props
    },
    ref,
  ): ReactElement => {
    const { value, selectDate, locale } = useDatePicker();
    const selected = selectedProp ?? (value !== null && isSameDay(value, date));

    const isToday = isSameDay(date, new Date());
    const label = date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const handleMouseDown = (event: MouseEvent<HTMLButtonElement>): void => {
      onMouseDown?.(event);
      if (event.defaultPrevented || disabled) return;
      event.preventDefault();
    };

    const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) return;
      selectDate(date);
    };

    return (
      <button
        data-component='DatePicker.Day'
        ref={ref}
        type='button'
        role={role ?? 'gridcell'}
        className={cn(
          'flex size-7.5 items-center justify-center rounded-sm font-medium text-sm transition-highlight',
          !selected && !disabled && 'data-[active=true]:bg-surface-neutral-hover',
          'after:-inset-x-1.25 after:-inset-y-1 after:-z-10 relative z-0 after:absolute after:rounded-sm after:content-[""]',
          'after:pointer-events-auto',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring',
          'focus-visible:ring-offset-3 focus-visible:ring-offset-ring-offset',
          selected && 'bg-surface-selected text-alt hover:bg-surface-selected-hover',
          !selected && !disabled && 'hover:bg-surface-neutral-hover',
          !disabled && 'cursor-pointer',
          outside && !selected && 'text-subtle',
          isToday && 'font-bold',
          isToday && !selected && 'border-[0.1rem] border-bdr-strong',
          disabled && 'cursor-not-allowed opacity-30',
          className,
        )}
        aria-current={isToday ? 'date' : undefined}
        aria-label={label}
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        data-active={active || undefined}
        disabled={disabled}
        tabIndex={tabIndex ?? -1}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        {...props}
      >
        {date.getDate()}
      </button>
    );
  },
);

DatePickerDay.displayName = 'DatePicker.Day';

//
// * Date Grid
//

export type DatePickerGridProps = {
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

const DatePickerGrid = ({
  className,
  onKeyDown,
  onFocus,
  onBlur,
  tabIndex,
  ...props
}: DatePickerGridProps): ReactElement => {
  const { baseId, month, setMonth, weekStartsOn, showOutsideDays, isDateDisabled, value, selectDate } = useDatePicker();
  const days = useMemo(
    () => getDatePickerDays(month, weekStartsOn, isDateDisabled),
    [month, weekStartsOn, isDateDisabled],
  );
  const weeks = useMemo(() => {
    const rows: DatePickerDayMeta[][] = [];
    for (let index = 0; index < days.length; index += DAYS_IN_WEEK) {
      rows.push(days.slice(index, index + DAYS_IN_WEEK));
    }
    return rows;
  }, [days]);
  const [activeDate, setActiveDate] = useState<Date>(() => getDefaultActiveDate(month, value, isDateDisabled));

  useEffect(() => {
    setActiveDate(prev => {
      if (value && !isDateDisabled(value) && isSameMonth(value, month)) {
        return value;
      }
      if (isSameMonth(prev, month)) {
        return prev;
      }
      const next = getSameDayInMonth(month, prev);
      return isDateDisabled(next) ? startOfMonth(month) : next;
    });
  }, [value, month, isDateDisabled]);

  const moveActive = useCallback(
    (amount: number) => {
      setActiveDate(prev => {
        const next = addDays(prev, amount);
        if (isDateDisabled(next)) {
          return prev;
        }
        if (!isSameMonth(next, month)) {
          setMonth(startOfMonth(next));
        }
        return next;
      });
    },
    [isDateDisabled, month, setMonth],
  );

  const handleFocus = (event: FocusEvent<HTMLDivElement>): void => {
    onFocus?.(event);
    if (event.defaultPrevented) return;
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
    onBlur?.(event);
    if (event.defaultPrevented) return;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveActive(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(-DAYS_IN_WEEK);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveActive(DAYS_IN_WEEK);
        break;
      case ' ':
      case 'Spacebar':
      case 'Enter':
        event.preventDefault();
        if (!isDateDisabled(activeDate)) {
          selectDate(activeDate);
        }
        break;
      default:
        break;
    }
  };

  const activeId = getDayId(baseId, activeDate);

  return (
    // eslint-disable-next-line jsx-a11y/aria-activedescendant-has-tabindex
    <div
      data-component='DatePicker.Grid'
      role='grid'
      aria-label='Date picker'
      tabIndex={tabIndex ?? 0}
      aria-activedescendant={activeId}
      aria-colcount={DAYS_IN_WEEK}
      aria-rowcount={weeks.length}
      className={cn(
        'grid grid-cols-7 place-items-center gap-x-1.5 gap-y-1 rounded-sm outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring/10 focus-visible:ring-offset-2',
        className,
      )}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {weeks.map(week => {
        const firstDay = week[0];
        if (!firstDay) return null;

        return (
          <div key={`week-${getDateKey(firstDay.date)}`} role='row' className='contents'>
            {week.map(day => {
              if (!showOutsideDays && day.outside) {
                return <div key={getDateKey(day.date)} role='gridcell' aria-hidden='true' className='size-7.5' />;
              }

              const selected = value != null && isSameDay(value, day.date);
              const active = isSameDay(activeDate, day.date);

              return (
                <DatePickerDay
                  key={getDateKey(day.date)}
                  id={getDayId(baseId, day.date)}
                  date={day.date}
                  outside={day.outside}
                  disabled={day.disabled}
                  active={active}
                  selected={selected}
                  tabIndex={-1}
                  onPointerMove={() => {
                    if (!day.disabled) {
                      setActiveDate(day.date);
                    }
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

DatePickerGrid.displayName = 'DatePicker.Grid';

//
// * Date Weekdays
//

export type DatePickerWeekdaysProps = {
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

const DatePickerWeekdays = ({ className, ...props }: DatePickerWeekdaysProps): ReactElement => {
  const { locale, weekStartsOn } = useDatePicker();
  const labels = useMemo(() => getWeekdayLabels(locale, weekStartsOn), [locale, weekStartsOn]);

  return (
    <div data-component='DatePicker.Weekdays' className={cn('grid grid-cols-7 gap-1', className)} {...props}>
      {labels.map(label => (
        <div key={label} className='flex items-center justify-center font-semibold text-subtle text-xs'>
          {label}
        </div>
      ))}
    </div>
  );
};

DatePickerWeekdays.displayName = 'DatePicker.Weekdays';

//
// * Date Month Select
//

export type DatePickerMonthSelectProps = {
  className?: string;
  contentClassName?: string;
} & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

const DatePickerMonthSelect = forwardRef<HTMLButtonElement, DatePickerMonthSelectProps>(
  ({ className, contentClassName, disabled, onFocus, onPointerDown, ...props }, ref): ReactElement => {
    const {
      month,
      setMonth,
      locale,
      monthFormat,
      headerActive,
      setHeaderActive,
      registerHeaderItem,
      unregisterHeaderItem,
      getHeaderItems,
      isHeaderItemDisabled,
      monthSelectOpen,
      setMonthSelectOpen,
      setYearSelectOpen,
      monthSelectId,
    } = useDatePicker();
    const options = useMemo(() => getMonthOptions(locale, monthFormat), [locale, monthFormat]);
    const isDisabled = disabled as boolean | undefined;
    const isActive = headerActive === monthSelectId;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const composedRefs = useComposedRefs(ref, triggerRef);

    const handleValueChange = useCallback(
      (value: string) => {
        setMonth(new Date(month.getFullYear(), Number(value), 1));
      },
      [month, setMonth],
    );

    useEffect(() => {
      registerHeaderItem(monthSelectId, isDisabled);
      return () => unregisterHeaderItem(monthSelectId);
    }, [monthSelectId, isDisabled, registerHeaderItem, unregisterHeaderItem]);

    const { tabIndex } = useRovingTabIndex({
      id: monthSelectId,
      active: headerActive,
      disabled: Boolean(isDisabled),
      getItems: getHeaderItems,
      isItemDisabled: isHeaderItemDisabled,
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
        setHeaderActive(monthSelectId);
        setYearSelectOpen(false);
      },
      [onFocus, isDisabled, setHeaderActive, monthSelectId, setYearSelectOpen],
    );

    const handlePointerDown = useCallback(
      (event: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerDown']>>[0]): void => {
        onPointerDown?.(event);
        if (isDisabled) return;
        setHeaderActive(monthSelectId);
        setYearSelectOpen(false);
      },
      [onPointerDown, isDisabled, setHeaderActive, monthSelectId, setYearSelectOpen],
    );

    const handleOpenChange = useCallback(
      (nextOpen: boolean): void => {
        setMonthSelectOpen(nextOpen);
        if (nextOpen) {
          setHeaderActive(monthSelectId);
          setYearSelectOpen(false);
        }
      },
      [setMonthSelectOpen, setHeaderActive, monthSelectId, setYearSelectOpen],
    );

    return (
      <Selector.Root
        value={String(month.getMonth())}
        onValueChange={handleValueChange}
        disabled={isDisabled}
        open={monthSelectOpen}
        onOpenChange={handleOpenChange}
      >
        <Selector.Trigger
          data-component='DatePicker.MonthSelect'
          ref={composedRefs}
          className={cn(
            'h-10 gap-1 border-bdr-subtle bg-btn-primary px-3 font-normal text-sm hover:bg-btn-primary-hover',
            className,
          )}
          aria-label='Month'
          tabIndex={tabIndex}
          data-registry-id={monthSelectId}
          onFocus={handleFocus}
          onPointerDown={handlePointerDown}
          {...props}
        >
          <Selector.Value>
            {() => options[month.getMonth()]?.label ?? getMonthLabel(locale, month.getMonth(), monthFormat)}
          </Selector.Value>
          <Selector.Icon>
            <ChevronDown className='size-5' />
          </Selector.Icon>
        </Selector.Trigger>
        <Selector.Content align='end' portal={false} className={cn('gap-y-0.5', contentClassName)}>
          <Selector.Viewport className='max-h-60 gap-y-0.5 p-0.5'>
            {options.map(option => (
              <Selector.Item
                key={option.value}
                value={String(option.value)}
                textValue={option.label}
                className='px-3 py-2'
              >
                <Selector.ItemText>{option.label}</Selector.ItemText>
              </Selector.Item>
            ))}
          </Selector.Viewport>
        </Selector.Content>
      </Selector.Root>
    );
  },
);

DatePickerMonthSelect.displayName = 'DatePicker.MonthSelect';

//
// * Date Year Select
//

export type DatePickerYearSelectProps = {
  className?: string;
  contentClassName?: string;
} & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

const DatePickerYearSelect = forwardRef<HTMLButtonElement, DatePickerYearSelectProps>(
  ({ className, contentClassName, disabled, onFocus, onPointerDown, ...props }, ref): ReactElement => {
    const {
      month,
      minYear,
      maxYear,
      setMonth,
      headerActive,
      setHeaderActive,
      registerHeaderItem,
      unregisterHeaderItem,
      getHeaderItems,
      isHeaderItemDisabled,
      yearSelectOpen,
      setYearSelectOpen,
      setMonthSelectOpen,
      yearSelectId,
    } = useDatePicker();
    const years = useMemo(
      () => Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index),
      [minYear, maxYear],
    );
    const isDisabled = disabled as boolean | undefined;
    const isActive = headerActive === yearSelectId;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const composedRefs = useComposedRefs(ref, triggerRef);

    const handleValueChange = useCallback(
      (value: string) => {
        setMonth(new Date(Number(value), month.getMonth(), 1));
      },
      [month, setMonth],
    );

    useEffect(() => {
      registerHeaderItem(yearSelectId, isDisabled);
      return () => unregisterHeaderItem(yearSelectId);
    }, [yearSelectId, isDisabled, registerHeaderItem, unregisterHeaderItem]);

    const { tabIndex } = useRovingTabIndex({
      id: yearSelectId,
      active: headerActive,
      disabled: Boolean(isDisabled),
      getItems: getHeaderItems,
      isItemDisabled: isHeaderItemDisabled,
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
        setHeaderActive(yearSelectId);
        setMonthSelectOpen(false);
      },
      [onFocus, isDisabled, setHeaderActive, yearSelectId, setMonthSelectOpen],
    );

    const handlePointerDown = useCallback(
      (event: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerDown']>>[0]): void => {
        onPointerDown?.(event);
        if (isDisabled) return;
        setHeaderActive(yearSelectId);
        setMonthSelectOpen(false);
      },
      [onPointerDown, isDisabled, setHeaderActive, yearSelectId, setMonthSelectOpen],
    );

    const handleOpenChange = useCallback(
      (nextOpen: boolean): void => {
        setYearSelectOpen(nextOpen);
        if (nextOpen) {
          setHeaderActive(yearSelectId);
          setMonthSelectOpen(false);
        }
      },
      [setYearSelectOpen, setHeaderActive, yearSelectId, setMonthSelectOpen],
    );

    return (
      <Selector.Root
        value={String(month.getFullYear())}
        onValueChange={handleValueChange}
        disabled={isDisabled}
        open={yearSelectOpen}
        onOpenChange={handleOpenChange}
      >
        <Selector.Trigger
          data-component='DatePicker.YearSelect'
          ref={composedRefs}
          className={cn(
            'h-10 gap-1 border-bdr-subtle bg-btn-primary px-3 font-normal text-sm hover:bg-btn-primary-hover',
            className,
          )}
          aria-label='Year'
          tabIndex={tabIndex}
          data-registry-id={yearSelectId}
          onFocus={handleFocus}
          onPointerDown={handlePointerDown}
          {...props}
        >
          <Selector.Value>{() => month.getFullYear()}</Selector.Value>
          <Selector.Icon>
            <ChevronDown className='size-5' />
          </Selector.Icon>
        </Selector.Trigger>
        <Selector.Content align='end' portal={false} className={cn('gap-y-0.5', contentClassName)}>
          <Selector.Viewport className='max-h-60 gap-y-0.5 p-0.5'>
            {years.map(year => (
              <Selector.Item key={year} value={String(year)} textValue={String(year)} className='px-3 py-2'>
                <Selector.ItemText>{year}</Selector.ItemText>
              </Selector.Item>
            ))}
          </Selector.Viewport>
        </Selector.Content>
      </Selector.Root>
    );
  },
);

DatePickerYearSelect.displayName = 'DatePicker.YearSelect';

//
// * Date Header
//

export type DatePickerHeaderProps = {
  showNavigation?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

const DatePickerHeader = ({
  showNavigation: showNavigationProp,
  className,
  ...props
}: DatePickerHeaderProps): ReactElement => {
  const {
    month,
    minYear,
    maxYear,
    setMonth,
    showNavigation,
    headerActive,
    setHeaderActive,
    registerHeaderItem,
    unregisterHeaderItem,
    getHeaderItems,
    isHeaderItemDisabled,
    setMonthSelectOpen,
    setYearSelectOpen,
    prevButtonId,
    nextButtonId,
  } = useDatePicker();
  const canGoPrev = month.getFullYear() > minYear || (month.getFullYear() === minYear && month.getMonth() > 0);
  const canGoNext = month.getFullYear() < maxYear || (month.getFullYear() === maxYear && month.getMonth() < 11);
  const shouldShowNavigation = showNavigationProp ?? showNavigation;
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const handlePrev = (): void => {
    if (!canGoPrev) return;
    setMonth(addMonths(month, -1));
  };

  const handleNext = (): void => {
    if (!canGoNext) return;
    setMonth(addMonths(month, 1));
  };

  useEffect(() => {
    if (!shouldShowNavigation) return;
    registerHeaderItem(prevButtonId, !canGoPrev);
    registerHeaderItem(nextButtonId, !canGoNext);
    return () => {
      unregisterHeaderItem(prevButtonId);
      unregisterHeaderItem(nextButtonId);
    };
  }, [
    shouldShowNavigation,
    registerHeaderItem,
    unregisterHeaderItem,
    prevButtonId,
    nextButtonId,
    canGoPrev,
    canGoNext,
  ]);

  const { tabIndex: prevTabIndex } = useRovingTabIndex({
    id: prevButtonId,
    active: headerActive,
    disabled: !canGoPrev,
    getItems: getHeaderItems,
    isItemDisabled: isHeaderItemDisabled,
  });

  const { tabIndex: nextTabIndex } = useRovingTabIndex({
    id: nextButtonId,
    active: headerActive,
    disabled: !canGoNext,
    getItems: getHeaderItems,
    isItemDisabled: isHeaderItemDisabled,
  });

  useActiveItemFocus({
    ref: prevButtonRef,
    isActive: headerActive === prevButtonId,
    disabled: !canGoPrev,
  });

  useActiveItemFocus({
    ref: nextButtonRef,
    isActive: headerActive === nextButtonId,
    disabled: !canGoNext,
  });

  const handlePrevFocus = useCallback(
    (_event: React.FocusEvent<HTMLButtonElement>): void => {
      if (!shouldShowNavigation || !canGoPrev) return;
      setHeaderActive(prevButtonId);
      setMonthSelectOpen(false);
      setYearSelectOpen(false);
    },
    [shouldShowNavigation, canGoPrev, setHeaderActive, prevButtonId, setMonthSelectOpen, setYearSelectOpen],
  );

  const handleNextFocus = useCallback(
    (_event: React.FocusEvent<HTMLButtonElement>): void => {
      if (!shouldShowNavigation || !canGoNext) return;
      setHeaderActive(nextButtonId);
      setMonthSelectOpen(false);
      setYearSelectOpen(false);
    },
    [shouldShowNavigation, canGoNext, setHeaderActive, nextButtonId, setMonthSelectOpen, setYearSelectOpen],
  );

  const handlePrevPointerDown = useCallback(
    (_event: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerDown']>>[0]): void => {
      if (!shouldShowNavigation || !canGoPrev) return;
      setHeaderActive(prevButtonId);
      setMonthSelectOpen(false);
      setYearSelectOpen(false);
    },
    [shouldShowNavigation, canGoPrev, setHeaderActive, prevButtonId, setMonthSelectOpen, setYearSelectOpen],
  );

  const handleNextPointerDown = useCallback(
    (_event: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerDown']>>[0]): void => {
      if (!shouldShowNavigation || !canGoNext) return;
      setHeaderActive(nextButtonId);
      setMonthSelectOpen(false);
      setYearSelectOpen(false);
    },
    [shouldShowNavigation, canGoNext, setHeaderActive, nextButtonId, setMonthSelectOpen, setYearSelectOpen],
  );

  return (
    <div data-component='DatePicker.Header' className={cn('flex items-center gap-2', className)} {...props}>
      {shouldShowNavigation ? (
        <IconButton
          ref={prevButtonRef}
          tabIndex={prevTabIndex}
          data-registry-id={prevButtonId}
          icon={ChevronLeft}
          variant='text'
          size='md'
          title='Previous month'
          onClick={handlePrev}
          onFocus={handlePrevFocus}
          onPointerDown={handlePrevPointerDown}
          disabled={!canGoPrev}
        />
      ) : null}
      <div className='grid flex-1 grid-cols-2 gap-3'>
        <DatePickerMonthSelect />
        <DatePickerYearSelect />
      </div>
      {shouldShowNavigation ? (
        <IconButton
          ref={nextButtonRef}
          tabIndex={nextTabIndex}
          data-registry-id={nextButtonId}
          icon={ChevronRight}
          variant='text'
          size='md'
          title='Next month'
          onClick={handleNext}
          onFocus={handleNextFocus}
          onPointerDown={handleNextPointerDown}
          disabled={!canGoNext}
        />
      ) : null}
    </div>
  );
};

DatePickerHeader.displayName = 'DatePicker.Header';

//
// * Date Content
//

export type DatePickerContentProps = {
  align?: 'start' | 'end';
  /** Optional reference to an anchor element for positioning (defaults to trigger) */
  anchorRef?: RefObject<HTMLElement>;
  forceMount?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

const DatePickerContent = forwardRef<HTMLDivElement, DatePickerContentProps>(
  ({ align = 'start', anchorRef, forceMount, className, children, onKeyDown, ...props }, ref): ReactElement | null => {
    const {
      baseId,
      open,
      setOpen,
      triggerRef,
      focusOnCloseRef,
      handleHeaderKeyDown,
      monthSelectId,
      yearSelectId,
      prevButtonId,
      nextButtonId,
      setMonthSelectOpen,
      setYearSelectOpen,
    } = useDatePicker();
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, contentRef);
    const [isPortalMode, setIsPortalMode] = useState(false);
    const position = useFloatingPosition({ enabled: open, anchorRef: anchorRef ?? triggerRef, contentRef, align });
    const contentId = `${baseId}-content`;
    const triggerId = `${baseId}-trigger`;
    const labelledBy = triggerRef.current ? triggerId : undefined;

    // Detect portal mode
    useLayoutEffect(() => {
      if (!open || !contentRef.current) return;
      setIsPortalMode(contentRef.current.parentElement === document.body);
    }, [open]);

    // Register with parent focus trap (e.g., Dialog) when in portal mode
    usePortalFocusContainer(contentRef, isPortalMode);

    useClickOutside({
      enabled: open,
      contentRef,
      excludeRefs: [triggerRef],
      onClose: () => setOpen(false),
    });

    useEffect(() => {
      if (!open) return;
      if (!contentRef.current) return;
      const grid = contentRef.current.querySelector('[role="grid"]');
      if (grid instanceof HTMLElement) {
        grid.focus();
      }
    }, [open]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        requestAnimationFrame(() => {
          const focusTarget = focusOnCloseRef?.current ?? triggerRef.current;
          focusTarget?.focus();
        });
        return;
      }
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const target = event.target as HTMLElement | null;
      const headerItem = target?.closest(
        `[data-registry-id="${prevButtonId}"], [data-registry-id="${monthSelectId}"], [data-registry-id="${yearSelectId}"], [data-registry-id="${nextButtonId}"]`,
      );
      if (!headerItem) return;
      setMonthSelectOpen(false);
      setYearSelectOpen(false);
      handleHeaderKeyDown(event);
    };

    if (!forceMount && !open) {
      return null;
    }

    const content = children ?? (
      <>
        <DatePickerHeader />
        <div className='flex flex-col gap-2'>
          <DatePickerWeekdays />
          <DatePickerGrid />
        </div>
      </>
    );

    const { side, top, left, right } = position ?? { side: 'bottom' };
    const positionStyle: Pick<CSSProperties, 'top' | 'left' | 'right'> = { top, left, right };

    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div
        data-component='DatePicker.Content'
        ref={composedRefs}
        id={contentId}
        role='dialog'
        aria-label='Date picker'
        aria-labelledby={labelledBy}
        data-state={open ? 'open' : 'closed'}
        data-side={side}
        className={cn(
          'fixed z-40 flex w-fit flex-col gap-4 rounded-sm border border-bdr-subtle bg-surface-neutral p-5',
          'data-[side=top]:-mt-2 data-[side=bottom]:mt-2',
          'shadow-lg outline-none',
          'data-[state=closed]:animate-out data-[state=open]:animate-in',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          !position && 'pointer-events-none opacity-0',
          className,
        )}
        style={{ ...positionStyle }}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {content}
      </div>
    );
  },
);

DatePickerContent.displayName = 'DatePicker.Content';

//
// * Date Trigger
//

export type DatePickerTriggerProps = {
  asChild?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

const DatePickerTrigger = forwardRef<HTMLButtonElement, DatePickerTriggerProps>(
  ({ asChild, className, children, onClick, onKeyDown, title, disabled, ...props }, ref): ReactElement => {
    const { baseId, open, setOpen, triggerRef } = useDatePicker();
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
      if (event.key === 'ArrowDown' && !open) {
        event.preventDefault();
        setOpen(true);
      }
    };

    if (!asChild && !children) {
      return (
        <IconButton
          data-component='DatePicker.Trigger'
          ref={composedRefs}
          icon={CalendarIcon}
          variant='text'
          size='md'
          title={title ?? 'Open date picker'}
          id={triggerId}
          aria-haspopup='dialog'
          aria-expanded={open}
          aria-controls={open ? contentId : undefined}
          data-active={open}
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
        data-component='DatePicker.Trigger'
        // @ts-expect-error - Radix Slot ref type is incompatible with ForwardedRef
        ref={composedRefs}
        id={triggerId}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
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

DatePickerTrigger.displayName = 'DatePicker.Trigger';

//
// * Date Portal
//

export type DatePickerPortalProps = {
  container?: HTMLElement | null;
  forceMount?: boolean;
  children?: ReactNode;
};

const DatePickerPortal = ({ container, forceMount, children }: DatePickerPortalProps): ReactElement | null => {
  const { open } = useDatePicker();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || (!forceMount && !open)) {
    return null;
  }

  return createPortal(children, container ?? document.body);
};

DatePickerPortal.displayName = 'DatePicker.Portal';

//
// * Date Native Input
//

export type DatePickerNativeInputProps = {
  className?: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'type' | 'value' | 'defaultValue'>;

const DatePickerNativeInput = forwardRef<HTMLInputElement, DatePickerNativeInputProps>(
  ({ className, onChange, required, 'aria-required': ariaRequiredProp, ...props }, ref): ReactElement => {
    const { value, selectDate, setValue, minYear, maxYear } = useDatePicker();
    const ariaRequired = ariaRequiredProp ?? (required ? true : undefined);

    const min = props.min ?? `${minYear}-01-01`;
    const max = props.max ?? `${maxYear}-12-31`;

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      onChange?.(event);
      const nextValue = parseInputDate(event.currentTarget.value);
      if (!nextValue) {
        setValue(null);
        return;
      }
      selectDate(nextValue);
    };

    return (
      <input
        data-component='DatePicker.NativeInput'
        ref={ref}
        type='date'
        className={cn(
          'h-12 w-full rounded-sm border border-bdr-subtle bg-surface-neutral px-4 text-base text-main',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring',
          'focus-visible:ring-offset-3 focus-visible:ring-offset-ring-offset',
          className,
        )}
        aria-label={props['aria-label'] ?? 'Select date'}
        aria-required={ariaRequired}
        value={formatInputDate(value)}
        min={min}
        max={max}
        onChange={handleChange}
        required={required}
        {...props}
      />
    );
  },
);

DatePickerNativeInput.displayName = 'DatePicker.NativeInput';

//
// * Date Hidden Input
//

export type DatePickerHiddenInputProps = {
  className?: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'type' | 'value' | 'defaultValue' | 'onChange'>;

const DatePickerHiddenInput = forwardRef<HTMLInputElement, DatePickerHiddenInputProps>(
  ({ className, name, form, disabled, ...props }, ref): ReactElement => {
    const { value, name: contextName, form: contextForm } = useDatePicker();

    return (
      <input
        data-component='DatePicker.HiddenInput'
        ref={ref}
        type='hidden'
        name={name ?? contextName}
        form={form ?? contextForm}
        disabled={disabled}
        value={formatInputDate(value)}
        onChange={() => {
          /* no-op, controlled by DatePicker */
        }}
        className={className}
        {...props}
      />
    );
  },
);

DatePickerHiddenInput.displayName = 'DatePicker.HiddenInput';

//
// * Date Root
//

export type DatePickerRootProps = {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  focusOnCloseRef?: RefObject<HTMLElement>;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  minYear?: number;
  maxYear?: number;
  weekStartsOn?: number | 'locale';
  showOutsideDays?: boolean;
  showNavigation?: boolean;
  monthFormat?: 'short' | 'long';
  name?: string;
  form?: string;
  locale?: Intl.LocalesArgument;
  native?: boolean;
  closeOnSelect?: boolean;
  nativeInputProps?: DatePickerNativeInputProps;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

const DatePickerRoot = ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  focusOnCloseRef,
  month: controlledMonth,
  defaultMonth,
  onMonthChange,
  minYear,
  maxYear,
  weekStartsOn = 1,
  showOutsideDays = true,
  showNavigation = true,
  monthFormat = 'short',
  name,
  form,
  locale,
  native,
  closeOnSelect = true,
  nativeInputProps,
  className,
  children,
  onKeyDown,
  ...props
}: DatePickerRootProps): ReactElement => {
  const baseId = usePrefixedId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const monthSelectId = `${baseId}-month-select`;
  const yearSelectId = `${baseId}-year-select`;
  const prevButtonId = `${baseId}-prev-button`;
  const nextButtonId = `${baseId}-next-button`;
  const [rangeStart, rangeEnd] = resolveYearRange(minYear, maxYear);
  const [value, setValue] = useControlledState<Date | null>(controlledValue, defaultValue ?? null, onValueChange);
  const initialMonth = clampMonthToRange(startOfMonth(defaultMonth ?? value ?? new Date()), rangeStart, rangeEnd);
  const [month, setMonth] = useControlledState<Date>(controlledMonth, initialMonth, onMonthChange);
  const isMonthControlled = controlledMonth !== undefined;
  const clampedMonth = clampMonthToRange(month, rangeStart, rangeEnd);
  const [open, setOpen] = useControlledState<boolean>(controlledOpen, defaultOpen, onOpenChange);
  const resolvedWeekStartsOn = useMemo(() => resolveWeekStartsOn(weekStartsOn, locale), [weekStartsOn, locale]);
  const [monthSelectOpen, setMonthSelectOpen] = useState(false);
  const [yearSelectOpen, setYearSelectOpen] = useState(false);
  const [headerActive, setHeaderActive] = useState<string | undefined>(undefined);
  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  const { handleKeyDown: handleHeaderKeyDown } = useKeyboardNavigation({
    getItems,
    isItemDisabled,
    active: headerActive,
    setActive: setHeaderActive,
    loop: true,
    orientation: 'horizontal',
  });

  useEffect(() => {
    if (!isMonthControlled && value) {
      setMonth(clampMonthToRange(startOfMonth(value), rangeStart, rangeEnd));
    }
  }, [isMonthControlled, value, rangeStart, rangeEnd, setMonth]);

  useEffect(() => {
    if (!open) {
      setMonthSelectOpen(false);
      setYearSelectOpen(false);
      setHeaderActive(undefined);
    }
  }, [open]);

  const isDateDisabled = useCallback(
    (date: Date) => date.getFullYear() < rangeStart || date.getFullYear() > rangeEnd,
    [rangeStart, rangeEnd],
  );

  const selectDate = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;
      setValue(date);
      setMonth(clampMonthToRange(startOfMonth(date), rangeStart, rangeEnd));
      if (closeOnSelect) {
        setOpen(false);
        if (open) {
          requestAnimationFrame(() => {
            const focusTarget = focusOnCloseRef?.current ?? triggerRef.current;
            focusTarget?.focus();
          });
        }
      }
    },
    [isDateDisabled, setValue, setMonth, rangeStart, rangeEnd, closeOnSelect, setOpen, open, focusOnCloseRef],
  );

  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => subscribeToMobileChanges(setIsMobile), []);

  const shouldUseNative = native ?? isMobile;

  const contextValue = useMemo<DatePickerContextValue>(
    () => ({
      baseId,
      open,
      setOpen,
      triggerRef,
      focusOnCloseRef,
      monthSelectId,
      yearSelectId,
      prevButtonId,
      nextButtonId,
      headerActive,
      setHeaderActive,
      registerHeaderItem: registerItem,
      unregisterHeaderItem: unregisterItem,
      getHeaderItems: getItems,
      isHeaderItemDisabled: isItemDisabled,
      handleHeaderKeyDown,
      monthSelectOpen,
      setMonthSelectOpen,
      yearSelectOpen,
      setYearSelectOpen,
      name,
      form,
      value,
      setValue,
      month: clampedMonth,
      setMonth,
      selectDate,
      locale,
      weekStartsOn: resolvedWeekStartsOn,
      minYear: rangeStart,
      maxYear: rangeEnd,
      showOutsideDays,
      showNavigation,
      monthFormat,
      isDateDisabled,
    }),
    [
      baseId,
      open,
      setOpen,
      value,
      setValue,
      clampedMonth,
      setMonth,
      selectDate,
      locale,
      resolvedWeekStartsOn,
      rangeStart,
      rangeEnd,
      showOutsideDays,
      showNavigation,
      monthFormat,
      isDateDisabled,
      name,
      form,
      focusOnCloseRef,
      monthSelectId,
      yearSelectId,
      prevButtonId,
      nextButtonId,
      headerActive,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      handleHeaderKeyDown,
      monthSelectOpen,
      yearSelectOpen,
    ],
  );

  const handleInlineKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const target = event.target as HTMLElement | null;
      const headerItem = target?.closest(
        `[data-registry-id="${prevButtonId}"], [data-registry-id="${monthSelectId}"], [data-registry-id="${yearSelectId}"], [data-registry-id="${nextButtonId}"]`,
      );
      if (!headerItem) return;
      setMonthSelectOpen(false);
      setYearSelectOpen(false);
      handleHeaderKeyDown(event);
    },
    [onKeyDown, handleHeaderKeyDown, prevButtonId, monthSelectId, yearSelectId, nextButtonId],
  );

  const content = children ?? (
    <>
      <DatePickerHeader />
      <div className='flex flex-col gap-2'>
        <DatePickerWeekdays />
        <DatePickerGrid />
      </div>
    </>
  );

  return (
    <DatePickerProvider value={contextValue}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        data-component='DatePicker.Root'
        className={
          children
            ? className
            : cn('flex w-fit flex-col gap-3 rounded-sm border border-bdr-subtle bg-surface-neutral p-3', className)
        }
        onKeyDown={shouldUseNative ? onKeyDown : handleInlineKeyDown}
        {...props}
      >
        {shouldUseNative ? <DatePickerNativeInput {...nativeInputProps} /> : content}
      </div>
    </DatePickerProvider>
  );
};

DatePickerRoot.displayName = 'DatePicker';

//

export const DatePicker = Object.assign(DatePickerRoot, {
  Root: DatePickerRoot,
  Trigger: DatePickerTrigger,
  Portal: DatePickerPortal,
  Content: DatePickerContent,
  Header: DatePickerHeader,
  MonthSelect: DatePickerMonthSelect,
  YearSelect: DatePickerYearSelect,
  Weekdays: DatePickerWeekdays,
  Grid: DatePickerGrid,
  Day: DatePickerDay,
  NativeInput: DatePickerNativeInput,
  HiddenInput: DatePickerHiddenInput,
});
