import { Checkbox, type CheckboxProps } from '@/components/checkbox/checkbox';
import { ListItem } from '@/components/list-item/list-item';
import type { ReactNode } from 'react';

export type SelectableListItemProps = {
  className?: string;
  selected?: boolean;
  children?: ReactNode;
  label: string;
  description?: string;
  metadata?: string;
  readOnly?: boolean;
  checked?: CheckboxProps['checked'];
  defaultChecked?: CheckboxProps['defaultChecked'];
  onCheckedChange?: CheckboxProps['onCheckedChange'];
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>;

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
