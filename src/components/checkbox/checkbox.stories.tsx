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
    partial: {
      control: 'boolean',
      description: 'Whether the checkbox is in the indeterminate (partial) state',
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
    alignment: {
      control: 'select',
      options: ['left','right','top','bottom'],
      description: 'Where the checkbox sits relative to the label'
    }
  },
} satisfies Meta<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Default Checkbox',
    checked: false,
    partial: false,
  },
};

export const Checked: Story = {
  args: {
    label: 'Checked Checkbox',
    checked: true,
    partial: false,
  },
};

export const Indeterminate: Story = {
  name: 'Indeterminate',
  args: {
    label: 'Indeterminate Checkbox',
    checked: false,
    partial: true,
  },
};


export const ErrorState: Story = {
  name: 'Error State',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='text-sm font-medium mb-3'>Read Only checkbox</h3>
      <div className='flex items-center gap-3'>
        <Checkbox label='Unchecked' checked={false} state='error'/>
        <Checkbox label='Checked' checked={true} state='error'/>
        <Checkbox label='indeterminate' checked={false} partial={true} state='error'/>
      </div>
    </div>
  ),
};

export const ReadOnly: Story = {
  name: 'Read Only',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='text-sm font-medium mb-3'>Read Only checkbox</h3>
      <div className='flex items-center gap-3'>
        <Checkbox label='Unchecked' checked={false} state='readOnly'/>
        <Checkbox label='Checked' checked={true} state='readOnly'/>
        <Checkbox label='indeterminate' checked={false} partial={true} state='readOnly'/>
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
        <Checkbox label='Indeterminate' partial={true} checked={true} state='disabled'/>
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
    partial: false,
    size: 'md',
    disabled: false,
  },
};
