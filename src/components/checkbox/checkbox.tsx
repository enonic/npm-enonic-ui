import { cn, unwrap } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Minus } from 'lucide-react';
import { forwardRef, useId } from 'react';

const checkboxContainerVariants = cva(
  ['relative flex items-center select-none gap-2', 'transition-opacity duration-100'],
  {
    variants: {
      disabled: {
        true: 'pointer-events-none cursor-not-allowed',
        false: 'cursor-pointer',
      },
      alignment: {
        left: 'flex-row',
        right: 'flex-row-reverse justify-end',
        top: 'flex-col',
        bottom: 'flex-col-reverse',
      },
    },
    defaultVariants: {
      disabled: false,
      alignment: 'left',
    },
  },
);

const checkboxBoxVariants = cva(
  [
    'inline-block transition-all duration-100',
    'border-2 rounded-xs',
    'flex-shrink-0 flex items-center justify-center',
    'peer-focus-visible:outline-none peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-focus-visible:ring-offset-0',
    'h-3.5 w-3.5',
  ],
  {
    variants: {
      state: {
        default: [
          'border-bdr-subtle bg-transparent peer-hover:border-bdr-strong',
          'peer-checked:bg-btn-tertiary peer-checked:border-btn-tertiary',
          'peer-indeterminate:bg-btn-tertiary peer-indeterminate:border-btn-tertiary',
        ],
        error: [
          'border-bdr-danger bg-transparent',
          'peer-checked:bg-danger peer-checked:border-danger',
          'peer-indeterminate:bg-danger peer-indeterminate:border-danger',
        ],
        readOnly: [
          'border-bdr-subtle bg-transparent',
          'peer-checked:bg-bdr-subtle peer-checked:border-bdr-subtle',
          'peer-indeterminate:bg-bdr-subtle peer-indeterminate:border-bdr-subtle',
        ],
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
);

export type CheckboxState = NonNullable<VariantProps<typeof checkboxBoxVariants>['state']>;
export type CheckboxAlignment = NonNullable<VariantProps<typeof checkboxContainerVariants>['alignment']>;

export type CheckboxProps = {
  className?: string;
  label?: string;
  checked?: boolean;
  state?: CheckboxState;
  alignment?: CheckboxAlignment;
  partial?: boolean;
  error?: boolean;
} & Omit<React.InputHTMLAttributes, 'type'>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      checked,
      state = 'default',
      alignment = 'left',
      partial = false,
      error,
      disabled,
      readOnly,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? useId();
    const isDisabled = disabled ?? false;
    const isReadOnly = readOnly ?? state === 'readOnly';
    const actualState = error ? 'error' : isReadOnly ? 'readOnly' : state;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          checkboxContainerVariants({ disabled: unwrap(isDisabled || isReadOnly), alignment }),
          isDisabled && 'opacity-30',
          isReadOnly && 'cursor-not-allowed',
          className,
        )}
      >
        <input
          ref={el => {
            if (typeof ref === 'function') {
              ref(el);
            } else if (ref) {
              ref.current = el;
            }
            if (el) el.indeterminate = partial;
          }}
          id={inputId}
          type='checkbox'
          className='peer sr-only'
          checked={checked}
          disabled={isDisabled || isReadOnly}
          aria-checked={partial ? 'mixed' : checked}
          aria-disabled={isDisabled}
          aria-invalid={error ?? actualState === 'error'}
          aria-readonly={isReadOnly}
          {...props}
        />

        <span className={cn(checkboxBoxVariants({ state: actualState }))} aria-hidden='true'>
          {partial ? (
            <Minus size={'0.625rem'} className='text-white' strokeWidth={4} />
          ) : checked ? (
            <Check size={'0.625rem'} className='text-white' strokeWidth={4} />
          ) : null}
        </span>

        {label && <span className='text-main'>{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
