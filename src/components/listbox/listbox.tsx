import { Checkbox } from '@/components';
import { cn } from '@/utils';
import { useState } from 'preact/hooks';
import { type ReactNode } from 'react';

export type ListboxOption = {
  value: string;
  element: ReactNode;
};

export type ListboxProps = {
  className?: string;
  options: ListboxOption[];
  selection?: string[];
  selectionMode?: 'single' | 'multiple';
  disabled?: boolean;
  onSelectionChange?: (value: string[]) => void;
};

export const Listbox = ({
  className,
  options = [],
  selectionMode = 'single',
  selection,
  onSelectionChange,
  disabled = false,
}: ListboxProps): React.ReactElement<ListboxProps> => {
  const [selectedItemsUncontrolled, setSelectedItemsUncontrolled] = useState<string[]>([]);
  const isControlled = selection !== undefined;
  const currentSelection = isControlled ? selection : selectedItemsUncontrolled;

  const isSelected = (value: string): boolean => {
    return currentSelection.includes(value);
  };

  const handleSelectionChange = (selectedItems: string[]): void => {
    if (!isControlled) {
      setSelectedItemsUncontrolled(selectedItems);
    }
    onSelectionChange?.(selectedItems);
  };

  const handleClick = (value: string): void => {
    // deselect selected item
    if (isSelected(value)) {
      handleSelectionChange(currentSelection.filter(s => s !== value));
      return;
    }

    // select new item
    if (selectionMode === 'single') {
      handleSelectionChange([value]);
    } else {
      handleSelectionChange([...currentSelection, value]);
    }
  };

  return (
    <ul
      className={cn(
        'flex flex-col items-start grow-1 shrink-0 basis-0',
        'px-0',
        disabled && 'pointer-events-none opacity-30',
        className,
      )}
      aria-disabled={disabled}
      role='listbox'
      aria-multiselectable={selectionMode === 'multiple'}
    >
      {options.map(option => {
        const isOptionSelected = isSelected(option.value);
        return (
          <li
            key={option.value}
            className={cn(
              'flex items-center w-full px-4.5 py-1 gap-x-2.5',
              !disabled && 'cursor-pointer',
              isOptionSelected
                ? 'bg-surface-primary-selected text-alt hover:bg-surface-primary-selected-hover'
                : 'hover:bg-surface-primary-hover',
            )}
            onClick={() => handleClick(option.value)}
            onKeyDown={(e): void => {
              if (e.key === ' ') {
                e.preventDefault();
                handleClick(option.value);
              } else if (e.key === 'Enter') {
                handleClick(option.value);
              }
            }}
            role='option'
            aria-selected={isOptionSelected}
          >
            <div className={cn('flex-1')}>{option.element}</div>

            {selectionMode === 'multiple' && (
              <Checkbox checked={isOptionSelected} onCheckedChange={() => handleClick(option.value)} />
            )}
          </li>
        );
      })}
    </ul>
  );
};

Listbox.displayName = 'Listbox';
