import { IconButton } from '@/components';
import { cn } from '@/utils';
import { Search, X } from 'lucide-react';
import { useState } from 'preact/hooks';
import { forwardRef, useRef } from 'react';

export type SearchInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  closeLabel?: string;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, placeholder = 'Search', ...props }) => {
    const [internalValue, setInternalValue] = useState('');

    const isControlled = props.value !== undefined;
    const value = isControlled ? props.value : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const newValue = (e.target as HTMLInputElement).value;

      if (!isControlled) {
        setInternalValue(newValue);
      }

      props.onChange?.(newValue);
    };

    const inputRef = useRef<HTMLInputElement>(null);

    const handleClear = (): void => {
      const newValue = '';

      if (!isControlled) {
        setInternalValue(newValue);
      }

      props.onChange?.(newValue);

      inputRef.current?.focus();
    };

    const disabled = !!props.disabled;
    const isValueSet = internalValue.length > 0 || (props.value && props.value.length > 0);

    return (
      <div
        className={cn(
          'relative flex rounded-sm overflow-hidden',
          'h-10 border focus-within:border-bdr-solid',
          'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/50 focus-within:ring-offset-0',
          'transition-highlight',
          disabled && 'pointer-events-none opacity-30',
          className,
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center shrink-0',
            'min-h-10 h-9 w-9',
            'px-1 text-sm text-subtle rounded-none focus:bg-btn-secondary focus-visible:ring-0',
            disabled && 'bg-surface-primary',
          )}
        >
          {<Search size={16} />}
        </div>

        <input
          value={value}
          ref={inputRef}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          aria-label='Search'
          className={cn(
            'w-full text-base px-1 h-10 border-0',
            'text-main bg-surface-neutral',
            'placeholder:text-subtle',
            'focus:outline-none',
            'disabled:pointer-events-none',
            'read-only:bg-surface-primary',
            !isValueSet && 'pr-11',
          )}
        />

        {isValueSet && (
          <IconButton
            disabled={disabled}
            className={cn(
              'rounded-none focus:bg-btn-secondary focus-visible:ring-0',
              'min-h-10 h-10 w-10',
              disabled && 'bg-surface-primary',
            )}
            onClick={handleClear}
            icon={X}
            title={props.closeLabel}
          />
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
