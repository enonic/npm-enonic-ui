import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useState } from 'react';
import { Tooltip } from '../tooltip';
import { RadioGroup, type RadioGroupRootProps } from './radio-group';

type Story = StoryObj<RadioGroupRootProps>;

export default {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<RadioGroupRootProps>;

//
// * Examples
//

export const Default: Story = {
  name: 'Examples / Default',
  render: () => {
    return (
      <div className='space-y-4 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Default Radio Group</h3>
        <RadioGroup.Root name='defaultAccessMode' defaultValue='public'>
          <RadioGroup.Item value='public'>
            <RadioGroup.Indicator />
            <span>Public - Everyone can read the content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='private'>
            <RadioGroup.Indicator />
            <span>Private - Only project roles can read content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='custom'>
            <RadioGroup.Indicator />
            <span>Custom - Selected users can read content</span>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    );
  },
};

export const Controlled: Story = {
  name: 'Examples / Controlled',
  render: () => {
    const [value, setValue] = useState('public');

    return (
      <div className='space-y-4 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Controlled Radio Group</h3>
        <RadioGroup.Root name='controlledAccessMode' value={value} onValueChange={setValue}>
          <RadioGroup.Item value='public'>
            <RadioGroup.Indicator />
            <span>Public - Everyone can read the content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='private'>
            <RadioGroup.Indicator />
            <span>Private - Only project roles can read content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='custom'>
            <RadioGroup.Indicator />
            <span>Custom - Selected users can read content</span>
          </RadioGroup.Item>
        </RadioGroup.Root>
        <p className='mt-3 text-sm text-subtle'>Selected: {value}</p>
      </div>
    );
  },
};

export const HorizontalState: Story = {
  name: 'State / Horizontal',
  render: () => {
    return (
      <div className='space-y-4 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Horizontal Radio Group</h3>
        <RadioGroup.Root name='horizontalAccessMode' defaultValue='public' orientation='horizontal'>
          <RadioGroup.Item value='public'>
            <RadioGroup.Indicator />
            <span>Public</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='private'>
            <RadioGroup.Indicator />
            <span>Private</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='custom'>
            <RadioGroup.Indicator />
            <span>Custom</span>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    );
  },
};

export const ErrorState: Story = {
  name: 'State / Error',
  render: () => {
    return (
      <div className='space-y-4 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Error Radio Group</h3>
        <RadioGroup.Root name='errorAccessMode' defaultValue='public' error>
          <RadioGroup.Item value='public'>
            <RadioGroup.Indicator />
            <span>Public - Everyone can read the content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='private'>
            <RadioGroup.Indicator />
            <span>Private - Only project roles can read content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='custom'>
            <RadioGroup.Indicator />
            <span>Custom - Selected users can read content</span>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    );
  },
};

export const ErrorMessageState: Story = {
  name: 'State / Error with message',
  render: () => {
    return (
      <div className='space-y-4 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Error Radio Group with message</h3>
        <RadioGroup.Root name='errorMessageAccessMode' defaultValue='public' error errorMessage='Error message'>
          <RadioGroup.Item value='public'>
            <RadioGroup.Indicator />
            <span>Public - Everyone can read the content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='private'>
            <RadioGroup.Indicator />
            <span>Private - Only project roles can read content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='custom'>
            <RadioGroup.Indicator />
            <span>Custom - Selected users can read content</span>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    );
  },
};

export const LoopState: Story = {
  name: 'State / Loop',
  render: () => {
    return (
      <div className='space-y-4 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Radio Group with loop navigation</h3>
        <RadioGroup.Root name='loopAccessMode' defaultValue='public' loop>
          <RadioGroup.Item value='public'>
            <RadioGroup.Indicator />
            <span>Public - Everyone can read the content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='private'>
            <RadioGroup.Indicator />
            <span>Private - Only project roles can read content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='custom'>
            <RadioGroup.Indicator />
            <span>Custom - Selected users can read content</span>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    );
  },
};

export const DisabledState: Story = {
  name: 'State / Disabled',
  render: () => {
    return (
      <div className='space-y-4 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Radio Group with disabled item</h3>
        <RadioGroup.Root name='disabledAccessMode' defaultValue='public'>
          <RadioGroup.Item value='public'>
            <RadioGroup.Indicator />
            <span>Public - Everyone can read the content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='private' disabled>
            <RadioGroup.Indicator />
            <span>Private - Only project roles can read content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='custom'>
            <RadioGroup.Indicator />
            <span>Custom - Selected users can read content</span>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    );
  },
};

export const RequiredState: Story = {
  name: 'State / Required',
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className='space-y-4 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Required Radio Group</h3>
        <RadioGroup.Root
          name='requiredAccessMode'
          value={value}
          onValueChange={setValue}
          required
          error={!value}
          errorMessage={!value ? 'Please select an option' : undefined}
        >
          <RadioGroup.Item value='public'>
            <RadioGroup.Indicator />
            <span>Public - Everyone can read the content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='private'>
            <RadioGroup.Indicator />
            <span>Private - Only project roles can read content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='custom'>
            <RadioGroup.Indicator />
            <span>Custom - Selected users can read content</span>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    );
  },
};

export const FeatureCustomItems: Story = {
  name: 'Feature / Custom Items',
  render: () => {
    return (
      <div className='space-y-4 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Radio Group with custom items</h3>
        <RadioGroup.Root
          name='customItemsAccessMode'
          defaultValue='public'
          className='flex flex-row justify-between gap-10'
        >
          <Tooltip value='Public - Everyone can read the content'>
            <RadioGroup.Item value='public' className='flex flex-col'>
              <span>Public</span>
              <RadioGroup.Indicator />
            </RadioGroup.Item>
          </Tooltip>

          <Tooltip value='Private - Only project roles can read content'>
            <RadioGroup.Item value='private' className='flex flex-col'>
              <span>Private</span>
              <RadioGroup.Indicator />
            </RadioGroup.Item>
          </Tooltip>

          <Tooltip value='Custom - Selected users can read content'>
            <RadioGroup.Item value='custom' className='flex flex-col'>
              <span>Custom</span>
              <RadioGroup.Indicator />
            </RadioGroup.Item>
          </Tooltip>
        </RadioGroup.Root>
      </div>
    );
  },
};

export const UnselectedRadio: Story = {
  name: 'Behavior / Unselected Radio',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <div className='w-96 rounded-sm bg-surface-primary p-3 text-sm'>
          <p className='mb-2 font-medium'>Radio Group with unselected radio:</p>
          <ul className='space-y-1 text-xs'>
            <li>Reachable via Keyboard Tab</li>
            <li>Focus moves to the first enabled radio</li>
          </ul>
        </div>
        <RadioGroup.Root name='unselectedAccessMode'>
          <RadioGroup.Item value='public' disabled>
            <RadioGroup.Indicator />
            <span>Public - Everyone can read the content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='private'>
            <RadioGroup.Indicator />
            <span>Private - Only project roles can read content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='custom'>
            <RadioGroup.Indicator />
            <span>Custom - Selected users can read content</span>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    );
  },
};

export const KeyboardNavigation: Story = {
  name: 'Behavior / Keyboard Navigation',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <div className='w-96 rounded-sm bg-surface-primary p-3 text-sm'>
          <p className='mb-2 font-medium'>Keyboard shortcuts:</p>
          <ul className='space-y-1 text-subtle text-xs'>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Tab</kbd> - Enter/exit the group
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Arrow Left / Arrow Up</kbd> - Move backwards
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Arrow Right / Arrow Down</kbd> - Move forwards
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Home</kbd> - Go to first enabled radio
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>End</kbd> - Go to last enabled radio
            </li>
          </ul>
        </div>
        <RadioGroup.Root name='keyboardAccessMode' defaultValue='public'>
          <RadioGroup.Item value='public'>
            <RadioGroup.Indicator />
            <span>Public - Everyone can read the content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='private'>
            <RadioGroup.Indicator />
            <span>Private - Only project roles can read content</span>
          </RadioGroup.Item>

          <RadioGroup.Item value='custom'>
            <RadioGroup.Indicator />
            <span>Custom - Selected users can read content</span>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    );
  },
};
