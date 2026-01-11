import type { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';
import { unwrap } from '../utils/unwrap';

/**
 * @component
 * @name FilledCircleInfo
 * @description Lucide-compatible SVG icon component. A filled circle with an "i" symbol inside. Useful for representing informational states.
 * @see {@link https://enonic.github.io/npm-enonic-ui/?path=/story/design-icons--custom-icons | Storybook}
 * @param props - Lucide icon props and any valid SVG attribute
 * @returns SVG element
 */
export const FilledCircleInfo: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='currentColor'
      className={cn('lucide lucide-filled-circle-info', unwrap(className))}
      aria-hidden='true'
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM9.85714 15.3929C9.36402 15.3929 8.96429 15.7926 8.96429 16.2857C8.96429 16.7788 9.36402 17.1786 9.85714 17.1786H14.1429C14.636 17.1786 15.0357 16.7788 15.0357 16.2857C15.0357 15.7926 14.636 15.3929 14.1429 15.3929H12.8929V11.2857C12.8929 10.7926 12.4931 10.3929 12 10.3929H10.5714C10.0783 10.3929 9.67857 10.7926 9.67857 11.2857C9.67857 11.7788 10.0783 12.1786 10.5714 12.1786H11.1071V15.3929H9.85714ZM13.4286 7.71429C13.4286 8.50325 12.7889 9.14286 12 9.14286C11.2111 9.14286 10.5714 8.50325 10.5714 7.71429C10.5714 6.92532 11.2111 6.28571 12 6.28571C12.7889 6.28571 13.4286 6.92532 13.4286 7.71429Z'
        fill='currentColor'
      />
    </svg>
  ),
);
FilledCircleInfo.displayName = 'FilledCircleInfo';

/** @alias FilledCircleInfo */
export const FilledCircleInfoIcon = FilledCircleInfo;
