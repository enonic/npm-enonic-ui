import { IconButton } from '@/components';
import { useControlledState } from '@/hooks';
import { type SearchFieldContextValue, SearchFieldProvider, usePrefixedId, useSearchField } from '@/providers';
import { cn, unwrap, useComposedRefs } from '@/utils';
import { Search, X } from 'lucide-react';
import { type ComponentPropsWithoutRef, forwardRef, type ReactElement, type ReactNode, useMemo, useRef } from 'react';

//
// * SearchField
//

export type SearchFieldRootProps = {
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  clearLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'children'>;

const SearchFieldRoot = ({
  id,
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Search',
  clearLabel = 'Clear',
  disabled,
  readOnly,
  children,
  className,
  ...props
}: SearchFieldRootProps): ReactElement => {
  const inputId = usePrefixedId(unwrap(id));
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useControlledState(value, defaultValue, onChange);

  const context = useMemo<SearchFieldContextValue>(
    () => ({
      id: inputId,
      value: inputValue,
      disabled,
      readOnly,
      placeholder,
      clearLabel,
      setValue: setInputValue,
      inputRef,
    }),
    [inputId, inputValue, disabled, readOnly, placeholder, clearLabel, setInputValue],
  );

  return (
    <SearchFieldProvider value={context}>
      <div
        className={cn(
          'relative flex gap-2.5 items-center rounded-sm overflow-hidden',
          'h-11.5 px-4.5 py-3',
          'border border-bdr-subtle focus-within:border-bdr-strong',
          'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring focus-within:ring-offset-3 focus-within:ring-offset-ring-offset',
          'transition-highlight',
          readOnly ? 'bg-surface-primary' : 'bg-surface-neutral',
          disabled && 'pointer-events-none select-none opacity-30',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SearchFieldProvider>
  );
};
SearchFieldRoot.displayName = 'SearchFieldRoot';

//
// * SearchFieldIcon
//

export type SearchFieldIconProps = {
  className?: string;
};

const SearchFieldIcon = ({ className }: SearchFieldIconProps): ReactElement => {
  return (
    <Search
      className={cn('flex items-center justify-center shrink-0 size-5.5 text-subtle', className)}
      strokeWidth={1.5}
    />
  );
};
SearchFieldIcon.displayName = 'SearchFieldIcon';

//
// * SearchFieldInput
//

export type SearchFieldInputProps = ComponentPropsWithoutRef<'input'>;

const SearchFieldInput = forwardRef<HTMLInputElement, SearchFieldInputProps>(
  ({ className, ...props }, ref): ReactElement => {
    const { id, value, disabled, readOnly, placeholder, setValue, inputRef } = useSearchField();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setValue(e.currentTarget.value);
    };

    return (
      <input
        ref={useComposedRefs(ref, inputRef)}
        id={id}
        className={cn(
          'h-5.5 w-full text-base border-0',
          'text-main bg-surface-neutral',
          'placeholder:text-subtle',
          'focus:outline-none',
          'enabled:read-only:bg-surface-primary',
          className,
        )}
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        aria-label='Search'
        aria-disabled={disabled}
        {...props}
      />
    );
  },
);
SearchFieldInput.displayName = 'SearchFieldInput';

//
// * SearchFieldClear
//

export type SearchFieldClearProps = Omit<ComponentPropsWithoutRef<typeof IconButton>, 'icon' | 'onClick'>;

const SearchFieldClear = ({ className, ...props }: SearchFieldClearProps): ReactElement | null => {
  const { value, disabled, readOnly, clearLabel, setValue, inputRef } = useSearchField();

  if (!value || disabled || readOnly) {
    return null;
  }

  const handleClear = (): void => {
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <IconButton
      className={cn('flex items-center justify-center shrink-0 size-7 -mx-1.5 text-subtle', className)}
      icon={X}
      title={clearLabel}
      onClick={handleClear}
      disabled={disabled}
      iconSize={28}
      iconStrokeWidth={1.25}
      {...props}
    />
  );
};
SearchFieldClear.displayName = 'SearchFieldClear';

export const SearchField = Object.assign(SearchFieldRoot, {
  Root: SearchFieldRoot,
  Icon: SearchFieldIcon,
  Input: SearchFieldInput,
  Clear: SearchFieldClear,
});
