import { cva, type VariantProps } from 'class-variance-authority';
import type { JSX } from 'react';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'text-main dark:text-main font-medium',
    'box-border rounded-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-30',
    'cursor-pointer',
  ],
  {
    variants: {
      variant: {
        text: 'bg-btn-primary hover:bg-btn-primary-hover active:bg-btn-active active:text-rev dark:active:text-main',
        filled:
          'bg-btn-secondary hover:bg-btn-secondary-hover active:bg-btn-active active:text-rev dark:active:text-main',
        solid:
          'bg-btn-tertiary text-rev dark:text-main hover:bg-btn-tertiary-hover active:bg-btn-active dark:active:text-main',
        outline:
          'bg-btn-primary hover:bg-btn-primary-hover active:bg-btn-active active:text-rev dark:active:text-main border border-bdr-strong',
      },
      size: {
        sm: 'h-9 px-3.5 gap-2 text-sm',
        md: 'h-10 px-3.5 gap-2.5 text-base',
        lg: 'h-11.5 px-4 gap-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'text',
      size: 'md',
    },
  },
);

export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

export type ButtonProps = {
  label: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  title?: string;
  className?: string;
};

export function Button({
  label,
  onClick,
  variant = 'text',
  size = 'md',
  disabled = false,
  title,
  className,
}: ButtonProps): JSX.Element {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size }), className ?? '')}
      title={title}
    >
      {label}
    </button>
  );
}
