import type { ReactElement, ReactNode } from 'react';
import { Checkbox, type CheckboxProps } from '@/components/checkbox/checkbox';
import { ListItem, type ListItemDefaultContentProps, type ListItemProps } from '@/components/list-item/list-item';
import { cn } from '@/utils';

export type SelectableListItemProps = {
  children?: ReactNode;
  readOnly?: boolean;
} & Pick<ListItemDefaultContentProps, 'label' | 'description' | 'metadata' | 'icon'> &
  Pick<CheckboxProps, 'checked' | 'defaultChecked' | 'onCheckedChange'> &
  Omit<ListItemProps, 'children'>;

export const SelectableListItem = ({
  className,
  selected,
  children,
  label,
  description,
  metadata,
  icon,
  readOnly,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: SelectableListItemProps): ReactElement => {
  return (
    <ListItem
      className={cn(!selected && 'hover:bg-surface-neutral-hover', className)}
      selected={selected}
      role='row'
      aria-selected={selected}
      {...props}
    >
      <ListItem.Left>
        <Checkbox
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          readOnly={readOnly}
        />
      </ListItem.Left>
      <ListItem.DefaultContent label={label} description={description} metadata={metadata} icon={icon} />
      <ListItem.Right>{children}</ListItem.Right>
    </ListItem>
  );
};

SelectableListItem.displayName = 'SelectableListItem';
