import { type ListboxContextValue, ListboxProvider, useListbox, usePrefixedId } from '@/providers';
import { cn } from '@/utils';
import { useComposedRefs } from '@/utils/ref';
import { cva } from 'class-variance-authority';
import {
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
  },
});

export type ListboxRootProps = {
  className?: string;
  selection?: ReadonlySet<string>;
  defaultSelection?: ReadonlySet<string>;
  setSelection?: (selection: ReadonlySet<string>) => void;
  active?: string;
  defaultActive?: string;
  setActive?: (active: string | undefined) => void;
  selectionMode?: 'single' | 'multiple';
  disabled?: boolean;
  children?: ReactNode;
};

const ListboxRoot = ({
  selection: controlledSelection,
  defaultSelection = new Set(),
  setSelection,
  active: controlledActive,
  defaultActive,
  setActive,
  selectionMode = 'single',
  disabled = false,
  children,
}: ListboxRootProps): ReactElement => {
  const listboxId = usePrefixedId();

  // Selection
  const [uncontrolledSelection, setUncontrolledSelection] = useState(defaultSelection);
  const isSelectionControlled = controlledSelection !== undefined;
  const selection = isSelectionControlled ? controlledSelection : uncontrolledSelection;

  // Active
  const [uncontrolledActive, setUncontrolledActive] = useState<string | undefined>(defaultActive);
  const isActiveControlled = controlledActive !== undefined;
  const active = isActiveControlled ? controlledActive : uncontrolledActive;

  const updateActive = useCallback(
    (id?: string) => {
      if (!isActiveControlled) {
        setUncontrolledActive(id);
      }
      setActive?.(id);
    },
    [isActiveControlled, setActive],
  );

  // Items registry
  const itemsRef = useRef<Set<string>>(new Set());

  const registerItem = useCallback((value: string) => {
    itemsRef.current.add(value);
  }, []);

  const unregisterItem = useCallback((value: string) => {
    itemsRef.current.delete(value);
  }, []);

  const getItems = useCallback(() => Array.from(itemsRef.current), []);

  const toggleValue = useCallback(
    (value: string) => {
      const isSelected = selection.has(value);
      let newSelection = new Set(selection);
      if (selectionMode === 'single') {
        newSelection = isSelected ? new Set() : new Set([value]);
      } else {
        if (isSelected) {
          newSelection.delete(value);
        } else {
          newSelection.add(value);
        }
      }

      if (!isSelectionControlled) {
        setUncontrolledSelection(newSelection);
      }
      setSelection?.(newSelection);
      updateActive(value);
    },
    [selection, selectionMode, isSelectionControlled, setSelection, updateActive],
  );

  const value = useMemo<ListboxContextValue>(
    () => ({
      active,
      selection,
      selectionMode,
      disabled,
      setActive: updateActive,
      toggleValue,
      registerItem,
      unregisterItem,
      getItems,
      listboxId,
    }),
    [active, selection, selectionMode, disabled, updateActive, toggleValue, registerItem, getItems, listboxId],
  );

  return <ListboxProvider value={value}>{children}</ListboxProvider>;
};

ListboxRoot.displayName = 'ListboxRoot';

export type ListboxContentProps = {
  className?: string;
  label?: string;
  visualFocus?: boolean;
  domFocusable?: boolean;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const ListboxContent = forwardRef<HTMLDivElement, ListboxContentProps>(
  ({ className, label, visualFocus, domFocusable = true, children, ...props }, ref): ReactElement => {
    const { active, disabled, getItems, setActive, toggleValue, listboxId } = useListbox();
    const innerRef = useRef<HTMLDivElement>(null);

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
      [getItems, active, setActive],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLElement>) => {
        if (disabled) {
          return;
        }
        const items = getItems();
        if (!items.length) {
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveActive(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveActive(-1);
        } else if (e.key === 'Home') {
          e.preventDefault();
          setActive(items[0]);
        } else if (e.key === 'End') {
          e.preventDefault();
          setActive(items[items.length - 1]);
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (active) {
            toggleValue(active);
          }
        }
      },
      [disabled, getItems, active, moveActive, toggleValue, setActive],
    );

    useEffect(() => {
      if (!active || !innerRef.current) {
        return;
      }
      const el = innerRef.current.querySelector<HTMLDivElement>(`#${listboxId}-option-${active}`);
      if (el) {
        el.scrollIntoView({
          block: 'nearest',
          behavior: 'auto',
        });
      }
    }, [active, listboxId]);

    return (
      <div
        id={listboxId}
        ref={useComposedRefs(ref, innerRef)}
        role='listbox'
        tabIndex={domFocusable && !disabled ? 0 : -1}
        aria-disabled={disabled}
        aria-label={label}
        aria-activedescendant={active ? `${listboxId}-option-${active}` : undefined}
        className={cn(
          'flex flex-col items-start grow shrink-0 basis-0',
          'max-h-100 overflow-y-auto',
          'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/50',
          visualFocus && 'outline-none ring-3 ring-ring/50',
          disabled && 'pointer-events-none opacity-30',
          className,
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ListboxContent.displayName = 'ListboxContent';

export type ListboxItemProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

const ListboxItem = ({ value, children, className }: ListboxItemProps): ReactElement => {
  const ctx = useListbox();
  const isSelected = ctx.selection.has(value);
  const isActive = ctx.active === value;

  useEffect(() => {
    ctx.registerItem(value);
    return () => {
      ctx.unregisterItem(value);
    };
  }, [value, ctx]);

  const handleClick = useCallback(() => {
    if (!ctx.disabled) {
      ctx.toggleValue(value);
    }
  }, [ctx, value]);

  return (
    /* eslint-disable jsx-a11y/click-events-have-key-events */
    /* eslint-disable jsx-a11y/interactive-supports-focus */
    <div
      id={`${ctx.listboxId}-option-${value}`}
      data-value={value}
      data-active={isActive || undefined}
      role='option'
      aria-selected={isSelected}
      className={cn(listboxItemVariants({ selected: isSelected, active: isActive }), className)}
      onClick={handleClick}
    >
      {children}
    </div>
    /* eslint-enable jsx-a11y/click-events-have-key-events */
    /* eslint-enable jsx-a11y/interactive-supports-focus */
  );
};

export const Listbox = Object.assign(ListboxRoot, {
  Root: ListboxRoot,
  Content: ListboxContent,
  Item: ListboxItem,
});
