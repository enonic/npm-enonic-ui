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
    color: {
      control: 'select',
      options: ['primary', 'success', 'destructive', 'neutral'],
      description: 'The semantic color/purpose of the button',
    },
    kind: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'link'],
      description: 'The visual style of the button',
    },
    size: {
      control: 'select',
      options: ['md', 'lg'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
} satisfies Meta<typeof Button>;

// Primary color examples
export const Primary: Story = {
  args: {
    label: 'Primary Action',
    color: 'primary',
    kind: 'solid',
  },
};

export const Success: Story = {
  args: {
    label: 'Save Changes',
    color: 'success',
    kind: 'solid',
  },
};

export const Destructive: Story = {
  args: {
    label: 'Delete Item',
    color: 'destructive',
    kind: 'solid',
  },
};

export const Neutral: Story = {
  args: {
    label: 'Cancel',
    color: 'neutral',
    kind: 'solid',
  },
};

// Kind variations
export const Solid: Story = {
  args: {
    label: 'Solid Button',
    kind: 'solid',
  },
};

export const Outline: Story = {
  args: {
    label: 'Outline Button',
    kind: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    label: 'Ghost Button',
    kind: 'ghost',
  },
};

export const Link: Story = {
  args: {
    label: 'Link Button',
    kind: 'link',
  },
};

// Size variations
export const Large: Story = {
  args: {
    label: 'Large Button',
    size: 'lg',
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    label: 'Disabled Button',
    disabled: true,
  },
};

// Comprehensive showcase
export const AllVariations: Story = {
  render: () => (
    <div className='space-y-6'>
      {/* Colors with solid kind */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-fg'>Solid Buttons</h3>
        <div className='flex flex-wrap gap-2'>
          <Button label='Primary' color='primary' kind='solid' />
          <Button label='Success' color='success' kind='solid' />
          <Button label='Destructive' color='destructive' kind='solid' />
          <Button label='Neutral' color='neutral' kind='solid' />
        </div>
      </div>

      {/* Outline variants */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-fg'>Outline Buttons</h3>
        <div className='flex flex-wrap gap-2'>
          <Button label='Primary' color='primary' kind='outline' />
          <Button label='Success' color='success' kind='outline' />
          <Button label='Destructive' color='destructive' kind='outline' />
          <Button label='Neutral' color='neutral' kind='outline' />
        </div>
      </div>

      {/* Ghost variants */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-fg'>Ghost Buttons</h3>
        <div className='flex flex-wrap gap-2'>
          <Button label='Primary' color='primary' kind='ghost' />
          <Button label='Success' color='success' kind='ghost' />
          <Button label='Destructive' color='destructive' kind='ghost' />
          <Button label='Neutral' color='neutral' kind='ghost' />
        </div>
      </div>

      {/* Link variants */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-fg'>Link Buttons</h3>
        <div className='flex flex-wrap gap-2'>
          <Button label='Primary' color='primary' kind='link' />
          <Button label='Success' color='success' kind='link' />
          <Button label='Destructive' color='destructive' kind='link' />
          <Button label='Neutral' color='neutral' kind='link' />
        </div>
      </div>

      {/* Sizes */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-fg'>Sizes</h3>
        <div className='flex items-center gap-2'>
          <Button label='Medium' size='md' />
          <Button label='Large' size='lg' />
        </div>
      </div>

      {/* Disabled states */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-fg'>Disabled States</h3>
        <div className='flex flex-wrap gap-2'>
          <Button label='Disabled Solid' kind='solid' disabled />
          <Button label='Disabled Outline' kind='outline' disabled />
          <Button label='Disabled Ghost' kind='ghost' disabled />
          <Button label='Disabled Link' kind='link' disabled />
        </div>
      </div>
    </div>
  ),
};
