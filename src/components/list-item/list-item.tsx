import { cn } from '@/utils';
import { findComponentByType } from '@/utils/find';
import type { ReactNode } from 'react';

export type ListItemProps = {
  className?: string;
  selected?: boolean;
  children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export type ListItemLeftProps = {
  children?: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export type ListItemContentProps = {
  children?: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export type ListItemRightProps = {
  children?: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const ListItemLeft = ({
  children,
  className,
  ...props
}: ListItemLeftProps): React.ReactElement<ListItemLeftProps> => (
  <div className={cn('flex items-center gap-2.5 flex-shrink-0', className)} {...props}>
    {children}
  </div>
);
ListItemLeft.displayName = 'ListItem.Left';

export const ListItemContent = ({
  children,
  className,
  ...props
}: ListItemContentProps): React.ReactElement<ListItemContentProps> => (
  <div className={cn('flex-1 min-w-0', className)} {...props}>
    {children}
  </div>
);
ListItemContent.displayName = 'ListItem.Content';

export const ListItemRight = ({
  children,
  className,
  ...props
}: ListItemRightProps): React.ReactElement<ListItemRightProps> => (
  <div className={cn('flex items-center gap-5 flex-shrink-0', className)} {...props}>
    {children}
  </div>
);
ListItemRight.displayName = 'ListItem.Right';

const ListItemRoot = ({
  children,
  className,
  selected,
  ...props
}: ListItemProps): React.ReactElement<ListItemProps> => {
  const left = findComponentByType(children, ListItemLeft);
  const content = findComponentByType(children, ListItemContent);
  const right = findComponentByType(children, ListItemRight);

  return (
    <div
      className={cn(
        'group flex items-center px-2.5 py-1 gap-2.5',
        selected ? 'bg-surface-primary-selected text-rev' : 'hover:bg-surface-primary-hover',
        className,
      )}
      {...props}
    >
      {left}
      {content}
      {right}
    </div>
  );
};
ListItemRoot.displayName = 'ListItem';

export const ListItem = Object.assign(ListItemRoot, {
  Left: ListItemLeft,
  Content: ListItemContent,
  Right: ListItemRight,
});
