import { Listbox, SearchInput } from '@/components';
import { IconButton } from '@/components/icon-button/icon-button';
import { useControlledState, useItemRegistry, useKeyboardNavigation } from '@/hooks';
import { type ComboboxContextValue, ComboboxProvider, useCombobox, usePrefixedId } from '@/providers';
import { cn } from '@/utils';
import { useComposedRefs } from '@/utils/ref';
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

const EMPTY_SELECTION: readonly string[] = [];

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
  selectionMode?: 'single' | 'multiple';
  selection?: readonly string[];
  defaultSelection?: readonly string[];
  onSelectionChange?: (selection: readonly string[]) => void;
  active?: string;
  defaultActive?: string;
  setActive?: (active: string | undefined) => void;
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

  // Selection - store as Set internally for O(1) lookups
  const [uncontrolledSelection, setUncontrolledSelection] = useState<Set<string>>(() => new Set(defaultSelection));
  const isSelectionControlled = controlledSelection !== undefined;
  const selectionSet = useMemo(
    () => (isSelectionControlled ? new Set(controlledSelection) : uncontrolledSelection),
    [isSelectionControlled, controlledSelection, uncontrolledSelection],
  );

  const onSelectionChangeInner = useCallback(
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
    [isSelectionControlled, selectionMode, setOpenInternal, onSelectionChange],
  );

  const [activeInternal, setActiveInternal] = useControlledState(controlledActive, defaultActive, setActive);

  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  // Wrap setInputValue to also open the dropdown
  const setInputValue = useCallback(
    (next: string) => {
      setInputValueInternal(next);
      setOpenInternal(true);
    },
    [setInputValueInternal, setOpenInternal],
  );

  // Wrap setOpen for external use
  const setOpen = useCallback(
    (next: boolean) => {
      setOpenInternal(next);
    },
    [setOpenInternal],
  );

  // Keyboard navigation with custom handlers for Combobox-specific keys
  const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
    getItems,
    isItemDisabled,
    active: activeInternal,
    setActive: setActiveInternal,
    loop: false,
    orientation: 'vertical',
    onSelect: id => {
      // On select, update selection
      const newSelection =
        selectionMode === 'multiple'
          ? selectionSet.has(id)
            ? Array.from(selectionSet).filter(item => item !== id)
            : [...Array.from(selectionSet), id]
          : [id];
      onSelectionChangeInner(newSelection);
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
        setOpenInternal(false);
        return;
      }

      // Delegate to navigation hook for other keys
      handleNavKeyDown(e);
    },
    [disabled, open, setOpenInternal, handleNavKeyDown],
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
      selection: selectionSet,
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
      selectionSet,
    ],
  );

  return (
    <ComboboxProvider value={context}>
      <Listbox.Root
        selectionMode={selectionMode}
        selection={Array.from(selectionSet)}
        onSelectionChange={onSelectionChangeInner}
        disabled={disabled}
        active={activeInternal}
        focusable={false}
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
  ({ className, children }, ref): ReactElement => {
    const innerRef = useRef<HTMLDivElement>(null);

    const { setOpen, baseId, closeOnBlur } = useCombobox();

    const handleFocusOut = closeOnBlur
      ? useCallback(
          (e: React.FocusEvent<HTMLDivElement>): void => {
            const nextTarget = e.relatedTarget as HTMLElement | null;

            if (nextTarget && innerRef.current?.contains(nextTarget)) {
              return;
            }

            setOpen(false);
          },
          [baseId, setOpen],
        )
      : void 0;

    return (
      // eslint-disable-next-line react/no-unknown-property
      <div onFocusOut={handleFocusOut} ref={useComposedRefs(ref, innerRef)} className={className}>
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
    'flex items-center',
    'h-12 rounded-sm border bg-surface-neutral',
    'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/50 focus-within:ring-offset-0',
    'transition-highlight',
  ],
  {
    variants: {
      error: {
        true: 'border-error focus-within:border-error focus-within:ring-error/50',
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
  children?: ReactNode;
  className?: string;
};

const ComboboxControl = ({ children, className }: ComboboxControlProps): ReactElement => {
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
};

const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(
  ({ className, placeholder, ...props }, ref): ReactElement => {
    const innerRef = useRef<HTMLInputElement>(null);

    const { inputValue, setInputValue, open, keyHandler, selection, baseId, active, disabled, error } = useCombobox();

    useEffect(() => {
      if (open && !disabled) {
        innerRef.current?.focus();
      }
    }, [open, selection, disabled]);

    return (
      <SearchInput
        ref={useComposedRefs(ref, innerRef)}
        id={`${baseId}-input`}
        className={'border-none focus:outline-none focus-within:outline-none h-auto focus-within:ring-0 grow'}
        value={inputValue}
        onChange={setInputValue}
        onKeyDown={keyHandler}
        placeholder={placeholder}
        disabled={disabled}
        aria-disabled={disabled}
        aria-invalid={error ?? undefined}
        role='combobox'
        aria-autocomplete='list'
        aria-expanded={open}
        aria-haspopup='listbox'
        aria-controls={`${baseId}-listbox`}
        aria-activedescendant={active ? `${baseId}-listbox-option-${active}` : undefined}
        showClearButton={false}
        {...props}
      />
    );
  },
);
ComboboxInput.displayName = 'Combobox.Input';

//
// * Toggle
//

export type ComboboxToggleProps = {
  className?: string;
};

const ComboboxToggle = ({ className }: ComboboxToggleProps): ReactElement => {
  const { open, setOpen, disabled } = useCombobox();

  return (
    <IconButton
      type='button'
      variant='text'
      size='md'
      icon={ChevronDown}
      aria-label='Toggle'
      onClick={() => {
        if (disabled) {
          return;
        }
        setOpen(!open);
      }}
      disabled={disabled}
      tabIndex={-1}
      className={cn(
        'h-10 w-10 text-subtle transition-transform hover:bg-surface-primary-hover mr-1',
        open && 'rotate-180',
        className,
      )}
    />
  );
};

ComboboxToggle.displayName = 'Combobox.Toggle';

//
// * Popup
//

export type ComboboxPopupProps = {
  children?: ReactNode;
  className?: string;
};

const ComboboxPopup = ({ children, className }: ComboboxPopupProps): ReactElement | null => {
  const { open } = useCombobox();

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute left-0 right-0 z-50 mt-1 rounded-sm bg-surface-neutral shadow-lg ring-1 ring-bdr-subtle',
        className,
      )}
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
  Input: ComboboxInput,
  Toggle: ComboboxToggle,
  Popup: ComboboxPopup,
});
