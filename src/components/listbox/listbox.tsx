import { cn } from '@/utils';
import type { ReactNode } from 'react';

export type ListboxOption = {
  value: string;
  element: ReactNode;
};

export type ListboxProps = {
  className?: string;
  options: ListboxOption[];
  selectionMode?: 'single' | 'multiple';
  disabled?: boolean;
};

export function Listbox({
  className,
  options = [],
  selectionMode = 'single',
  disabled = false,
}: ListboxProps): React.ReactElement<ListboxProps> {
  return (
    <ul
      className={cn(
        'flex flex-col gap-2.5 items-start grow-1 shrink-0 basis-0',
        'px-0 py-2.5',
        disabled && 'pointer-events-none opacity-30',
        className,
      )}
    >
      {options.map(option => {
        return (
          <li
            key={option.value}
            className={cn(
              'w-full px-4.5 py-1',
              !disabled && 'cursor-pointer hover:bg-surface-primary-hover',
              selectionMode === 'single' && '', // to be added later
            )}
          >
            {option.element}
          </li>
        );
      })}
    </ul>
  );
}
