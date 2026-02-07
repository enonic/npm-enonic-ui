import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { useControlledState, useItemRegistry, useRovingTabIndex } from '@/hooks';
import { useStepNavigation } from '@/hooks/use-step-navigation';
import { usePrefixedId } from '@/providers';
import { type StepperContextValue, StepperProvider, useStepper } from '@/providers/stepper-provider';
import { cn, useComposedRefs } from '@/utils';
import { fixedCountRangeAround } from '@/utils/array';

const getPanelId = (baseId: string, itemId: string): string => `${baseId}-panel-${itemId}`;
const getButtonId = (baseId: string, itemId: string): string => `${baseId}-tab-${itemId}`;

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
      <div ref={ref} className={className} {...restProps}>
        {children}
      </div>
    </StepperProvider>
  );
});

StepperRoot.displayName = 'Stepper.Root';

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: locked is handled by the next effect to avoid unregister/re-register cycle that breaks Map insertion order
  useEffect(() => {
    registerItem(value, locked, panelRef.current);
    return () => unregisterItem(value);
  }, [value, registerItem, unregisterItem]);

  useEffect(() => {
    registerItem(value, locked, panelRef.current);
  }, [value, locked, registerItem]);

  return (
    <div
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
  /** If the dot is hidden */
  hidden?: boolean;
};
const StepperDot = forwardRef<HTMLButtonElement, StepperDotProps>((props, ref): ReactElement | null => {
  const { index, itemId, goTo, onKeyDown, small = false, hidden = false } = props;

  const { baseId, value: selectedValue, getItems, isItemDisabled } = useStepper();

  const getClass = useCallback(
    (itemId: string) => {
      const isSelected = itemId === selectedValue;

      return cn(
        'flex size-5 items-center justify-center',
        'hover:cursor-pointer focus-visible:outline-none',
        'after:size-2.5 after:rounded-full after:ring-[1.5px]',
        'after:transition-[scale,background-color,box-shadow] after:duration-300 after:ease-in-out',
        hidden && 'hidden',
        isSelected
          ? 'after:scale-120 after:bg-subtle after:ring-1 after:ring-subtle'
          : small
            ? 'after:scale-80 after:bg-transparent after:ring-2 after:ring-bdr-subtle'
            : 'after:scale-100 after:bg-transparent after:ring-bdr-subtle',
        isItemDisabled(itemId) && 'after:opacity-30 hover:cursor-default',
      );
    },
    [isItemDisabled, selectedValue, small, hidden],
  );

  const { tabIndex } = useRovingTabIndex({
    id: getButtonId(baseId, itemId),
    active: getButtonId(baseId, String(selectedValue)),
    disabled: isItemDisabled(itemId),
    getItems,
    isItemDisabled,
  });

  if (hidden) {
    return null;
  }

  return (
    <button
      ref={ref}
      id={getButtonId(baseId, itemId)}
      tabIndex={tabIndex}
      type='button'
      role='tab'
      disabled={isItemDisabled(itemId)}
      className={getClass(itemId)}
      onClick={() => goTo(itemId)}
      onKeyDown={onKeyDown}
      aria-label={`Go to step ${index + 1}`}
      aria-selected={itemId === selectedValue}
      aria-controls={getPanelId(baseId, itemId)}
    />
  );
});

//
// * Stepper.Dots
//

export type StepperDotsProps = ComponentPropsWithoutRef<'div'>;

const StepperDots = forwardRef<HTMLDivElement, StepperDotsProps>((props, ref): ReactElement => {
  const { className, ...restProps } = props;

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
    getButtonId,
    onValueChange,
    value: selectedValue,
    isItemDisabled,
    registryVersion,
  });

  const { left, mid, right } = fixedCountRangeAround(currentIndex, Number(maxVisible), 0, items.length - 1);

  return (
    <div
      ref={ref}
      role='tablist'
      aria-label='Step navigation'
      aria-orientation='horizontal'
      className={cn(
        'mx-auto flex w-fit items-center justify-center gap-0 rounded-md p-2',
        'has-focus-visible:ring-3 has-focus-visible:ring-ring has-focus-visible:ring-offset-3 has-focus-visible:ring-offset-ring-offset',
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

        return (
          <StepperDot
            key={itemId}
            itemId={itemId}
            index={index}
            goTo={goTo}
            onKeyDown={handleKeyDown}
            small={small}
            hidden={!isVisible}
          />
        );
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
  const { asChild, onClick, children, ...restProps } = props;

  const { baseId, getItems, onValueChange, value: selectedValue, isItemDisabled, registryVersion } = useStepper();

  const { canGoPrevious, goToPrevious } = useStepNavigation({
    baseId,
    getItems,
    getButtonId,
    onValueChange,
    value: selectedValue,
    isItemDisabled,
    registryVersion,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    onClick?.(e);
    goToPrevious();
  };

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
      ref={ref}
      onClick={handleClick}
      aria-disabled={!canGoPrevious}
      disabled={!canGoPrevious}
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
  const { asChild, onClick, children, ...restProps } = props;

  const { baseId, getItems, onValueChange, value: selectedValue, isItemDisabled, registryVersion } = useStepper();

  const { canGoNext, goToNext } = useStepNavigation({
    baseId,
    getItems,
    getButtonId,
    onValueChange,
    value: selectedValue,
    isItemDisabled,
    registryVersion,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    onClick?.(e);
    goToNext();
  };

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
      ref={ref}
      onClick={handleClick}
      aria-disabled={!canGoNext}
      disabled={!canGoNext}
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
