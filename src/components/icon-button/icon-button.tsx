import { Button, type ButtonVariantsProps } from '@/components/button';
import type { LucideIcon } from '@/types';
import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

export type IconButtonVariantsProps = VariantProps<typeof iconButtonVariants> & ButtonVariantsProps;
export type IconButtonVariant = NonNullable<IconButtonVariantsProps['variant']>;
export type IconButtonSize = NonNullable<IconButtonVariantsProps['size']>;
export type IconButtonShape = NonNullable<IconButtonVariantsProps['shape']>;

const iconButtonVariants = cva(['p-0'], {
  variants: {
    size: {
      sm: 'h-9 w-9',
      md: 'h-10 w-10',
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
} & IconButtonVariantsProps &
  React.ButtonHTMLAttributes;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, variant = 'text', size = 'md', shape = 'square', icon, ...props }: IconButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <Button
        ref={ref}
        className={cn(iconButtonVariants({ size, shape }), className)}
        variant={variant}
        size={size}
        startIcon={icon}
        label=''
        {...props}
      />
    );
  },
);

IconButton.displayName = 'IconButton';
