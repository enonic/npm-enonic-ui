import { Info } from 'lucide-react';
import { useState } from 'react';

import { Combobox } from '@/components/combobox';
import { Dialog } from '@/components/dialog';
import { IconButton } from '@/components/icon-button';
import { Listbox } from '@/components/listbox';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { Button } from '../button';
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
      <IconButton icon={Info} aria-label='More information' variant='outline' />
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
        <IconButton icon={Info} aria-label='More information' shape='round' />
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

export const TriggerModes: Story = {
  name: 'Features / Trigger Modes',
  render: () => (
    <div className='flex gap-4'>
      <Tooltip value='Shows on hover and focus' trigger='hover-focus'>
        <Button label='Hover + focus' />
      </Tooltip>

      <Tooltip value='Shows on hover only' trigger='hover'>
        <Button label='Hover only' />
      </Tooltip>

      <Tooltip value='Shows on focus only' trigger='focus'>
        <Button label='Focus only' />
      </Tooltip>
    </div>
  ),
};

export const AsChildWithExistingId: Story = {
  name: 'Features / AsChild With Existing Id',
  render: () => (
    <Tooltip value='The trigger keeps its existing id'>
      <button
        id='tooltip-trigger-with-own-id'
        type='button'
        className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
      >
        Existing trigger id
      </button>
    </Tooltip>
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

export const DismissibleAndHoverable: Story = {
  name: 'Behavior / Dismissible And Hoverable',
  render: () => (
    <div className='flex max-w-md flex-col items-center gap-6'>
      <p className='text-subtle text-sm'>
        Hover or focus the button to show the tooltip. Move the pointer onto the tooltip to keep it visible. Press
        Escape to dismiss it without moving the pointer or keyboard focus.
      </p>
      <Tooltip value='This tooltip stays visible while you hover over it'>
        <Button label='Hover or focus me' />
      </Tooltip>
    </div>
  ),
};

export const InsideDialog: Story = {
  name: 'Behavior / Inside Dialog',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className='flex flex-col gap-2.5'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open dialog' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120'>
              <Dialog.DefaultHeader
                title='Tooltip inside dialog'
                description='Pressing the tooltip keeps the dialog open. The first Escape closes the tooltip only.'
              />
              <Dialog.Body>
                <Tooltip value='Press me, the dialog stays open'>
                  <Button label='Hover me' />
                </Tooltip>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const InsideCombobox: Story = {
  name: 'Behavior / Inside Combobox',
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const options = ['Preact', 'React', 'Solid'];

    return (
      <Combobox.Root value={value} onChange={setValue}>
        <Combobox.Content>
          <Combobox.Control>
            <Combobox.Search>
              <Combobox.Input placeholder='Search frameworks' />
              <Combobox.Toggle />
            </Combobox.Search>
          </Combobox.Control>
          <Combobox.Popup>
            <Listbox.Content>
              {options.map(option => (
                <Listbox.Item key={option} value={option}>
                  <Tooltip value={`Pressing this keeps the ${option} list open`}>
                    <span>{option}</span>
                  </Tooltip>
                </Listbox.Item>
              ))}
            </Listbox.Content>
          </Combobox.Popup>
        </Combobox.Content>
      </Combobox.Root>
    );
  },
};

export const ExternalFocus: Story = {
  name: 'Behavior / External Focus',
  render: () => {
    const [focused, setFocused] = useState(false);
    const [active, setActive] = useState(0);
    const rows = ['First', 'Second'];

    return (
      <div className='flex flex-col gap-4'>
        <p className='max-w-100 text-sm'>
          Focus the list and use Up/Down to change the highlighted row. Its tooltip appears after 500 ms. Press Escape
          to dismiss.
        </p>
        <div
          role='listbox'
          tabIndex={0}
          aria-label='Rows with status tooltips'
          aria-activedescendant={`tooltip-row-${active}`}
          className='flex flex-col gap-4 rounded-sm border p-4'
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={event => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setActive(event.key === 'ArrowDown' ? 1 : 0);
            }
          }}
        >
          {rows.map((label, index) => (
            <div
              key={label}
              id={`tooltip-row-${index}`}
              role='option'
              aria-selected='false'
              data-active={focused && active === index}
              className='data-[active=true]:bg-surface-neutral-hover data-[active=true]:ring-ring rounded-sm px-3 py-2 data-[active=true]:ring-2'
            >
              {label} row{' '}
              <Tooltip value={`${label} details`} virtualFocus={focused && active === index} focusDelay={500}>
                <span>({index === 0 ? 'D' : 'M'})</span>
              </Tooltip>
            </div>
          ))}
        </div>
        <Button label='Outside the list' />
      </div>
    );
  },
};

export const DisabledTooltip: Story = {
  name: 'States / Disabled Tooltip',
  render: () => {
    const [disabled, setDisabled] = useState(true);

    return (
      <div className='flex flex-col items-start gap-4'>
        <p className='max-w-100 text-sm'>Disabling the tooltip keeps its button usable.</p>
        <Button label={disabled ? 'Enable tooltip' : 'Disable tooltip'} onClick={() => setDisabled(value => !value)} />
        <Tooltip value='Tooltip details' disabled={disabled}>
          <Button label='Hover or focus me' />
        </Tooltip>
      </div>
    );
  },
};

export const DelayedFocus: Story = {
  name: 'Behavior / Delayed Focus',
  render: () => (
    <div className='flex flex-col gap-4'>
      <p className='max-w-100 text-sm'>Focus the button for a 200 ms delay, or hover for a 500 ms delay.</p>
      <div className='flex gap-4'>
        <Tooltip value='Delayed keyboard details' focusDelay={200} delay={500}>
          <Button label='Focus for details' />
        </Tooltip>
        <Button label='Outside' />
      </div>
    </div>
  ),
};
