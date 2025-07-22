import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { JSX } from 'react';

const checkboxVariants = cva(
  ['relative flex items-center cursor-pointer select-none', 'disabled:opacity-30 disabled:pointer-events-none'],
  {
    variants: {
      size: {
        sm: 'text-sm gap-2',
        md: 'text-base gap-2.5',
        lg: 'text-lg gap-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const boxSize = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

export type CheckboxSize = VariantProps<typeof checkboxVariants>['size'];

export type CheckboxProps = {
  className?: string;
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  size?: CheckboxSize;
  onChange?: (checked: boolean) => void;
  id?: string;
};

export function Checkbox({
  className,
  label,
  checked,
  defaultChecked,
  disabled = false,
  size = 'md',
  onChange,
  id,
}: CheckboxProps): JSX.Element {
  const iconSize = boxSize[size ?? 'md'];

  return (
    <label className={cn(checkboxVariants({ size }), className)} htmlFor={id}>
      <input
        id={id}
        type='checkbox'
        className='peer sr-only'
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        //onChange={e => onChange?.(e.target?.checked ?? false)}
        onChange={e => {
          onChange?.(Boolean(e.currentTarget.checked));
        }}
        aria-checked={checked}
        aria-disabled={disabled}
      />
      <span
        className={cn(
          'inline-block border border-bdr-strong bg-bg-main transition-colors duration-100',
          iconSize,
          'rounded-sm flex items-center justify-center',
          'peer-checked:bg-btn-primary peer-checked:border-btn-primary peer-disabled:bg-bg-main',
        )}
        aria-hidden='true'
      >
        {/* Checkmark */}
        <svg
          className={cn('opacity-0 peer-checked:opacity-100 transition-opacity', iconSize)}
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
