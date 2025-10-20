import { IconButton } from '@/components';
import { usePrefixedId } from '@/providers';
import { cn, unwrap, useComposedRefs } from '@/utils';
import { Search, X } from 'lucide-react';
import { useState } from 'preact/hooks';
import { type ComponentPropsWithoutRef, forwardRef, useRef } from 'react';

export type SearchInputProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  clearLabel?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
} & Omit<
  ComponentPropsWithoutRef<'div'>,
  'className' | 'value' | 'defaultValue' | 'onChange' | 'disabled' | 'readOnly'
>;

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      id,
      value,
      defaultValue = '',
      placeholder = 'Search',
      clearLabel = 'Clear',
      onChange,
      disabled,
      readOnly,
      className,
      ...props
    },
    ref,
  ) => {
    const inputId = usePrefixedId(unwrap(id));

    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    const inputValue = isControlled ? value : uncontrolledValue;
    const isValueSet = inputValue.length > 0;
    const canClear = isValueSet && !disabled && !readOnly;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const newValue = e.currentTarget.value;

      if (!isControlled) {
        setUncontrolledValue(newValue);
      }

      onChange?.(newValue);
    };

    const inputRef = useRef<HTMLInputElement>(null);

    const handleClear = (): void => {
      const newValue = '';

      if (!isControlled) {
        setUncontrolledValue(newValue);
      }

      onChange?.(newValue);

      inputRef.current?.focus();
    };

    return (
      <div
        className={cn(
          'relative flex rounded-sm overflow-hidden',
          'h-12 border border-bdr-subtle focus-within:border-bdr-strong',
          'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/50 focus-within:ring-offset-0',
          'transition-highlight',
          disabled && 'pointer-events-none select-none opacity-30',
          className,
        )}
      >
        <Search
          className='absolute left-4.5 top-1/2 -translate-y-1/2 mt-0.25 text-subtle pointer-events-none'
          size={20}
          strokeWidth={1.5}
        />
        <input
          ref={useComposedRefs(ref, inputRef)}
          id={inputId}
          className={cn(
            'w-full text-base pr-1 px-12 border-0',
            'text-main bg-surface-neutral',
            'placeholder:text-subtle',
            'focus:outline-none',
            'read-only:bg-surface-primary',
          )}
          value={inputValue}
          onChange={handleChange}
          readOnly={readOnly}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={'Search'}
          aria-disabled={disabled}
          {...props}
        />

        {canClear && (
          <IconButton
            className='absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-subtle'
            size='lg'
            icon={X}
            title={clearLabel}
            onClick={handleClear}
            disabled={disabled}
          />
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
