import {
  useActiveItemFocus,
  useControlledStateWithNull,
  useItemRegistry,
  type UseItemRegistryReturn,
  useKeyboardNavigation,
  useRovingTabIndex,
  useScrollActiveIntoView,
} from '@/hooks';
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
  /** Controlled active item ID (use `null` for no active item, omit for uncontrolled) */
  active?: string | null;
  /** Default active item ID (uncontrolled mode) */
  defaultActive?: string;
  /** Callback when active item changes */
  setActive?: (active: string | null | undefined) => void;
  selectionMode?: 'single' | 'multiple';
  disabled?: boolean;
  /**
   * Focus management mode for the listbox:
   * - 'roving-tabindex': Items are individually focusable with roving tabindex (default for standalone listbox)
   * - 'activedescendant': Container manages focus via aria-activedescendant (used in composite widgets like Combobox)
   */
  focusMode?: 'roving-tabindex' | 'activedescendant';
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
  focusMode = 'roving-tabindex',
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

  const [active, updateActive] = useControlledStateWithNull(controlledActive, defaultActive, setActive);

  // Use external registry if provided (for Combobox), otherwise create internal registry
  const internalRegistry = useItemRegistry();
  const registerItem = externalRegisterItem ?? internalRegistry.registerItem;
  const unregisterItem = externalUnregisterItem ?? internalRegistry.unregisterItem;
  const getItems = externalGetItems ?? internalRegistry.getItems;
  const isItemDisabled = externalIsItemDisabled ?? internalRegistry.isItemDisabled;

  // Initialize active state to first available item if not set
  // Priority: defaultActive > first selected item > first non-disabled item
  useEffect(() => {
    if (active === undefined && !disabled) {
      const items = getItems();
      if (items.length === 0) return;

      // Check if there's a selected item
      const firstSelected = items.find(id => selectionSet.has(id) && !isItemDisabled(id));
      if (firstSelected) {
        updateActive(firstSelected);
        return;
      }

      // Otherwise, use first non-disabled item
      const firstEnabled = items.find(id => !isItemDisabled(id));
      if (firstEnabled) {
        updateActive(firstEnabled);
      }
    }
  }, [active, disabled, getItems, isItemDisabled, selectionSet, updateActive]);

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
      focusMode,
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
      focusMode,
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
      focusMode = 'roving-tabindex',
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

    // In activedescendant mode, activate first item when container receives focus
    const handleContainerFocus = useCallback(() => {
      if (focusMode === 'activedescendant' && !active && !disabled) {
        const items = getItems();
        const firstEnabled = items.find(id => !isItemDisabled(id));
        if (firstEnabled) {
          setActive(firstEnabled);
        }
      }
    }, [focusMode, active, disabled, setActive, getItems, isItemDisabled]);

    // Clear active state when mouse leaves container (only in roving-tabindex mode)
    // Preserve active state if focus is within listbox (keyboard navigation)
    const handleContainerPointerLeave = useCallback(() => {
      if (focusMode === 'roving-tabindex') {
        const focusWithinListbox = innerRef.current?.contains(document.activeElement);
        if (!focusWithinListbox) {
          setActive(undefined);
        }
      }
    }, [focusMode, setActive]);

    useScrollActiveIntoView({
      containerRef: innerRef,
      activeId: active ?? undefined,
      orientation: 'vertical',
      buildElementId: id => `${baseId}-listbox-option-${id}`,
    });

    return (
      // tabIndex for aria-activedescendant is properly managed based on focusMode and disabled state
      // eslint-disable-next-line jsx-a11y/aria-activedescendant-has-tabindex, jsx-a11y/interactive-supports-focus
      <div
        ref={useComposedRefs(ref, innerRef)}
        id={`${baseId}-listbox`}
        className={cn(
          'flex flex-col items-start grow shrink-0 basis-0 p-1 gap-y-1',
          'max-h-100 overflow-y-auto',
          'outline-none',
          'transition-highlight',
          disabled && 'pointer-events-none select-none opacity-30',
          className,
        )}
        role='listbox'
        aria-disabled={disabled}
        aria-label={label}
        aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
        aria-activedescendant={
          focusMode === 'activedescendant' && active ? `${baseId}-listbox-option-${active}` : undefined
        }
        tabIndex={focusMode === 'activedescendant' && !disabled ? 0 : undefined}
        onFocus={focusMode === 'activedescendant' ? handleContainerFocus : undefined}
        onPointerLeave={focusMode === 'roving-tabindex' ? handleContainerPointerLeave : undefined}
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

const listboxItemVariants = cva(
  [
    'relative z-0 group flex w-full items-center px-4.5 py-1 gap-x-2.5 cursor-pointer outline-none transition-highlight',
    'after:absolute after:-inset-0.5 after:content-[""] after:rounded-sm after:pointer-events-auto after:-z-10',
  ],
  {
    variants: {
      selected: {
        true: 'bg-surface-selected text-alt hover:bg-surface-selected-hover',
        false: 'hover:bg-surface-neutral-hover data-[active=true]:bg-surface-neutral-hover',
      },
      disabled: {
        true: 'opacity-30 cursor-not-allowed pointer-events-none',
        false: '',
      },
      focusMode: {
        'roving-tabindex': [
          // ring and offset colors are swapped for inset ring focus
          'focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring-offset',
          'focus-visible:ring-offset-3 focus-visible:ring-offset-ring',
        ],
        activedescendant: '',
      },
    },
    defaultVariants: {
      selected: false,
      disabled: false,
      focusMode: 'roving-tabindex',
    },
  },
);

export type ListboxItemProps = {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const ListboxItem = ({ value, disabled = false, children, className, ...props }: ListboxItemProps): ReactElement => {
  const ctx = useListbox();
  const {
    disabled: listboxDisabled,
    toggleValue,
    baseId,
    active,
    setActive,
    focusMode = 'roving-tabindex',
    registerItem,
    unregisterItem,
    getItems,
    isItemDisabled,
  } = ctx;
  const isSelected = ctx.selection.has(value);
  const isActive = active === value;
  const isDisabled = disabled || !!listboxDisabled;

  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerItem(value, isDisabled);
    return () => unregisterItem(value);
  }, [value, isDisabled, registerItem, unregisterItem]);

  const { tabIndex } = useRovingTabIndex({
    id: value,
    active,
    disabled: isDisabled,
    getItems,
    isItemDisabled,
    focusMode,
  });

  useActiveItemFocus({
    ref: itemRef,
    isActive,
    disabled: isDisabled,
    focusMode,
    checkFocusWithin: {
      enabled: true,
      containerRole: 'listbox',
    },
  });

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      toggleValue(value);
    }
  }, [isDisabled, toggleValue, value]);

  const handlePointerMove = useCallback(() => {
    if (!isActive && !isDisabled) {
      setActive(value);
    }
  }, [isActive, setActive, value, isDisabled]);

  const handleFocus = useCallback(() => {
    if (isDisabled) return;
    setActive(value);
  }, [isDisabled, setActive, value]);

  return (
    // ARIA listbox pattern: supports both roving tabindex and aria-activedescendant
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
    <div
      ref={itemRef}
      id={`${baseId}-listbox-option-${value}`}
      className={cn(listboxItemVariants({ selected: isSelected, disabled: isDisabled, focusMode }), className)}
      role='option'
      aria-selected={isSelected}
      aria-disabled={isDisabled || undefined}
      tabIndex={focusMode === 'roving-tabindex' ? tabIndex : undefined}
      data-value={value}
      data-active={isActive || undefined}
      data-tone={isSelected ? 'inverse' : undefined}
      onClick={handleClick}
      onPointerMove={focusMode === 'roving-tabindex' ? handlePointerMove : undefined}
      onFocus={focusMode === 'roving-tabindex' ? handleFocus : undefined}
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
