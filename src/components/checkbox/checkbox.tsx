import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Minus, OctagonAlert } from 'lucide-react';
import { forwardRef, useId, useState } from 'react';

const checkboxBoxVariants = cva(
  [
    'inline-block',
    'flex-shrink-0 flex items-center justify-center',
    'h-3.5 w-3.5',
    'border-[1.5px] rounded-xs',
    'bg-transparent',
    'transition-all duration-100',
  ],
  {
    variants: {
      state: {
        default: [
          'border-bdr-strong',
          'peer-checked:bg-btn-tertiary peer-checked:border-btn-tertiary',
          'peer-indeterminate:bg-btn-tertiary peer-indeterminate:border-btn-tertiary',
        ],
        error: [
          'border-box-danger',
          'peer-checked:bg-box-danger peer-checked:border-box-danger',
          'peer-indeterminate:bg-box-danger peer-indeterminate:border-box-danger',
        ],
        readOnly: [
          'border-bdr-subtle',
          'peer-checked:bg-bdr-subtle peer-checked:border-bdr-subtle',
          'peer-indeterminate:bg-bdr-subtle peer-indeterminate:border-bdr-subtle',
        ],
      },
      editable: {
        true: [
          'peer-focus-visible:outline-none peer-focus-visible:ring-3 peer-focus-visible:ring-ring/75 peer-focus-visible:ring-offset-0',
          'peer-hover:outline-none peer-hover:ring-3 peer-hover:ring-ring/50 peer-hover:ring-offset-0',
        ],
        false: null,
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
);

export type CheckboxState = NonNullable<VariantProps<typeof checkboxBoxVariants>['state']>;
export type CheckboxAlign = 'left' | 'right';
export type CheckboxChecked = boolean | 'indeterminate';

export type CheckboxProps = {
  className?: string;
  label?: string;
  defaultChecked?: CheckboxChecked;
  checked?: CheckboxChecked;
  align?: CheckboxAlign;
  error?: boolean;
  errorMessage?: string;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  onCheckedChange?: (checked: CheckboxChecked) => void;
} & Omit<
  React.InputHTMLAttributes,
  'type' | 'readOnly' | 'disabled' | 'onChange' | 'checked' | 'defaultChecked' | 'required' | 'name' | 'value'
>;

function calcState(error: boolean | undefined, readOnly: boolean | undefined): CheckboxState {
  if (error) return 'error';
  if (readOnly) return 'readOnly';
  return 'default';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      className,
      name,
      label,
      defaultChecked,
      checked,
      align = 'left',
      error,
      disabled,
      readOnly,
      required,
      value = 'on',
      onCheckedChange,
      errorMessage,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? useId();
    const state = calcState(error, readOnly);
    const editable = !disabled && !readOnly;

    const [uncontrolledChecked, setUncontrolledChecked] = useState<boolean | 'indeterminate'>(defaultChecked ?? false);
    const isControlled = checked !== undefined;
    const checkedState = isControlled ? checked : uncontrolledChecked;
    const isIndeterminate = checkedState === 'indeterminate';
    const isChecked = checkedState === true;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (!editable) return;

      let nextValue: boolean | 'indeterminate';

      if (isIndeterminate) {
        nextValue = false;
      } else {
        nextValue = e.currentTarget.checked;
      }

      if (!isControlled) {
        setUncontrolledChecked(nextValue);
      }

      onCheckedChange?.(nextValue);
    };

    return (
      <div>
        <label
          htmlFor={inputId}
          className={cn(
            'relative flex items-center select-none gap-2',
            'transition-opacity duration-100',
            align === 'right' && 'flex-row-reverse justify-end',
            disabled ? 'opacity-30 cursor-default' : readOnly ? 'cursor-default' : 'cursor-pointer',
            className,
          )}
        >
          <input
            ref={el => {
              if (typeof ref === 'function') ref(el);
              else if (ref) ref.current = el;
              if (el) el.indeterminate = isIndeterminate;
            }}
            {...props}
            id={inputId}
            type='checkbox'
            className='peer sr-only'
            checked={isChecked}
            disabled={readOnly ?? disabled}
            required={required}
            name={name}
            value={value}
            aria-checked={isIndeterminate ? 'mixed' : isChecked}
            aria-disabled={disabled}
            aria-invalid={error}
            aria-readonly={readOnly}
            data-state={isIndeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked'}
            data-disabled={disabled ? '' : undefined}
            onChange={handleChange}
          />

          <span className={cn(checkboxBoxVariants({ state, editable }))} aria-hidden='true'>
            {isIndeterminate ? (
              <Minus size={10} className='text-rev' strokeWidth={4} />
            ) : isChecked ? (
              <Check size={10} className='text-rev' strokeWidth={4} />
            ) : null}
          </span>

          {label && <span className='text-main'>{label}</span>}
        </label>
        {state === 'error' && errorMessage && (
          <div className={'flex items-center gap-2 text-box-danger mt-1'}>
            <OctagonAlert size={14} strokeWidth={2.5} />
            {errorMessage}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
