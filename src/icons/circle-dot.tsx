import type { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';
import { unwrap } from '../utils/unwrap';

/**
 * A circle with a dot inside.
 */
export const CircleDot: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('lucide lucide-circle-dot-icon lucide-circle-dot', unwrap(className))}
      {...props}
    >
      <circle cx='12' cy='12' r='10' />
      <circle cx='12' cy='12' r='4' fill='currentColor' />
    </svg>
  ),
);
CircleDot.displayName = 'CircleDot';

/** @alias CircleDot */
export const CircleDotIcon = CircleDot;
