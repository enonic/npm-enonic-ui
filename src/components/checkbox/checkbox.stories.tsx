import type { Meta, StoryObj } from '@storybook/preact-vite';

import { Checkbox } from './checkbox';

type Story = StoryObj<typeof Checkbox>;

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    label: {
      control: 'text',
      description: 'Label for the checkbox',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the checkbox',
    },
    state: {
      control: 'select',
      options: ['default', 'readOnly', 'disabled', 'error'],
      description: 'Visual state',
    },
  },
} satisfies Meta<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Default Checkbox',
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    label: 'Checked Checkbox',
    checked: true,
  },
};

export const ErrorState: Story = {
  name: 'Error State',
  args: {
    label: 'Error Checkbox',
    checked: false,
    state: 'error',
  },
};

export const ReadOnly: Story = {
  name: 'Read Only',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='text-sm font-medium mb-3'>Read Only checkbox</h3>
      <div className='flex items-center gap-3'>
        <Checkbox label='Unchecked' checked={false} state='readOnly'/>
        <Checkbox label='Checked' checked={true} state='readOnly'/>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  name: 'Disabled',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='text-sm font-medium mb-3'>Disabled checkbox</h3>
      <div className='flex items-center gap-3'>
        <Checkbox label='Unchecked' checked={false} state='disabled'/>
        <Checkbox label='Checked' checked={true} state='disabled'/>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='text-sm font-medium mb-3'>Checkbox Sizes</h3>
      <div className='flex items-center gap-3'>
        <Checkbox label='Small' size='sm' />
        <Checkbox label='Medium' checked={true} size='md' />
        <Checkbox label='Large' size='lg' />
      </div>
    </div>
  ),
};

export const InteractivePlayground: Story = {
  name: 'Interactive Playground',
  args: {
    label: 'Playground Checkbox',
    checked: false,
    size: 'md',
    disabled: false,
  },
};
