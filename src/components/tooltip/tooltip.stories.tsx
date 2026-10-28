import { Info } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { IconButton } from '@/components';
import { Combobox } from '@/components/combobox';
import { Dialog } from '@/components/dialog';
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

const tooltipContent = (): HTMLElement | null => document.querySelector("[data-component='Tooltip.Content']");

const byTestId = (id: string): HTMLElement => {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`);
  if (element == null) throw new Error(`No element with data-testid="${id}"`);
  return element;
};

const waitForTooltip = async (): Promise<HTMLElement> =>
  await waitFor(() => {
    const element = tooltipContent();
    if (element == null) throw new Error('Tooltip did not open');
    return element;
  });

export const InsideDialog: Story = {
  name: 'Behavior / Inside Dialog',
  tags: ['interactions-smoke'],
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className='flex flex-col gap-2.5'>
        <Button data-testid='opener' variant='solid' onClick={() => setOpen(true)} label='Open dialog' />

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
                  <Button data-testid='trigger' label='Hover me' />
                </Tooltip>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
  play: async () => {
    const dialog = (): HTMLElement | null => document.querySelector("[data-component='Dialog.Content']");

    await userEvent.click(byTestId('opener'));
    const content = await waitFor(() => {
      const element = dialog();
      if (element == null || !element.contains(document.activeElement)) throw new Error('Dialog is not ready');
      return element;
    });

    await userEvent.hover(byTestId('trigger'));
    await userEvent.click(await waitForTooltip());
    await new Promise(resolve => setTimeout(resolve, 50));
    await expect(dialog()).not.toBeNull();
    await expect(content.contains(document.activeElement)).toBe(true);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(tooltipContent()).toBeNull());
    await new Promise(resolve => setTimeout(resolve, 50));
    await expect(dialog()).not.toBeNull();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog()).toBeNull());
  },
};

export const InsideCombobox: Story = {
  name: 'Behavior / Inside Combobox',
  tags: ['interactions-smoke'],
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
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>("[data-component='Combobox.Input']");
    if (input == null) throw new Error('No combobox input');
    const popup = (): HTMLElement | null => canvasElement.querySelector("[data-component='Combobox.Popup']");

    await userEvent.type(input, 'r');
    const option = await waitFor(() => {
      const element = canvasElement.querySelector<HTMLElement>("[role='option'] span");
      if (element == null) throw new Error('No combobox option');
      return element;
    });

    await userEvent.hover(option);
    await userEvent.click(await waitForTooltip());
    await new Promise(resolve => setTimeout(resolve, 50));
    await expect(popup()).not.toBeNull();
    await expect(document.activeElement).toBe(input);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(tooltipContent()).toBeNull());
    await new Promise(resolve => setTimeout(resolve, 50));
    await expect(popup()).not.toBeNull();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup()).toBeNull());
  },
};
