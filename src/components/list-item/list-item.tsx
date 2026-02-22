import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { cn } from '@/utils';
import { findComponentByType } from '@/utils/find';

export type ListItemProps = {
  className?: string;
  selected?: boolean;
  children: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

export type ListItemLeftProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

export type ListItemContentProps = {
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

export type ListItemDefaultContentProps = {
  className?: string;
  label?: string;
  description?: ReactNode;
  metadata?: string;
  icon?: ReactNode;
};

export type ListItemRightProps = {
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

export const ListItemLeft = ({ children, className, ...props }: ListItemLeftProps): ReactElement<ListItemLeftProps> => (
  <div className={cn('flex flex-shrink-0 items-center gap-2.5', className)} {...props}>
    {children}
  </div>
);

export const ListItemContent = ({
  className,
  children,
  ...props
}: ListItemContentProps): ReactElement<ListItemContentProps> => {
  return (
    <div className={cn('min-w-0 flex-1', className)} {...props}>
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
    <ListItemContent className={cn(icon && 'grid grid-cols-[auto_1fr] items-center gap-2.5', className)}>
      {icon && (
        <div className='flex flex-shrink-0 items-center justify-center group-data-[tone=inverse]:text-alt'>{icon}</div>
      )}
      <div className='min-w-0 text-left'>
        {label && <h1 className='truncate font-semibold group-data-[tone=inverse]:text-alt'>{label}</h1>}
        {description && (
          <p className='truncate text-sm text-subtle group-data-[tone=inverse]:text-alt'>{description}</p>
        )}
        {metadata && <p className='text-subtle text-xs group-data-[tone=inverse]:text-alt'>{metadata}</p>}
      </div>
    </ListItemContent>
  );
};

export const ListItemRight = ({
  children,
  className,
  ...props
}: ListItemRightProps): ReactElement<ListItemRightProps> => (
  <div className={cn('flex flex-shrink-0 items-center gap-5', className)} {...props}>
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
        'group flex items-center gap-2.5 px-2.5 py-1',
        selected && 'bg-surface-selected text-alt',
        className,
      )}
      data-tone={selected ? 'inverse' : undefined}
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
