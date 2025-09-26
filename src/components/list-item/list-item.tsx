import { cn } from '@/utils';
import { findComponentByType } from '@/utils/find';
import type { ReactElement, ReactNode } from 'react';

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
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export type ListItemDefaultContentProps = {
  className?: string;
  label?: string;
  description?: string;
  metadata?: string;
  icon?: ReactNode;
};

export type ListItemRightProps = {
  children?: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const ListItemLeft = ({ children, className, ...props }: ListItemLeftProps): ReactElement<ListItemLeftProps> => (
  <div className={cn('flex items-center gap-2.5 flex-shrink-0', className)} {...props}>
    {children}
  </div>
);

export const ListItemContent = ({
  className,
  children,
  ...props
}: ListItemContentProps): ReactElement<ListItemContentProps> => {
  return (
    <div className={cn('flex-1 min-w-0', className)} {...props}>
      {children}
    </div>
  );
};
ListItemContent.displayName = 'ListItem.Content';

export const ListItemDefaultContent = ({
  className,
  label,
  description,
  metadata,
  icon,
}: ListItemDefaultContentProps): ReactElement<ListItemDefaultContentProps> => {
  return (
    <ListItemContent className={cn(icon && 'grid grid-cols-[auto_1fr] gap-2.5 items-center', className)}>
      {icon && (
        <div className='flex items-center justify-center flex-shrink-0 group-data-[tone=inverse]:text-alt'>{icon}</div>
      )}
      <div className='min-w-0 text-left'>
        {label && <h1 className='truncate font-semibold group-data-[tone=inverse]:text-alt'>{label}</h1>}
        {description && (
          <p className='truncate text-sm text-subtle group-data-[tone=inverse]:text-alt'>{description}</p>
        )}
        {metadata && <p className='text-xs text-subtle group-data-[tone=inverse]:text-alt'>{metadata}</p>}
      </div>
    </ListItemContent>
  );
};

export const ListItemRight = ({
  children,
  className,
  ...props
}: ListItemRightProps): ReactElement<ListItemRightProps> => (
  <div className={cn('flex items-center gap-5 flex-shrink-0', className)} {...props}>
    {children}
  </div>
);
ListItemRight.displayName = 'ListItem.Right';

const ListItemRoot = ({ children, className, selected, ...props }: ListItemProps): ReactElement<ListItemProps> => {
  const left = findComponentByType(children, ListItemLeft);
  const content =
    findComponentByType(children, ListItemContent) ?? findComponentByType(children, ListItemDefaultContent);
  const right = findComponentByType(children, ListItemRight);
  return (
    <div
      className={cn(
        'group flex items-center px-2.5 py-1 gap-2.5',
        selected && 'bg-surface-primary-selected text-alt',
        className,
      )}
      data-tone={selected && 'inverse'}
      role='listitem'
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
  DefaultContent: ListItemDefaultContent,
  Right: ListItemRight,
});
