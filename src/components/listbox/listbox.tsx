import { useControlledState, useItemRegistry, type UseItemRegistryReturn, useKeyboardNavigation } from '@/hooks';
import { type ListboxContextValue, ListboxProvider, useListbox, usePrefixedId } from '@/providers';
import { cn, useComposedRefs } from '@/utils';
import { cva } from 'class-variance-authority';
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

const EMPTY_SELECTION: readonly string[] = [];

export type ListboxRootProps = {
  baseId?: string;
  selection?: readonly string[];
  defaultSelection?: readonly string[];
  onSelectionChange?: (selection: readonly string[]) => void;
  active?: string;
  defaultActive?: string;
  setActive?: (active: string | undefined) => void;
  selectionMode?: 'single' | 'multiple';
  disabled?: boolean;
  focusable?: boolean;
  children?: ReactNode;
  keyHandler?: (e: React.KeyboardEvent<HTMLElement>) => void;
  // Optional external item registry (used by Combobox)
  registerItem?: UseItemRegistryReturn['registerItem'];
  unregisterItem?: UseItemRegistryReturn['unregisterItem'];
  getItems?: UseItemRegistryReturn['getItems'];
  isItemDisabled?: UseItemRegistryReturn['isItemDisabled'];
};

const ListboxRoot = ({
  baseId,
  selection: controlledSelection,
  defaultSelection = EMPTY_SELECTION,
  onSelectionChange,
  active: controlledActive,
  defaultActive,
  setActive,
  selectionMode = 'single',
  focusable = true,
  disabled,
  children,
  keyHandler,
  registerItem: externalRegisterItem,
  unregisterItem: externalUnregisterItem,
  getItems: externalGetItems,
  isItemDisabled: externalIsItemDisabled,
}: ListboxRootProps): ReactElement => {
  const listboxBaseId = baseId ?? usePrefixedId();

  // Selection - store as Set internally for O(1) lookups
  const [uncontrolledSelection, setUncontrolledSelection] = useState<Set<string>>(() => new Set(defaultSelection));
  const isSelectionControlled = controlledSelection !== undefined;
  const selectionSet = useMemo(
    () => (isSelectionControlled ? new Set(controlledSelection) : uncontrolledSelection),
    [isSelectionControlled, controlledSelection, uncontrolledSelection],
  );

  const [active, updateActive] = useControlledState(controlledActive, defaultActive, setActive);

  // Use external registry if provided (for Combobox), otherwise create internal registry
  const internalRegistry = useItemRegistry();
  const registerItem = externalRegisterItem ?? internalRegistry.registerItem;
  const unregisterItem = externalUnregisterItem ?? internalRegistry.unregisterItem;
  const getItems = externalGetItems ?? internalRegistry.getItems;
  const isItemDisabled = externalIsItemDisabled ?? internalRegistry.isItemDisabled;

  const toggleValue = useCallback(
    (value: string) => {
      const isSelected = selectionSet.has(value);
      const newSet = new Set(selectionSet);

      if (selectionMode === 'single') {
        newSet.clear();
        if (!isSelected) {
          newSet.add(value);
        }
      } else {
        if (isSelected) {
          newSet.delete(value);
        } else {
          newSet.add(value);
        }
      }

      if (!isSelectionControlled) {
        setUncontrolledSelection(newSet);
      }
      onSelectionChange?.(Array.from(newSet));
      updateActive(value);
    },
    [selectionSet, selectionMode, isSelectionControlled, onSelectionChange, updateActive],
  );

  const contextValue = useMemo<ListboxContextValue>(
    () => ({
      active,
      selection: selectionSet,
      selectionMode,
      focusable,
      disabled,
      setActive: updateActive,
      toggleValue,
      baseId: listboxBaseId,
      keyHandler,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
    }),
    [
      active,
      selectionSet,
      selectionMode,
      focusable,
      disabled,
      updateActive,
      toggleValue,
      listboxBaseId,
      keyHandler,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
    ],
  );

  return <ListboxProvider value={contextValue}>{children}</ListboxProvider>;
};
ListboxRoot.displayName = 'ListboxRoot';

export type ListboxContentProps = {
  className?: string;
  label?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const ListboxContent = forwardRef<HTMLDivElement, ListboxContentProps>(
  ({ className, label, children, ...props }, ref): ReactElement => {
    const innerRef = useRef<HTMLDivElement>(null);

    const {
      active,
      disabled,
      setActive,
      toggleValue,
      baseId,
      selectionMode,
      keyHandler,
      focusable = true,
      getItems,
      isItemDisabled,
    } = useListbox();

    const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
      getItems,
      isItemDisabled,
      active,
      setActive,
      loop: false,
      orientation: 'vertical',
      onSelect: id => {
        toggleValue(id);
      },
    });

    // Allow custom keyHandler to override (used by Combobox)
    const handleKeyDown = keyHandler ?? handleNavKeyDown;

    useEffect(() => {
      if (!active || !innerRef.current) {
        return;
      }
      const el = innerRef.current.querySelector<HTMLDivElement>(`#${baseId}-listbox-option-${active}`);
      if (el) {
        el.scrollIntoView({
          block: 'nearest',
          behavior: 'auto',
        });
      }
    }, [active, baseId]);

    return (
      <div
        ref={useComposedRefs(ref, innerRef)}
        id={`${baseId}-listbox`}
        className={cn(
          'flex flex-col items-start grow shrink-0 basis-0',
          'max-h-100 overflow-y-auto',
          'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/50',
          disabled && 'pointer-events-none select-none opacity-30',
          className,
        )}
        role='listbox'
        aria-disabled={disabled}
        aria-label={label}
        aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
        aria-activedescendant={active ? `${baseId}-listbox-option-${active}` : undefined}
        tabIndex={focusable && !disabled ? 0 : -1}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ListboxContent.displayName = 'ListboxContent';

//
// * Listbox Item
//

const listboxItemVariants = cva('flex w-full items-center px-4.5 py-1 gap-x-2.5 cursor-pointer', {
  variants: {
    selected: {
      true: 'bg-surface-primary-selected text-alt hover:bg-surface-primary-selected-hover',
      false: 'hover:bg-surface-primary-hover',
    },
    active: {
      true: 'bg-surface-primary-hover',
      false: '',
    },
    disabled: {
      true: 'opacity-30 cursor-not-allowed pointer-events-none',
      false: '',
    },
  },
  compoundVariants: [
    {
      selected: true,
      active: true,
      class: 'bg-surface-primary-selected-hover',
    },
  ],
  defaultVariants: {
    selected: false,
    active: false,
    disabled: false,
  },
});

export type ListboxItemProps = {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const ListboxItem = ({ value, disabled = false, children, className, ...props }: ListboxItemProps): ReactElement => {
  const ctx = useListbox();
  const { disabled: listboxDisabled, toggleValue, baseId, registerItem, unregisterItem } = ctx;
  const isSelected = ctx.selection.has(value);
  const isActive = ctx.active === value;
  const isDisabled = disabled || listboxDisabled;

  useEffect(() => {
    registerItem(value, isDisabled);
    return () => unregisterItem(value);
  }, [value, isDisabled, registerItem, unregisterItem]);

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      toggleValue(value);
    }
  }, [isDisabled, toggleValue, value]);

  return (
    // ARIA listbox pattern: options are not individually focusable
    // Parent listbox handles all keyboard interactions via aria-activedescendant
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
    <div
      id={`${baseId}-listbox-option-${value}`}
      className={cn(listboxItemVariants({ selected: isSelected, active: isActive, disabled: isDisabled }), className)}
      role='option'
      aria-selected={isSelected}
      aria-disabled={isDisabled ?? undefined}
      data-value={value}
      data-active={isActive || undefined}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};
ListboxItem.displayName = 'ListboxItem';

export const Listbox = Object.assign(ListboxRoot, {
  Root: ListboxRoot,
  Content: ListboxContent,
  Item: ListboxItem,
});
