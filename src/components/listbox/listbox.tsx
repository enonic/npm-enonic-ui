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
  selection?: readonly string[];
  defaultSelection?: readonly string[];
  onSelectionChange?: (selection: readonly string[]) => void;
  active?: string;
  defaultActive?: string;
  setActive?: (active: string | undefined) => void;
  selectionMode?: 'single' | 'multiple';
  disabled?: boolean;
  children?: ReactNode;
};

const ListboxRoot = ({
  selection: controlledSelection,
  defaultSelection = EMPTY_SELECTION,
  onSelectionChange,
  active: controlledActive,
  defaultActive,
  setActive,
  selectionMode = 'single',
  disabled,
  children,
}: ListboxRootProps): ReactElement => {
  const listboxId = usePrefixedId();

  // Selection - store as Set internally for O(1) lookups
  const [uncontrolledSelection, setUncontrolledSelection] = useState<Set<string>>(() => new Set(defaultSelection));
  const isSelectionControlled = controlledSelection !== undefined;
  const selectionSet = useMemo(
    () => (isSelectionControlled ? new Set(controlledSelection) : uncontrolledSelection),
    [isSelectionControlled, controlledSelection, uncontrolledSelection],
  );

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
      disabled,
      setActive: updateActive,
      toggleValue,
      registerItem,
      unregisterItem,
      getItems,
      listboxId,
    }),
    [
      active,
      selectionSet,
      selectionMode,
      disabled,
      updateActive,
      toggleValue,
      registerItem,
      unregisterItem,
      getItems,
      listboxId,
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
        ref={useComposedRefs(ref, innerRef)}
        id={listboxId}
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
        aria-activedescendant={active ? `${listboxId}-option-${active}` : undefined}
        tabIndex={disabled ? -1 : 0}
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

export type ListboxItemProps = {
  value: string;
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const ListboxItem = ({ value, children, className, ...props }: ListboxItemProps): ReactElement => {
  const ctx = useListbox();
  const { disabled, toggleValue, registerItem, unregisterItem, listboxId } = ctx;
  const isSelected = ctx.selection.has(value);
  const isActive = ctx.active === value;

  useEffect(() => {
    registerItem(value);
    return () => {
      unregisterItem(value);
    };
  }, [value, registerItem, unregisterItem]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      toggleValue(value);
    }
  }, [disabled, toggleValue, value]);

  return (
    // ARIA listbox pattern: options are not individually focusable
    // Parent listbox handles all keyboard interactions via aria-activedescendant
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
    <div
      id={`${listboxId}-option-${value}`}
      className={cn(listboxItemVariants({ selected: isSelected, active: isActive }), className)}
      role='option'
      aria-selected={isSelected}
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
