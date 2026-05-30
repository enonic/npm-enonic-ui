import { forwardRef } from 'react';

import type { LucideIcon, LucideProps } from 'lucide-react';

import { cn } from '../utils/cn';
import { unwrap } from '../utils/unwrap';

/**
 * @component
 * @name FilledSquareCheck
 * @description Lucide-compatible SVG icon component. A filled square with a checkmark inside. Useful for representing selected or checked states.
 * @see {@link https://enonic.github.io/npm-enonic-ui/?path=/story/design-icons--custom-icons | Storybook}
 * @param props - Lucide icon props and any valid SVG attribute
 * @returns SVG element
 */
export const FilledSquareCheck: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='currentColor'
      className={cn('lucide lucide-filled-square-check', unwrap(className))}
      aria-hidden='true'
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M4.3 2H19.7C20.9703 2 22 3.02974 22 4.3V19.7C22 20.9703 20.9703 22 19.7 22H4.3C3.02974 22 2 20.9703 2 19.7V4.3C2 3.02974 3.02974 2 4.3 2ZM17.3886 8.25926C17.7868 7.76164 17.7061 7.03555 17.2085 6.63746C16.711 6.23937 15.9848 6.32005 15.5867 6.81766L10.1315 13.6367L7.94921 12C7.43942 11.6176 6.71618 11.721 6.33383 12.2308C5.95148 12.7406 6.0548 13.4638 6.56459 13.8462L9.64152 16.1538C10.1401 16.5278 10.8455 16.4382 11.2348 15.9515L17.3886 8.25926Z'
        fill='currentColor'
      />
    </svg>
  ),
);
FilledSquareCheck.displayName = 'FilledSquareCheck';

/** @alias FilledSquareCheck */
export const FilledSquareCheckIcon = FilledSquareCheck;
