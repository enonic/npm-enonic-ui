import { Circle, type LucideProps, OctagonAlert } from 'lucide-react';
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
} from 'react';
import { useControlledState, useItemRegistry, useRadioNavigation, useRovingTabIndex } from '@/hooks';
import { CircleDisc } from '@/icons';
import { type RadioGroupContextValue, RadioGroupProvider, usePrefixedId, useRadioGroup } from '@/providers';
import { cn } from '@/utils';

const getRadioId = (baseId: string, itemId: string): string => `${baseId}-radio-${itemId}`;

//
// * RadioGroupItemContext
//

type RadioGroupItemContextValue = {
  checked: boolean;
};

const RadioGroupItemContext = createContext<RadioGroupItemContextValue | null>(null);

function useRadioGroupItem(): RadioGroupItemContextValue {
  const ctx = useContext(RadioGroupItemContext);

  if (!ctx) {
    throw new Error('RadioGroup.Item subcomponents must be used within <RadioGroup.Item>.');
  }

  return ctx;
}

//
// * RadioGroup.Root
//

export type RadioGroupRootProps = {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue'>;

const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupRootProps>((props, ref): ReactElement => {
  const {
    name,
    value: controlledValue,
    defaultValue,
    onValueChange,
    orientation = 'vertical',
    loop = false,
    required = false,
    error,
    errorMessage,
    children,
    className,
    ...restProps
  } = props;

  const baseId = usePrefixedId(name, 'radio-group');
  const { registerItem, unregisterItem, getItems, registryVersion, isItemDisabled } = useItemRegistry();
  const [value, setValue] = useControlledState<string>(controlledValue, defaultValue ?? '', onValueChange);
  const state = error ? 'error' : 'default';

  const handleValueChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
    },
    [setValue],
  );

  const contextValue: RadioGroupContextValue = useMemo(
    () => ({
      baseId,
      name,
      value,
      onValueChange: handleValueChange,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      registryVersion,
    }),
    [baseId, value, handleValueChange, registerItem, unregisterItem, getItems, isItemDisabled, registryVersion, name],
  );

  const { handleKeyDown } = useRadioNavigation({
    baseId,
    getItems,
    getItemId: getRadioId,
    onValueChange: handleValueChange,
    value,
    loop,
    isItemDisabled,
    registryVersion,
  });

  return (
    <RadioGroupProvider value={contextValue}>
      <div
        ref={ref}
        role='radiogroup'
        tabIndex={-1}
        className={cn(
          'group flex gap-2.5 px-2 py-1.25',
          'focus-within:ring-2 focus-within:ring-ring/25 focus-within:ring-inset focus-visible:outline-none',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          className,
        )}
        aria-required={required}
        aria-invalid={error}
        data-state={state}
        data-orientation={orientation}
        onKeyDown={handleKeyDown}
        {...restProps}
      >
        {children}

        {state === 'error' && errorMessage && (
          <div className={cn('flex items-center gap-1 text-error leading-5')}>
            <OctagonAlert size={14} />
            {errorMessage}
          </div>
        )}
      </div>
    </RadioGroupProvider>
  );
});

RadioGroupRoot.displayName = 'RadioGroup.Root';

//
// * RadioGroup.Item
//

export type RadioGroupItemProps = {
  value: string;
  children: ReactNode;
  disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<'button'>, 'id' | 'disabled' | 'onClick'>;

const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>((props, ref): ReactElement | null => {
  const { value, children, disabled, className, ...restProps } = props;

  const {
    baseId,
    name: groupName,
    value: selectedValue,
    onValueChange,
    registerItem,
    unregisterItem,
    isItemDisabled,
    getItems,
  } = useRadioGroup();

  const id = getRadioId(baseId, value);
  const selectedRadioId = getRadioId(baseId, String(selectedValue));
  const isChecked = selectedValue === value;
  const isDisabled = isItemDisabled(value);

  useEffect(() => {
    registerItem(value, disabled);
    return () => unregisterItem(value);
  }, [value, disabled, registerItem, unregisterItem]);

  const { tabIndex } = useRovingTabIndex({
    id: id,
    active: selectedRadioId,
    disabled: isDisabled,
    getItems,
    isItemDisabled,
  });

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    onValueChange(value);
  }, [isDisabled, value, onValueChange]);

  const itemContextValue = useMemo(() => ({ checked: isChecked }), [isChecked]);

  return (
    <RadioGroupItemContext.Provider value={itemContextValue}>
      <input
        readOnly
        type='radio'
        name={groupName}
        value={value}
        checked={isChecked}
        tabIndex={-1}
        aria-hidden='true'
        className='peer sr-only'
      />
      <button
        ref={ref}
        id={id}
        data-registry-id={value}
        role='radio'
        type='button'
        tabIndex={isDisabled ? -1 : tabIndex}
        aria-checked={isChecked}
        aria-disabled={isDisabled}
        className={cn(
          'my-0.75 flex w-fit items-center gap-1 rounded-xs leading-4 transition-highlight',
          'group-data-[state=error]:focus-within:ring-error',
          isDisabled
            ? 'pointer-events-none opacity-30'
            : 'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring focus-within:ring-offset-3 focus-within:ring-offset-ring-offset hover:cursor-pointer',
          className,
        )}
        onClick={handleClick}
        {...restProps}
      >
        {children}
      </button>
    </RadioGroupItemContext.Provider>
  );
});

RadioGroupItem.displayName = 'RadioGroup.Item';

//
// * RadioGroup.Indicator
//

export type RadioGroupIndicatorProps = LucideProps;

const RadioGroupIndicator = forwardRef<SVGSVGElement, LucideProps>(({ className, ...props }, ref): ReactElement => {
  const { checked } = useRadioGroupItem();

  if (checked) {
    return (
      <CircleDisc ref={ref} size={14} className={cn('group-data-[state=error]:text-error', className)} {...props} />
    );
  }

  return <Circle ref={ref} size={14} className={cn('group-data-[state=error]:text-error', className)} {...props} />;
});

RadioGroupIndicator.displayName = 'RadioGroup.Indicator';

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
  Indicator: RadioGroupIndicator,
});
