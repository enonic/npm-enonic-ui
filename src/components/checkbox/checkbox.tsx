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
    'flex-shrink-0',
    'rounded-sm flex items-center justify-center',
    'peer-checked:[&>svg]:opacity-100',
  ],
  {
    variants: {
      size: {
        sm: 'h-3.5 w-3.5 border',
        md: 'h-4 w-4 border',
        lg: 'h-4.5 w-4.5 border',
      },
      state: {
        default: [
          'border border-bdr-strong peer-checked:bg-btn-tertiary peer-checked:border-bt-tertiary',
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
}: CheckboxProps): JSX.Element {
  const isDisabled = state === 'disabled';

  return (
    <label htmlFor={id} className={cn(checkboxContainerVariants({ state }), className)}>
      <input
        id={id}
        type='checkbox'
        className='peer sr-only'
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={isDisabled || state === 'readOnly'}
        onChange={e => onChange?.(e.currentTarget.checked)}
        aria-checked={checked}
        aria-disabled={isDisabled}
      />

      <span className={cn(checkboxBoxVariants({ size, state }))} aria-hidden='true'>
        {/* Checkmark */}
        <svg
          className='opacity-0 transition-opacity'
          viewBox='0 0 20 20'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <polyline points='5 10 9 14 15 6' />
        </svg>
      </span>

      {label && <span className='ml-2'>{label}</span>}
    </label>
  );
}
