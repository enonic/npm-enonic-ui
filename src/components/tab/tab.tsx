import { OctagonAlert } from 'lucide-react';
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

import { useControlledState, useItemRegistry, useKeyboardNavigation, useRovingTabIndex, useSyncValue } from '@/hooks';
import { type TabContextValue, TabProvider, usePrefixedId, useTab } from '@/providers';
import type { LucideIcon } from '@/types';
import { cn, useComposedRefs } from '@/utils';

//
// * Tab.Root
//

export type TabRootProps = {
  /** Controlled value */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** When 'automatic', tabs activate on focus. When 'manual', tabs activate on Enter/Space */
  activationMode?: 'automatic' | 'manual';
  /** Content */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue'>;

const TabRoot = forwardRef<HTMLDivElement, TabRootProps>((props, ref): ReactElement => {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    activationMode = 'automatic',
    children,
    className,
    ...restProps
  } = props;

  const baseId = usePrefixedId(undefined, 'tab');

  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  const [value, setValue] = useControlledState<string>(controlledValue, defaultValue ?? '', onValueChange);
  const [active, setActive] = useState<string | undefined>(value || undefined);

  useSyncValue(value, setActive);

  const handleValueChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      setActive(newValue);
    },
    [setValue],
  );

  const contextValue: TabContextValue = useMemo(
    () => ({
      baseId,
      value,
      onValueChange: handleValueChange,
      activationMode,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      active,
      setActive,
    }),
    [baseId, value, handleValueChange, activationMode, registerItem, unregisterItem, getItems, isItemDisabled, active],
  );

  return (
    <TabProvider value={contextValue}>
      <div ref={ref} className={cn('flex flex-col', className)} {...restProps}>
        {children}
      </div>
    </TabProvider>
  );
});
TabRoot.displayName = 'Tab.Root';

//
// * Tab.List
//

export type TabListProps = {
  /** Whether keyboard navigation loops */
  loop?: boolean;
  /** Content (Tab.Trigger components) */
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const TabList = forwardRef<HTMLDivElement, TabListProps>((props, ref): ReactElement => {
  const { loop = true, children, className, ...restProps } = props;

  const context = useTab();
  const { baseId, activationMode, getItems, isItemDisabled, active, setActive, onValueChange } = context;

  const containerRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, containerRef);

  const handleSelect = useCallback(
    (id: string) => {
      if (activationMode === 'manual') {
        onValueChange(id);
      }
    },
    [activationMode, onValueChange],
  );

  const { handleKeyDown } = useKeyboardNavigation({
    getItems,
    isItemDisabled,
    active,
    setActive: id => {
      setActive(id);
      if (activationMode === 'automatic' && id) {
        onValueChange(id);
      }
    },
    loop,
    orientation: 'horizontal',
    onSelect: handleSelect,
  });

  return (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus -- Keyboard navigation is handled via roving tabindex on child items
    <div
      ref={composedRef}
      role='tablist'
      id={`${baseId}-list`}
      className={cn('flex w-full gap-1.5', className)}
      onKeyDown={handleKeyDown}
      {...restProps}
    >
      {children}
    </div>
  );
});
TabList.displayName = 'Tab.List';

//
// * Tab.Trigger
//

export type TabTriggerProps = {
  /** Value that identifies this tab */
  value: string;
  /** Whether this tab is disabled */
  disabled?: boolean;
  /** Content */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'value'>;

const TabTrigger = forwardRef<HTMLButtonElement, TabTriggerProps>(
  ({ value, disabled = false, children, className, ...props }, ref): ReactElement => {
    const context = useTab();
    const {
      baseId,
      value: selectedValue,
      onValueChange,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      active,
      setActive,
    } = context;

    const triggerRef = useRef<HTMLButtonElement>(null);
    const composedRef = useComposedRefs(ref, triggerRef);

    const triggerId = `${baseId}-trigger-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    useEffect(() => {
      registerItem(value, disabled);
      return () => unregisterItem(value);
    }, [value, disabled, registerItem, unregisterItem]);

    const isSelected = selectedValue === value;

    const handleClick = useCallback(() => {
      if (!disabled) {
        onValueChange(value);
        setActive(value);
      }
    }, [disabled, onValueChange, value, setActive]);

    const { tabIndex } = useRovingTabIndex({
      id: value,
      active,
      disabled,
      getItems,
      isItemDisabled,
    });

    useEffect(() => {
      if (active === value && triggerRef.current) {
        if (document.activeElement !== triggerRef.current) {
          triggerRef.current.focus();
        }
      }
    }, [active, value]);

    return (
      <button
        ref={composedRef}
        type='button'
        role='tab'
        id={triggerId}
        aria-selected={isSelected}
        aria-controls={panelId}
        data-state={isSelected ? 'active' : 'inactive'}
        data-disabled={disabled || undefined}
        disabled={disabled}
        tabIndex={tabIndex}
        onClick={handleClick}
        className={cn(
          'relative inline-flex h-10 flex-1 items-center justify-center gap-1.5',
          'min-w-0 overflow-hidden whitespace-nowrap',
          'py-2.5 text-sm',
          'text-subtle transition-highlight',
          'after:absolute after:inset-x-0 after:bottom-0',
          'after:h-px after:bg-bdr-soft after:transition-all',
          'hover:text-default',
          'data-[state=active]:font-semibold data-[state=active]:text-default',
          'data-[state=active]:after:h-0.5 data-[state=active]:after:bg-bdr-strong',
          'data-disabled:pointer-events-none data-disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-3 focus-visible:ring-offset-ring-offset',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
TabTrigger.displayName = 'Tab.Trigger';

//
// * Tab.DefaultTrigger
//

export type TabDefaultTriggerProps = {
  /** Value that identifies this tab */
  value: string;
  /** Whether this tab is disabled */
  disabled?: boolean;
  /** Icon displayed on the left */
  icon?: LucideIcon;
  /** Count displayed as badge on the right */
  count?: string | number;
  /** Shows error indicator on the right (takes precedence over count) */
  error?: boolean;
  /** Label content */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'value'>;

const TabDefaultTrigger = forwardRef<HTMLButtonElement, TabDefaultTriggerProps>(
  ({ icon, count, error, children, ...props }, ref): ReactElement => {
    const Icon = icon;

    return (
      <TabTrigger ref={ref} {...props}>
        {Icon && (
          <span className='shrink-0'>
            <Icon size={14} strokeWidth={2} />
          </span>
        )}
        <span className='truncate'>{children}</span>
        {error ? (
          <OctagonAlert className='size-3 shrink-0 text-error' strokeWidth={2.5} />
        ) : count !== undefined ? (
          <span className='shrink-0 rounded-full bg-surface-primary px-1.5 py-0.5 font-medium text-xs'>{count}</span>
        ) : null}
      </TabTrigger>
    );
  },
);
TabDefaultTrigger.displayName = 'Tab.DefaultTrigger';

//
// * Tab.Content
//

export type TabContentProps = {
  /** Value that matches the corresponding Tab.Trigger */
  value: string;
  /** Keep content in DOM even when inactive */
  forceMount?: boolean;
  /** Content */
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const TabContent = forwardRef<HTMLDivElement, TabContentProps>(
  ({ value, forceMount = false, children, className, ...props }, ref): ReactElement | null => {
    const context = useTab();
    const { baseId, value: selectedValue } = context;

    const triggerId = `${baseId}-trigger-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    const isSelected = selectedValue === value;

    if (!isSelected && !forceMount) {
      return null;
    }

    return (
      <div
        ref={ref}
        role='tabpanel'
        id={panelId}
        aria-labelledby={triggerId}
        data-state={isSelected ? 'active' : 'inactive'}
        hidden={!isSelected}
        className={cn('mt-2', !isSelected && 'hidden', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TabContent.displayName = 'Tab.Content';

//
// * Tab
//

export const Tab = Object.assign(TabRoot, {
  Root: TabRoot,
  List: TabList,
  Trigger: TabTrigger,
  DefaultTrigger: TabDefaultTrigger,
  Content: TabContent,
});
