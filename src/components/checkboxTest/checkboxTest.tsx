import { cn, unwrap } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Minus, OctagonAlert } from 'lucide-react';
import { forwardRef, useEffect, useId, useState } from 'react';

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
      },
    },
    defaultVariants: {
      disabled: false,
      alignment: 'left',
    },
  },
);

const errorVariants = cva(['flex items-center gap-1 text-box-danger mt-1']);

const checkboxBoxVariants = cva(
  [
    'inline-block transition-all duration-100',
    'border-2 rounded-xs',
    'flex-shrink-0 flex items-center justify-center',
    'peer-focus-visible:outline-none peer-focus-visible:ring-3 peer-focus-visible:ring-ring/75 peer-focus-visible:ring-offset-0',
    'peer-hover:outline-none peer-hover:ring-3 peer-hover:ring-ring/50 peer-hover:ring-offset-0',
    'h-3.5 w-3.5',
  ],
  {
    variants: {
      state: {
        default: [
          'border-bdr-strong bg-transparent',
          'peer-checked:bg-btn-tertiary peer-checked:border-btn-tertiary',
          'peer-indeterminate:bg-btn-tertiary peer-indeterminate:border-btn-tertiary',
        ],
        error: [
          'border-box-danger bg-transparent',
          'peer-checked:bg-box-danger peer-checked:border-box-danger',
          'peer-indeterminate:bg-box-danger peer-indeterminate:border-box-danger',
        ],
        readOnly: [
          'border-bdr-subtle bg-transparent',
          'peer-checked:bg-bdr-subtle peer-checked:border-bdr-subtle',
          'peer-indeterminate:bg-bdr-subtle peer-indeterminate:border-bdr-subtle',
        ],
        disabled: [
          'border-bdr-strong bg-transparent',
          'peer-checked:bg-btn-tertiary peer-checked:border-btn-tertiary',
          'peer-indeterminate:bg-btn-tertiary peer-indeterminate:border-btn-tertiary',
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

export type CheckboxPropsTest = {
  className?: string;
  label?: string;
  checked?: boolean;
  state?: CheckboxState;
  alignment?: CheckboxAlignment;
  partial?: boolean;
  error?: boolean;
  errorText?: string;
  onChange?: (checked: boolean) => void;
} & Omit<React.InputHTMLAttributes, 'type' | 'onChange'>;

export const CheckboxTest = forwardRef<HTMLInputElement, CheckboxPropsTest>(
  (
    {
      className,
      label,
      checked: controlledChecked,
      partial: controlledPartial,
      state = 'default',
      alignment = 'left',
      error,
      disabled,
      readOnly,
      id,
      onChange,
      errorText,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? useId();

    const [checked, setChecked] = useState(controlledChecked ?? false);
    const [partial, setPartial] = useState(controlledPartial ?? false);

    useEffect(() => {
      setChecked(controlledChecked ?? false);
    }, [controlledChecked]);
    useEffect(() => {
      setPartial(controlledPartial ?? false);
    }, [controlledPartial]);

    const isDisabled = disabled ?? state === 'disabled';
    const isReadOnly = readOnly ?? state === 'readOnly';
    const actualState = error ? 'error' : isReadOnly ? 'readOnly' : isDisabled ? 'disabled' : state;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (isDisabled || isReadOnly) return;

      const next = e.currentTarget.checked;

      if (partial) {
        setPartial(false);
        setChecked(false);
        onChange?.(false);
        return;
      }

      setChecked(next);
      onChange?.(next);
    };

    return (
      <div>
        <label
          htmlFor={inputId}
          className={cn(
            checkboxContainerVariants({ disabled: unwrap(isDisabled || isReadOnly), alignment }),
            isDisabled && 'opacity-30 cursor-not-allowed',
            isReadOnly && 'cursor-not-allowed',
            className,
          )}
        >
          <input
            id={inputId}
            type='checkbox'
            className='peer sr-only'
            checked={checked}
            disabled={isDisabled || isReadOnly}
            aria-checked={partial ? 'mixed' : checked}
            aria-disabled={isDisabled}
            aria-invalid={error ?? actualState === 'error'}
            aria-readonly={isReadOnly}
            onChange={handleChange}
            ref={el => {
              if (typeof ref === 'function') ref(el);
              else if (ref) ref.current = el;
              if (el) el.indeterminate = partial;
            }}
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
        {state === 'error' && errorText && (
          <div className={cn(errorVariants())}>
            <OctagonAlert size={16} />
            {errorText}
          </div>
        )}
      </div>
    );
  },
);

CheckboxTest.displayName = 'CheckboxTest';
