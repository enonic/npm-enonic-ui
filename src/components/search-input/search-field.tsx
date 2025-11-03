import { IconButton } from '@/components';
import { useControlledState } from '@/hooks';
import { usePrefixedId } from '@/providers';
import { cn, unwrap, useComposedRefs } from '@/utils';
import { Search, X } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
} from 'react';

export type SearchInputContextValue = {
  id: string;
  value: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  clearLabel: string;
  setValue: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
};

const SearchInputContext = createContext<SearchInputContextValue | null>(null);
export const useSearchInput = (): SearchInputContextValue => {
  const ctx = useContext(SearchInputContext);
  if (!ctx) {
    throw new Error('SearchInput subcomponent must be used within <SearchInput.Root>');
  }
  return ctx;
};

export type SearchInputRootProps = {
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

const SearchRoot = ({
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
}: SearchInputRootProps): ReactElement => {
  const inputId = usePrefixedId(unwrap(id));
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useControlledState(value, defaultValue, onChange);

  const context = useMemo<SearchInputContextValue>(
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
    <SearchInputContext.Provider value={context}>
      <div
        className={cn(
          'relative flex gap-2.5 items-center rounded-sm overflow-hidden',
          'h-11.5 px-4.5 py-3',
          'border border-bdr-subtle focus-within:border-bdr-strong',
          'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/50 focus-within:ring-offset-0',
          'transition-highlight',
          readOnly ? 'bg-surface-primary' : 'bg-surface-neutral',
          disabled && 'pointer-events-none select-none opacity-30',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SearchInputContext.Provider>
  );
};
SearchRoot.displayName = 'SearchInputRoot';

export type SearchIconProps = {
  className?: string;
};

const SearchIcon = ({ className }: SearchIconProps): ReactElement => {
  return (
    <Search
      className={cn('flex items-center justify-center shrink-0 size-5.5 text-subtle', className)}
      strokeWidth={1.5}
    />
  );
};
SearchIcon.displayName = 'SearchInputIcon';

export type SearchInputProps = ComponentPropsWithoutRef<'input'>;

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ className, ...props }, ref): ReactElement => {
  const { id, value, disabled, readOnly, placeholder, setValue, inputRef } = useSearchInput();

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
});
SearchInput.displayName = 'SearchInputField';

export type SearchClearProps = Omit<ComponentPropsWithoutRef<typeof IconButton>, 'icon' | 'onClick'>;

const SearchClear = ({ className, ...props }: SearchClearProps): ReactElement | null => {
  const { value, disabled, readOnly, clearLabel, setValue, inputRef } = useSearchInput();

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
SearchClear.displayName = 'SearchInputClear';

export const SearchField = Object.assign(SearchRoot, {
  Root: SearchRoot,
  Icon: SearchIcon,
  Input: SearchInput,
  Clear: SearchClear,
});
