import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { JSX } from 'react';

const checkboxContainerVariants = cva(['relative flex items-center cursor-pointer select-none gap-2'], {
  variants: {
    state: {
      default: '',
      error: '',
      readOnly: 'pointer-events-none',
      disabled: 'pointer-events-none  opacity-30',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

const checkboxBoxVariants = cva(
  [
    'inline-block bg-bg-main transition-colors duration-100',
    'border-2',
    'flex-shrink-0',
    'rounded-[2px] flex items-center justify-center',
    'peer-checked:[&>svg]:opacity-100',
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
          'border-bdr-strong peer-checked:bg-btn-tertiary peer-checked:border-bt-tertiary',
          'peer-checked:[&>svg]:stroke-white',
        ].join(' '),
        error: [
          'border-red-500 peer-checked:bg-red-500 peer-checked:border-red-500',
          'peer-checked:[&>svg]:stroke-white',
        ].join(' '),
        readOnly: [
          'border-bdr-subtle peer-checked:bg-bdr-subtle peer-checked:border-bdr-subtle',
          'peer-checked:[&>svg]:stroke-white pointer-events-none',
        ].join(' '),
        disabled: [
          'border border-bdr-strong peer-checked:bg-btn-tertiary peer-checked:border-bt-tertiary',
          'peer-checked:[&>svg]:stroke-white pointer-events-none',
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

export type CheckboxProps = {
  className?: string;
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  size?: CheckboxSize;
  state?: CheckboxState;
  onChange?: (checked: boolean) => void;
  id?: string;
  name?: string;
};

export function Checkbox({
  className,
  label,
  checked,
  defaultChecked,
  size = 'md',
  state = 'default',
  onChange,
  id,
  name,
}: CheckboxProps): JSX.Element {
  const isDisabled = state === 'disabled';

  return (
    <label htmlFor={id} className={cn(checkboxContainerVariants({ state }), className)}>
      <input
        id={id}
        name={name}
        type='checkbox'
        className='peer sr-only'
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={state === 'readOnly' || state === 'disabled'}
        onChange={e => onChange?.(e.currentTarget.checked)}
        aria-checked={checked}
        aria-disabled={isDisabled}
        aria-invalid={state === 'error'}
        aria-readonly={state === 'readOnly'}
      />

      <span className={cn(checkboxBoxVariants({ size, state }))} aria-hidden='true'>
        {/* Checkmark */}
        <svg className='opacity-0 transition-opacity' viewBox='0 0 20 20' fill='none' stroke='currentColor'>
          <polyline className='stroke-[3] [stroke-linecap:round] [stroke-linejoin:round]' points='4 11 9 15 17 5' />
        </svg>
      </span>

      {label && <span>{label}</span>}
    </label>
  );
}
