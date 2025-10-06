import { cn } from '@/utils';
import type { ReactElement } from 'react';

export type SeparatorProps = {
  className?: string;
  label?: string;
  decorative?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

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
      className={cn('inline-flex w-full gap-2.5', className)}
      {...props}
    >
      <span className='min-w-0 truncate text-subtle uppercase'>{label}</span>
      <span className='min-w-6 flex-1 border-b-1 border-bdr-subtle' />
    </div>
  );
};

Separator.displayName = 'Separator';
