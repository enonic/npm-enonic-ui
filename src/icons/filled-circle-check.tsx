import type { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';
import { unwrap } from '../utils/unwrap';

/**
 * @component
 * @name FilledCircleCheck
 * @description Lucide-compatible SVG icon component. A filled circle with a checkmark inside. Useful for representing success states.
 * @see {@link https://enonic.github.io/npm-enonic-ui/?path=/story/design-icons--custom-icons | Storybook}
 * @param props - Lucide icon props and any valid SVG attribute
 * @returns SVG element
 */
export const FilledCircleCheck: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='currentColor'
      className={cn('lucide lucide-filled-circle-check', unwrap(className))}
      aria-hidden='true'
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM17.004 9.45502C17.3736 8.99296 17.2988 8.31872 16.8366 7.94907C16.3746 7.57942 15.7003 7.65433 15.3307 8.1164L10.2651 14.4483L8.23872 12.9286C7.76534 12.5735 7.09378 12.6695 6.73872 13.1428C6.3837 13.6162 6.47962 14.2878 6.95302 14.6428L9.81016 16.7857C10.2731 17.133 10.9282 17.0497 11.2897 16.5978L17.004 9.45502Z'
        fill='currentColor'
      />
    </svg>
  ),
);
FilledCircleCheck.displayName = 'FilledCircleCheck';

/** @alias FilledCircleCheck */
export const FilledCircleCheckIcon = FilledCircleCheck;
