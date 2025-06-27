import { cva, type VariantProps } from 'class-variance-authority';
import type { JSX } from 'react';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-md font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-30',
    'cursor-pointer',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-btn-primary text-bg-secondary hover:bg-btn-primary-hov active:bg-btn-active',
        secondary: 'bg-btn-secondary text-bg-secondary hover:bg-btn-secondary-hov active:bg-btn-active',
        tertiary: 'bg-transparent text-btn-tertiary hover:bg-btn-tertiary-hov active:bg-btn-active',
      },
      size: {
        sm: 'h-8 px-3 py-1 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 py-3 text-lg',
      },
      border: {
        true: 'border-2 border-bdr-strong',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        border: true,
        className: 'border-bdr-strong',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      border: false,
    },
  },
);

export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
export type ButtonSize = VariantProps<typeof buttonVariants>['size'];
export type ButtonBorder = VariantProps<typeof buttonVariants>['border'];

export type ButtonProps = {
  label: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  border?: ButtonBorder;
  disabled?: boolean;
  title?: string;
  className?: string;
};

export function Button({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  border = false,
  disabled = false,
  title,
  className,
}: ButtonProps): JSX.Element {
  const showBorder = border && variant === 'primary';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size, border: showBorder }), className)}
      title={title}
    >
      {label}
    </button>
  );
}
