import { Listbox, SearchInput } from '@/components';
import { IconButton } from '@/components/icon-button/icon-button';
import { type ComboboxContextValue, ComboboxProvider, useCombobox, usePrefixedId } from '@/providers';
import { cn } from '@/utils';
import { useComposedRefs } from '@/utils/ref';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { useEffect } from 'react';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

// * Root

export type ComboboxRootProps = {
  children?: ReactNode;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnBlur?: boolean;

  value?: string;
  onChange?: (value: string | undefined) => void;

  selectionMode?: 'single' | 'multiple';
  selection?: readonly string[];
  onSelectionChange?: (selection: readonly string[]) => void;

  disabled?: boolean;
  error?: boolean;
};

const ComboboxRoot = ({
  children,
  open: controlledOpen,
  onOpenChange,
  closeOnBlur = true,
  value,
  onChange,
  disabled = false,
  error = false,
  selectionMode = 'single',
  selection: controlledSelection,
  onSelectionChange,
}: ComboboxRootProps): ReactElement => {
  const baseId = usePrefixedId();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpenControlled = controlledOpen !== undefined;
  const open = isOpenControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const [uncontrolledSelection, setUncontrolledSelection] = useState<readonly string[]>([]);
  const isSelectionControlled = controlledSelection !== undefined;
  const selectedItems = isSelectionControlled ? controlledSelection : uncontrolledSelection;
  const onSelectionChangeInner = useCallback(
    (newSelection: readonly string[]) => {
      if (!isSelectionControlled) {
        setUncontrolledSelection(newSelection);
      }

      onSelectionChange?.(newSelection);

      if (selectionMode === 'single') {
        setOpen(false);
      }
    },
    [isSelectionControlled, selectionMode, setOpen, onSelectionChange, selectedItems],
  );

  const [uncontrolledInput, setUncontrolledInput] = useState('');
  const isInputControlled = value !== undefined;
  const inputValue = isInputControlled ? value : uncontrolledInput;
  const setInputValue = useCallback(
    (next: string) => {
      if (!isInputControlled) {
        setUncontrolledInput(next);
      }
      onChange?.(next);
      setOpen(true);
    },
    [isInputControlled, onChange, setOpen],
  );

  const toggleValueSelection = useCallback(
    (value: string) => {
      let newSelection: readonly string[] = [];

      if (selectionMode === 'multiple') {
        if (selectedItems.includes(value)) {
          newSelection = selectedItems.filter(item => item !== value);
        } else {
          newSelection = [...selectedItems, value];
        }
      } else {
        newSelection = [value];
      }
      onSelectionChangeInner(newSelection);
    },
    [selectionMode, selectedItems, onSelectionChangeInner],
  );

  const [active, setActive] = useState<string | undefined>(undefined);

  const innerRef = useRef<HTMLDivElement>(null);

  const getItems = useCallback((): string[] => {
    const container = innerRef.current;

    if (!container) {
      return [];
    }

    const optionNodes = container.querySelectorAll<HTMLElement>('[role="option"][data-value]');
    return Array.from(optionNodes)
      .map(node => node.dataset.value)
      .filter(v => v !== undefined);
  }, []);

  const moveActive = useCallback(
    (delta: number) => {
      const items = getItems();

      if (!items.length) {
        return;
      }

      const currentIndex = active ? items.indexOf(active) : -1;
      const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + delta));
      setActive(items[newIndex]);
    },
    [active, setActive, getItems],
  );

  const keyHandler = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      if (disabled) {
        return;
      }

      const items = getItems();

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        moveActive(1);
      } else if (e.key === 'ArrowUp') {
        setOpen(true);
        moveActive(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActive(items[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActive(items[items.length - 1]);
      } else if (e.key === 'Enter') {
        if (open) {
          e.preventDefault();

          if (active) {
            toggleValueSelection(active);
          }

          setOpen(false);
          setActive(items[0]);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
        setActive(items[0]);
      }
    },
    [disabled, moveActive, setOpen, toggleValueSelection, open],
  );

  useEffect(() => {
    if (open && active === undefined) {
      const items = getItems();
      if (items.length > 0) {
        setActive(items[0]);
      }
    }
  }, [open, active, getItems]);

  const context = useMemo<ComboboxContextValue>(
    () => ({
      open,
      setOpen,
      inputValue,
      setInputValue,
      baseId,
      active,
      disabled,
      error,
      closeOnBlur,
      keyHandler,
      selection: selectedItems,
    }),
    [open, setOpen, closeOnBlur, keyHandler, inputValue, setInputValue, active, baseId, disabled, error, selectedItems],
  );

  return (
    <div ref={innerRef}>
      <ComboboxProvider value={context}>
        <Listbox.Root
          selectionMode={selectionMode}
          selection={selectedItems}
          onSelectionChange={onSelectionChangeInner}
          disabled={disabled}
          active={active}
          focusable={false}
          baseId={baseId}
          setActive={setActive}
          keyHandler={keyHandler}
        >
          {children}
        </Listbox.Root>
      </ComboboxProvider>
    </div>
  );
};

ComboboxRoot.displayName = 'Combobox.Root';

export type ComboboxContentProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  ({ className, children }, ref): ReactElement => {
    const { setOpen, baseId, closeOnBlur } = useCombobox();
    const innerRef = useRef<HTMLDivElement>(null);

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

// * Control

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

// * Input

export type ComboboxInputProps = {
  className?: string;
  placeholder?: string;
};

const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(
  ({ className, placeholder, ...props }, ref): ReactElement => {
    const { inputValue, setInputValue, open, keyHandler, selection, baseId, active, disabled } = useCombobox();
    const innerRef = useRef<HTMLInputElement>(null);

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

// * Toggle

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

// * Popup

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
