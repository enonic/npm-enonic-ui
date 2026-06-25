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

import {
  type UseItemRegistryReturn,
  useActiveItemFocus,
  useActiveOnOpen,
  useControlledStateWithNull,
  useItemRegistry,
  useKeyboardNavigation,
  useRovingTabIndex,
  useScrollActiveIntoView,
} from '@/hooks';
import { type ListboxContextValue, ListboxProvider, useListbox, usePrefixedId } from '@/providers';
import { cn, useComposedRefs } from '@/utils';

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
  /**
   * When `false`, disables the auto-active-on-open behavior in
   * `Listbox.Content`. Set by hosts (e.g., Combobox) when active state is
   * externally controlled. Defaults to `true`.
   */
  autoActiveOnOpen?: boolean;
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
  autoActiveOnOpen = true,
}: ListboxRootProps): ReactElement => {
  const prefixedId = usePrefixedId();
  const listboxBaseId = baseId ?? prefixedId;

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
      autoActiveOnOpen,
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
      autoActiveOnOpen,
    ],
  );

  return <ListboxProvider value={contextValue}>{children}</ListboxProvider>;
};
ListboxRoot.displayName = 'Listbox';

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
      selection,
      selectionMode,
      keyHandler,
      focusMode = 'roving-tabindex',
      getItems,
      isItemDisabled,
      autoActiveOnOpen,
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

    const buildOptionId = useCallback((id: string) => `${baseId}-listbox-option-${id}`, [baseId]);

    // Order matters: useActiveOnOpen must center BEFORE useScrollActiveIntoView's
    // 'nearest' scroll runs, otherwise scrollIntoViewIfNeeded sees the item as
    // already visible (at the nearest edge) and skips centering.
    useActiveOnOpen({
      open: true,
      selection,
      setActive,
      getItems,
      isItemDisabled,
      containerRef: innerRef,
      buildElementId: buildOptionId,
      enabled: autoActiveOnOpen && !disabled,
    });

    useScrollActiveIntoView({
      containerRef: innerRef,
      activeId: active ?? undefined,
      orientation: 'vertical',
      buildElementId: buildOptionId,
    });

    return (
      // tabIndex for aria-activedescendant is properly managed based on focusMode and disabled state
      <div
        data-component='Listbox.Content'
        ref={useComposedRefs(ref, innerRef)}
        id={`${baseId}-listbox`}
        className={cn(
          'flex flex-col items-start gap-y-1 p-1',
          'overflow-y-auto',
          'outline-none',
          'transition-highlight',
          disabled && 'pointer-events-none opacity-30 select-none',
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
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ListboxContent.displayName = 'Listbox.Content';

//
// * Listbox Item
//

const listboxItemVariants = cva(
  [
    'group transition-highlight relative z-0 flex w-full cursor-pointer items-center gap-x-2.5 px-4.5 py-1 outline-none',
    // Click target expansion: -inset-y-{n} where n = gap / 2
    'after:pointer-events-auto after:absolute after:inset-x-0 after:-inset-y-0.5 after:-z-10 after:rounded-sm after:content-[""]',
  ],
  {
    variants: {
      selected: {
        true: 'bg-surface-selected text-alt hover:bg-surface-selected-hover',
        false: 'hover:bg-surface-neutral-hover',
      },
      disabled: {
        true: 'pointer-events-none cursor-not-allowed opacity-30',
        false: '',
      },
      focusMode: {
        'roving-tabindex': [
          // ring and offset colors are swapped for inset ring focus
          'focus-visible:ring-ring-offset focus-visible:ring-3 focus-visible:ring-inset',
          'focus-visible:ring-offset-ring focus-visible:ring-offset-3',
        ],
        activedescendant: [
          // Items never receive DOM focus — ring must be driven by data-active
          'data-[active=true]:ring-ring-offset data-[active=true]:ring-3 data-[active=true]:ring-inset',
          'data-[active=true]:ring-offset-ring data-[active=true]:ring-offset-3',
        ],
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

  // Set by useActiveItemFocus right before it focuses this item, so handleFocus
  // can skip the redundant setActive that the resulting focus event would fire.
  const programmaticFocusRef = useRef(false);

  useEffect(() => {
    registerItem(value, isDisabled, itemRef.current);
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

  const markProgrammaticFocus = useCallback(() => {
    programmaticFocusRef.current = true;
  }, []);

  useActiveItemFocus({
    ref: itemRef,
    isActive,
    disabled: isDisabled,
    focusMode,
    checkFocusWithin: {
      enabled: true,
      containerRole: 'listbox',
    },
    onProgrammaticFocus: markProgrammaticFocus,
  });

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      toggleValue(value);
    }
  }, [isDisabled, toggleValue, value]);

  const handleFocus = useCallback(() => {
    if (isDisabled) return;
    // Programmatic focus from useActiveItemFocus: active already points here, so
    // skip the redundant setActive.
    if (programmaticFocusRef.current) {
      programmaticFocusRef.current = false;
      return;
    }
    setActive(value);
  }, [isDisabled, setActive, value]);

  return (
    // ARIA listbox pattern: supports both roving tabindex and aria-activedescendant
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      data-component='Listbox.Item'
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
      onFocus={focusMode === 'roving-tabindex' ? handleFocus : undefined}
      {...props}
    >
      {children}
    </div>
  );
};
ListboxItem.displayName = 'Listbox.Item';

export const Listbox = Object.assign(ListboxRoot, {
  Root: ListboxRoot,
  Content: ListboxContent,
  Item: ListboxItem,
});
