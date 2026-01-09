import type { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';
import { unwrap } from '../utils/unwrap';

/**
 * A circle with a disc inside.
 */
export const CircleDisc: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('lucide lucide-circle-disc', unwrap(className))}
      aria-hidden='true'
      {...props}
    >
      <circle cx='12' cy='12' r='10' />
      <circle cx='12' cy='12' r='6' fill='currentColor' />
    </svg>
  ),
);
CircleDisc.displayName = 'CircleDisc';

/** @alias CircleDisc */
export const CircleDiscIcon = CircleDisc;
