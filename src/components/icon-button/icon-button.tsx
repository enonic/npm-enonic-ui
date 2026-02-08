import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, type ForwardedRef, forwardRef } from 'react';
import { Button, type ButtonIconProps, type ButtonVariantsProps } from '@/components/button';
import type { LucideIcon } from '@/types';
import { cn } from '@/utils';

export type IconButtonVariantsProps = VariantProps<typeof iconButtonVariants> & ButtonVariantsProps & ButtonIconProps;
export type IconButtonVariant = NonNullable<IconButtonVariantsProps['variant']>;
export type IconButtonSize = NonNullable<IconButtonVariantsProps['size']>;
export type IconButtonShape = NonNullable<IconButtonVariantsProps['shape']>;

const iconButtonVariants = cva(['p-0'], {
  variants: {
    size: {
      sm: 'size-9',
      md: 'size-10',
      lg: 'h-11.5 w-11.5',
    },
    shape: {
      square: 'rounded-sm',
      round: 'rounded-full',
    },
  },
  defaultVariants: {
    size: 'md',
    shape: 'square',
  },
});

export type IconButtonProps = {
  icon: LucideIcon;
  iconClassName?: string;
  disabled?: boolean;
} & IconButtonVariantsProps &
  ComponentPropsWithoutRef<'button'>;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, variant = 'text', size = 'md', shape = 'square', icon, iconClassName, ...props }: IconButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <Button
        ref={ref}
        className={cn(iconButtonVariants({ size, shape }), className)}
        variant={variant}
        size={size}
        startIcon={icon}
        startIconClassName={iconClassName}
        label=''
        {...props}
      />
    );
  },
);

IconButton.displayName = 'IconButton';
