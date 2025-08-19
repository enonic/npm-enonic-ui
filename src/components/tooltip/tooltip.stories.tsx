import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Info } from 'lucide-react';
import type { ComponentType } from 'preact';

import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Tooltip } from './tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story: ComponentType) => (
      <div className='flex items-center justify-center min-h-[200px] p-8'>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip value='This is a tooltip'>
      <Button label='Hover me' />
    </Tooltip>
  ),
};

export const TopPosition: Story = {
  render: () => (
    <Tooltip value='Tooltip on top' side='top'>
      <Button label='Hover for top tooltip' />
    </Tooltip>
  ),
};

export const WithIconButton: Story = {
  render: () => (
    <Tooltip value='More information'>
      <IconButton icon={Info} variant='outline' />
    </Tooltip>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Tooltip value='This is a much longer tooltip that contains more detailed information about the element'>
      <Button label='Long tooltip' />
    </Tooltip>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <Tooltip value='Important warning message!' className='bg-error text-alt'>
      <Button label='Custom styled tooltip' variant='solid' />
    </Tooltip>
  ),
};

export const MultipleTooltips: Story = {
  render: () => (
    <div className='flex gap-4'>
      <Tooltip value='First tooltip'>
        <Button label='First' />
      </Tooltip>

      <Tooltip value='Second tooltip on top' side='top'>
        <Button label='Second' variant='filled' />
      </Tooltip>

      <Tooltip value='Icon tooltip'>
        <IconButton icon={Info} shape='round' />
      </Tooltip>
    </div>
  ),
};

export const AllPositions: Story = {
  render: () => (
    <div className='flex gap-8 items-center justify-center' style={{ minHeight: '200px' }}>
      <Tooltip value='Top tooltip' side='top'>
        <Button label='Top' />
      </Tooltip>

      <Tooltip value='Right tooltip' side='right'>
        <Button label='Right' />
      </Tooltip>

      <Tooltip value='Bottom tooltip' side='bottom'>
        <Button label='Bottom' />
      </Tooltip>

      <Tooltip value='Left tooltip' side='left'>
        <Button label='Left' />
      </Tooltip>
    </div>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <div className='flex gap-4'>
      <Tooltip value='No delay'>
        <Button label='Instant' />
      </Tooltip>

      <Tooltip value='200ms delay' delay={200}>
        <Button label='200ms delay' />
      </Tooltip>

      <Tooltip value='500ms delay' delay={500}>
        <Button label='500ms delay' />
      </Tooltip>
    </div>
  ),
};

export const DisabledTrigger: Story = {
  render: () => (
    <div className='pointer-events-none'>
      <Tooltip value='This button is disabled'>
        <div className='pointer-events-auto'>
          <Button label='Disabled button' disabled />
        </div>
      </Tooltip>
    </div>
  ),
};

export const SimpleButton: Story = {
  render: () => (
    <Tooltip value='Simple HTML button tooltip'>
      <button
        type='button'
        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        onClick={() => alert('Button clicked!')}
      >
        Simple Button
      </button>
    </Tooltip>
  ),
};

export const AsChildFalse: Story = {
  render: () => (
    <Tooltip value='Using asChild=false' asChild={false}>
      <Button label='Wrapped in div' />
    </Tooltip>
  ),
};

export const EmptyTooltip: Story = {
  render: () => (
    <div className='flex gap-4'>
      <Tooltip value=''>
        <Button label='Empty string tooltip' />
      </Tooltip>

      <Tooltip value={null}>
        <Button label='Null tooltip' />
      </Tooltip>

      <Tooltip value={undefined}>
        <Button label='Undefined tooltip' />
      </Tooltip>
    </div>
  ),
};
