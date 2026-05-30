import { ChevronDown, Download, Loader2, Monitor, RefreshCw, Save, Share, Trash2, Upload } from 'lucide-react';

import type { Meta, StoryObj } from '@storybook/preact-vite';

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
  name: 'Examples / Text Variant',
  args: {
    label: 'Text Button',
    variant: 'text',
  },
};

export const Filled: Story = {
  name: 'Examples / Filled Variant',
  args: {
    label: 'Filled Button',
    variant: 'filled',
  },
};

export const Solid: Story = {
  name: 'Examples / Solid Variant',
  args: {
    label: 'Solid Button',
    variant: 'solid',
  },
};

export const Outline: Story = {
  name: 'Examples / Outline Variant',
  args: {
    label: 'Outline Button',
    variant: 'outline',
  },
};

export const AllVariantsComparison: Story = {
  name: 'Examples / All Variants',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='mb-3 text-sm font-medium'>All Variants - Medium Size</h3>
        <div className='flex flex-wrap gap-3'>
          <Button label='Text' variant='text' />
          <Button label='Filled' variant='filled' />
          <Button label='Solid' variant='solid' />
          <Button label='Outline' variant='outline' />
        </div>
      </div>
      <div>
        <h3 className='mb-3 text-sm font-medium'>All Variants - Disabled</h3>
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

export const DisabledStates: Story = {
  name: 'States / Disabled',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='mb-3 text-sm font-medium'>All Variants - Disabled</h3>
      <div className='flex flex-wrap gap-3'>
        <Button label='Text' variant='text' disabled />
        <Button label='Filled' variant='filled' disabled />
        <Button label='Solid' variant='solid' disabled />
        <Button label='Outline' variant='outline' disabled />
      </div>
    </div>
  ),
};

export const CustomStyles: Story = {
  name: 'Features / Custom Styles',
  args: {
    label: 'Custom Button',
    size: 'md',
    disabled: false,
  },
  parameters: {
    controls: {
      exclude: ['variant', 'startIcon', 'endIcon'],
    },
  },
  render: ({ label, size, disabled }) => (
    <Button
      label={label}
      variant='text'
      size={size}
      className='bg-btn-error text-alt hover:bg-btn-error-hover focus-visible:ring-error/50 active:bg-btn-error-active'
      disabled={disabled}
    />
  ),
};

export const TextSizes: Story = {
  name: 'Features / Text Sizes',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='mb-3 text-sm font-medium'>Text Variant - All Sizes</h3>
      <div className='flex items-center gap-3'>
        <Button label='Small' variant='text' size='sm' />
        <Button label='Medium' variant='text' size='md' />
        <Button label='Large' variant='text' size='lg' />
      </div>
    </div>
  ),
};

export const FilledSizes: Story = {
  name: 'Features / Filled Sizes',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='mb-3 text-sm font-medium'>Filled Variant - All Sizes</h3>
      <div className='flex items-center gap-3'>
        <Button label='Small' variant='filled' size='sm' />
        <Button label='Medium' variant='filled' size='md' />
        <Button label='Large' variant='filled' size='lg' />
      </div>
    </div>
  ),
};

export const SolidSizes: Story = {
  name: 'Features / Solid Sizes',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='mb-3 text-sm font-medium'>Solid Variant - All Sizes</h3>
      <div className='flex items-center gap-3'>
        <Button label='Small' variant='solid' size='sm' />
        <Button label='Medium' variant='solid' size='md' />
        <Button label='Large' variant='solid' size='lg' />
      </div>
    </div>
  ),
};

export const OutlineSizes: Story = {
  name: 'Features / Outline Sizes',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='mb-3 text-sm font-medium'>Outline Variant - All Sizes</h3>
      <div className='flex items-center gap-3'>
        <Button label='Small' variant='outline' size='sm' />
        <Button label='Medium' variant='outline' size='md' />
        <Button label='Large' variant='outline' size='lg' />
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  name: 'Features / With Icons',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='mb-3 text-sm font-medium'>Buttons with Left Icons</h3>
        <div className='flex flex-wrap gap-3'>
          <Button label='Monitor' variant='text' startIcon={Monitor} />
          <Button label='Save' variant='filled' startIcon={Save} />
          <Button label='Upload' variant='solid' startIcon={Upload} />
          <Button label='Delete' variant='outline' startIcon={Trash2} />
        </div>
      </div>
      <div>
        <h3 className='mb-3 text-sm font-medium'>Buttons with Right Icons</h3>
        <div className='flex flex-wrap gap-3'>
          <Button label='Options' variant='text' endIcon={ChevronDown} />
          <Button label='More Actions' variant='filled' endIcon={ChevronDown} />
          <Button label='Menu' variant='solid' endIcon={ChevronDown} />
          <Button label='Settings' variant='outline' endIcon={ChevronDown} />
        </div>
      </div>
      <div>
        <h3 className='mb-3 text-sm font-medium'>Buttons with Both Icons</h3>
        <div className='flex flex-wrap gap-3'>
          <Button label='Export' variant='text' startIcon={Download} endIcon={ChevronDown} />
          <Button label='Import' variant='filled' startIcon={Upload} endIcon={ChevronDown} />
          <Button label='Sync' variant='solid' startIcon={RefreshCw} endIcon={ChevronDown} />
          <Button label='Share' variant='outline' startIcon={Share} endIcon={ChevronDown} />
        </div>
      </div>
      <div>
        <h3 className='mb-3 text-sm font-medium'>Icon Button Sizes</h3>
        <div className='flex items-center gap-3'>
          <Button label='Small' variant='filled' size='sm' startIcon={Monitor} endIcon={ChevronDown} />
          <Button label='Medium' variant='filled' size='md' startIcon={Monitor} endIcon={ChevronDown} />
          <Button label='Large' variant='filled' size='lg' startIcon={Monitor} endIcon={ChevronDown} />
        </div>
      </div>
    </div>
  ),
};

export const IconClasses: Story = {
  name: 'Features / Icon Classes',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='mb-3 text-sm font-medium'>Animated Start Icon (Spin)</h3>
        <div className='flex flex-wrap gap-3'>
          <Button label='Loading' variant='solid' startIcon={Loader2} startIconClassName='animate-spin' />
          <Button label='Syncing' variant='filled' startIcon={RefreshCw} startIconClassName='animate-spin' />
        </div>
      </div>
      <div>
        <h3 className='mb-3 text-sm font-medium'>Animated End Icon (Rotate)</h3>
        <div className='flex flex-wrap gap-3'>
          <Button label='Closed' variant='outline' endIcon={ChevronDown} />
          <Button
            label='Opened'
            variant='outline'
            endIcon={ChevronDown}
            endIconClassName='rotate-180 transition-transform duration-150'
          />
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  name: 'Features / Interactive',
  args: {
    label: 'Click Me',
    variant: 'text',
    size: 'md',
    disabled: false,
  },
};
