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

  // Focus tree container after popup opens (for tree mode)
  const focusTreeContainer = useCallback(() => {
    requestAnimationFrame(() => {
      const tree = document.getElementById(`${baseId}-tree`);
      const treeContainer = tree?.querySelector<HTMLElement>('[role="tree"]');
      treeContainer?.focus();
    });
  }, [baseId]);

  // Wrap keyboard handler with Combobox-specific behavior
  const keyHandler = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      if (disabled) {
        return;
      }

      // Ctrl/Cmd + Enter to apply staged selection
      // NOTE: Also handled in ComboboxTreeContent for when focus is in tree container
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (stagingEnabled) {
          e.preventDefault();
          applyStagedSelection();
          return;
        }
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!open) {
          e.preventDefault();
          setOpenInternal(true);
          // For tree mode, also focus tree after it renders
          if (contentType === 'tree') {
            focusTreeContainer();
          }
          return;
        }
        // For tree mode, transfer focus to tree container
        if (contentType === 'tree') {
          e.preventDefault();
          focusTreeContainer();
          return;
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }

      // Only delegate to Listbox navigation in listbox/auto mode
      if (contentType !== 'tree') {
        handleNavKeyDown(e);
      }
    },
    [
      disabled,
      open,
      setOpenInternal,
      setOpen,
      handleNavKeyDown,
      contentType,
      focusTreeContainer,
      stagingEnabled,
      applyStagedSelection,
    ],
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

  const { open, keyHandler, baseId, active, disabled, error, contentType } = useCombobox();

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
      aria-haspopup={contentType === 'tree' ? 'tree' : 'listbox'}
      aria-controls={`${baseId}-${contentType === 'tree' ? 'tree' : 'listbox'}`}
      aria-activedescendant={
        contentType === 'tree'
          ? undefined // Tree container manages aria-activedescendant
          : active
            ? `${baseId}-listbox-option-${active}`
            : undefined
      }
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
      className={cn(
        'w-full pr-0',
        'border-0 focus-within:border-0 focus-within:ring-0 focus-within:ring-offset-0',
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
        'shrink-0 text-subtle hover:bg-surface-neutral-hover',
        '[&>svg]:transition-transform [&>svg]:duration-150',
        open && '[&>svg]:rotate-180',
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
        'absolute right-0 left-0 z-50 mt-2 overflow-hidden rounded-sm bg-surface-neutral shadow-lg ring-1 ring-bdr-subtle',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
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
    keyHandler,
    registerItem,
    unregisterItem,
    getItems,
    isItemDisabled,
    selectionMode,
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
      focusMode='activedescendant'
      baseId={baseId}
      setActive={setActive}
      keyHandler={keyHandler}
      registerItem={registerItem}
      unregisterItem={unregisterItem}
      getItems={getItems}
      isItemDisabled={isItemDisabled}
    >
      <Listbox.Content className={className} {...props}>
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
      // Ctrl/Cmd + Enter to apply staged selection
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (stagingEnabled) {
          applyStagedSelection();
        } else {
          setOpen(false);
        }
        // Return focus to input
        const input = document.getElementById(`${baseId}-input`);
        input?.focus();
        return;
      }

      // Escape to close combobox and return focus to input
      // stopPropagation prevents VirtualizedTreeList from clearing selection
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        const input = document.getElementById(`${baseId}-input`);
        input?.focus();
        return;
      }

      // Redirect printable characters (except Space) to input for filtering
      // Space is excluded because it's used for selection in tree controls (ARIA pattern)
      if (e.key.length === 1 && e.key !== ' ' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const input = document.getElementById(`${baseId}-input`) as HTMLInputElement | null;
        if (input) {
          input.focus();
          // The character will be captured by the now-focused input
        }
      }
    },
    [setOpen, baseId, stagingEnabled, applyStagedSelection],
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- VirtualizedTreeList inside provides proper role and tabIndex
    <div id={`${baseId}-tree`} className={cn('outline-none', className)} onKeyDown={handleKeyDown} {...props}>
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
  Toggle: ComboboxToggle,
  Apply: ComboboxApply,
  Popup: ComboboxPopup,
  ListContent: ComboboxListContent,
  TreeContent: ComboboxTreeContent,
});
