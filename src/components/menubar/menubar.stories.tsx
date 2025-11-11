import { Button } from '@/components';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { ChevronDown, File, Folder, Printer, Save, Settings } from 'lucide-react';
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
      <Menubar.Nav aria-label='Main navigation'>
        <Menubar.Button asChild>
          <Button className='bg-transparent' variant='text'>
            File
          </Button>
        </Menubar.Button>
        <Menubar.Button asChild>
          <Button className='bg-transparent' variant='text'>
            Edit
          </Button>
        </Menubar.Button>
        <Menubar.Button asChild>
          <Button className='bg-transparent' variant='text'>
            View
          </Button>
        </Menubar.Button>
        <Menubar.Button asChild>
          <Button className='bg-transparent' variant='text'>
            Help
          </Button>
        </Menubar.Button>
      </Menubar.Nav>
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
        <Menubar.Nav
          aria-label='Application actions'
          className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
        >
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={File}>
              New
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={Save}>
              Save
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={Printer}>
              Print
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={Settings}>
              Settings
            </Button>
          </Menubar.Button>
        </Menubar.Nav>
      </Menubar.Root>
    </div>
  ),
};

export const WithSeparators: Story = {
  name: 'With Separators',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Separators provide visual grouping between menubar items. They don’t participate in keyboard navigation.
      </div>
      <Menubar.Root>
        <Menubar.Nav
          aria-label='Actions with separators'
          className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
        >
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={File}>
              New
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={Folder}>
              Open
            </Button>
          </Menubar.Button>
          <Menubar.Separator />
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={Save}>
              Save
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={Printer}>
              Print
            </Button>
          </Menubar.Button>
          <Menubar.Separator />
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={Settings}>
              Settings
            </Button>
          </Menubar.Button>
        </Menubar.Nav>
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
        <Menubar.Nav aria-label='Actions' className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'>
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={File}>
              New
            </Button>
          </Menubar.Button>
          <Menubar.Button disabled asChild>
            <Button className='bg-transparent' variant='text' startIcon={Folder} disabled>
              Open
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={Save}>
              Save
            </Button>
          </Menubar.Button>
          <Menubar.Button disabled asChild>
            <Button className='bg-transparent' variant='text' startIcon={Printer} disabled>
              Print
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={Settings}>
              Settings
            </Button>
          </Menubar.Button>
        </Menubar.Nav>
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
          <Menubar.Nav
            aria-label='Navigation'
            className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
          >
            <Menubar.Button asChild>
              <Button className='bg-transparent' variant='text'>
                File
              </Button>
            </Menubar.Button>
            <Menubar.Button asChild>
              <Button className='bg-transparent' variant='text'>
                Edit
              </Button>
            </Menubar.Button>
            <Menubar.Button asChild>
              <Button className='bg-transparent' variant='text'>
                View
              </Button>
            </Menubar.Button>
            <Menubar.Button asChild>
              <Button className='bg-transparent' variant='text'>
                Help
              </Button>
            </Menubar.Button>
          </Menubar.Nav>
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
        <Menubar.Nav
          aria-label='Navigation'
          loop={false}
          className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
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
        </Menubar.Nav>
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
          <Menubar.Nav
            aria-label='Actions'
            className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
          >
            <Menubar.Button onSelect={() => handleSelect('New File')} asChild>
              <Button className='bg-transparent' variant='text' startIcon={File}>
                New
              </Button>
            </Menubar.Button>
            <Menubar.Button onSelect={() => handleSelect('Save File')} asChild>
              <Button className='bg-transparent' variant='text' startIcon={Save}>
                Save
              </Button>
            </Menubar.Button>
            <Menubar.Button disabled onSelect={() => handleSelect('Print (should not trigger)')} asChild>
              <Button className='bg-transparent' variant='text' startIcon={Printer} disabled>
                Print
              </Button>
            </Menubar.Button>
            <Menubar.Button onSelect={() => handleSelect('Settings')} asChild>
              <Button className='bg-transparent' variant='text' startIcon={Settings}>
                Settings
              </Button>
            </Menubar.Button>
          </Menubar.Nav>
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
        <Menubar.Nav
          aria-label='Custom styled navigation'
          className='bg-surface-primary border border-bdr-strong rounded-xl shadow-md'
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
        </Menubar.Nav>
      </Menubar.Root>
    </div>
  ),
};

export const WithDropdownMenus: Story = {
  name: 'With Dropdown Menus',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Complete menubar with dropdown menus. Click or press ArrowDown to open menus. Use ArrowLeft/Right to navigate
        between menus. Press Escape to close.
      </div>
      <Menubar.Root>
        <Menubar.Nav
          aria-label='Application menu'
          className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
        >
          <Menubar.Menu>
            <Menubar.Trigger asChild>
              <Button variant='text' endIcon={ChevronDown}>
                File
              </Button>
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content>
                <Menubar.Item onSelect={() => console.log('New File')}>New File</Menubar.Item>
                <Menubar.Item onSelect={() => console.log('Open File')}>Open File</Menubar.Item>
                <Menubar.Separator />
                <Menubar.Item onSelect={() => console.log('Save')}>Save</Menubar.Item>
                <Menubar.Item onSelect={() => console.log('Save As')}>Save As...</Menubar.Item>
                <Menubar.Separator />
                <Menubar.Item onSelect={() => console.log('Exit')}>Exit</Menubar.Item>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>

          <Menubar.Menu>
            <Menubar.Trigger asChild>
              <Button variant='text' endIcon={ChevronDown}>
                Edit
              </Button>
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content>
                <Menubar.Item onSelect={() => console.log('Undo')}>Undo</Menubar.Item>
                <Menubar.Item onSelect={() => console.log('Redo')}>Redo</Menubar.Item>
                <Menubar.Separator />
                <Menubar.Item onSelect={() => console.log('Cut')}>Cut</Menubar.Item>
                <Menubar.Item onSelect={() => console.log('Copy')}>Copy</Menubar.Item>
                <Menubar.Item onSelect={() => console.log('Paste')}>Paste</Menubar.Item>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>

          <Menubar.Menu>
            <Menubar.Trigger asChild>
              <Button variant='text' endIcon={ChevronDown}>
                View
              </Button>
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content>
                <Menubar.Item onSelect={() => console.log('Zoom In')}>Zoom In</Menubar.Item>
                <Menubar.Item onSelect={() => console.log('Zoom Out')}>Zoom Out</Menubar.Item>
                <Menubar.Item onSelect={() => console.log('Reset Zoom')}>Reset Zoom</Menubar.Item>
                <Menubar.Separator />
                <Menubar.Item onSelect={() => console.log('Fullscreen')}>Fullscreen</Menubar.Item>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        </Menubar.Nav>
      </Menubar.Root>
    </div>
  ),
};

export const MenusWithLabels: Story = {
  name: 'Menus with Labels',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Dropdown menus can include labels to organize items into sections.
      </div>
      <Menubar.Root>
        <Menubar.Nav
          aria-label='File menu'
          className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
        >
          <Menubar.Menu>
            <Menubar.Trigger asChild>
              <Button variant='text' startIcon={File} endIcon={ChevronDown}>
                File
              </Button>
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content>
                <Menubar.Label>Create</Menubar.Label>
                <Menubar.Item onSelect={() => console.log('New File')}>New File</Menubar.Item>
                <Menubar.Item onSelect={() => console.log('New Folder')}>New Folder</Menubar.Item>
                <Menubar.Separator />
                <Menubar.Label>Recent Files</Menubar.Label>
                <Menubar.Item onSelect={() => console.log('Document.txt')}>Document.txt</Menubar.Item>
                <Menubar.Item onSelect={() => console.log('Report.pdf')}>Report.pdf</Menubar.Item>
                <Menubar.Separator />
                <Menubar.Label>Actions</Menubar.Label>
                <Menubar.Item onSelect={() => console.log('Save All')}>Save All</Menubar.Item>
                <Menubar.Item onSelect={() => console.log('Close All')}>Close All</Menubar.Item>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        </Menubar.Nav>
      </Menubar.Root>
    </div>
  ),
};

export const MixedMenubarButtonsAndMenus: Story = {
  name: 'Mixed Buttons and Menus',
  render: () => {
    const [lastAction, setLastAction] = useState<string>('None');

    return (
      <div className='flex flex-col gap-y-3 p-4 items-center'>
        <div className='max-w-120 text-sm text-subtle'>
          Menubars can mix regular buttons and dropdown menus. Conditional hover: hovering a trigger while another menu
          is open automatically switches to that menu.
        </div>
        <div className='text-sm'>
          <span className='text-subtle'>Last action: </span>
          <span className='font-semibold'>{lastAction}</span>
        </div>
        <Menubar.Root>
          <Menubar.Nav
            aria-label='Mixed menu'
            className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
          >
            <Menubar.Menu>
              <Menubar.Trigger asChild>
                <Button variant='text' startIcon={File} endIcon={ChevronDown}>
                  File
                </Button>
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content>
                  <Menubar.Item onSelect={() => setLastAction('New File')}>New File</Menubar.Item>
                  <Menubar.Item onSelect={() => setLastAction('Open File')}>Open File</Menubar.Item>
                  <Menubar.Separator />
                  <Menubar.Item onSelect={() => setLastAction('Exit')}>Exit</Menubar.Item>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>

            <Menubar.Separator />

            <Menubar.Button onSelect={() => setLastAction('Save (button)')} asChild>
              <Button variant='text' startIcon={Save}>
                Save
              </Button>
            </Menubar.Button>

            <Menubar.Button onSelect={() => setLastAction('Print (button)')} asChild>
              <Button variant='text' startIcon={Printer}>
                Print
              </Button>
            </Menubar.Button>

            <Menubar.Separator />

            <Menubar.Menu>
              <Menubar.Trigger asChild>
                <Button variant='text' startIcon={Settings} endIcon={ChevronDown}>
                  Settings
                </Button>
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content>
                  <Menubar.Item onSelect={() => setLastAction('Preferences')}>Preferences</Menubar.Item>
                  <Menubar.Item onSelect={() => setLastAction('Keyboard Shortcuts')}>Keyboard Shortcuts</Menubar.Item>
                  <Menubar.Separator />
                  <Menubar.Item onSelect={() => setLastAction('About')}>About</Menubar.Item>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          </Menubar.Nav>
        </Menubar.Root>
      </div>
    );
  },
};
