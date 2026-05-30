import { forwardRef } from 'react';

import type { LucideIcon, LucideProps } from 'lucide-react';

import { cn } from '../utils/cn';
import { unwrap } from '../utils/unwrap';

/**
 * @component
 * @name FilledCircleX
 * @description Lucide-compatible SVG icon component. A filled circle with an X mark inside. Useful for representing error states.
 * @see {@link https://enonic.github.io/npm-enonic-ui/?path=/story/design-icons--custom-icons | Storybook}
 * @param props - Lucide icon props and any valid SVG attribute
 * @returns SVG element
 */
export const FilledCircleX: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='currentColor'
      className={cn('lucide lucide-filled-circle-x', unwrap(className))}
      aria-hidden='true'
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM7.67101 7.67101C8.08942 7.2526 8.76782 7.2526 9.18624 7.67101L12 10.4848L14.8138 7.67101C15.2322 7.2526 15.9106 7.2526 16.329 7.67101C16.7474 8.08942 16.7474 8.76782 16.329 9.18624L13.5152 12L16.329 14.8138C16.7474 15.2322 16.7474 15.9106 16.329 16.329C15.9106 16.7474 15.2322 16.7474 14.8138 16.329L12 13.5152L9.18624 16.329C8.76782 16.7474 8.08942 16.7474 7.67101 16.329C7.2526 15.9106 7.2526 15.2322 7.67101 14.8138L10.4848 12L7.67101 9.18624C7.2526 8.76782 7.2526 8.08942 7.67101 7.67101Z'
        fill='currentColor'
      />
    </svg>
  ),
);
FilledCircleX.displayName = 'FilledCircleX';

/** @alias FilledCircleX */
export const FilledCircleXIcon = FilledCircleX;
