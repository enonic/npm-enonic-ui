import type { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';
import { unwrap } from '../utils/unwrap';

/**
 * @component
 * @name FilledSquareMinus
 * @description Lucide-compatible SVG icon component. A filled square with a minus sign inside. Useful for representing indeterminate or partial selection states.
 * @see {@link https://enonic.github.io/npm-enonic-ui/?path=/story/design-icons--custom-icons | Storybook}
 * @param props - Lucide icon props and any valid SVG attribute
 * @returns SVG element
 */
export const FilledSquareMinus: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='currentColor'
      className={cn('lucide lucide-filled-square-minus', unwrap(className))}
      aria-hidden='true'
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM7 10.75h10a1 1 0 0 1 1 1v0.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-0.5a1 1 0 0 1 1-1Z'
        fill='currentColor'
      />
    </svg>
  ),
);
FilledSquareMinus.displayName = 'FilledSquareMinus';

/** @alias FilledSquareMinus */
export const FilledSquareMinusIcon = FilledSquareMinus;
