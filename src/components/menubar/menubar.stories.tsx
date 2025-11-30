import type { Meta, StoryObj } from '@storybook/preact-vite';
import { ChevronDown, File, Folder, Globe, Printer, Save, Settings } from 'lucide-react';
import { useState } from 'preact/hooks';
import { Button } from '@/components/button';

import { Menubar } from './menubar';

type Story = StoryObj<typeof Menubar>;

export default {
  title: 'Components/Menubar',
  component: Menubar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Menubar>;

export const Basic: Story = {
  name: 'Examples / Basic',
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
  name: 'Examples / With Icons',
  render: () => (
    <div className='flex flex-col items-center gap-y-3 p-4'>
      <div className='max-w-120 text-sm text-subtle'>
        Menubar with icon buttons. Use ArrowLeft/ArrowRight to navigate, Enter/Space to activate.
      </div>
      <Menubar.Root>
        <Menubar.Nav
          aria-label='Application actions'
          className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
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
  name: 'Examples / With Separators',
  render: () => (
    <div className='flex flex-col items-center gap-y-3 p-4'>
      <div className='max-w-120 text-sm text-subtle'>
        Separators provide visual grouping between menubar items. They don’t participate in keyboard navigation.
      </div>
      <Menubar.Root>
        <Menubar.Nav
          aria-label='Actions with separators'
          className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
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

export const WithDropdownMenus: Story = {
  name: 'Examples / With Dropdown Menus',
  render: () => (
    <div className='flex flex-col items-center gap-y-3 p-4'>
      <div className='max-w-120 text-sm text-subtle'>
        Complete menubar with dropdown menus. Click or press ArrowDown to open menus. Use ArrowLeft/Right to navigate
        between menus. Press Escape to close.
      </div>
      <Menubar.Root>
        <Menubar.Nav
          aria-label='Application menu'
          className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
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

export const WithDisabledItems: Story = {
  name: 'States / Disabled Items',
  render: () => (
    <div className='flex flex-col items-center gap-y-3 p-4'>
      <div className='max-w-120 text-sm text-subtle'>
        Disabled items are skipped during keyboard navigation but remain visible and accessible to screen readers. Test
        ArrowLeft/Right, Home, and End keys.
      </div>
      <Menubar.Root>
        <Menubar.Nav aria-label='Actions' className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'>
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={File}>
              New
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild disabled>
            <Button className='bg-transparent' variant='text' startIcon={Folder}>
              Open
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild>
            <Button className='bg-transparent' variant='text' startIcon={Save}>
              Save
            </Button>
          </Menubar.Button>
          <Menubar.Button asChild disabled>
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

export const Interactive: Story = {
  name: 'Features / Interactive',
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
            className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
          >
            <Menubar.Button asChild onSelect={() => handleSelect('New File')}>
              <Button className='bg-transparent' variant='text' startIcon={File}>
                New
              </Button>
            </Menubar.Button>
            <Menubar.Button asChild onSelect={() => handleSelect('Save File')}>
              <Button className='bg-transparent' variant='text' startIcon={Save}>
                Save
              </Button>
            </Menubar.Button>
            <Menubar.Button asChild disabled onSelect={() => handleSelect('Print (should not trigger)')}>
              <Button className='bg-transparent' variant='text' startIcon={Printer}>
                Print
              </Button>
            </Menubar.Button>
            <Menubar.Button asChild onSelect={() => handleSelect('Settings')}>
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
  name: 'Features / Custom Styled',
  render: () => (
    <div className='flex flex-col items-center gap-y-3 p-4'>
      <div className='max-w-120 text-sm text-subtle'>
        Custom styling can be applied via className prop. This example shows a darker menubar with different button
        variants.
      </div>
      <Menubar.Root>
        <Menubar.Nav
          aria-label='Custom styled navigation'
          className='rounded-xl border border-bdr-strong bg-surface-primary shadow-md'
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

export const MenusWithLabels: Story = {
  name: 'Features / Menus with Labels',
  render: () => (
    <div className='flex flex-col items-center gap-y-3 p-4'>
      <div className='max-w-120 text-sm text-subtle'>
        Dropdown menus can include labels to organize items into sections.
      </div>
      <Menubar.Root>
        <Menubar.Nav
          aria-label='File menu'
          className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
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
  name: 'Features / Mixed Buttons and Menus',
  render: () => {
    const [lastAction, setLastAction] = useState<string>('None');

    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
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
            className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
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

export const FocusNavigation: Story = {
  name: 'Behavior / Focus Navigation',
  render: () => (
    <div className='flex flex-col items-center gap-y-3 p-4'>
      <div className='max-w-120 text-sm text-subtle'>
        Test keyboard navigation: Tab moves focus out of the menubar entirely to the next focusable element.
        ArrowLeft/Right navigate within the menubar. First item is auto-activated on focus.
      </div>
      <div className='flex flex-col gap-4'>
        <Button>Before Menubar</Button>
        <Menubar.Root>
          <Menubar.Nav
            aria-label='Navigation'
            className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
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
  name: 'Behavior / No Loop',
  render: () => (
    <div className='flex flex-col items-center gap-y-3 p-4'>
      <div className='max-w-120 text-sm text-subtle'>
        Arrow key navigation stops at first/last item instead of looping. Press ArrowLeft at the first item or
        ArrowRight at the last item to see the difference.
      </div>
      <Menubar.Root>
        <Menubar.Nav
          aria-label='Navigation'
          loop={false}
          className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
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

export const RadioItems: Story = {
  name: 'Radio / Basic',
  render: () => {
    const [textSize, setTextSize] = useState('medium');

    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
        <div className='max-w-120 text-sm text-subtle'>
          Radio items in menubar dropdowns allow single selection within a group. Note that selecting a radio item does
          NOT close the menu, allowing users to see their selection.
        </div>
        <div className='text-sm'>
          <span className='text-subtle'>Selected size: </span>
          <span className='font-semibold'>{textSize}</span>
        </div>
        <Menubar.Root>
          <Menubar.Nav
            aria-label='View settings'
            className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
          >
            <Menubar.Menu>
              <Menubar.Trigger asChild>
                <Button variant='text' endIcon={ChevronDown}>
                  Text Size
                </Button>
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content>
                  <Menubar.Label>Font Size</Menubar.Label>
                  <Menubar.RadioGroup value={textSize} onValueChange={setTextSize}>
                    <Menubar.RadioItem value='small'>
                      <Menubar.ItemIndicator />
                      Small
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='medium'>
                      <Menubar.ItemIndicator />
                      Medium
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='large'>
                      <Menubar.ItemIndicator />
                      Large
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='x-large'>
                      <Menubar.ItemIndicator />
                      Extra Large
                    </Menubar.RadioItem>
                  </Menubar.RadioGroup>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          </Menubar.Nav>
        </Menubar.Root>
      </div>
    );
  },
};

export const MultipleRadioGroupsInMenubar: Story = {
  name: 'Radio / Multiple Groups',
  render: () => {
    const [textSize, setTextSize] = useState('medium');
    const [theme, setTheme] = useState('light');

    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
        <div className='max-w-120 text-sm text-subtle'>
          Multiple radio groups in a menubar dropdown. Each group maintains its own selection state independently. Test
          keyboard navigation across groups.
        </div>
        <div className='flex flex-col gap-1 text-sm'>
          <div>
            <span className='text-subtle'>Text Size: </span>
            <span className='font-semibold'>{textSize}</span>
          </div>
          <div>
            <span className='text-subtle'>Theme: </span>
            <span className='font-semibold'>{theme}</span>
          </div>
        </div>
        <Menubar.Root>
          <Menubar.Nav
            aria-label='Preferences'
            className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
          >
            <Menubar.Menu>
              <Menubar.Trigger asChild>
                <Button variant='text' startIcon={Settings} endIcon={ChevronDown}>
                  Preferences
                </Button>
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content>
                  <Menubar.Label>Text Size</Menubar.Label>
                  <Menubar.RadioGroup value={textSize} onValueChange={setTextSize}>
                    <Menubar.RadioItem value='small'>
                      <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
                      Small
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='medium'>
                      <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
                      Medium
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='large'>
                      <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
                      Large
                    </Menubar.RadioItem>
                  </Menubar.RadioGroup>
                  <Menubar.Separator />
                  <Menubar.Label>Theme</Menubar.Label>
                  <Menubar.RadioGroup value={theme} onValueChange={setTheme}>
                    <Menubar.RadioItem value='light'>
                      <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
                      Light
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='dark'>
                      <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
                      Dark
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='auto'>
                      <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
                      System
                    </Menubar.RadioItem>
                  </Menubar.RadioGroup>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          </Menubar.Nav>
        </Menubar.Root>
      </div>
    );
  },
};

export const RadioWithRegularItemsInMenubar: Story = {
  name: 'Radio / Mixed with Items',
  render: () => {
    const [sortBy, setSortBy] = useState('name');

    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
        <div className='max-w-120 text-sm text-subtle'>
          Radio groups can be mixed with regular menu items and separators in menubar dropdowns for flexible
          composition.
        </div>
        <div className='text-sm'>
          <span className='text-subtle'>Sort by: </span>
          <span className='font-semibold'>{sortBy}</span>
        </div>
        <Menubar.Root>
          <Menubar.Nav
            aria-label='View menu'
            className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
          >
            <Menubar.Menu>
              <Menubar.Trigger asChild>
                <Button variant='text' endIcon={ChevronDown}>
                  View
                </Button>
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content>
                  <Menubar.Item>Refresh</Menubar.Item>
                  <Menubar.Item>Show Hidden Files</Menubar.Item>
                  <Menubar.Separator />
                  <Menubar.Label>Sort By</Menubar.Label>
                  <Menubar.RadioGroup value={sortBy} onValueChange={setSortBy}>
                    <Menubar.RadioItem value='name'>
                      <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
                      Name
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='date'>
                      <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
                      Date Modified
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='size'>
                      <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
                      Size
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='type'>
                      <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
                      Type
                    </Menubar.RadioItem>
                  </Menubar.RadioGroup>
                  <Menubar.Separator />
                  <Menubar.Item>Reset View</Menubar.Item>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          </Menubar.Nav>
        </Menubar.Root>
      </div>
    );
  },
};

export const CustomIndicatorsInMenubar: Story = {
  name: 'Radio / Custom Indicators',
  render: () => {
    const [priority, setPriority] = useState('medium');

    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
        <div className='max-w-120 text-sm text-subtle'>
          Indicators can be customized by passing children to <code>Menubar.ItemIndicator</code>. Use custom icons,
          characters, or any React element.
        </div>
        <div className='text-sm'>
          <span className='text-subtle'>Priority: </span>
          <span className='font-semibold'>{priority}</span>
        </div>
        <Menubar.Root>
          <Menubar.Nav
            aria-label='Task priority'
            className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
          >
            <Menubar.Menu>
              <Menubar.Trigger asChild>
                <Button variant='text' endIcon={ChevronDown}>
                  Set Priority
                </Button>
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content>
                  <Menubar.Label>Task Priority</Menubar.Label>
                  <Menubar.RadioGroup value={priority} onValueChange={setPriority}>
                    <Menubar.RadioItem value='low'>
                      <Menubar.ItemIndicator>▹</Menubar.ItemIndicator>
                      Low
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='medium'>
                      <Menubar.ItemIndicator>▸</Menubar.ItemIndicator>
                      Medium
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='high'>
                      <Menubar.ItemIndicator>▶</Menubar.ItemIndicator>
                      High
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='urgent'>
                      <Menubar.ItemIndicator>⚠</Menubar.ItemIndicator>
                      Urgent
                    </Menubar.RadioItem>
                  </Menubar.RadioGroup>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          </Menubar.Nav>
        </Menubar.Root>
      </div>
    );
  },
};

export const CloseOnSelectInMenubar: Story = {
  name: 'Radio / Close on Select',
  render: () => {
    const [region, setRegion] = useState('us');

    const regions = [
      { value: 'us', label: 'United States' },
      { value: 'eu', label: 'Europe' },
      { value: 'asia', label: 'Asia Pacific' },
      { value: 'latam', label: 'Latin America' },
    ];

    const selectedLabel = regions.find(r => r.value === region)?.label ?? 'Select Region';

    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
        <div className='max-w-120 text-sm text-subtle'>
          Use <code>closeOnSelect</code> prop on <code>Menubar.RadioGroup</code> to automatically close the menu after
          selecting a radio item. Focus returns to the menubar trigger for continued navigation.
        </div>
        <p className='font-semibold text-sm text-subtle'>Server Region: {selectedLabel}</p>
        <Menubar.Root>
          <Menubar.Nav
            aria-label='Server settings'
            className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
          >
            <Menubar.Menu>
              <Menubar.Trigger asChild>
                <Button variant='text' startIcon={Globe} endIcon={ChevronDown}>
                  Region
                </Button>
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content>
                  <Menubar.Label>Select Region</Menubar.Label>
                  <Menubar.RadioGroup value={region} onValueChange={setRegion} closeOnSelect>
                    {regions.map(reg => (
                      <Menubar.RadioItem key={reg.value} value={reg.value}>
                        <Menubar.ItemIndicator />
                        {reg.label}
                      </Menubar.RadioItem>
                    ))}
                  </Menubar.RadioGroup>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          </Menubar.Nav>
        </Menubar.Root>
      </div>
    );
  },
};

export const DisabledRadioItemsInMenubar: Story = {
  name: 'Radio / Disabled Items',
  render: () => {
    const [quality, setQuality] = useState('medium');

    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
        <div className='max-w-120 text-sm text-subtle'>
          Radio items in menubar dropdowns can be disabled individually. Disabled items are skipped during keyboard
          navigation and cannot be selected.
        </div>
        <div className='text-sm'>
          <span className='text-subtle'>Playback quality: </span>
          <span className='font-semibold'>{quality}</span>
        </div>
        <Menubar.Root>
          <Menubar.Nav
            aria-label='Playback settings'
            className='rounded-xl border border-bdr-subtle bg-surface-neutral shadow-sm'
          >
            <Menubar.Menu>
              <Menubar.Trigger asChild>
                <Button variant='text' startIcon={Settings} endIcon={ChevronDown}>
                  Quality
                </Button>
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content>
                  <Menubar.Label>Playback Quality</Menubar.Label>
                  <Menubar.RadioGroup value={quality} onValueChange={setQuality}>
                    <Menubar.RadioItem value='low'>
                      <Menubar.ItemIndicator />
                      Low (360p)
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='medium'>
                      <Menubar.ItemIndicator />
                      Medium (720p)
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='high' disabled>
                      <Menubar.ItemIndicator />
                      <span>High (1080p)</span>
                      <span className='ml-auto text-xs'>(Premium)</span>
                    </Menubar.RadioItem>
                    <Menubar.RadioItem value='ultra' disabled>
                      <Menubar.ItemIndicator />
                      <span>Ultra (4K)</span>
                      <span className='ml-auto text-xs'>(Premium)</span>
                    </Menubar.RadioItem>
                  </Menubar.RadioGroup>
                  <Menubar.Separator />
                  <Menubar.Item>Upgrade to Premium</Menubar.Item>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          </Menubar.Nav>
        </Menubar.Root>
      </div>
    );
  },
};
