import type { Meta, StoryObj } from '@storybook/preact-vite';

import { Button } from './button';

type Story = StoryObj<typeof Button>;

export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label of the button',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'The visual variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button',
    },
    border: {
      control: 'boolean',
      description: 'Whether the button has a border (only available for primary variant)',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
} satisfies Meta<typeof Button>;

export const Primary: Story = {
  args: {
    label: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Tertiary: Story = {
  args: {
    label: 'Tertiary Button',
    variant: 'tertiary',
  },
};

export const PrimaryWithBorder: Story = {
  args: {
    label: 'Primary with Border',
    variant: 'primary',
    border: true,
  },
};

export const Small: Story = {
  args: {
    label: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    label: 'Medium Button',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    label: 'Large Button',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Button',
    disabled: true,
  },
};

export const AllVariations: Story = {
  render: () => (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h3 className='text-sm font-medium'>Button Variants</h3>
        <div className='flex flex-wrap gap-2'>
          <Button label='Primary' variant='primary' />
          <Button label='Secondary' variant='secondary' />
          <Button label='Tertiary' variant='tertiary' />
        </div>
      </div>

      <div className='space-y-2'>
        <h3 className='text-sm font-medium'>Primary with Border</h3>
        <div className='flex flex-wrap gap-2'>
          <Button label='Primary' variant='primary' border={false} />
          <Button label='Primary with Border' variant='primary' border={true} />
        </div>
      </div>

      <div className='space-y-2'>
        <h3 className='text-sm font-medium'>Button Sizes</h3>
        <div className='flex items-center gap-2'>
          <Button label='Small' size='sm' />
          <Button label='Medium' size='md' />
          <Button label='Large' size='lg' />
        </div>
      </div>

      <div className='space-y-2'>
        <h3 className='text-sm font-medium'>Disabled States</h3>
        <div className='flex flex-wrap gap-2'>
          <Button label='Primary Disabled' variant='primary' disabled />
          <Button label='Secondary Disabled' variant='secondary' disabled />
          <Button label='Tertiary Disabled' variant='tertiary' disabled />
        </div>
      </div>

      <div className='space-y-2'>
        <h3 className='text-sm font-medium'>All Size Variants</h3>
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <span className='w-16 text-xs'>Primary:</span>
            <Button label='Small' variant='primary' size='sm' />
            <Button label='Medium' variant='primary' size='md' />
            <Button label='Large' variant='primary' size='lg' />
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-16 text-xs'>Secondary:</span>
            <Button label='Small' variant='secondary' size='sm' />
            <Button label='Medium' variant='secondary' size='md' />
            <Button label='Large' variant='secondary' size='lg' />
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-16 text-xs'>Tertiary:</span>
            <Button label='Small' variant='tertiary' size='sm' />
            <Button label='Medium' variant='tertiary' size='md' />
            <Button label='Large' variant='tertiary' size='lg' />
          </div>
        </div>
      </div>
    </div>
  ),
};
