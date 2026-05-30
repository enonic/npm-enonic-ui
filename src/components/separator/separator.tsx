import { cn } from '@/utils';

import type { ComponentPropsWithoutRef, ReactElement } from 'react';

export type SeparatorProps = {
  className?: string;
  label?: string;
  decorative?: boolean;
} & ComponentPropsWithoutRef<'div'>;

export const Separator = ({ className, label, decorative = false, ...props }: SeparatorProps): ReactElement => {
  const ariaHidden = decorative ? 'true' : undefined;

  if (!label) {
    return (
      <hr data-component='Separator' aria-hidden={ariaHidden} className={cn('border-bdr-subtle w-full', className)} />
    );
  }

  return (
    <div
      data-component='Separator'
      role='separator'
      aria-orientation='horizontal'
      aria-hidden={ariaHidden}
      className={cn('inline-flex w-full items-baseline gap-2.5', className)}
      {...props}
    >
      <span className='text-subtle min-w-0 truncate tracking-wider uppercase'>{label}</span>
      <span className='border-bdr-subtle min-w-6 flex-1 border-b' />
    </div>
  );
};

Separator.displayName = 'Separator';
