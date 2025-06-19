import { cva, type VariantProps } from 'class-variance-authority';
import type { JSX } from 'react';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-md font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer',
  ],
  {
    variants: {
      color: {
        primary: '',
        success: '',
        destructive: '',
        neutral: '',
      },
      kind: {
        solid: '',
        outline: 'border-2 bg-transparent',
        ghost: 'bg-transparent',
        link: 'bg-transparent underline-offset-4 hover:underline',
      },
      size: {
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8 text-lg',
      },
    },
    compoundVariants: [
      // Primary color variants
      {
        color: 'primary',
        kind: 'solid',
        className: 'bg-primary text-primary-fg hover:bg-primary/90',
      },
      {
        color: 'primary',
        kind: 'outline',
        className: 'border-primary text-primary hover:bg-primary hover:text-primary-fg',
      },
      {
        color: 'primary',
        kind: 'ghost',
        className: 'text-primary hover:bg-primary/10',
      },
      {
        color: 'primary',
        kind: 'link',
        className: 'text-primary hover:bg-transparent',
      },
      // Success color variants
      {
        color: 'success',
        kind: 'solid',
        className: 'bg-success text-success-fg hover:bg-success/90',
      },
      {
        color: 'success',
        kind: 'outline',
        className: 'border-success text-success hover:bg-success hover:text-success-fg',
      },
      {
        color: 'success',
        kind: 'ghost',
        className: 'text-success hover:bg-success/10',
      },
      {
        color: 'success',
        kind: 'link',
        className: 'text-success hover:bg-transparent',
      },
      // Destructive color variants
      {
        color: 'destructive',
        kind: 'solid',
        className: 'bg-destructive text-destructive-fg hover:bg-destructive/90',
      },
      {
        color: 'destructive',
        kind: 'outline',
        className: 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-fg',
      },
      {
        color: 'destructive',
        kind: 'ghost',
        className: 'text-destructive hover:bg-destructive/10',
      },
      {
        color: 'destructive',
        kind: 'link',
        className: 'text-destructive hover:bg-transparent',
      },
      // Neutral color variants
      {
        color: 'neutral',
        kind: 'solid',
        className: 'bg-secondary text-secondary-fg hover:bg-secondary/80',
      },
      {
        color: 'neutral',
        kind: 'outline',
        className: 'border-secondary text-secondary hover:bg-secondary hover:text-secondary-fg',
      },
      {
        color: 'neutral',
        kind: 'ghost',
        className: 'text-secondary hover:bg-secondary/10',
      },
      {
        color: 'neutral',
        kind: 'link',
        className: 'text-secondary hover:bg-transparent',
      },
    ],
    defaultVariants: {
      color: 'primary',
      kind: 'solid',
      size: 'md',
    },
  },
);

export type ButtonColor = VariantProps<typeof buttonVariants>['color'];
export type ButtonKind = VariantProps<typeof buttonVariants>['kind'];
export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

export type ButtonProps = {
  label: string;
  onClick?: () => void;
  color?: ButtonColor;
  kind?: ButtonKind;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
};

export function Button({
  label,
  onClick,
  color = 'primary',
  kind,
  size,
  disabled = false,
  className,
}: ButtonProps): JSX.Element {
  return (
    <button onClick={onClick} disabled={disabled} className={cn(buttonVariants({ color, kind, size }), className)}>
      {label}
    </button>
  );
}
