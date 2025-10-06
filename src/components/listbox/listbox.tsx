import { usePrefixedId } from '@/providers';
import { cn } from '@/utils';
import { useComposedRefs } from '@/utils/ref';
import { useEffect, useState } from 'preact/hooks';
import { forwardRef, type ReactNode, useRef } from 'react';

export type ListboxProps<Data = unknown> = {
  className?: string;
  label?: string;
  selection?: Set<string>;
  defaultSelection?: Set<string>;
  setSelection?: (selection: Set<string>) => void;
  selectionMode?: 'single' | 'multiple';
  disabled?: boolean;
  items: Data[];
  renderItem: (data: Data, selected: boolean, active: boolean) => ReactNode;
  getValue: (data: Data) => string;
} & React.HTMLAttributes<HTMLUListElement>;

export const Listbox = forwardRef<HTMLUListElement, ListboxProps>(
  (
    {
      className,
      selection,
      selectionMode = 'single',
      disabled = false,
      defaultSelection = new Set(),
      setSelection,
      items,
      renderItem,
      getValue,
      ...props
    },
    outerRef: React.ForwardedRef<HTMLUListElement>,
  ): React.ReactElement => {
    const listboxId = usePrefixedId();
    const innerRef = useRef<HTMLUListElement>(null);
    const [active, setActive] = useState<string | undefined>(items[0] ? getValue(items[0]) : undefined);
    const [uncontrolledSelection, setUncontrolledSelection] = useState(defaultSelection);
    const isControlled = selection !== undefined;
    const currentSelection = isControlled ? selection : uncontrolledSelection;

    useEffect(() => {
      if (!active || !items.some(item => getValue(item) === active)) {
        setActive(items[0] ? getValue(items[0]) : undefined);
      }
    }, [items, getValue]);

    useEffect(() => {
      if (!active || !innerRef.current) return;

      const el = innerRef.current.querySelector<HTMLElement>(`#${listboxId}-option-${active}`);

      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, [active]);

    const handleToggleValue = (value: string): void => {
      const isAlreadySelected = currentSelection.has(value);
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

      if (!isControlled) {
        setUncontrolledSelection(newSelection);
      }

      setSelection?.(newSelection);
      setActive(value);
    };

    const handleClickItem = (e: React.MouseEvent<HTMLElement>): void => {
      const li = (e.target as HTMLElement).closest('li');

      if (!li) {
        return;
      }

      const value = li.getAttribute('data-value');
      if (value) {
        handleToggleValue(value);
      }
    };

    const moveActive = (delta: number): void => {
      const activeIndex = items.findIndex(item => getValue(item) === active);
      const newIndex = Math.max(0, Math.min(items.length - 1, activeIndex + delta));
      setActive(getValue(items[newIndex]));
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
        setActive(items[0] ? getValue(items[0]) : undefined);
      } else if (e.key === 'End') {
        setActive(items.length > 0 ? getValue(items[items.length - 1]) : undefined);
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
        ref={useComposedRefs(outerRef, innerRef)}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'flex flex-col items-start grow-1 shrink-0 basis-0',
          'max-h-100 overflow-y-auto',
          'focus-within:border-bdr-solid focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/50 focus-within:ring-offset-0',
          'focus-within:[&>li[data-active=true]]:bg-surface-primary-hover',
          'focus-within:[&>li[data-active=true][aria-selected=true]]:bg-surface-primary-selected-hover',
          'px-0',
          disabled && 'pointer-events-none opacity-30',
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
          const selected = currentSelection.has(value);
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
  },
);

Listbox.displayName = 'Listbox';
