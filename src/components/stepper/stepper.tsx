import { Slot } from '@radix-ui/react-slot';
import { Fragment, forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';

import { useControlledState, useItemRegistry, useRovingTabIndex } from '@/hooks';
import { useStepNavigation } from '@/hooks/use-step-navigation';
import { usePrefixedId } from '@/providers';
import { type StepperContextValue, StepperProvider, useStepper } from '@/providers/stepper-provider';
import { cn, useComposedRefs } from '@/utils';
import { fixedCountRangeAround } from '@/utils/array';

import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';

const getPanelId = (baseId: string, itemId: string): string => `${baseId}-panel-${itemId}`;
const getButtonId = (baseId: string, itemId: string): string => `${baseId}-tab-${itemId}`;

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

//
// * Stepper.Root
//

export type StepperRootProps = {
  /** Render without wrapper div (for composition with other components) */
  asFragment?: boolean;
  /** Controlled value */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** The maximum number of dots to show */
  maxVisible?: number;
  /** If the dots on edges are smaller than the other dots */
  smallOnEdges?: boolean;
  /** Content */
  children?: ReactNode;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
} & Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue'>;

const StepperRoot = forwardRef<HTMLDivElement, StepperRootProps>((props, ref): ReactElement => {
  const {
    asFragment,
    value: controlledValue,
    defaultValue,
    maxVisible,
    smallOnEdges,
    onValueChange,
    children,
    className,
    ...restProps
  } = props;

  const baseId = usePrefixedId(undefined, 'stepper');

  const { registerItem, unregisterItem, getItems, registryVersion, isItemDisabled } = useItemRegistry();

  const [value, setValue] = useControlledState<string>(controlledValue, defaultValue ?? '', onValueChange);

  const handleValueChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
    },
    [setValue],
  );

  const contextValue: StepperContextValue = useMemo(
    () => ({
      baseId,
      value,
      maxVisible,
      smallOnEdges,
      onValueChange: handleValueChange,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      registryVersion,
    }),
    [
      baseId,
      value,
      maxVisible,
      smallOnEdges,
      handleValueChange,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      registryVersion,
    ],
  );

  if (asFragment) {
    return <StepperProvider value={contextValue}>{children}</StepperProvider>;
  }

  return (
    <StepperProvider value={contextValue}>
      <div data-component='Stepper.Root' ref={ref} className={className} {...restProps}>
        {children}
      </div>
    </StepperProvider>
  );
});

StepperRoot.displayName = 'Stepper';

//
// * Stepper.Panel
//

export type StepperPanelProps = {
  /** Value that identifies this panel */
  value: string;
  /** Whether the panel is locked. If locked, navigation via dots or buttons will not be possible. */
  locked?: boolean;
  /** Content */
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const StepperPanel = forwardRef<HTMLDivElement, StepperPanelProps>((props, ref): ReactElement | null => {
  const { value, locked = false, children, className, ...restProps } = props;
  const { baseId, value: selectedValue, registerItem, unregisterItem } = useStepper();
  const isSelected = selectedValue === value;
  const panelRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, panelRef);

  useEffect(() => {
    registerItem(value, locked, panelRef.current);
    return () => unregisterItem(value);
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- locked is handled by the next effect to avoid unregister/re-register cycle that breaks Map insertion order
  }, [value, registerItem, unregisterItem]);

  useEffect(() => {
    registerItem(value, locked, panelRef.current);
  }, [value, locked, registerItem]);

  return (
    <div
      data-component='Stepper.Panel'
      ref={composedRef}
      id={getPanelId(baseId, value)}
      data-registry-id={value}
      role='tabpanel'
      aria-labelledby={getButtonId(baseId, value)}
      hidden={!isSelected}
      className={className}
      {...restProps}
    >
      {children}
    </div>
  );
});

StepperPanel.displayName = 'Stepper.Panel';

//
// * Stepper.Dot (Internal)
//

type StepperDotProps = {
  /** Value that identifies the dot related item */
  itemId: string;
  /** Index of the dot */
  index: number;
  /** Function to navigate to the related item */
  goTo: (itemId: string) => void;
  /** Keyboard event handler */
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  /** If the dot is small */
  small?: boolean;
  /** Disabled state from parent (e.g., when Dots container is disabled) */
  disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<'button'>, 'disabled'>;

const StepperDot = forwardRef<HTMLButtonElement, StepperDotProps>((props, ref): ReactElement => {
  const { index, itemId, goTo, onKeyDown, small = false, disabled: disabledProp = false, ...restProps } = props;

  const { baseId, value: selectedValue, getItems, isItemDisabled } = useStepper();

  const isDotDisabled = disabledProp || isItemDisabled(itemId);

  const getClass = useCallback(
    (itemId: string) => {
      const isSelected = itemId === selectedValue;

      return cn(
        'flex size-5 items-center justify-center',
        'hover:cursor-pointer focus-visible:outline-none',
        'after:size-2.5 after:rounded-full after:ring-[1.5px]',
        'after:transition-[scale,background-color,box-shadow] after:duration-300 after:ease-in-out',
        'hover:after:outline-bdr-subtle hover:after:outline-2',
        isSelected
          ? 'after:bg-subtle after:ring-subtle after:scale-120 after:ring-1 hover:after:outline-none'
          : small
            ? 'after:ring-bdr-subtle after:scale-80 after:bg-transparent after:ring-2'
            : 'after:ring-bdr-subtle after:scale-100 after:bg-transparent',
        isDotDisabled && 'after:opacity-30 hover:cursor-default',
      );
    },
    [isDotDisabled, selectedValue, small],
  );

  const { tabIndex } = useRovingTabIndex({
    id: getButtonId(baseId, itemId),
    active: getButtonId(baseId, String(selectedValue)),
    disabled: isDotDisabled,
    getItems,
    isItemDisabled,
  });

  return (
    <button
      ref={ref}
      id={getButtonId(baseId, itemId)}
      tabIndex={tabIndex}
      type='button'
      role='tab'
      disabled={isDotDisabled}
      className={getClass(itemId)}
      onClick={() => goTo(itemId)}
      onKeyDown={onKeyDown}
      aria-label={`Go to step ${index + 1}`}
      aria-selected={itemId === selectedValue}
      aria-controls={getPanelId(baseId, itemId)}
      {...restProps}
    />
  );
});
StepperDot.displayName = 'Stepper.Dot';

//
// * Stepper.Dots
//

export type StepperDotsProps = {
  /** Disable all dots navigation */
  disabled?: boolean;
  /** Custom render wrapper for each dot. Receives the dot element and the step ID. */
  renderDot?: (dot: ReactElement, step: string) => ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const StepperDots = forwardRef<HTMLDivElement, StepperDotsProps>((props, ref): ReactElement => {
  const { disabled, renderDot, className, ...restProps } = props;

  const {
    baseId,
    getItems,
    onValueChange,
    isItemDisabled,
    value: selectedValue,
    maxVisible,
    smallOnEdges,
    registryVersion,
  } = useStepper();

  const { items, handleKeyDown, currentIndex, goTo } = useStepNavigation({
    baseId,
    getItems,
    getNextFocusable: getButtonId,
    onValueChange,
    value: selectedValue,
    isItemDisabled,
    registryVersion,
  });

  const { left, mid, right } = fixedCountRangeAround(currentIndex, Number(maxVisible), 0, items.length - 1);

  return (
    <div
      data-component='Stepper.Dots'
      ref={ref}
      role='tablist'
      aria-label='Step navigation'
      aria-orientation='horizontal'
      aria-disabled={disabled || undefined}
      className={cn(
        'mx-auto flex w-fit items-center justify-center gap-0 rounded-md p-2',
        'has-focus-visible:ring-ring has-focus-visible:ring-offset-ring-offset has-focus-visible:ring-3 has-focus-visible:ring-offset-3',
        disabled && 'pointer-events-none',
        className,
      )}
      {...restProps}
    >
      {items.map((itemId, index) => {
        const isMaxVisibleSet = maxVisible && maxVisible > 0;

        const isVisible = isMaxVisibleSet ? left.includes(index) || mid === index || right.includes(index) : true;

        let small = false;

        if (smallOnEdges && isMaxVisibleSet) {
          const leftmostVisible = left.at(0) ?? mid;
          const rightmostVisible = right.at(-1) ?? mid;

          const hasHiddenBefore = leftmostVisible > 0;
          const hasHiddenAfter = rightmostVisible < items.length - 1;

          small = (hasHiddenBefore && index === leftmostVisible) || (hasHiddenAfter && index === rightmostVisible);
        }

        if (!isVisible) return null;

        const dot = (
          <StepperDot
            itemId={itemId}
            index={index}
            goTo={goTo}
            onKeyDown={handleKeyDown}
            small={small}
            disabled={disabled}
          />
        );

        return <Fragment key={itemId}>{renderDot ? renderDot(dot, itemId) : dot}</Fragment>;
      })}
    </div>
  );
});

StepperDots.displayName = 'Stepper.Dots';

//
// * Stepper.Previous
//

export type StepperPreviousProps = {
  asChild?: boolean;
  children: ReactNode;
} & ComponentPropsWithoutRef<'button'>;

const StepperPrevious = forwardRef<HTMLButtonElement, StepperPreviousProps>((props, ref): ReactElement => {
  const { asChild, onClick, disabled: disabledProp, children, ...restProps } = props;

  const { baseId, getItems, onValueChange, value: selectedValue, isItemDisabled, registryVersion } = useStepper();

  const { canGoPrevious, goToPrevious, items, currentIndex } = useStepNavigation({
    baseId,
    getItems,
    onValueChange,
    value: selectedValue,
    isItemDisabled,
    registryVersion,
  });

  const isDisabled = !canGoPrevious || !!disabledProp;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    onClick?.(e);

    const prevValue = items[currentIndex - 1];
    if (!canGoPrevious || !prevValue) return;
    goToPrevious();

    const beforePrev = items[currentIndex - 2];
    const willBeDisabled = beforePrev == null || isItemDisabled(beforePrev);
    if (willBeDisabled) {
      requestAnimationFrame(() => {
        document.getElementById(getPanelId(baseId, prevValue))?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
      });
    }
  };

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-component='Stepper.Previous'
      // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
      ref={ref}
      onClick={handleClick}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      {...(!asChild && { type: 'button' })}
      {...restProps}
    >
      {children}
    </Comp>
  );
});

StepperPrevious.displayName = 'Stepper.Previous';

//
// * Stepper.Next
//

export type StepperNextProps = {
  asChild?: boolean;
  children: ReactNode;
} & ComponentPropsWithoutRef<'button'>;

const StepperNext = forwardRef<HTMLButtonElement, StepperNextProps>((props, ref): ReactElement => {
  const { asChild, onClick, disabled: disabledProp, children, ...restProps } = props;

  const { baseId, getItems, onValueChange, value: selectedValue, isItemDisabled, registryVersion } = useStepper();

  const { canGoNext, goToNext, items, currentIndex } = useStepNavigation({
    baseId,
    getItems,
    onValueChange,
    value: selectedValue,
    isItemDisabled,
    registryVersion,
  });

  const isDisabled = !canGoNext || !!disabledProp;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    onClick?.(e);

    const nextValue = items[currentIndex + 1];
    if (!canGoNext || !nextValue) return;
    goToNext();

    const afterNext = items[currentIndex + 2];
    const willBeDisabled = afterNext == null || isItemDisabled(afterNext);
    if (willBeDisabled) {
      requestAnimationFrame(() => {
        document.getElementById(getPanelId(baseId, nextValue))?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
      });
    }
  };

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-component='Stepper.Next'
      // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
      ref={ref}
      onClick={handleClick}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      {...(!asChild && { type: 'button' })}
      {...restProps}
    >
      {children}
    </Comp>
  );
});

StepperNext.displayName = 'Stepper.Next';

//
// * Stepper
//

export const Stepper = Object.assign(StepperRoot, {
  Root: StepperRoot,
  Panel: StepperPanel,
  Dots: StepperDots,
  Previous: StepperPrevious,
  Next: StepperNext,
});
