import { usePrefixedId } from '@/providers';
import { cn } from '@/utils';
import { useComposedRefs } from '@/utils/ref';
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

export type ListboxProps<Data = unknown> = {
  className?: string;
  label?: string;
  selection?: ReadonlySet<string>;
  defaultSelection?: ReadonlySet<string>;
  setSelection?: (selection: ReadonlySet<string>) => void;
  selectionMode?: 'single' | 'multiple';
  active?: string;
  defaultActive?: string;
  onActiveChange?: (active: string | undefined) => void;
  disabled?: boolean;
  items: readonly Data[];
  /**
   * Renders each list item. For optimal performance, wrap this callback in `useCallback`
   * or define it outside the component to prevent unnecessary re-renders.
   *
   * @param data - The item data
   * @param selected - Whether the item is selected
   * @param active - Whether the item is currently active (keyboard focused)
   */
  renderItem: (data: Readonly<Data>, selected: boolean, active: boolean) => ReactNode;
  /**
   * Extracts a unique string value from each item. This function should be stable
   * (memoized or defined outside component) to prevent performance issues.
   */
  getValue: (data: Readonly<Data>) => string;
} & React.HTMLAttributes<HTMLUListElement>;

function ListboxImpl<D = unknown>(
  {
    className,
    selection: controlledSelection,
    selectionMode = 'single',
    disabled = false,
    defaultSelection = new Set(),
    setSelection,
    active: controlledActive,
    defaultActive,
    onActiveChange,
    items,
    renderItem,
    getValue,
    ...props
  }: ListboxProps<D>,
  ref: React.ForwardedRef<HTMLUListElement>,
): React.ReactElement {
  const listboxId = usePrefixedId();
  const innerRef = useRef<HTMLUListElement>(null);

  const [uncontrolledSelection, setUncontrolledSelection] = useState(defaultSelection);
  const isSelectionControlled = controlledSelection !== undefined;
  const selection = isSelectionControlled ? controlledSelection : uncontrolledSelection;

  const [uncontrolledActive, setUncontrolledActive] = useState<string | undefined>(
    defaultActive ?? (items[0] ? getValue(items[0]) : undefined),
  );
  const isActiveControlled = controlledActive !== undefined;
  const active = isActiveControlled ? controlledActive : uncontrolledActive;

  const valueToIndexMap = useMemo(() => {
    return new Map(items.map((item, idx) => [getValue(item), idx]));
  }, [items, getValue]);

  // Helper to update active state (supports both controlled and uncontrolled modes)
  const updateActive = useCallback(
    (newActive: string | undefined): void => {
      if (!isActiveControlled) {
        setUncontrolledActive(newActive);
      }
      onActiveChange?.(newActive);
    },
    [isActiveControlled, onActiveChange],
  );

  useEffect(() => {
    if (!active || !items.some(item => getValue(item) === active)) {
      updateActive(items[0] ? getValue(items[0]) : undefined);
    }
  }, [items, getValue, active, updateActive]);

  useEffect(() => {
    if (!active || !innerRef.current) return;

    const el = innerRef.current.querySelector<HTMLLIElement>(`#${listboxId}-option-${active}`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  }, [active, listboxId]);

  const handleToggleValue = (value: string): void => {
    const isAlreadySelected = selection.has(value);
    let newSelection: Set<string>;

    if (selectionMode === 'single') {
      newSelection = isAlreadySelected ? new Set() : new Set([value]);
    } else {
      newSelection = new Set(selection);

      if (isAlreadySelected) {
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
  };

  const handleClickItem = ({ target }: React.MouseEvent<Element>): void => {
    const li = target instanceof Element ? target.closest('li') : null;

    const value = li?.getAttribute('data-value');
    if (value) {
      handleToggleValue(value);
    }
  };

  const moveActive = (delta: number): void => {
    const activeIndex = active ? (valueToIndexMap.get(active) ?? 0) : 0;
    const newIndex = Math.max(0, Math.min(items.length - 1, activeIndex + delta));
    updateActive(getValue(items[newIndex]));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
    if (disabled) {
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
      const firstItem = items[0];
      updateActive(firstItem && getValue(firstItem));
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastItem = items.at(-1);
      updateActive(lastItem && getValue(lastItem));
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (active) {
        handleToggleValue(active);
      }
    }
  };

  return (
    <ul
      id={listboxId}
      ref={useComposedRefs(ref, innerRef)}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        'flex flex-col items-start grow-1 shrink-0 basis-0',
        'max-h-100 px-0 overflow-y-auto',
        'focus-within:border-bdr-solid focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/50 focus-within:ring-offset-0',
        'focus-within:[&>li[data-active=true]]:bg-surface-primary-hover',
        'focus-within:[&>li[data-active=true][aria-selected=true]]:bg-surface-primary-selected-hover',
        'transition-highlight',
        disabled && 'pointer-events-none select-none opacity-30',
        className,
      )}
      role='listbox'
      aria-activedescendant={active ? `${listboxId}-option-${active}` : undefined}
      aria-disabled={disabled}
      aria-multiselectable={selectionMode === 'multiple'}
      aria-label={props.label ?? undefined}
      aria-orientation='vertical'
      onKeyDown={handleKeyDown}
      onClick={handleClickItem}
    >
      {items.map(item => {
        const value = getValue(item);
        const selected = selection.has(value);
        const isActive = value === active;

        return (
          <li
            id={`${listboxId}-option-${value}`}
            key={value}
            data-value={value}
            data-active={isActive ? 'true' : 'false'}
            tabIndex={-1}
            className={cn(
              'flex items-center w-full px-4.5 py-1 gap-x-2.5',
              !disabled && 'cursor-pointer',
              selected
                ? 'bg-surface-primary-selected text-alt hover:bg-surface-primary-selected-hover'
                : 'hover:bg-surface-primary-hover',
            )}
            role='option'
            aria-selected={selected}
          >
            {renderItem(item, selected, isActive)}
          </li>
        );
      })}
    </ul>
  );
}

export const Listbox = forwardRef(ListboxImpl) as { displayName: 'Listbox' } & (<Data = unknown>(
  props: ListboxProps<Data> & { ref?: React.Ref<HTMLUListElement> },
) => ReactElement);

Listbox.displayName = 'Listbox';
