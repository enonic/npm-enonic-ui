import { Search, X } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconButton } from '@/components/icon-button';
import { useControlledState } from '@/hooks';
import { type SearchFieldContextValue, SearchFieldProvider, usePrefixedId, useSearchField } from '@/providers';
import { cn, unwrap, useComposedRefs } from '@/utils';

//
// * SearchField
//

export type SearchFieldRootProps = {
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
  const defaultId = usePrefixedId(unwrap(id));
  const [inputId, setInputId] = useState(defaultId);

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useControlledState(value, defaultValue, onChange);

  const context = useMemo<SearchFieldContextValue>(
    () => ({
      id: inputId,
      setId: setInputId,
      value: inputValue,
      setValue: setInputValue,
      disabled,
      readOnly,
      placeholder,
      clearLabel,
      inputRef,
    }),
    [inputId, inputValue, setInputValue, disabled, readOnly, placeholder, clearLabel],
  );

  return (
    <SearchFieldProvider value={context}>
      <div
        className={cn(
          'relative flex items-center gap-2.5 overflow-hidden rounded-sm',
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
      className={cn('flex size-5.5 shrink-0 items-center justify-center text-subtle', className)}
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
  ({ id: providedId, className, ...props }, ref): ReactElement => {
    const { id, setId, value, disabled, readOnly, placeholder, setValue, inputRef } = useSearchField();

    const inputId = unwrap(providedId);
    useEffect(() => {
      if (inputId) {
        setId(inputId);
      }
    }, [inputId, setId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setValue(e.currentTarget.value);
    };

    return (
      <input
        ref={useComposedRefs(ref, inputRef)}
        id={id}
        className={cn(
          'h-5.5 w-full border-0 text-base',
          'bg-surface-neutral text-main',
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
      className={cn('-mx-1.5 flex size-7 shrink-0 items-center justify-center text-subtle', className)}
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
