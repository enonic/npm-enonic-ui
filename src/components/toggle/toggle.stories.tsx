import { cn } from '@/utils';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Bold, Italic, Star, Underline } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../button';
import { Toggle, type ToggleProps } from './toggle';

type Story = StoryObj<ToggleProps>;

export default {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label of the toggle',
    },
    variant: {
      control: 'select',
      options: ['text', 'filled', 'solid', 'outline'],
      description: 'The visual variant of the toggle',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the toggle',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
    pressed: {
      control: 'boolean',
      description: 'Controlled pressed state',
    },
    defaultPressed: {
      control: 'boolean',
      description: 'Default pressed state for uncontrolled usage',
    },
    startIcon: {
      control: false,
      description: 'Icon on the left side of the toggle',
    },
    endIcon: {
      control: false,
      description: 'Icon on the right side of the toggle',
    },
  },
} satisfies Meta<ToggleProps>;

export const Default: Story = {
  args: {
    label: 'Toggle',
    variant: 'text',
  },
};

export const DefaultPressed: Story = {
  args: {
    label: 'Toggle',
    variant: 'text',
    defaultPressed: true,
  },
};

export const AllVariantsComparison: Story = {
  name: 'All Variants Comparison',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>All Variants - Unpressed</h3>
        <div className='flex flex-wrap gap-3'>
          <Toggle label='Text' variant='text' />
          <Toggle label='Filled' variant='filled' />
          <Toggle label='Solid' variant='solid' />
          <Toggle label='Outline' variant='outline' />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>All Variants - Pressed</h3>
        <div className='flex flex-wrap gap-3'>
          <Toggle label='Text' variant='text' defaultPressed />
          <Toggle label='Filled' variant='filled' defaultPressed />
          <Toggle label='Solid' variant='solid' defaultPressed />
          <Toggle label='Outline' variant='outline' defaultPressed />
        </div>
      </div>
    </div>
  ),
};

export const SizeComparison: Story = {
  name: 'Size Comparison',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Text Variant</h3>
        <div className='flex items-center gap-3'>
          <Toggle label='Small' variant='text' size='sm' />
          <Toggle label='Medium' variant='text' size='md' />
          <Toggle label='Large' variant='text' size='lg' />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Filled Variant</h3>
        <div className='flex items-center gap-3'>
          <Toggle label='Small' variant='filled' size='sm' />
          <Toggle label='Medium' variant='filled' size='md' />
          <Toggle label='Large' variant='filled' size='lg' />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Solid Variant</h3>
        <div className='flex items-center gap-3'>
          <Toggle label='Small' variant='solid' size='sm' />
          <Toggle label='Medium' variant='solid' size='md' />
          <Toggle label='Large' variant='solid' size='lg' />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Outline Variant</h3>
        <div className='flex items-center gap-3'>
          <Toggle label='Small' variant='outline' size='sm' />
          <Toggle label='Medium' variant='outline' size='md' />
          <Toggle label='Large' variant='outline' size='lg' />
        </div>
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  name: 'Controlled',
  render: () => {
    const [pressed, setPressed] = useState(false);

    return (
      <div className='space-y-3 p-4'>
        <div>
          <h3 className='text-sm font-medium mb-2'>Controlled Toggle</h3>
          <Toggle label='Notifications' variant='outline' pressed={pressed} onPressedChange={setPressed} />
        </div>
        <p className='text-sm text-subtle'>
          <strong>State:</strong> {pressed ? 'On' : 'Off'}
        </p>
        <Button variant='filled' size='sm' label='Toggle from outside' onClick={() => setPressed(!pressed)} />
      </div>
    );
  },
};

export const Uncontrolled: Story = {
  name: 'Uncontrolled',
  render: () => {
    return (
      <div className='space-y-4 p-4'>
        <div>
          <h3 className='text-sm font-medium mb-3'>Uncontrolled Toggle</h3>
          <Toggle
            label='Notifications'
            variant='outline'
            defaultPressed={false}
            onPressedChange={pressed => console.log('Pressed changed to:', pressed)}
          />
        </div>
        <div className='text-sm text-subtle'>
          <p>Check the console to see state changes</p>
        </div>
      </div>
    );
  },
};

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Icon Only - All Variants</h3>
        <div className='flex flex-wrap gap-3'>
          <Toggle variant='text' startIcon={Bold} aria-label='Toggle bold' />
          <Toggle variant='filled' startIcon={Italic} aria-label='Toggle italic' />
          <Toggle variant='solid' startIcon={Underline} aria-label='Toggle underline' />
          <Toggle variant='outline' startIcon={Bold} aria-label='Toggle bold outline' />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Icon with Label</h3>
        <div className='flex flex-wrap gap-3'>
          <Toggle label='Bold' variant='text' startIcon={Bold} />
          <Toggle label='Italic' variant='filled' startIcon={Italic} />
          <Toggle label='Underline' variant='solid' startIcon={Underline} />
          <Toggle label='Bold' variant='outline' startIcon={Bold} />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Different Sizes</h3>
        <div className='flex items-center gap-3'>
          <Toggle variant='text' size='sm' startIcon={Bold} aria-label='Small bold' />
          <Toggle variant='text' size='md' startIcon={Bold} aria-label='Medium bold' />
          <Toggle variant='text' size='lg' startIcon={Bold} aria-label='Large bold' />
        </div>
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  name: 'Custom Styling',
  render: () => {
    const [favorite, setFavorite] = useState(false);

    return (
      <div className='flex flex-col gap-y-3 p-4'>
        <h3 className='text-sm font-medium'>Star Favorite - Custom Gold Fill</h3>
        <div className='flex items-center gap-4'>
          <Toggle
            variant='text'
            aria-label='Add to favorites'
            pressed={favorite}
            onPressedChange={setFavorite}
            className={cn(
              'size-10 p-0 active:bg-initial active:text-initial hover:bg-initial',
              'data-[state=on]:bg-transparent data-[state=on]:text-[goldenrod] hover:text-[goldenrod]',
              'transition-highlight',
            )}
          >
            <Star fill={favorite ? 'currentColor' : 'none'} />
          </Toggle>
          <span className='text-sm text-subtle'>{favorite ? 'Added to favorites' : 'Add to favorites'}</span>
        </div>
      </div>
    );
  },
};

export const DisabledStates: Story = {
  name: 'Disabled States',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Disabled - Unpressed</h3>
        <div className='flex flex-wrap gap-3'>
          <Toggle label='Text' variant='text' disabled />
          <Toggle label='Filled' variant='filled' disabled />
          <Toggle label='Solid' variant='solid' disabled />
          <Toggle label='Outline' variant='outline' disabled />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Disabled - Pressed</h3>
        <div className='flex flex-wrap gap-3'>
          <Toggle label='Text' variant='text' disabled defaultPressed />
          <Toggle label='Filled' variant='filled' disabled defaultPressed />
          <Toggle label='Solid' variant='solid' disabled defaultPressed />
          <Toggle label='Outline' variant='outline' disabled defaultPressed />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Disabled - With Icons</h3>
        <div className='flex flex-wrap gap-3'>
          <Toggle variant='text' startIcon={Bold} disabled aria-label='Bold' />
          <Toggle variant='filled' startIcon={Italic} disabled aria-label='Italic' />
          <Toggle variant='solid' startIcon={Underline} disabled aria-label='Underline' />
          <Toggle variant='outline' startIcon={Bold} disabled aria-label='Bold outline' />
        </div>
      </div>
    </div>
  ),
};

export const InteractivePlayground: Story = {
  name: 'Interactive Playground',
  args: {
    label: 'Toggle Me',
    variant: 'text',
    size: 'md',
    disabled: false,
    defaultPressed: false,
  },
};
