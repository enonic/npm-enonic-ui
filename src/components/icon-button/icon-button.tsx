import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, type ForwardedRef, forwardRef } from 'react';

import { Button, type ButtonIconProps, type ButtonVariantsProps } from '@/components/button';
import { cn } from '@/utils';

import type { LucideIcon } from '@/types';

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
  /** Explicit accessible action name; title and label are not naming fallbacks. */
  'aria-label': string;
  iconClassName?: string;
  disabled?: boolean;
  label?: never;
} & IconButtonVariantsProps &
  Omit<ComponentPropsWithoutRef<'button'>, 'aria-label'>;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'text',
      size = 'md',
      shape = 'square',
      icon,
      'aria-label': ariaLabel,
      iconClassName,
      ...props
    }: IconButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <Button
        data-component='IconButton'
        ref={ref}
        className={cn(iconButtonVariants({ size, shape }), className)}
        variant={variant}
        size={size}
        startIcon={icon}
        startIconClassName={iconClassName}
        {...props}
        label=''
        aria-label={ariaLabel}
      />
    );
  },
);

IconButton.displayName = 'IconButton';
