import { IconButton } from '@/components';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { MoreVertical, Pen, X } from 'lucide-react';

import { SelectableListItem } from './selectable-list-item';

type Story = StoryObj<typeof SelectableListItem>;

export default {
  title: 'Components/SelectableListItem',
  component: SelectableListItem,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof SelectableListItem>;

export const Examples: Story = {
  name: 'Examples',
  render: () => (
    <div className='w-96 space-y-2'>
      <SelectableListItem
        label='This is a label.'
        description='This is a description.'
        metadata='Metadata| 12 KB'
        defaultChecked={false}
      >
        <IconButton icon={X} variant='text' size='sm' aria-label='Edit' />
        <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
      </SelectableListItem>
      <SelectableListItem
        label='This is a label.'
        description='This is a description.'
        metadata='Metadata| 12 KB'
        defaultChecked={true}
      >
        <IconButton icon={Pen} variant='text' size='sm' aria-label='Edit' />
        <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
      </SelectableListItem>
      <SelectableListItem
        readOnly={true}
        label='This is a label.'
        description='This is a description.'
        metadata='Metadata| 12 KB'
        defaultChecked={'indeterminate'}
      >
        <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='Edit' />
        <IconButton icon={X} variant='text' size='sm' aria-label='More options' />
      </SelectableListItem>
      <SelectableListItem
        selected
        label='This is a label.'
        description='This is a description.'
        metadata='Metadata| 12 KB'
        defaultChecked={false}
      >
        <IconButton icon={X} variant='text' size='sm' aria-label='Edit' />
        <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
      </SelectableListItem>

      <SelectableListItem
        selected
        label='This is a label.'
        description='This is a description.'
        metadata='Metadata| 12 KB'
        defaultChecked={'indeterminate'}
      >
        <IconButton icon={Pen} variant='text' size='sm' aria-label='Edit' />
        <IconButton icon={X} variant='text' size='sm' aria-label='More options' />
      </SelectableListItem>

      <SelectableListItem
        readOnly={true}
        selected
        label='This is a label.'
        description='This is a description.'
        metadata='Metadata| 12 KB'
        defaultChecked={'indeterminate'}
      >
        <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='Edit' />
        <IconButton icon={X} variant='text' size='sm' aria-label='More options' />
      </SelectableListItem>
    </div>
  ),
};

type ControlsArgs = {
  initialCheckedState: 'unchecked' | 'checked' | 'indeterminate';
  selected: boolean;
  readOnly: boolean;
  label: string;
  description: string;
  metadata: string;
};

export const Controls: StoryObj = {
  name: 'Playground (Controls)',
  args: {
    initialCheckedState: 'unchecked',
    selected: false,
    readOnly: false,
    label: 'Report.pdf',
    description: 'Shared by John',
    metadata: '12 KB',
  } as ControlsArgs,
  argTypes: {
    initialCheckedState: {
      options: ['unchecked', 'checked', 'indeterminate'],
      control: { type: 'inline-radio' },
    },
    selected: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    label: { control: 'text' },
    description: { control: 'text' },
    metadata: { control: 'text' },
  },
  render: raw => {
    const args = raw as ControlsArgs;

    const defaultChecked =
      args.initialCheckedState === 'checked'
        ? true
        : args.initialCheckedState === 'indeterminate'
          ? 'indeterminate'
          : false;

    return (
      <div className='w-96'>
        <SelectableListItem
          key={args.initialCheckedState}
          selected={args.selected}
          readOnly={args.readOnly}
          label={args.label}
          description={args.description}
          metadata={args.metadata}
          defaultChecked={defaultChecked}
        >
          <IconButton icon={Pen} variant='text' size='sm' aria-label='Edit' />
          <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
        </SelectableListItem>
      </div>
    );
  },
};
