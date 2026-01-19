import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, type ForwardedRef, forwardRef } from 'react';
import type { LucideIcon } from '@/types';
import { cn } from '@/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'font-semibold text-main',
    'box-border rounded-sm transition-highlight',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-3 focus-visible:ring-offset-ring-offset',
    // Override ring colors for inverse tone to match background
    'group-data-[tone=inverse]:[--color-ring-offset:var(--color-surface-selected)] group-data-[tone=inverse]:[--color-ring:var(--color-ring-alt)]',
    'active:bg-btn-active active:text-alt data-[active=true]:bg-btn-active data-[active=true]:text-alt',
    'disabled:pointer-events-none disabled:select-none disabled:opacity-30',
    'cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        text: 'bg-btn-primary hover:bg-btn-primary-hover hover:text-main',
        filled: 'bg-btn-secondary hover:bg-btn-secondary-hover hover:text-main',
        solid: 'bg-btn-tertiary text-alt hover:bg-btn-tertiary-hover',
        outline: 'border border-bdr-strong bg-btn-primary hover:bg-btn-primary-hover',
      },
      size: {
        sm: 'h-9 gap-2 px-3.5 text-sm',
        md: 'h-10 gap-2.5 px-3.5 text-base',
        lg: 'h-11.5 gap-3 px-4 text-lg',
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
  iconSize?: number | ButtonSize;
  iconStrokeWidth?: number;
};

export type ButtonProps = {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  label?: string;
  disabled?: boolean;
} & ButtonVariantsProps &
  ButtonIconProps &
  Omit<ComponentPropsWithoutRef<'button'>, 'disabled'>;

const getIconSize = (size: ButtonSize | number): number => {
  if (typeof size === 'number') return size;

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
      disabled,
      ...props
    }: ButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const StartIcon = startIcon;
    const EndIcon = endIcon;
    const iconSizeValue = getIconSize(iconSize ?? size ?? 'md');

    return (
      <button
        ref={ref}
        type='button'
        className={cn(buttonVariants({ variant, size }), className)}
        title={title}
        aria-label={title ?? label}
        aria-disabled={disabled}
        data-disabled={disabled ?? undefined}
        disabled={disabled}
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
