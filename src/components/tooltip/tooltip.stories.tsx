import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Info } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Tooltip } from './tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Examples / Default',
  render: () => (
    <Tooltip value='This is a tooltip'>
      <Button label='Hover me' />
    </Tooltip>
  ),
};

export const TopPosition: Story = {
  name: 'Examples / Top Position',
  render: () => (
    <Tooltip value='Tooltip on top' side='top'>
      <Button label='Hover for top tooltip' />
    </Tooltip>
  ),
};

export const WithIconButton: Story = {
  name: 'Examples / With IconButton',
  render: () => (
    <Tooltip value='More information'>
      <IconButton icon={Info} variant='outline' />
    </Tooltip>
  ),
};

export const SimpleButton: Story = {
  name: 'Examples / Simple Button',
  render: () => (
    <Tooltip value='Simple HTML button tooltip'>
      <button
        type='button'
        className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
        onClick={() => alert('Button clicked!')}
      >
        Simple Button
      </button>
    </Tooltip>
  ),
};

export const MultipleTooltips: Story = {
  name: 'Examples / Multiple Tooltips',
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

export const LongContent: Story = {
  name: 'Features / Long Content',
  render: () => (
    <Tooltip value='This is a much longer tooltip that contains more detailed information about the element'>
      <Button label='Long tooltip' />
    </Tooltip>
  ),
};

export const CustomStyling: Story = {
  name: 'Features / Custom Styling',
  render: () => (
    <Tooltip value={<strong>Important warning message!</strong>} className='bg-error text-alt'>
      <Button label='Custom styled tooltip' variant='solid' />
    </Tooltip>
  ),
};

export const AllPositions: Story = {
  name: 'Features / All Positions',
  render: () => (
    <div className='flex min-h-50 items-center justify-center gap-8'>
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
  name: 'Features / With Delay',
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

export const AsChildFalse: Story = {
  name: 'Features / AsChild False',
  render: () => (
    <Tooltip value='Using asChild=false' asChild={false}>
      <Button label='Wrapped in div' />
    </Tooltip>
  ),
};

export const DisabledTrigger: Story = {
  name: 'Behavior / Disabled Trigger',
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

export const EmptyTooltip: Story = {
  name: 'Behavior / Empty Tooltip',
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

export const DynamicContent: Story = {
  name: 'Behavior / Dynamic Content',
  render: () => {
    const [isLong, setIsLong] = useState(false);
    const tooltipContent = isLong
      ? 'This is a much longer tooltip content that will cause the tooltip to resize and reposition itself automatically'
      : 'Short';

    // Note: Tooltips use whitespace-nowrap to prevent text wrapping.
    // For dynamic content that changes while tooltip is visible, keep the height static
    // to avoid repositioning issues. If content may overflow the screen, consider:
    // 1. Limiting tooltip text length
    // 2. Using a Popover component instead for longer content
    // 3. Ensuring content changes maintain similar dimensions
    return (
      <Tooltip value={tooltipContent} side='top'>
        <Button label='Switch tooltip' onClick={() => setIsLong(!isLong)} />
      </Tooltip>
    );
  },
};
