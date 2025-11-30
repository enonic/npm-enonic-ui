import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
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
import { Button } from '@/components/button';
import { IconButton } from '@/components/icon-button/icon-button';
import { Listbox } from '@/components/listbox';
import { SearchField } from '@/components/search-field';
import { useControlledState, useControlledStateWithNull, useItemRegistry, useKeyboardNavigation } from '@/hooks';
import { type ComboboxContextValue, ComboboxProvider, useCombobox, usePrefixedId } from '@/providers';
import { cn } from '@/utils';
import { areArraysEquals } from '@/utils/array';
import { useComposedRefs } from '@/utils/ref';

// Shared empty array to maintain referential equality across renders
const EMPTY_SELECTION: readonly string[] = [];

// Helper to update array state only when values differ (prevents unnecessary re-renders)
const updateArrayIfChanged =
  <T extends string>(next: readonly T[]) =>
  (prev: readonly T[]): readonly T[] =>
    areArraysEquals(prev, next) ? prev : next;

//
// * Root
//

export type ComboboxRootProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnBlur?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  selectionMode?: 'single' | 'multiple' | 'staged';
  selection?: readonly string[];
  defaultSelection?: readonly string[];
  onSelectionChange?: (selection: readonly string[]) => void;
  /** Controlled active item ID (use `null` for no active item, omit for uncontrolled) */
  active?: string | null;
  /** Default active item ID (uncontrolled mode) */
  defaultActive?: string;
  /** Callback when active item changes */
  setActive?: (active: string | null) => void;
  disabled?: boolean;
  error?: boolean;
};

const ComboboxRoot = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnBlur = true,
  value,
  defaultValue = '',
  onChange,
  disabled = false,
  error = false,
  selectionMode = 'single',
  selection: controlledSelection,
  defaultSelection = EMPTY_SELECTION,
  onSelectionChange,
  active: controlledActive,
  defaultActive,
  setActive,
}: ComboboxRootProps): ReactElement => {
  const baseId = usePrefixedId();

  // Controlled/uncontrolled state using shared hook
  const [open, setOpenInternal] = useControlledState(controlledOpen, defaultOpen, onOpenChange);
  const [inputValue, setInputValueInternal] = useControlledState(value, defaultValue, onChange);

  const isMultipleSelection = selectionMode !== 'single';
  const stagingEnabled = selectionMode === 'staged';

  const [uncontrolledSelection, setUncontrolledSelection] = useState<Set<string>>(() => new Set(defaultSelection));
  const isSelectionControlled = controlledSelection !== undefined;
  const appliedSelectionSet = useMemo(
    () => (isSelectionControlled ? new Set(controlledSelection) : uncontrolledSelection),
    [isSelectionControlled, controlledSelection, uncontrolledSelection],
  );
  const appliedSelection = useMemo(() => Array.from(appliedSelectionSet), [appliedSelectionSet]);

  const [stagedSelection, setStagedSelection] = useState<readonly string[]>(appliedSelection);

  useEffect(() => {
    if (!stagingEnabled) {
      setStagedSelection(appliedSelection);
      return;
    }
    setStagedSelection(updateArrayIfChanged(appliedSelection));
  }, [appliedSelection, stagingEnabled]);

  const currentSelection = stagingEnabled ? stagedSelection : appliedSelection;
  const currentSelectionSet = useMemo(() => new Set(currentSelection), [currentSelection]);
  // Checks if staged selection differs from the applied selection
  const hasStagedChanges = useMemo(
    () => stagingEnabled && !areArraysEquals(stagedSelection, appliedSelection),
    [stagingEnabled, stagedSelection, appliedSelection],
  );

  const resetStagedSelection = useCallback(() => {
    if (!stagingEnabled) {
      return;
    }
    setStagedSelection(updateArrayIfChanged(appliedSelection));
  }, [stagingEnabled, appliedSelection]);

  const [activeInternal, setActiveInternal] = useControlledStateWithNull(controlledActive, defaultActive, setActive);

  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  // Wrap setInputValue to also open the dropdown
  const setInputValue = useCallback(
    (next: string) => {
      setInputValueInternal(next);
      setOpenInternal(true);
    },
    [setInputValueInternal, setOpenInternal],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenInternal(next);
      if (!next) {
        resetStagedSelection();
      }
    },
    [setOpenInternal, resetStagedSelection],
  );

  const commitSelection = useCallback(
    (newSelection: readonly string[]) => {
      const newSet = new Set(newSelection);
      if (!isSelectionControlled) {
        setUncontrolledSelection(newSet);
      }
      onSelectionChange?.(newSelection);

      if (selectionMode === 'single') {
        setOpenInternal(false);
      }
    },
    [isSelectionControlled, onSelectionChange, selectionMode, setOpenInternal],
  );

  const handleSelectionChange = useCallback(
    (nextSelection: readonly string[]) => {
      if (stagingEnabled) {
        setStagedSelection(nextSelection);
        return;
      }

      commitSelection(nextSelection);
    },
    [stagingEnabled, commitSelection],
  );

  const applyStagedSelection = useCallback(() => {
    if (!stagingEnabled) {
      return;
    }
    if (!areArraysEquals(stagedSelection, appliedSelection)) {
      commitSelection(stagedSelection);
    }

    setOpenInternal(false);
  }, [stagingEnabled, stagedSelection, appliedSelection, commitSelection, setOpenInternal]);

  const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
    getItems,
    isItemDisabled,
    active: activeInternal,
    setActive: setActiveInternal,
    loop: false,
    orientation: 'vertical',
    onSelect: id => {
      let nextSelection: readonly string[];

      if (!isMultipleSelection) {
        nextSelection = [id];
      } else if (currentSelection.includes(id)) {
        nextSelection = currentSelection.filter(item => item !== id);
      } else {
        nextSelection = [...currentSelection, id];
      }

      handleSelectionChange(nextSelection);
    },
  });

  // Wrap keyboard handler with Combobox-specific behavior
  const keyHandler = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      if (disabled) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!open) {
          e.preventDefault();
          setOpenInternal(true);
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }

      // Delegate to navigation hook for other keys
      handleNavKeyDown(e);
    },
    [disabled, open, setOpenInternal, setOpen, handleNavKeyDown],
  );

  // Auto-select first item when opening
  useEffect(() => {
    if (open && activeInternal === undefined) {
      const items = getItems();
      if (items.length > 0) {
        setActiveInternal(items[0]);
      }
    }
  }, [open, activeInternal, getItems, setActiveInternal]);

  const context = useMemo<ComboboxContextValue>(
    () => ({
      open,
      setOpen,
      inputValue,
      setInputValue,
      baseId,
      active: activeInternal,
      disabled,
      error,
      closeOnBlur,
      keyHandler,
      selection: currentSelectionSet,
      appliedSelection,
      stagedSelection,
      stagingEnabled,
      hasStagedChanges,
      applyStagedSelection,
      resetStagedSelection,
    }),
    [
      open,
      setOpen,
      closeOnBlur,
      keyHandler,
      inputValue,
      setInputValue,
      activeInternal,
      baseId,
      disabled,
      error,
      currentSelectionSet,
      appliedSelection,
      stagedSelection,
      stagingEnabled,
      hasStagedChanges,
      applyStagedSelection,
      resetStagedSelection,
    ],
  );

  return (
    <ComboboxProvider value={context}>
      <Listbox.Root
        selectionMode={isMultipleSelection ? 'multiple' : 'single'}
        selection={currentSelection}
        onSelectionChange={handleSelectionChange}
        disabled={disabled}
        active={activeInternal}
        focusMode='activedescendant'
        baseId={baseId}
        setActive={setActiveInternal}
        keyHandler={keyHandler}
        registerItem={registerItem}
        unregisterItem={unregisterItem}
        getItems={getItems}
        isItemDisabled={isItemDisabled}
      >
        {children}
      </Listbox.Root>
    </ComboboxProvider>
  );
};
ComboboxRoot.displayName = 'Combobox.Root';

//
// * Content
//

export type ComboboxContentProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    const innerRef = useRef<HTMLDivElement>(null);

    const { setOpen, closeOnBlur } = useCombobox();

    const handleOnBlur = useCallback(
      (e: React.FocusEvent<HTMLDivElement>): void => {
        if (!closeOnBlur) {
          return;
        }

        const { relatedTarget } = e;

        if (relatedTarget instanceof Node && innerRef.current?.contains(relatedTarget)) {
          return;
        }

        setOpen(false);
      },
      [setOpen, closeOnBlur],
    );

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div ref={useComposedRefs(ref, innerRef)} className={className} onBlur={handleOnBlur} {...props}>
        {children}
      </div>
    );
  },
);
ComboboxContent.displayName = 'Combobox.Content';

//
// * Control
//

const comboboxControlVariants = cva(
  [
    'flex items-center gap-2.5',
    'h-12 rounded-sm border bg-surface-neutral',
    'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring focus-within:ring-offset-3 focus-within:ring-offset-ring-offset',
    'transition-highlight',
  ],
  {
    variants: {
      error: {
        true: 'border-error focus-within:border-error focus-within:ring-error',
        false: 'border-bdr-subtle focus-within:border-bdr-strong',
      },
      open: {
        true: 'border-bdr-strong',
        false: null,
      },
      disabled: {
        true: 'pointer-events-none select-none opacity-30',
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

export type ComboboxControlProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const ComboboxControl = ({ className, children, ...props }: ComboboxControlProps): ReactElement => {
  const { open, disabled, error } = useCombobox();

  return (
    <div
      className={cn(
        comboboxControlVariants({
          error,
          open,
          disabled,
        }),
        className,
      )}
      data-open={open ? 'true' : undefined}
      {...props}
    >
      {children}
    </div>
  );
};
ComboboxControl.displayName = 'Combobox.Control';

//
// * Input
//

export type ComboboxInputProps = {
  className?: string;
  placeholder?: string;
} & ComponentPropsWithoutRef<'input'>;

const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>((props, ref): ReactElement => {
  const innerRef = useRef<HTMLInputElement>(null);

  const { open, keyHandler, baseId, active, disabled, error } = useCombobox();

  useEffect(() => {
    if (open && !disabled) {
      innerRef.current?.focus();
    }
  }, [open, disabled]);

  return (
    <SearchField.Input
      ref={useComposedRefs(ref, innerRef)}
      id={`${baseId}-input`}
      onKeyDown={keyHandler}
      aria-disabled={disabled}
      aria-invalid={error ?? undefined}
      role='combobox'
      aria-autocomplete='list'
      aria-expanded={open}
      aria-haspopup='listbox'
      aria-controls={`${baseId}-listbox`}
      aria-activedescendant={active ? `${baseId}-listbox-option-${active}` : undefined}
      {...props}
    />
  );
});
ComboboxInput.displayName = 'Combobox.Input';

//
// * Search
//

export type ComboboxSearchProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<typeof SearchField.Root>;

const ComboboxSearch = ({ children, className, ...props }: ComboboxSearchProps): ReactElement => {
  const { inputValue, setInputValue } = useCombobox();

  return (
    <SearchField.Root
      value={inputValue}
      onChange={setInputValue}
      className={cn('w-full pr-0', 'border-0 focus-within:border-0 focus-within:ring-0', className)}
      {...props}
    >
      {children}
    </SearchField.Root>
  );
};
ComboboxSearch.displayName = 'Combobox.Search';

//
// * ComboboxSearchIcon
//
export type ComboboxSearchIconProps = {
  className?: string;
} & ComponentPropsWithoutRef<typeof SearchField.Icon>;

const ComboboxSearchIcon = ({ className, ...props }: ComboboxSearchIconProps): ReactElement => {
  return <SearchField.Icon className={className} {...props} />;
};
ComboboxSearchIcon.displayName = 'Combobox.SearchIcon';

//
// * Toggle
//

export type ComboboxToggleProps = {
  className?: string;
} & Omit<ComponentPropsWithoutRef<typeof IconButton>, 'icon'>;

const ComboboxToggle = ({ className, ...props }: ComboboxToggleProps): ReactElement => {
  const { open, setOpen, disabled } = useCombobox();

  return (
    <IconButton
      type='button'
      variant='text'
      size='lg'
      icon={ChevronDown}
      aria-label='Toggle'
      onClick={() => {
        if (!disabled) setOpen(!open);
      }}
      disabled={disabled}
      tabIndex={-1}
      className={cn(
        'shrink-0 text-subtle transition-transform hover:bg-surface-neutral-hover',
        open && 'rotate-180',
        className,
      )}
      {...props}
    />
  );
};
ComboboxToggle.displayName = 'Combobox.Toggle';

export type ComboboxApplyProps = {
  className?: string;
} & ComponentPropsWithoutRef<typeof Button>;

const ComboboxApply = ({ className, label = 'Apply', ...props }: ComboboxApplyProps): ReactElement | null => {
  const { stagingEnabled, hasStagedChanges, applyStagedSelection } = useCombobox();

  if (!stagingEnabled || !hasStagedChanges) {
    return null;
  }

  return (
    <Button
      className={cn('h-7 min-w-14 gap-2 px-2.5 text-xs', className)}
      type='button'
      label={label}
      variant='outline'
      onClick={applyStagedSelection}
      {...props}
    />
  );
};
ComboboxApply.displayName = 'Combobox.Apply';

//
// * Popup
//

export type ComboboxPopupProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const ComboboxPopup = ({ children, className, ...props }: ComboboxPopupProps): ReactElement | null => {
  const { open } = useCombobox();

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute right-0 left-0 z-50 mt-2 rounded-sm bg-surface-neutral shadow-lg ring-1 ring-bdr-subtle',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
ComboboxPopup.displayName = 'Combobox.Popup';

export const Combobox = Object.assign(ComboboxRoot, {
  Root: ComboboxRoot,
  Content: ComboboxContent,
  Control: ComboboxControl,
  Search: ComboboxSearch,
  Input: ComboboxInput,
  SearchIcon: ComboboxSearchIcon,
  Toggle: ComboboxToggle,
  Apply: ComboboxApply,
  Popup: ComboboxPopup,
});
