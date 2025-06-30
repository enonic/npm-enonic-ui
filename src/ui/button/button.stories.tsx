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
      options: ['text', 'filled', 'solid', 'outline'],
      description: 'The visual variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
} satisfies Meta<typeof Button>;

export const Text: Story = {
  args: {
    label: 'Text Button',
    variant: 'text',
  },
};

export const Filled: Story = {
  args: {
    label: 'Filled Button',
    variant: 'filled',
  },
};

export const Solid: Story = {
  args: {
    label: 'Solid Button',
    variant: 'solid',
  },
};

export const Outline: Story = {
  args: {
    label: 'Outline Button',
    variant: 'outline',
  },
};

export const AllVariantsComparison: Story = {
  name: 'All Variants Comparison',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>All Variants - Medium Size</h3>
        <div className='flex flex-wrap gap-3'>
          <Button label='Text' variant='text' />
          <Button label='Filled' variant='filled' />
          <Button label='Solid' variant='solid' />
          <Button label='Outline' variant='outline' />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>All Variants - Disabled</h3>
        <div className='flex flex-wrap gap-3'>
          <Button label='Text' variant='text' disabled />
          <Button label='Filled' variant='filled' disabled />
          <Button label='Solid' variant='solid' disabled />
          <Button label='Outline' variant='outline' disabled />
        </div>
      </div>
    </div>
  ),
};

export const TextSizes: Story = {
  name: 'Text Variant - Size Comparison',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='text-sm font-medium mb-3'>Text Variant - All Sizes</h3>
      <div className='flex items-center gap-3'>
        <Button label='Small' variant='text' size='sm' />
        <Button label='Medium' variant='text' size='md' />
        <Button label='Large' variant='text' size='lg' />
      </div>
    </div>
  ),
};

export const FilledSizes: Story = {
  name: 'Filled Variant - Size Comparison',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='text-sm font-medium mb-3'>Filled Variant - All Sizes</h3>
      <div className='flex items-center gap-3'>
        <Button label='Small' variant='filled' size='sm' />
        <Button label='Medium' variant='filled' size='md' />
        <Button label='Large' variant='filled' size='lg' />
      </div>
    </div>
  ),
};

export const SolidSizes: Story = {
  name: 'Solid Variant - Size Comparison',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='text-sm font-medium mb-3'>Solid Variant - All Sizes</h3>
      <div className='flex items-center gap-3'>
        <Button label='Small' variant='solid' size='sm' />
        <Button label='Medium' variant='solid' size='md' />
        <Button label='Large' variant='solid' size='lg' />
      </div>
    </div>
  ),
};

export const OutlineSizes: Story = {
  name: 'Outline Variant - Size Comparison',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='text-sm font-medium mb-3'>Outline Variant - All Sizes</h3>
      <div className='flex items-center gap-3'>
        <Button label='Small' variant='outline' size='sm' />
        <Button label='Medium' variant='outline' size='md' />
        <Button label='Large' variant='outline' size='lg' />
      </div>
    </div>
  ),
};

export const DisabledStates: Story = {
  name: 'Disabled States',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='text-sm font-medium mb-3'>All Variants - Disabled</h3>
      <div className='flex flex-wrap gap-3'>
        <Button label='Text' variant='text' disabled />
        <Button label='Filled' variant='filled' disabled />
        <Button label='Solid' variant='solid' disabled />
        <Button label='Outline' variant='outline' disabled />
      </div>
    </div>
  ),
};

export const InteractivePlayground: Story = {
  name: 'Interactive Playground',
  args: {
    label: 'Click Me',
    variant: 'text',
    size: 'md',
    disabled: false,
  },
};
