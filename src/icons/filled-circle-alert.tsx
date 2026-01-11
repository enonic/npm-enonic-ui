import type { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';
import { unwrap } from '../utils/unwrap';

/**
 * @component
 * @name FilledCircleAlert
 * @description Lucide-compatible SVG icon component. A filled circle with an exclamation mark inside. Useful for representing warning states.
 * @see {@link https://enonic.github.io/npm-enonic-ui/?path=/story/design-icons--custom-icons | Storybook}
 * @param props - Lucide icon props and any valid SVG attribute
 * @returns SVG element
 */
export const FilledCircleAlert: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='currentColor'
      className={cn('lucide lucide-filled-circle-alert', unwrap(className))}
      aria-hidden='true'
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 6.46429C12.5917 6.46429 13.0714 6.94398 13.0714 7.53571V12.1786C13.0714 12.7703 12.5917 13.25 12 13.25C11.4083 13.25 10.9286 12.7703 10.9286 12.1786V7.53571C10.9286 6.94398 11.4083 6.46429 12 6.46429ZM13.4286 16.1071C13.4286 16.8962 12.7889 17.5357 12 17.5357C11.2111 17.5357 10.5714 16.8962 10.5714 16.1071C10.5714 15.3181 11.2111 14.6786 12 14.6786C12.7889 14.6786 13.4286 15.3181 13.4286 16.1071Z'
        fill='currentColor'
      />
    </svg>
  ),
);
FilledCircleAlert.displayName = 'FilledCircleAlert';

/** @alias FilledCircleAlert */
export const FilledCircleAlertIcon = FilledCircleAlert;
