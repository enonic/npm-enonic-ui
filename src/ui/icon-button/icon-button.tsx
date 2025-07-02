import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import type { JSX } from 'react';

import { Button, type ButtonSize, type ButtonVariant } from '../button/button';

export type IconButtonVariant = ButtonVariant;
export type IconButtonSize = ButtonSize;
export type IconButtonShape = 'square' | 'round';

export type IconButtonProps = {
  className?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  icon: LucideIcon;
  title?: string;
  disabled?: boolean;
  onClick?: () => void;
};

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

export function IconButton({
  className,
  variant = 'text',
  size = 'md',
  shape = 'square',
  icon,
  title,
  disabled = false,
  onClick,
}: IconButtonProps): JSX.Element {
  return (
    <Button
      variant={variant}
      size={size}
      startIcon={icon}
      label=''
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(iconButtonVariants({ size, shape }), className)}
    />
  );
}
