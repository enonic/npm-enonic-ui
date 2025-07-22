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
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
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

export const Disabled: Story = {
  args: {
    label: 'Disabled Checkbox',
    disabled: true,
  },
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='text-sm font-medium mb-3'>Checkbox Sizes</h3>
      <div className='flex items-center gap-3'>
        <Checkbox label='Small' size='sm' />
        <Checkbox label='Medium' size='md' />
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
