import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { LockKeyhole, OctagonAlert } from 'lucide-react';
import type { JSX } from 'react';

const inputContainerVariants = cva(
  [
    'relative flex rounded-sm overflow-hidden',
    'h-10 border focus-within:border-bdr-solid',
    'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/50 focus-within:ring-offset-0',
    'transition-highlight duration-100',
  ],
  {
    variants: {
      state: {
        default: 'border-bdr-subtle focus-within:border-bdr-strong',
        error: 'border-bdr-danger focus-within:border-bdr-danger focus-within:ring-danger/50',
      },
      disabled: {
        true: 'pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      state: 'default',
      disabled: false,
    },
  },
);

const inputVariants = cva([
  'w-full px-3 text-base h-10',
  'text-main bg-alt',
  'placeholder:text-subtle',
  'focus:outline-none',
  'disabled:pointer-events-none',
  'read-only:bg-surface-primary',
  'border-0',
]);

const labelVariants = cva(['block text-base font-semibold text-main'], {
  variants: {
    disabled: {
      true: 'opacity-30',
      false: '',
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

const descriptionVariants = cva(['text-sm text-subtle'], {
  variants: {
    disabled: {
      true: 'opacity-30',
      false: '',
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

const errorVariants = cva(['flex items-center gap-1 text-danger mt-1']);

const addonVariants = cva([
  'flex items-center justify-center shrink-0',
  'min-h-10 min-w-10',
  'px-4 text-sm text-subtle bg-surface-primary',
  'first:rounded-l-sm last:rounded-r-sm',
  'first:border-r first:border-bdr-soft',
  'last:border-l last:border-bdr-soft',
]);

export type InputProps = {
  className?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  error?: string;
  startAddon?: string | JSX.Element;
  endAddon?: string | JSX.Element;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (event: Event & { currentTarget: HTMLInputElement }) => void;
  onInput?: (event: Event & { currentTarget: HTMLInputElement }) => void;
  onFocus?: (event: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  onBlur?: (event: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
  name?: string;
  id?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
  tabIndex?: number;
};

const renderAddon = (addon: string | JSX.Element): JSX.Element => {
  return <div className={cn(addonVariants())}>{addon}</div>;
};

export function Input({
  className,
  label,
  description,
  placeholder,
  error,
  startAddon,
  endAddon,
  value,
  defaultValue,
  disabled = false,
  readOnly = false,
  onChange,
  onInput,
  onFocus,
  onBlur,
  type = 'text',
  name,
  id,
  required = false,
  minLength,
  maxLength,
  min,
  max,
  step,
  pattern,
  autoComplete,
  tabIndex,
}: InputProps): JSX.Element {
  const hasError = Boolean(error);
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 11)}`;

  return (
    <div className={cn('w-full', disabled && 'opacity-30', className)}>
      <div className='mb-2'>
        {label && (
          <label htmlFor={inputId} className={cn(labelVariants({ disabled }))}>
            <div className='flex items-center gap-1'>
              {readOnly && <LockKeyhole size={16} />}
              {label}
            </div>
          </label>
        )}

        {description && <div className={cn(descriptionVariants({ disabled }))}>{description}</div>}
      </div>

      <div
        className={cn(
          inputContainerVariants({
            state: hasError ? 'error' : 'default',
            disabled,
          }),
        )}
      >
        {startAddon && renderAddon(startAddon)}

        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          autoComplete={autoComplete}
          tabIndex={tabIndex}
          onChange={onChange}
          onInput={onInput}
          onFocus={onFocus}
          onBlur={onBlur}
          className={cn(inputVariants(), startAddon && 'rounded-l-none', endAddon && 'rounded-r-none', 'flex-1')}
        />

        {endAddon && renderAddon(endAddon)}
      </div>

      {error && (
        <div className={cn(errorVariants())}>
          <OctagonAlert size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
