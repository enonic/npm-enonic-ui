import type { LucideIcon } from '@/types';
import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'text-main dark:text-main font-medium',
    'box-border rounded-sm transition-highlight',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-0',
    'disabled:select-none disabled:opacity-30',
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

export type ButtonVariantsProps = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariantsProps['variant']>;
export type ButtonSize = NonNullable<ButtonVariantsProps['size']>;

export type ButtonProps = {
  startIcon?: LucideIcon;
  label?: string;
  endIcon?: LucideIcon;
  iconSize?: number;
} & ButtonVariantsProps &
  React.ButtonHTMLAttributes;

const getIconSize = (size: NonNullable<ButtonSize>): number => {
  switch (size) {
    case 'sm':
      return 16;
    case 'md':
      return 18;
    case 'lg':
      return 20;
  }
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'text', size = 'md', iconSize, startIcon, label, endIcon, title, children, ...props },
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => {
    const StartIcon = startIcon;
    const EndIcon = endIcon;
    const iconSizeValue = iconSize ?? getIconSize(size ?? 'md');

    return (
      <button
        ref={ref}
        type='button'
        className={cn(buttonVariants({ variant, size }), className)}
        title={title}
        aria-label={title ?? label}
        aria-disabled={props.disabled}
        {...props}
      >
        {StartIcon && <StartIcon size={iconSizeValue} strokeWidth={1.5} />}
        {children}
        {label}
        {EndIcon && <EndIcon size={iconSizeValue} strokeWidth={1.5} />}
      </button>
    );
  },
);

Button.displayName = 'Button';
