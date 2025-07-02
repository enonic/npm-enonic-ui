import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Edit, Heart, Monitor, Plus, Save, Search, Settings, Upload } from 'lucide-react';

import { IconButton } from './icon-button';

type Story = StoryObj<typeof IconButton>;

export default {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
      description: 'The icon to display (required)',
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
    shape: {
      control: 'select',
      options: ['square', 'round'],
      description: 'The shape of the button',
    },
    title: {
      control: 'text',
      description: 'Tooltip text shown on hover',
    },
  },
} satisfies Meta<typeof IconButton>;

export const Text: Story = {
  args: {
    icon: Monitor,
    variant: 'text',
    title: 'Monitor',
  },
};

export const Filled: Story = {
  args: {
    icon: Save,
    variant: 'filled',
    title: 'Save',
  },
};

export const Solid: Story = {
  args: {
    icon: Upload,
    variant: 'solid',
    title: 'Upload',
  },
};

export const Outline: Story = {
  args: {
    icon: Settings,
    variant: 'outline',
    title: 'Settings',
  },
};

export const AllVariantsComparison: Story = {
  name: 'All Variants Comparison',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>All Variants - Medium Size</h3>
        <div className='flex flex-wrap gap-3'>
          <IconButton icon={Monitor} variant='text' title='Text variant' />
          <IconButton icon={Save} variant='filled' title='Filled variant' />
          <IconButton icon={Upload} variant='solid' title='Solid variant' />
          <IconButton icon={Settings} variant='outline' title='Outline variant' />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>All Variants - Disabled</h3>
        <div className='flex flex-wrap gap-3'>
          <IconButton icon={Monitor} variant='text' title='Text variant' disabled />
          <IconButton icon={Save} variant='filled' title='Filled variant' disabled />
          <IconButton icon={Upload} variant='solid' title='Solid variant' disabled />
          <IconButton icon={Settings} variant='outline' title='Outline variant' disabled />
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
        <IconButton icon={Search} variant='text' size='sm' title='Small search' />
        <IconButton icon={Search} variant='text' size='md' title='Medium search' />
        <IconButton icon={Search} variant='text' size='lg' title='Large search' />
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
        <IconButton icon={Plus} variant='filled' size='sm' title='Small add' />
        <IconButton icon={Plus} variant='filled' size='md' title='Medium add' />
        <IconButton icon={Plus} variant='filled' size='lg' title='Large add' />
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
        <IconButton icon={Edit} variant='solid' size='sm' title='Small edit' />
        <IconButton icon={Edit} variant='solid' size='md' title='Medium edit' />
        <IconButton icon={Edit} variant='solid' size='lg' title='Large edit' />
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
        <IconButton icon={Heart} variant='outline' size='sm' title='Small heart' />
        <IconButton icon={Heart} variant='outline' size='md' title='Medium heart' />
        <IconButton icon={Heart} variant='outline' size='lg' title='Large heart' />
      </div>
    </div>
  ),
};

export const ShapeComparison: Story = {
  name: 'Shape Comparison',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Square Shape (Default)</h3>
        <div className='flex flex-wrap gap-3'>
          <IconButton icon={Monitor} variant='text' shape='square' title='Square text' />
          <IconButton icon={Save} variant='filled' shape='square' title='Square filled' />
          <IconButton icon={Upload} variant='solid' shape='square' title='Square solid' />
          <IconButton icon={Settings} variant='outline' shape='square' title='Square outline' />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Round Shape</h3>
        <div className='flex flex-wrap gap-3'>
          <IconButton icon={Monitor} variant='text' shape='round' title='Round text' />
          <IconButton icon={Save} variant='filled' shape='round' title='Round filled' />
          <IconButton icon={Upload} variant='solid' shape='round' title='Round solid' />
          <IconButton icon={Settings} variant='outline' shape='round' title='Round outline' />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Round Shape - All Sizes</h3>
        <div className='flex items-center gap-3'>
          <IconButton icon={Heart} variant='filled' shape='round' size='sm' title='Small round' />
          <IconButton icon={Heart} variant='filled' shape='round' size='md' title='Medium round' />
          <IconButton icon={Heart} variant='filled' shape='round' size='lg' title='Large round' />
        </div>
      </div>
    </div>
  ),
};

export const DisabledStates: Story = {
  name: 'Disabled States',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Square - Disabled</h3>
        <div className='flex flex-wrap gap-3'>
          <IconButton icon={Monitor} variant='text' shape='square' title='Text variant' disabled />
          <IconButton icon={Save} variant='filled' shape='square' title='Filled variant' disabled />
          <IconButton icon={Upload} variant='solid' shape='square' title='Solid variant' disabled />
          <IconButton icon={Settings} variant='outline' shape='square' title='Outline variant' disabled />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Round - Disabled</h3>
        <div className='flex flex-wrap gap-3'>
          <IconButton icon={Monitor} variant='text' shape='round' title='Text variant' disabled />
          <IconButton icon={Save} variant='filled' shape='round' title='Filled variant' disabled />
          <IconButton icon={Upload} variant='solid' shape='round' title='Solid variant' disabled />
          <IconButton icon={Settings} variant='outline' shape='round' title='Outline variant' disabled />
        </div>
      </div>
    </div>
  ),
};

export const InteractivePlayground: Story = {
  name: 'Interactive Playground',
  args: {
    icon: Monitor,
    variant: 'text',
    size: 'md',
    shape: 'square',
    disabled: false,
    title: 'Monitor',
  },
};
