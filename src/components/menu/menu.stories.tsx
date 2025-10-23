import { Button, IconButton } from '@/components';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import {
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  File,
  FileText,
  Folder,
  Image,
  Link,
  Menu as MenuIcon,
  RefreshCwOff,
  Save,
  Share2,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'preact/hooks';

import { Menu } from './menu';

type Story = StoryObj<typeof Menu>;

export default {
  title: 'Components/Menu',
  component: Menu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Menu>;

export const Basic: Story = {
  name: 'Basic',
  render: () => (
    <Menu>
      <Menu.Trigger asChild>
        <IconButton icon={MenuIcon} iconStrokeWidth={2} size='lg' variant='solid' aria-label='Open menu' />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content>
          <Menu.Item>New File</Menu.Item>
          <Menu.Item>Open</Menu.Item>
          <Menu.Separator />
          <Menu.Item>Save</Menu.Item>
          <Menu.Item>Save As...</Menu.Item>
          <Menu.Separator />
          <Menu.Item>Exit</Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu>
  ),
};

export const DefaultTrigger: Story = {
  name: 'Default Trigger',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Menu.Trigger without <code>asChild</code> renders a fallback button element
      </div>
      <Menu>
        <Menu.Trigger className='p-2 rounded-sm cursor-pointer hover:bg-surface-primary-hover'>Open Menu</Menu.Trigger>
        <Menu.Portal>
          <Menu.Content>
            <Menu.Item>Action 1</Menu.Item>
            <Menu.Item>Action 2</Menu.Item>
            <Menu.Item>Action 3</Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu>
    </div>
  ),
};

export const FocusNavigation: Story = {
  name: 'Focus Navigation',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-80 text-sm text-subtle'>
        Test keyboard navigation: Tab should move close menu and focus back to the trigger button
      </div>
      <div className='flex gap-4'>
        <Button>Before</Button>
        <Menu>
          <Menu.Trigger asChild>
            <Button variant='solid'>Open Menu</Button>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Content>
              <Menu.Item>Copy</Menu.Item>
              <Menu.Item>Paste</Menu.Item>
              <Menu.Item>Cut</Menu.Item>
              <Menu.Separator />
              <Menu.Item>Delete</Menu.Item>
            </Menu.Content>
          </Menu.Portal>
        </Menu>
        <Button>After</Button>
      </div>
    </div>
  ),
};

export const WithSections: Story = {
  name: 'With Sections',
  render: () => (
    <Menu>
      <Menu.Trigger asChild>
        <Button variant='outline'>File Menu</Button>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content>
          <Menu.Label>New</Menu.Label>
          <Menu.Item>
            <FileText className='w-4 h-4' />
            <span>Text Document</span>
          </Menu.Item>
          <Menu.Item>
            <Folder className='w-4 h-4' />
            <span>Folder</span>
          </Menu.Item>
          <Menu.Item>
            <Image className='w-4 h-4' />
            <span>Image</span>
          </Menu.Item>
          <Menu.Separator />
          <Menu.Label>Actions</Menu.Label>
          <Menu.Item>
            <Upload className='w-4 h-4' />
            <span>Upload</span>
          </Menu.Item>
          <Menu.Item>
            <Download className='w-4 h-4' />
            <span>Download</span>
          </Menu.Item>
          <Menu.Separator />
          <Menu.Label>Edit</Menu.Label>
          <Menu.Item>
            <Copy className='w-4 h-4' />
            <span>Copy</span>
          </Menu.Item>
          <Menu.Item>
            <Link className='w-4 h-4' />
            <span>Copy Link</span>
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item className='text-error data-[active=true]:not-dark:text-error-rev'>
            <Trash2 className='w-4 h-4' />
            <span>Delete</span>
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu>
  ),
};

export const WithDisabledItems: Story = {
  name: 'Disabled Items',
  render: () => (
    <div className='flex flex-col gap-y-6 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Disabled items are skipped during keyboard navigation but remain visible and accessible to screen readers. Test
        arrow keys, Home, and End.
      </div>
      <div className='flex gap-6 flex-wrap justify-center'>
        {/* Menu 1: Disabled in middle */}
        <div className='flex flex-col gap-2 items-center'>
          <div className='text-xs text-subtle'>Middle disabled</div>
          <Menu>
            <Menu.Trigger asChild>
              <Button endIcon={ChevronDown} iconStrokeWidth={2} variant='outline'>
                Menu 1
              </Button>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Content>
                <Menu.Item>
                  <File className='w-4 h-4' />
                  <span>New Document</span>
                </Menu.Item>
                <Menu.Item>
                  <Folder className='w-4 h-4' />
                  <span>Open Folder</span>
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item disabled>
                  <Share2 className='w-4 h-4' />
                  <span>Share (unavailable)</span>
                </Menu.Item>
                <Menu.Item disabled>
                  <Download className='w-4 h-4' />
                  <span>Download (processing...)</span>
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item>
                  <Upload className='w-4 h-4' />
                  <span>Upload</span>
                </Menu.Item>
                <Menu.Item>
                  <Save className='w-4 h-4' />
                  <span>Save</span>
                </Menu.Item>
              </Menu.Content>
            </Menu.Portal>
          </Menu>
        </div>

        {/* Menu 2: First and last disabled */}
        <div className='flex flex-col gap-2 items-center'>
          <div className='text-xs text-subtle'>First & last disabled</div>
          <Menu>
            <Menu.Trigger asChild>
              <Button endIcon={ChevronDown} iconStrokeWidth={2} variant='outline'>
                Menu 2
              </Button>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Content>
                <Menu.Item disabled>
                  <File className='w-4 h-4' />
                  <span>New (disabled)</span>
                </Menu.Item>
                <Menu.Item disabled>
                  <Folder className='w-4 h-4' />
                  <span>Open (disabled)</span>
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item>
                  <Share2 className='w-4 h-4' />
                  <span>Share</span>
                </Menu.Item>
                <Menu.Item>
                  <Download className='w-4 h-4' />
                  <span>Download</span>
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item disabled>
                  <Upload className='w-4 h-4' />
                  <span>Upload (disabled)</span>
                </Menu.Item>
                <Menu.Item disabled>
                  <Save className='w-4 h-4' />
                  <span>Save (disabled)</span>
                </Menu.Item>
              </Menu.Content>
            </Menu.Portal>
          </Menu>
        </div>

        {/* Menu 3: All disabled */}
        <div className='flex flex-col gap-2 items-center'>
          <div className='text-xs text-subtle'>All disabled</div>
          <Menu>
            <Menu.Trigger asChild>
              <Button endIcon={ChevronDown} iconStrokeWidth={2} variant='outline'>
                Menu 3
              </Button>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Content>
                <Menu.Item disabled>
                  <File className='w-4 h-4' />
                  <span>New (disabled)</span>
                </Menu.Item>
                <Menu.Item disabled>
                  <Folder className='w-4 h-4' />
                  <span>Open (disabled)</span>
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item disabled>
                  <Share2 className='w-4 h-4' />
                  <span>Share (disabled)</span>
                </Menu.Item>
                <Menu.Item disabled>
                  <Download className='w-4 h-4' />
                  <span>Download (disabled)</span>
                </Menu.Item>
              </Menu.Content>
            </Menu.Portal>
          </Menu>
        </div>
      </div>
    </div>
  ),
};

export const AlignEnd: Story = {
  name: 'Align End',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-end'>
      <div className='text-sm text-subtle'>Menu aligned to the right edge of the trigger button</div>
      <Menu>
        <Menu.Trigger asChild>
          <Button variant='filled' endIcon={ChevronDown}>
            User Menu
          </Button>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content align='end'>
            <Menu.Item>Profile</Menu.Item>
            <Menu.Item>Settings</Menu.Item>
            <Menu.Item>Preferences</Menu.Item>
            <Menu.Separator />
            <Menu.Item>Sign Out</Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu>
    </div>
  ),
};

export const NoLoop: Story = {
  name: 'No Loop',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='text-sm text-subtle'>Arrow key navigation stops at first/last item instead of looping</div>
      <Menu>
        <Menu.Trigger asChild>
          <IconButton icon={RefreshCwOff} iconStrokeWidth={2} variant='filled' aria-label='Open no-loop menu' />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content loop={false}>
            <Menu.Item>First Item</Menu.Item>
            <Menu.Item>Second Item</Menu.Item>
            <Menu.Item>Third Item</Menu.Item>
            <Menu.Item>Fourth Item</Menu.Item>
            <Menu.Item>Last Item</Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu>
    </div>
  ),
};

export const AsChild: Story = {
  name: 'AsChild Pattern',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Menu.Item with <code>asChild</code> allows rendering custom elements like links or buttons while maintaining
        menu behavior
      </div>
      <Menu>
        <Menu.Trigger asChild>
          <Button variant='outline'>Navigation Menu</Button>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content>
            <Menu.Item asChild>
              <a href='https://enonic.com' target='_blank' rel='noreferrer' className='no-underline'>
                <span>Enonic.com</span>
                <ExternalLink className='w-3 h-3 ml-auto' />
              </a>
            </Menu.Item>
            <Menu.Item asChild>
              <a href='https://example.com' target='_blank' rel='noreferrer' className='no-underline'>
                <span>example.com</span>
                <ExternalLink className='w-3 h-3 ml-auto' />
              </a>
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu>
    </div>
  ),
};

export const Interactive: Story = {
  name: 'Interactive',
  render: () => {
    const [lastAction, setLastAction] = useState<string>('None');
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (action: string): void => {
      setLastAction(action);
    };

    return (
      <div className='flex flex-col gap-y-3 p-4'>
        <div className='text-sm'>
          <span className='text-subtle'>Menu state: </span>
          <span className='font-semibold'>{isOpen ? 'Open' : 'Closed'}</span>
        </div>
        <div className='text-sm'>
          <span className='text-subtle'>Last action: </span>
          <span className='font-semibold'>{lastAction}</span>
        </div>

        <Menu open={isOpen} onOpenChange={setIsOpen}>
          <Menu.Trigger asChild>
            <Button variant='outline'>Interactive Menu</Button>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Content>
              <Menu.Item onSelect={() => handleSelect('New')}>New</Menu.Item>
              <Menu.Item onSelect={() => handleSelect('Open')}>Open</Menu.Item>
              <Menu.Item onSelect={() => handleSelect('Save')}>Save</Menu.Item>
              <Menu.Separator />
              <Menu.Item disabled onSelect={() => handleSelect('Export')}>
                Export (disabled)
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item
                onSelect={e => {
                  e.preventDefault();
                  setLastAction('Delete (menu stayed open)');
                }}
              >
                <Trash2 className='w-4 h-4 text-red-600' />
                <span className='text-red-600'>Delete (stay open)</span>
              </Menu.Item>
            </Menu.Content>
          </Menu.Portal>
        </Menu>
      </div>
    );
  },
};
