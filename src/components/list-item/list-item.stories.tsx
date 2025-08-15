import { Checkbox, type CheckboxChecked, IconButton } from '@/components';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { ChevronDown, MoreVertical, Pen, X } from 'lucide-react';
import { useState } from 'preact/hooks';

import { ListItem } from './list-item';

type Story = StoryObj<typeof ListItem>;

export default {
  title: 'Components/ListItem',
  component: ListItem,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ListItem>;

export const Basic: Story = {
  name: 'Basic',
  render: () => (
    <div className='w-80 space-y-2'>
      <ListItem>
        <ListItem.Content>
          <div className='font-medium truncate'>Normal list item</div>
        </ListItem.Content>
      </ListItem>

      <ListItem selected>
        <ListItem.Content>
          <div className='font-medium truncate'>Selected list item</div>
        </ListItem.Content>
      </ListItem>
    </div>
  ),
};

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => {
    const [checked1, setChecked1] = useState<CheckboxChecked>(false);
    const [checked2, setChecked2] = useState<CheckboxChecked>(true);
    const [checked3, setChecked3] = useState<CheckboxChecked>(false);
    const [checked4, setChecked4] = useState<CheckboxChecked>('indeterminate');
    const [checked5, setChecked5] = useState<CheckboxChecked>(false);

    return (
      <div className='w-80 space-y-2'>
        {/* 1 icon on the left */}
        <ListItem>
          <ListItem.Left>
            <Checkbox checked={checked1} onCheckedChange={setChecked1} aria-label='Select folder' />
          </ListItem.Left>
          <ListItem.Content>
            <div className='font-medium truncate'>Documents folder</div>
          </ListItem.Content>
        </ListItem>

        {/* 1 icon on the right */}
        <ListItem>
          <ListItem.Content>
            <div className='min-w-0'>
              <div className='font-medium truncate'>Project settings</div>
              <div className='text-sm truncate'>Configure project options</div>
            </div>
          </ListItem.Content>
          <ListItem.Right>
            <IconButton icon={X} variant='text' size='sm' aria-label='Delete' />
          </ListItem.Right>
        </ListItem>

        {/* Icons on both sides */}
        <ListItem>
          <ListItem.Left>
            <Checkbox checked={checked2} onCheckedChange={setChecked2} aria-label='Select file' />
          </ListItem.Left>
          <ListItem.Content>
            <div className='min-w-0'>
              <div className='font-medium truncate'>main.tsx</div>
              <div className='text-sm truncate'>Entry point file</div>
            </div>
          </ListItem.Content>
          <ListItem.Right>
            <IconButton icon={Pen} variant='text' size='sm' aria-label='Edit' />
          </ListItem.Right>
        </ListItem>

        {/* 2 icons on the left */}
        <ListItem>
          <ListItem.Left>
            <Checkbox checked={checked3} onCheckedChange={setChecked3} aria-label='Select folder' />
            <IconButton icon={ChevronDown} variant='text' size='sm' aria-label='Expand' />
          </ListItem.Left>
          <ListItem.Content>
            <div className='min-w-0'>
              <div className='font-medium truncate'>src folder</div>
              <div className='text-sm truncate'>Source files</div>
            </div>
          </ListItem.Content>
        </ListItem>

        {/* 1 icon and 1 text on the right */}
        <ListItem>
          <ListItem.Left>
            <Checkbox checked={checked4} onCheckedChange={setChecked4} aria-label='Select package' />
          </ListItem.Left>
          <ListItem.Content>
            <div className='min-w-0'>
              <div className='font-medium truncate'>package.json</div>
              <div className='text-sm truncate'>Package configuration</div>
            </div>
          </ListItem.Content>
          <ListItem.Right>
            <span className='text-xs'>2.1 KB</span>
            <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
          </ListItem.Right>
        </ListItem>

        {/* Demonstrating automatic organization - children in any order */}
        <ListItem>
          <ListItem.Right>
            <IconButton icon={X} variant='text' size='sm' aria-label='Remove' />
          </ListItem.Right>
          <ListItem.Content>
            <div className='font-medium truncate'>Order does not matter</div>
          </ListItem.Content>
          <ListItem.Left>
            <Checkbox checked={checked5} onCheckedChange={setChecked5} aria-label='Select' />
          </ListItem.Left>
        </ListItem>

        {/* Plain text without explicit Content wrapper */}
        <ListItem>
          <div className='font-medium truncate'>Auto-wrapped in Content</div>
        </ListItem>
      </div>
    );
  },
};
