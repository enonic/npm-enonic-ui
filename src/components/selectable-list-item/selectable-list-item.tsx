import { Checkbox, type CheckboxProps } from '@/components/checkbox/checkbox';
import { ListItem, type ListItemContentProps, type ListItemProps } from '@/components/list-item/list-item';
import type { ReactNode } from 'react';

export type SelectableListItemProps = {
  children?: ReactNode;
  readOnly?: boolean;
} & Pick<ListItemContentProps, 'label' | 'description' | 'metadata' | 'icon'> &
  Pick<CheckboxProps, 'checked' | 'defaultChecked' | 'onCheckedChange'> &
  Omit<ListItemProps, 'children'>;

export const SelectableListItem = ({
  className,
  selected,
  children,
  label,
  description,
  metadata,
  readOnly,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: SelectableListItemProps): React.ReactElement => {
  return (
    <ListItem className={className} selected={selected} {...props}>
      <ListItem.Left>
        <Checkbox
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          readOnly={readOnly}
        />
      </ListItem.Left>
      <ListItem.Content label={label} description={description} metadata={metadata} />
      <ListItem.Right>{children}</ListItem.Right>
    </ListItem>
  );
};

SelectableListItem.displayName = 'SelectableListItem';
