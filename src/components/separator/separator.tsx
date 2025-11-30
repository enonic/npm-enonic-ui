import type { ComponentPropsWithoutRef, ReactElement } from 'react';
import { cn } from '@/utils';

export type SeparatorProps = {
  className?: string;
  label?: string;
  decorative?: boolean;
} & ComponentPropsWithoutRef<'div'>;

export const Separator = ({ className, label, decorative = false, ...props }: SeparatorProps): ReactElement => {
  const ariaHidden = decorative ? 'true' : undefined;

  if (!label) {
    return <hr aria-hidden={ariaHidden} className={cn('w-full border-bdr-subtle', className)} />;
  }

  return (
    <div
      role='separator'
      aria-orientation='horizontal'
      aria-hidden={ariaHidden}
      className={cn('inline-flex w-full items-baseline gap-2.5', className)}
      {...props}
    >
      <span className='min-w-0 truncate text-subtle uppercase tracking-wider'>{label}</span>
      <span className='min-w-6 flex-1 border-bdr-subtle border-b' />
    </div>
  );
};

Separator.displayName = 'Separator';
