import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/button';
import { IconButton } from '@/components/icon-button/icon-button';
import { Listbox } from '@/components/listbox';
import { SearchField } from '@/components/search-field';
import {
  useClickOutside,
  useControlledState,
  useControlledStateWithNull,
  useFloatingPosition,
  useItemRegistry,
  usePortalFocusContainer,
} from '@/hooks';
import { type ComboboxContextValue, ComboboxProvider, type ContentType, useCombobox, usePrefixedId } from '@/providers';
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
  /**
   * Content type determines popup content structure and keyboard navigation:
   * - `'auto'` (default): Wraps with Listbox.Root for backward compatibility
   * - `'listbox'`: Uses Combobox.ListContent with internal item registry for keyboard navigation
   * - `'tree'`: Uses Combobox.TreeContent for VirtualizedTreeList/TreeList.
   *   In tree mode, the internal item registry (`registerItem`, `getItems`, etc.) is unused.
   *   Consumer must manage `active` state externally and pass it to VirtualizedTreeList.
   */
  contentType?: ContentType;
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
  contentType = 'auto',
}: ComboboxRootProps): ReactElement => {
  const baseId = usePrefixedId();
  const controlRef = useRef<HTMLDivElement>(null);

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

  // Auto-active-on-open is owned by Listbox.Content (covers both 'auto' and
  // 'listbox' content modes). Skip it when active is consumer-controlled.
  const autoActiveOnOpen = controlledActive === undefined && !disabled;

  // Track if a Value component is present
  const [hasValue, setHasValue] = useState(false);

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

  // Focus tree container after popup opens (for tree mode)
  const focusTreeContainer = useCallback(() => {
    requestAnimationFrame(() => {
      const tree = document.getElementById(`${baseId}-tree`);
      const treeContainer = tree?.querySelector<HTMLElement>('[role="tree"]');
      treeContainer?.focus({ focusVisible: true });
    });
  }, [baseId]);

  // Focus first focusable listbox option (for listbox/auto mode)
  const focusListboxItem = useCallback(() => {
    requestAnimationFrame(() => {
      const listbox = document.getElementById(`${baseId}-listbox`);
      const focusable = listbox?.querySelector<HTMLElement>('[role="option"][tabindex="0"]');
      focusable?.focus({ focusVisible: true });
    });
  }, [baseId]);

  // Input-level handler. Owns: open/close transitions and focus transfer
  // from the input into the popup. Once focus is on a listbox item or the
  // tree container, their own handlers drive navigation and selection.
  const keyHandler = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      if (disabled) {
        return;
      }

      // Enter applies/closes the popup. In staged mode it commits staged
      // selection; otherwise it just closes (matches Escape). Selection itself
      // is driven by Space on the focused option, not Enter.
      // Also handled in Combobox.Popup for when focus has moved off the input.
      if (e.key === 'Enter' && open) {
        e.preventDefault();
        if (stagingEnabled) {
          applyStagedSelection();
        } else {
          setOpen(false);
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!open) {
          setOpenInternal(true);
        }
        if (contentType === 'tree') {
          focusTreeContainer();
        } else {
          focusListboxItem();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
    },
    [
      disabled,
      open,
      setOpenInternal,
      setOpen,
      contentType,
      focusTreeContainer,
      focusListboxItem,
      stagingEnabled,
      applyStagedSelection,
    ],
  );

  const context = useMemo<ComboboxContextValue>(
    () => ({
      open,
      setOpen,
      inputValue,
      setInputValue,
      baseId,
      controlRef,
      active: activeInternal,
      setActive: setActiveInternal,
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
      // Composable pattern additions
      contentType,
      selectionMode: isMultipleSelection ? 'multiple' : 'single',
      onSelectionChange: handleSelectionChange,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      hasValue,
      setHasValue,
      autoActiveOnOpen,
    }),
    [
      open,
      setOpen,
      closeOnBlur,
      keyHandler,
      inputValue,
      setInputValue,
      activeInternal,
      setActiveInternal,
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
      contentType,
      isMultipleSelection,
      handleSelectionChange,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      hasValue,
      autoActiveOnOpen,
    ],
  );

  // When contentType is 'tree' or 'listbox', content wrapper handles its own structure
  if (contentType === 'tree' || contentType === 'listbox') {
    return <ComboboxProvider value={context}>{children}</ComboboxProvider>;
  }

  // Default 'auto' mode: backward compat with internal Listbox.Root
  return (
    <ComboboxProvider value={context}>
      <Listbox.Root
        selectionMode={isMultipleSelection ? 'multiple' : 'single'}
        selection={currentSelection}
        onSelectionChange={handleSelectionChange}
        disabled={disabled}
        active={activeInternal}
        focusMode='roving-tabindex'
        baseId={baseId}
        setActive={setActiveInternal}
        registerItem={registerItem}
        unregisterItem={unregisterItem}
        getItems={getItems}
        isItemDisabled={isItemDisabled}
        autoActiveOnOpen={autoActiveOnOpen}
      >
        {children}
      </Listbox.Root>
    </ComboboxProvider>
  );
};
ComboboxRoot.displayName = 'Combobox';

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

        // Check if focus moved within the content
        if (relatedTarget instanceof Node && innerRef.current?.contains(relatedTarget)) {
          return;
        }

        // Check if focus moved to the portal popup (rendered outside content)
        if (relatedTarget instanceof Element && relatedTarget.closest('[data-combobox-popup]')) {
          return;
        }

        setOpen(false);
      },
      [setOpen, closeOnBlur],
    );

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        data-component='Combobox.Content'
        ref={useComposedRefs(ref, innerRef)}
        className={cn('relative', className)}
        onBlur={handleOnBlur}
        {...props}
      >
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
        false: 'border-bdr-subtle',
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
    compoundVariants: [
      {
        error: true,
        open: true,
        class: 'border-error',
      },
    ],
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
  const { open, disabled, error, controlRef } = useCombobox();

  return (
    <div
      data-component='Combobox.Control'
      ref={controlRef}
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

const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>((props, ref): ReactElement | null => {
  const innerRef = useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(ref, innerRef);

  const { open, keyHandler, baseId, disabled, error, contentType, hasValue } = useCombobox();

  useEffect(() => {
    if (open && !disabled) {
      innerRef.current?.focus();
    }
  }, [open, disabled]);

  // Return focus to the input when the popup closes (mirrors Combobox.Value's
  // close-effect). Only fires when no Combobox.Value is rendered, since the
  // input unmounts in that case and Value's own effect refocuses the button.
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (prevOpenRef.current && !open && !disabled) {
      innerRef.current?.focus({ focusVisible: true });
    }
    prevOpenRef.current = open;
  }, [open, disabled]);

  // Hide when Value is present and closed
  if (hasValue && !open) return null;

  return (
    <SearchField.Input
      data-component='Combobox.Input'
      ref={composedRef}
      id={`${baseId}-input`}
      onKeyDown={keyHandler}
      disabled={disabled}
      aria-disabled={disabled}
      aria-invalid={error ?? undefined}
      role='combobox'
      aria-autocomplete='list'
      aria-expanded={open}
      aria-haspopup={contentType === 'tree' ? 'tree' : 'listbox'}
      aria-controls={`${baseId}-${contentType === 'tree' ? 'tree' : 'listbox'}`}
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
  error?: boolean;
} & ComponentPropsWithoutRef<typeof SearchField.Root>;

const ComboboxSearch = ({ children, className, ...props }: ComboboxSearchProps): ReactElement => {
  const { inputValue, setInputValue, error } = useCombobox();

  return (
    <SearchField.Root
      data-component='Combobox.Search'
      value={inputValue}
      onChange={setInputValue}
      className={cn(
        'w-full pr-0',
        'border-0 focus-within:border-0 focus-within:ring-0 focus-within:ring-offset-0',
        error && 'hover:outline-error',
        className,
      )}
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

const ComboboxSearchIcon = ({ className, ...props }: ComboboxSearchIconProps): ReactElement | null => {
  const { open, hasValue } = useCombobox();

  // Hide when Value is present and closed
  if (hasValue && !open) return null;

  return <SearchField.Icon data-component='Combobox.SearchIcon' className={className} {...props} />;
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
      data-component='Combobox.Toggle'
      type='button'
      variant='text'
      size='sm'
      iconSize='lg'
      icon={ChevronDown}
      aria-label='Toggle'
      onClick={() => {
        if (!disabled) setOpen(!open);
      }}
      disabled={disabled}
      tabIndex={-1}
      iconClassName={cn('transition-transform duration-150', open && 'rotate-180')}
      className={cn(
        'mr-1.25 shrink-0 rounded-[0.1875rem] text-subtle hover:bg-surface-neutral-hover',
        'after:-inset-1 after:-z-10 relative z-0 overflow-visible after:absolute after:rounded-sm after:content-[""]',
        !disabled && 'after:pointer-events-auto',
        'disabled:opacity-100',
        className,
      )}
      {...props}
    />
  );
};
ComboboxToggle.displayName = 'Combobox.Toggle';

//
// * Value
//

export type ComboboxValueProps = {
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children'>;

const ComboboxValue = ({ className, children, ...props }: ComboboxValueProps): ReactElement | null => {
  const { open, setOpen, disabled, setHasValue } = useCombobox();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prevOpenRef = useRef(open);

  // Register presence with context - useLayoutEffect prevents flash on initial render
  useLayoutEffect(() => {
    setHasValue(true);
    return () => setHasValue(false);
  }, [setHasValue]);

  // Focus button when combobox closes (open: true → false)
  useEffect(() => {
    if (prevOpenRef.current && !open) {
      buttonRef.current?.focus();
    }
    prevOpenRef.current = open;
  }, [open]);

  const handleClick = useCallback(() => {
    if (!disabled) setOpen(true);
  }, [disabled, setOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
      }
    },
    [setOpen],
  );

  // Hidden when open (Input is visible instead)
  if (open) return null;

  return (
    <button
      data-component='Combobox.Value'
      ref={buttonRef}
      type='button'
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        'flex flex-1 items-center gap-2 truncate text-left',
        '-mx-4.5 -my-3 h-11.5 px-4.5',
        'cursor-pointer select-none',
        'focus-visible:outline-none',
        disabled && 'pointer-events-none cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
ComboboxValue.displayName = 'Combobox.Value';

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
      data-component='Combobox.Apply'
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
// * Portal
//

export type ComboboxPortalProps = {
  container?: HTMLElement | null;
  forceMount?: boolean;
  children?: ReactNode;
};

const ComboboxPortal = ({ container, forceMount, children }: ComboboxPortalProps): ReactElement | null => {
  const { open } = useCombobox();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || (!forceMount && !open)) {
    return null;
  }

  return createPortal(children, container ?? document.body);
};
ComboboxPortal.displayName = 'Combobox.Portal';

//
// * Popup
//

export type ComboboxPopupProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const ComboboxPopup = forwardRef<HTMLDivElement, ComboboxPopupProps>(
  ({ children, className, style, ...props }, ref): ReactElement | null => {
    const {
      open,
      setOpen,
      controlRef,
      closeOnBlur,
      contentType,
      baseId,
      stagingEnabled,
      applyStagedSelection,
      selectionMode,
    } = useCombobox();
    const innerRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, innerRef);
    const [isPortalMode, setIsPortalMode] = useState(false);

    // Detect portal mode synchronously before paint to avoid flash
    useLayoutEffect(() => {
      if (!open || !innerRef.current) return;
      const parent = innerRef.current.parentElement;
      setIsPortalMode(parent === document.body);
    }, [open]);

    // Register with parent focus trap (e.g., Dialog) when in portal mode.
    // This allows focus to move to the popup even though it's rendered outside the dialog DOM.
    // See rules/patterns.mdc — "Focus Trap with Portaled Content"
    usePortalFocusContainer(innerRef, isPortalMode);

    // Floating position for portal mode
    const position = useFloatingPosition({
      enabled: open && isPortalMode,
      anchorRef: controlRef,
      contentRef: innerRef,
      align: 'start',
    });

    // Click outside handling for portal mode (blur won't work across portal boundary)
    useClickOutside({
      enabled: open && isPortalMode && closeOnBlur,
      contentRef: innerRef,
      excludeRefs: controlRef ? [controlRef] : undefined,
      onClose: () => setOpen(false),
    });

    const focusInput = useCallback(() => {
      const input = document.getElementById(`${baseId}-input`);
      input?.focus({ focusVisible: true });
    }, [baseId]);

    // Capture phase: intercept Escape and Enter before Listbox.Content's
    // bubble-phase handler runs.
    // Enter semantics:
    //   - staged → apply staged selection and close
    //   - multi  → close without toggling (Space is the selection key)
    //   - single → fall through; Listbox handles Enter as select-and-commit,
    //              which triggers single-mode auto-close
    const handleKeyDownCapture = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (contentType === 'tree') return;

        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          focusInput();
          return;
        }

        if (e.key === 'Enter') {
          if (selectionMode === 'single' && !stagingEnabled) return;

          e.preventDefault();
          e.stopPropagation();
          if (stagingEnabled) {
            applyStagedSelection();
          } else {
            setOpen(false);
          }
          focusInput();
        }
      },
      [contentType, setOpen, focusInput, stagingEnabled, applyStagedSelection, selectionMode],
    );

    // Bubble phase: redirect printable keys (and Backspace) back to the input
    // for filtering. Mirrors ComboboxTreeContent's redirect — focus the input
    // so the browser delivers the keystroke to it as the next event.
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (contentType === 'tree') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;

        const isPrintable = e.key.length === 1 && e.key !== ' ';
        const isBackspace = e.key === 'Backspace';
        if (isPrintable || isBackspace) {
          focusInput();
        }
      },
      [contentType, focusInput],
    );

    if (!open) {
      return null;
    }

    // Calculate width from control element for portal mode
    const portalWidth = isPortalMode && controlRef?.current ? controlRef.current.offsetWidth : undefined;

    // Hide in portal mode until position is calculated
    const isHidden = isPortalMode && !position;

    const popupStyle: React.CSSProperties = isPortalMode
      ? {
          position: 'fixed',
          top: position ? `${position.top}px` : '0',
          left: position?.left !== undefined ? `${position.left}px` : undefined,
          right: position?.right !== undefined ? `${position.right}px` : undefined,
          width: portalWidth,
          ...((style as React.CSSProperties | undefined) ?? {}),
        }
      : ((style as React.CSSProperties | undefined) ?? {});

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- key handlers redirect to interactive descendants (listbox items / input)
      <div
        data-component='Combobox.Popup'
        ref={composedRefs}
        data-combobox-popup=''
        data-side={isPortalMode ? position?.side : 'bottom'}
        className={cn(
          'z-50 overflow-hidden rounded-sm bg-surface-neutral shadow-lg ring-1 ring-bdr-subtle',
          'data-[side=top]:-mt-2 data-[side=bottom]:mt-2',
          !isPortalMode && 'absolute right-0 left-0',
          isHidden && 'pointer-events-none opacity-0',
          className,
        )}
        style={popupStyle}
        onKeyDownCapture={handleKeyDownCapture}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ComboboxPopup.displayName = 'Combobox.Popup';

//
// * ListContent
//

export type ComboboxListContentProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const ComboboxListContent = ({ children, className, ...props }: ComboboxListContentProps): ReactElement => {
  const {
    selection,
    onSelectionChange,
    disabled,
    active,
    setActive,
    baseId,
    registerItem,
    unregisterItem,
    getItems,
    isItemDisabled,
    selectionMode,
    autoActiveOnOpen,
  } = useCombobox();

  // Convert Set to array for Listbox
  const selectionArray = useMemo(() => Array.from(selection), [selection]);

  return (
    <Listbox.Root
      selectionMode={selectionMode}
      selection={selectionArray}
      onSelectionChange={onSelectionChange}
      disabled={disabled}
      active={active}
      focusMode='roving-tabindex'
      baseId={baseId}
      setActive={setActive}
      registerItem={registerItem}
      unregisterItem={unregisterItem}
      getItems={getItems}
      isItemDisabled={isItemDisabled}
      autoActiveOnOpen={autoActiveOnOpen}
    >
      <Listbox.Content data-component='Combobox.ListContent' className={className} {...props}>
        {children}
      </Listbox.Content>
    </Listbox.Root>
  );
};
ComboboxListContent.displayName = 'Combobox.ListContent';

//
// * TreeContent
//

export type ComboboxTreeContentProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

/**
 * Container for tree content in Combobox popup.
 *
 * Unlike ListContent, TreeContent does not provide item management.
 * Consumers must:
 * - Manage `active` state externally and pass to VirtualizedTreeList
 * - Calculate container height (Virtuoso requires explicit height)
 * - Handle selection via VirtualizedTreeList props
 *
 * @example
 * ```tsx
 * const [activeId, setActiveId] = useState<string | null>('1');
 * const treeHeight = useMemo(() => Math.min(items.length * 32 + 8, 240), [items.length]);
 *
 * <Combobox.TreeContent style={{ height: treeHeight }}>
 *   <VirtualizedTreeList
 *     active={activeId}
 *     onActiveChange={setActiveId}
 *     items={items}
 *     className="h-full"
 *   />
 * </Combobox.TreeContent>
 * ```
 */
const ComboboxTreeContent = ({ children, className, ...props }: ComboboxTreeContentProps): ReactElement => {
  const { baseId, setOpen, stagingEnabled, applyStagedSelection } = useCombobox();

  // Handle keyboard shortcuts from tree content
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const focusInput = (): void => {
        const input = document.getElementById(`${baseId}-input`);
        input?.focus({ focusVisible: true });
      };

      // Enter closes the popup, mirroring listbox behavior. TreeList runs
      // first in bubble phase: in single mode it toggles selection; in multi
      // mode Space is the selection key, so Enter only commits the popup.
      // Staged mode applies staged selection.
      if (e.key === 'Enter') {
        if (stagingEnabled) {
          e.preventDefault();
          e.stopPropagation();
          applyStagedSelection();
          focusInput();
          return;
        }
        setOpen(false);
        focusInput();
        return;
      }

      // Escape to close combobox and return focus to input
      // stopPropagation prevents VirtualizedTreeList from clearing selection
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        focusInput();
        return;
      }

      // Redirect printable characters (except Space) and Backspace to input for filtering
      // Space is excluded because it's used for selection in tree controls (ARIA pattern)
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const isPrintable = e.key.length === 1 && e.key !== ' ';
      const isBackspace = e.key === 'Backspace';
      if (isPrintable || isBackspace) {
        focusInput();
      }
    },
    [setOpen, baseId, stagingEnabled, applyStagedSelection],
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- VirtualizedTreeList inside provides proper role and tabIndex
    <div
      data-component='Combobox.TreeContent'
      id={`${baseId}-tree`}
      className={cn('outline-none', className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  );
};
ComboboxTreeContent.displayName = 'Combobox.TreeContent';

export type { ContentType };

export const Combobox = Object.assign(ComboboxRoot, {
  Root: ComboboxRoot,
  Content: ComboboxContent,
  Control: ComboboxControl,
  Search: ComboboxSearch,
  Input: ComboboxInput,
  SearchIcon: ComboboxSearchIcon,
  Value: ComboboxValue,
  Toggle: ComboboxToggle,
  Apply: ComboboxApply,
  Portal: ComboboxPortal,
  Popup: ComboboxPopup,
  ListContent: ComboboxListContent,
  TreeContent: ComboboxTreeContent,
});
