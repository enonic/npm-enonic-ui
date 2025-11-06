import { Button } from '@/components';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { File, Folder, Printer, Save, Settings } from 'lucide-react';
import { useState } from 'preact/hooks';

import { Menubar } from './menubar';

type Story = StoryObj<typeof Menubar>;

export default {
  title: 'Components/Menubar',
  component: Menubar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Menubar>;

export const Basic: Story = {
  name: 'Basic',
  render: () => (
    <Menubar.Root>
      <Menubar.Content aria-label='Main navigation'>
        <Menubar.Button asChild>
          <Button variant='text'>File</Button>
        </Menubar.Button>
        <Menubar.Button asChild>
          <Button variant='text'>Edit</Button>
        </Menubar.Button>
        <Menubar.Button asChild>
          <Button variant='text'>View</Button>
        </Menubar.Button>
        <Menubar.Button asChild>
          <Button variant='text'>Help</Button>
        </Menubar.Button>
      </Menubar.Content>
    </Menubar.Root>
  ),
};

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Menubar with icon buttons. Use ArrowLeft/ArrowRight to navigate, Enter/Space to activate.
      </div>
      <Menubar.Root>
        <Menubar.Content
          aria-label='Application actions'
          className='bg-surface-neutral border border-bdr-subtle rounded-md p-1 shadow-sm'
        >
          <Menubar.Button asChild>
            <Button variant='text' startIcon={File}>
              New
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text' startIcon={Save}>
              Save
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text' startIcon={Printer}>
              Print
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text' startIcon={Settings}>
              Settings
            </Button>
          </Menubar.Button>
        </Menubar.Content>
      </Menubar.Root>
    </div>
  ),
};

export const WithSeparators: Story = {
  name: 'With Separators',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Separators provide visual grouping between menubar items. They don&apos;t participate in keyboard navigation.
      </div>
      <Menubar.Root>
        <Menubar.Content
          aria-label='Actions with separators'
          className='bg-surface-neutral border border-bdr-subtle rounded-md p-1 shadow-sm'
        >
          <Menubar.Button asChild>
            <Button variant='text' startIcon={File}>
              New
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text' startIcon={Folder}>
              Open
            </Button>
          </Menubar.Button>
          <Menubar.Separator />
          <Menubar.Button asChild>
            <Button variant='text' startIcon={Save}>
              Save
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text' startIcon={Printer}>
              Print
            </Button>
          </Menubar.Button>
          <Menubar.Separator />
          <Menubar.Button asChild>
            <Button variant='text' startIcon={Settings}>
              Settings
            </Button>
          </Menubar.Button>
        </Menubar.Content>
      </Menubar.Root>
    </div>
  ),
};

export const WithDisabledItems: Story = {
  name: 'Disabled Items',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Disabled items are skipped during keyboard navigation but remain visible and accessible to screen readers. Test
        ArrowLeft/Right, Home, and End keys.
      </div>
      <Menubar.Root>
        <Menubar.Content
          aria-label='Actions'
          className='bg-surface-neutral border border-bdr-subtle rounded-md p-1 shadow-sm'
        >
          <Menubar.Button asChild>
            <Button variant='text' startIcon={File}>
              New
            </Button>
          </Menubar.Button>
          <Menubar.Button disabled asChild>
            <Button variant='text' startIcon={Folder} disabled>
              Open
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text' startIcon={Save}>
              Save
            </Button>
          </Menubar.Button>
          <Menubar.Button disabled asChild>
            <Button variant='text' startIcon={Printer} disabled>
              Print
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text' startIcon={Settings}>
              Settings
            </Button>
          </Menubar.Button>
        </Menubar.Content>
      </Menubar.Root>
    </div>
  ),
};

export const FocusNavigation: Story = {
  name: 'Focus Navigation',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Test keyboard navigation: Tab moves focus out of the menubar entirely to the next focusable element.
        ArrowLeft/Right navigate within the menubar. First item is auto-activated on focus.
      </div>
      <div className='flex flex-col gap-4'>
        <Button>Before Menubar</Button>
        <Menubar.Root>
          <Menubar.Content
            aria-label='Navigation'
            className='bg-surface-neutral border border-bdr-subtle rounded-md p-1 shadow-sm'
          >
            <Menubar.Button asChild>
              <Button variant='text'>File</Button>
            </Menubar.Button>
            <Menubar.Button asChild>
              <Button variant='text'>Edit</Button>
            </Menubar.Button>
            <Menubar.Button asChild>
              <Button variant='text'>View</Button>
            </Menubar.Button>
            <Menubar.Button asChild>
              <Button variant='text'>Help</Button>
            </Menubar.Button>
          </Menubar.Content>
        </Menubar.Root>
        <Button>After Menubar</Button>
      </div>
    </div>
  ),
};

export const NoLoop: Story = {
  name: 'No Loop',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Arrow key navigation stops at first/last item instead of looping. Press ArrowLeft at the first item or
        ArrowRight at the last item to see the difference.
      </div>
      <Menubar.Root>
        <Menubar.Content
          aria-label='Navigation'
          loop={false}
          className='bg-surface-neutral border border-bdr-subtle rounded-md p-1 shadow-sm'
        >
          <Menubar.Button asChild>
            <Button variant='text'>First</Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text'>Second</Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text'>Third</Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text'>Fourth</Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text'>Last</Button>
          </Menubar.Button>
        </Menubar.Content>
      </Menubar.Root>
    </div>
  ),
};

export const Interactive: Story = {
  name: 'Interactive',
  render: () => {
    const [lastAction, setLastAction] = useState<string>('None');
    const [activeItem, setActiveItem] = useState<string | undefined>(undefined);

    const handleSelect = (action: string): void => {
      setLastAction(action);
    };

    return (
      <div className='flex flex-col gap-y-3 p-4'>
        <div className='text-sm'>
          <span className='text-subtle'>Active item: </span>
          <span className='font-semibold'>{activeItem ?? 'None'}</span>
        </div>
        <div className='text-sm'>
          <span className='text-subtle'>Last action: </span>
          <span className='font-semibold'>{lastAction}</span>
        </div>

        <Menubar.Root onActiveChange={setActiveItem}>
          <Menubar.Content
            aria-label='Actions'
            className='bg-surface-neutral border border-bdr-subtle rounded-md p-1 shadow-sm'
          >
            <Menubar.Button onSelect={() => handleSelect('New File')} asChild>
              <Button variant='text' startIcon={File}>
                New
              </Button>
            </Menubar.Button>
            <Menubar.Button onSelect={() => handleSelect('Save File')} asChild>
              <Button variant='text' startIcon={Save}>
                Save
              </Button>
            </Menubar.Button>
            <Menubar.Button disabled onSelect={() => handleSelect('Print (should not trigger)')} asChild>
              <Button variant='text' startIcon={Printer} disabled>
                Print
              </Button>
            </Menubar.Button>
            <Menubar.Button onSelect={() => handleSelect('Settings')} asChild>
              <Button variant='text' startIcon={Settings}>
                Settings
              </Button>
            </Menubar.Button>
          </Menubar.Content>
        </Menubar.Root>
      </div>
    );
  },
};

export const Styled: Story = {
  name: 'Custom Styled',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Custom styling can be applied via className prop. This example shows a darker menubar with different button
        variants.
      </div>
      <Menubar.Root>
        <Menubar.Content
          aria-label='Custom styled navigation'
          className='bg-surface-primary border border-bdr-strong rounded-lg p-1.5 shadow-md'
        >
          <Menubar.Button asChild>
            <Button variant='solid' size='sm'>
              File
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='solid' size='sm'>
              Edit
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='solid' size='sm'>
              View
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='solid' size='sm'>
              Help
            </Button>
          </Menubar.Button>
        </Menubar.Content>
      </Menubar.Root>
    </div>
  ),
};

export const Phase2Preview: Story = {
  name: 'Phase 2 Preview (Not Implemented)',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        <strong>Phase 2 Preview:</strong> This shows how Menubar.Menu will integrate with Menu component. Currently, the
        Menu wrapper is a stub and does not provide menubar integration.
      </div>
      <div className='bg-surface-warning/10 border border-bdr-warning rounded-sm p-3 text-sm text-warning'>
        <strong>Note:</strong> Menu integration is not yet implemented. This is a visual preview only.
      </div>
      <Menubar.Root>
        <Menubar.Content
          aria-label='Application menu'
          className='bg-surface-neutral border border-bdr-subtle rounded-md p-1 shadow-sm'
        >
          <Menubar.Menu>{/* Future: Menu.Trigger, Menu.Content will go here */}</Menubar.Menu>
          <Menubar.Button asChild>
            <Button variant='text' startIcon={Save}>
              Save
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button variant='text' startIcon={Printer}>
              Print
            </Button>
          </Menubar.Button>
        </Menubar.Content>
      </Menubar.Root>
    </div>
  ),
};
