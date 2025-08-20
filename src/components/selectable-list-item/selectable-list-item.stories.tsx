import { IconButton } from '@/components';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { MoreVertical, Pen, X } from 'lucide-react';
import { useEffect, useState } from 'preact/hooks';

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

type PlaygroundArgs = {
  checked: boolean | 'indeterminate';
  selected: boolean;
  readOnly: boolean;
  label: string;
  description: string;
  metadata: string;
  showActions: boolean;
};

export const InteractivePlayground: StoryObj<PlaygroundArgs> = {
  name: 'Interactive Playground',
  args: {
    checked: false,
    selected: false,
    readOnly: false,
    label: 'Report.pdf',
    description: 'Shared by John',
    metadata: '12 KB',
    showActions: true,
  },
  argTypes: {
    checked: {
      control: 'select',
      options: [false, true, 'indeterminate'],
      description: 'Controls the checked state',
    },
    selected: {
      control: 'boolean',
      description: 'Controls the selected background state',
    },
    readOnly: {
      control: 'boolean',
      description: 'Makes the checkbox read-only',
    },
    label: {
      control: 'text',
      description: 'Main label text',
    },
    description: {
      control: 'text',
      description: 'Description text',
    },
    metadata: {
      control: 'text',
      description: 'Metadata text',
    },
    showActions: {
      control: 'boolean',
      description: 'Show action buttons',
    },
  },
  render: args => {
    const [checked, setChecked] = useState<boolean | 'indeterminate'>(args.checked);

    useEffect(() => {
      setChecked(args.checked);
    }, [args.checked]);

    return (
      <div className='w-96'>
        <SelectableListItem
          selected={args.selected}
          readOnly={args.readOnly}
          label={args.label}
          description={args.description}
          metadata={args.metadata}
          checked={checked}
          onCheckedChange={(newChecked: boolean | 'indeterminate') => {
            setChecked(newChecked);
          }}
        >
          {args.showActions && (
            <>
              <IconButton icon={Pen} variant='text' size='sm' aria-label='Edit' />
              <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
            </>
          )}
        </SelectableListItem>
      </div>
    );
  },
};
