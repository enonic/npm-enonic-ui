import type { LucideIcon } from '@/types';
import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, type ForwardedRef, forwardRef } from 'react';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'text-main font-semibold',
    'box-border rounded-sm transition-highlight',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-0',
    'disabled:select-none disabled:pointer-events-none disabled:opacity-30',
    'overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer',
  ],
  {
    variants: {
      variant: {
        text: 'bg-btn-primary hover:bg-btn-primary-hover hover:text-main active:bg-btn-active active:text-alt',
        filled: 'bg-btn-secondary hover:bg-btn-secondary-hover hover:text-main active:bg-btn-active active:text-alt',
        solid: 'bg-btn-tertiary text-alt hover:bg-btn-tertiary-hover active:bg-btn-active',
        outline:
          'bg-btn-primary hover:bg-btn-primary-hover active:bg-btn-active active:text-alt border border-bdr-strong',
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
export type ButtonIconProps = {
  iconSize?: number;
  iconStrokeWidth?: number;
};

export type ButtonProps = {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  label?: string;
} & ButtonVariantsProps &
  ButtonIconProps &
  ComponentPropsWithoutRef<'button'>;

const getIconSize = (size: NonNullable<ButtonSize>): number => {
  switch (size) {
    case 'sm':
      return 14;
    case 'md':
      return 20;
    case 'lg':
      return 24;
  }
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'text',
      size = 'md',
      iconSize,
      iconStrokeWidth = 1.5,
      startIcon,
      label,
      endIcon,
      title,
      children,
      ...props
    },
    ref: ForwardedRef<HTMLButtonElement>,
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
        {StartIcon && <StartIcon size={iconSizeValue} strokeWidth={iconStrokeWidth} />}
        {children}
        {label}
        {EndIcon && <EndIcon size={iconSizeValue} strokeWidth={iconStrokeWidth} />}
      </button>
    );
  },
);

Button.displayName = 'Button';
