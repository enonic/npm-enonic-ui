import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { JSX } from 'react';

const checkboxContainerVariants = cva(
  [
    'relative flex items-center cursor-pointer select-none gap-2',
    'focus-within:w-fit',
    'focus-within:ring-1 focus-within:ring-bt-tertiary',
    'rounded-[2px] border border-transparent',
    'focus-within:border-bt-tertiary focus-within:ring-2 focus-within:ring-bt-tertiary',
  ],
  {
    variants: {
      state: {
        default: '',
        error: '',
        readOnly: 'pointer-events-none',
        disabled: 'pointer-events-none opacity-30',
      },
      alignment: {
        left: 'flex-row',
        right: 'flex-row-reverse justify-end',
        top: 'flex-col',
        bottom: 'flex-col-reverse',
      },
    },
    defaultVariants: {
      state: 'default',
      alignment: 'left',
    },
  },
);

const checkboxBoxVariants = cva(
  [
    'inline-block bg-bg-main transition-colors duration-100',
    'border-2',
    'flex-shrink-0',
    'rounded-[2px] flex items-center justify-center',
    'peer-checked:[&>svg>.check]:opacity-100',
    'peer-indeterminate:[&>svg>.dash]:opacity-100',
  ],
  {
    variants: {
      size: {
        sm: 'h-3.5 w-3.5 border-2',
        md: 'h-3.5 w-3.5 border-2',
        lg: 'h-3.5 w-3.5 border-2',
      },
      state: {
        default: [
          'border-bdr-strong peer-checked:bg-btn-tertiary peer-checked:border-bt-tertiary peer-checked:[&>svg]:stroke-white',
          'peer-indeterminate:bg-btn-tertiary peer-indeterminate:border-bt-tertiary peer-indeterminate:[&>svg]:stroke-white',
        ].join(' '),
        error: [
          'border-red-500 peer-checked:bg-red-500 peer-checked:border-red-500',
          'peer-checked:[&>svg]:stroke-white',
          'peer-indeterminate:[&>svg]:stroke-white peer-indeterminate:bg-red-500 peer-indeterminate:border-red-500',
        ].join(' '),
        readOnly: [
          'border-bdr-subtle peer-checked:bg-bdr-subtle peer-checked:border-bdr-subtle',
          'peer-checked:[&>svg]:stroke-white pointer-events-none',
          'peer-indeterminate:[&>svg]:stroke-white pointer-events-none peer-indeterminate:bg-bdr-subtle',
        ].join(' '),
        disabled: [
          'border border-bdr-strong peer-checked:bg-btn-tertiary peer-checked:border-bt-tertiary',
          'peer-checked:[&>svg]:stroke-white pointer-events-none',
          'peer-indeterminate:[&>svg]:stroke-white pointer-events-none peer-indeterminate:bg-btn-tertiary peer-checked:border-bt-tertiary',
        ].join(' '),
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  },
);

export type CheckboxSize = VariantProps<typeof checkboxBoxVariants>['size'];
export type CheckboxState = VariantProps<typeof checkboxBoxVariants>['state'];
export type CheckboxAlignment = 'left' | 'right' | 'top' | 'bottom';

export type CheckboxProps = {
  className?: string;
  label?: string;
  checked?: boolean;
  size?: CheckboxSize;
  state?: CheckboxState;
  alignment?: CheckboxAlignment;
  onChange?: (checked: boolean) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  id?: string;
  name?: string;
  partial?: boolean;
};

export function Checkbox({
  className,
  label,
  checked,
  size = 'md',
  state = 'default',
  alignment = 'left',
  onChange,
  id,
  onBlur,
  onFocus,
  name,
  partial = false,
}: CheckboxProps): JSX.Element {
  const isDisabled = state === 'disabled';

  return (
    <label htmlFor={id} className={cn(checkboxContainerVariants({ state, alignment }), className)}>
      <input
        id={id}
        name={name}
        type='checkbox'
        className='peer sr-only'
        checked={checked}
        disabled={state === 'readOnly' || state === 'disabled'}
        onChange={e => onChange?.(e.currentTarget.checked)}
        ref={el => {
          if (el) el.indeterminate = partial;
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-checked={partial ? 'mixed' : checked}
        aria-disabled={isDisabled}
        aria-invalid={state === 'error'}
        aria-readonly={state === 'readOnly'}
      />

      <span className={cn(checkboxBoxVariants({ size, state }))} aria-hidden='true'>
        {/* Checkmark */}
        <svg viewBox='0 0 20 20' fill='none' stroke='currentColor' strokeWidth='2'>
          <line
            className='dash opacity-0 transition-opacity stroke-[4] [stroke-linecap:round]'
            x1='4'
            y1='10'
            x2='16'
            y2='10'
          />
          <polyline
            className='check opacity-0 transition-opacity stroke-[3] [stroke-linecap:round] [stroke-linejoin:round]'
            points='4 11 9 15 17 5'
          />
        </svg>
      </span>

      {label && <span>{label}</span>}
    </label>
  );
}
