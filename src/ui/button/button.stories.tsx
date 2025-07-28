import type { Meta, StoryObj } from '@storybook/preact-vite';
import { ChevronDown, Download, Monitor, RefreshCw, Save, Share, Trash2, Upload } from 'lucide-react';

import { Button, type ButtonProps } from './button';

type Story = StoryObj<ButtonProps>;

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
    startIcon: {
      control: false,
      description: 'Icon on the left side of the button',
    },
    endIcon: {
      control: false,
      description: 'Icon on the right side of the button',
    },
  },
} satisfies Meta<ButtonProps>;

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

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Buttons with Left Icons</h3>
        <div className='flex flex-wrap gap-3'>
          <Button label='Monitor' variant='text' startIcon={Monitor} />
          <Button label='Save' variant='filled' startIcon={Save} />
          <Button label='Upload' variant='solid' startIcon={Upload} />
          <Button label='Delete' variant='outline' startIcon={Trash2} />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Buttons with Right Icons</h3>
        <div className='flex flex-wrap gap-3'>
          <Button label='Options' variant='text' endIcon={ChevronDown} />
          <Button label='More Actions' variant='filled' endIcon={ChevronDown} />
          <Button label='Menu' variant='solid' endIcon={ChevronDown} />
          <Button label='Settings' variant='outline' endIcon={ChevronDown} />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Buttons with Both Icons</h3>
        <div className='flex flex-wrap gap-3'>
          <Button label='Export' variant='text' startIcon={Download} endIcon={ChevronDown} />
          <Button label='Import' variant='filled' startIcon={Upload} endIcon={ChevronDown} />
          <Button label='Sync' variant='solid' startIcon={RefreshCw} endIcon={ChevronDown} />
          <Button label='Share' variant='outline' startIcon={Share} endIcon={ChevronDown} />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Icon Button Sizes</h3>
        <div className='flex items-center gap-3'>
          <Button label='Small' variant='filled' size='sm' startIcon={Monitor} endIcon={ChevronDown} />
          <Button label='Medium' variant='filled' size='md' startIcon={Monitor} endIcon={ChevronDown} />
          <Button label='Large' variant='filled' size='lg' startIcon={Monitor} endIcon={ChevronDown} />
        </div>
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
