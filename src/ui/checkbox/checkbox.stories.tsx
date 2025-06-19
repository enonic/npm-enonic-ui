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
    label: {
      control: 'text',
      description: 'The label of the checkbox',
    },
    color: {
      control: 'select',
      options: ['primary', 'success', 'destructive', 'neutral'],
      description: 'The semantic color/purpose of the checkbox',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the checkbox',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
  },
} satisfies Meta<typeof Checkbox>;

// Basic examples
export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    label: 'Newsletter subscription',
    checked: true,
  },
};

// Color variations
export const Primary: Story = {
  args: {
    label: 'Primary checkbox',
    color: 'primary',
    checked: true,
  },
};

export const Success: Story = {
  args: {
    label: 'Task completed',
    color: 'success',
    checked: true,
  },
};

export const Destructive: Story = {
  args: {
    label: 'Delete permanently',
    color: 'destructive',
    checked: true,
  },
};

export const Neutral: Story = {
  args: {
    label: 'Archive item',
    color: 'neutral',
    checked: true,
  },
};

// Size variations
export const Small: Story = {
  args: {
    label: 'Small checkbox',
    size: 'sm',
    checked: true,
  },
};

export const Medium: Story = {
  args: {
    label: 'Medium checkbox',
    size: 'md',
    checked: true,
  },
};

export const Large: Story = {
  args: {
    label: 'Large checkbox',
    size: 'lg',
    checked: true,
  },
};

// States
export const Disabled: Story = {
  args: {
    label: 'Disabled checkbox',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled checked',
    disabled: true,
    checked: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    checked: true,
  },
};

// Comprehensive showcase
export const AllVariations: Story = {
  render: () => (
    <div className='space-y-6'>
      {/* Colors */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-fg'>Colors</h3>
        <div className='space-y-2'>
          <Checkbox label='Primary' color='primary' checked />
          <Checkbox label='Success' color='success' checked />
          <Checkbox label='Destructive' color='destructive' checked />
          <Checkbox label='Neutral' color='neutral' checked />
        </div>
      </div>

      {/* Sizes */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-fg'>Sizes</h3>
        <div className='space-y-2'>
          <Checkbox label='Small' size='sm' checked />
          <Checkbox label='Medium' size='md' checked />
          <Checkbox label='Large' size='lg' checked />
        </div>
      </div>

      {/* States */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-fg'>States</h3>
        <div className='space-y-2'>
          <Checkbox label='Unchecked' checked={false} />
          <Checkbox label='Checked' checked={true} />
          <Checkbox label='Disabled unchecked' disabled />
          <Checkbox label='Disabled checked' disabled checked />
        </div>
      </div>

      {/* Without labels */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-fg'>Without Labels</h3>
        <div className='flex items-center gap-2'>
          <Checkbox size='sm' />
          <Checkbox size='md' checked />
          <Checkbox size='lg' />
        </div>
      </div>
    </div>
  ),
};