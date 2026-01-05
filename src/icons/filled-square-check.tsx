import type { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';
import { unwrap } from '../utils/unwrap';

/**
 * A filled square with a checkmark inside.
 * Useful for representing selected or checked states.
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
        d='M4.3 2H19.7C20.9703 2 22 3.02974 22 4.3V19.7C22 20.9703 20.9703 22 19.7 22H4.3C3.02974 22 2 20.9703 2 19.7V4.3C2 3.02974 3.02974 2 4.3 2ZM17.3886 9.25926C17.7868 8.76164 17.7061 8.03555 17.2085 7.63746C16.711 7.23937 15.9848 7.32005 15.5867 7.81766L10.1315 14.6367L7.94921 13C7.43942 12.6176 6.71618 12.721 6.33383 13.2308C5.95148 13.7406 6.0548 14.4638 6.56459 14.8462L9.64152 17.1538C10.1401 17.5278 10.8455 17.4382 11.2348 16.9515L17.3886 9.25926Z'
        fill='currentColor'
      />
    </svg>
  ),
);
FilledSquareCheck.displayName = 'FilledSquareCheck';

/** @alias FilledSquareCheck */
export const FilledSquareCheckIcon = FilledSquareCheck;
