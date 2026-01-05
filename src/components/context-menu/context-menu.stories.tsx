import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Copy, Download, ExternalLink, File, FileText, Folder, Link, Scissors, Trash2 } from 'lucide-react';
import { useState } from 'preact/hooks';
import { Button } from '@/components/button';

import { ContextMenu } from './context-menu';

type Story = StoryObj<typeof ContextMenu>;

export default {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ContextMenu>;

//
// * Examples
//

export const Basic: Story = {
  name: 'Examples / Basic',
  render: () => (
    <ContextMenu>
      <ContextMenu.Trigger className='flex h-40 w-80 items-center justify-center rounded-md border-2 border-bdr-subtle border-dashed bg-surface-neutral-hover'>
        <span className='cursor-default text-subtle'>Right click here</span>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content>
          <ContextMenu.Item>
            <Scissors className='size-4' />
            <span>Cut</span>
          </ContextMenu.Item>
          <ContextMenu.Item>
            <Copy className='size-4' />
            <span>Copy</span>
          </ContextMenu.Item>
          <ContextMenu.Item>
            <Link className='size-4' />
            <span>Copy Link</span>
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item>
            <Download className='size-4' />
            <span>Download</span>
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item className='text-error data-[active=true]:not-dark:text-error-rev'>
            <Trash2 className='size-4' />
            <span>Delete</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu>
  ),
};

export const WithSections: Story = {
  name: 'Examples / With Sections',
  render: () => (
    <ContextMenu>
      <ContextMenu.Trigger className='flex h-40 w-80 items-center justify-center rounded-md border-2 border-bdr-subtle border-dashed bg-surface-neutral-hover'>
        <span className='cursor-default text-subtle'>Right click for file options</span>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content>
          <ContextMenu.Label>New</ContextMenu.Label>
          <ContextMenu.Item>
            <FileText className='size-4' />
            <span>Text Document</span>
          </ContextMenu.Item>
          <ContextMenu.Item>
            <Folder className='size-4' />
            <span>Folder</span>
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Label>Actions</ContextMenu.Label>
          <ContextMenu.Item>
            <Copy className='size-4' />
            <span>Copy</span>
          </ContextMenu.Item>
          <ContextMenu.Item>
            <Download className='size-4' />
            <span>Download</span>
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item className='text-error data-[active=true]:not-dark:text-error-rev'>
            <Trash2 className='size-4' />
            <span>Delete</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu>
  ),
};

//
// * States
//

export const WithDisabledItems: Story = {
  name: 'States / Disabled Items',
  render: () => (
    <div className='flex flex-col items-center gap-y-6 p-4'>
      <div className='max-w-120 text-sm text-subtle'>
        Disabled items are skipped during keyboard navigation but remain visible and accessible to screen readers.
      </div>
      <ContextMenu>
        <ContextMenu.Trigger className='flex h-40 w-80 items-center justify-center rounded-md border-2 border-bdr-subtle border-dashed bg-surface-neutral-hover'>
          <span className='cursor-default text-subtle'>Right click here</span>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content>
            <ContextMenu.Item>
              <File className='size-4' />
              <span>Open</span>
            </ContextMenu.Item>
            <ContextMenu.Item disabled>
              <Copy className='size-4' />
              <span>Copy (unavailable)</span>
            </ContextMenu.Item>
            <ContextMenu.Item disabled>
              <Scissors className='size-4' />
              <span>Cut (unavailable)</span>
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item>
              <Download className='size-4' />
              <span>Download</span>
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu>
    </div>
  ),
};

//
// * Features
//

export const AsChild: Story = {
  name: 'Features / AsChild Pattern',
  render: () => (
    <div className='flex flex-col items-center gap-y-3 p-4'>
      <div className='max-w-120 text-sm text-subtle'>
        ContextMenu.Item with <code>asChild</code> allows rendering custom elements like links while maintaining menu
        behavior
      </div>
      <ContextMenu>
        <ContextMenu.Trigger className='flex h-40 w-80 items-center justify-center rounded-md border-2 border-bdr-subtle border-dashed bg-surface-neutral-hover'>
          <span className='cursor-default text-subtle'>Right click for links</span>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content>
            <ContextMenu.Item asChild>
              <a href='https://enonic.com' target='_blank' rel='noreferrer' className='no-underline'>
                <span>Enonic.com</span>
                <ExternalLink className='ml-auto size-3' />
              </a>
            </ContextMenu.Item>
            <ContextMenu.Item asChild>
              <a href='https://example.com' target='_blank' rel='noreferrer' className='no-underline'>
                <span>Example.com</span>
                <ExternalLink className='ml-auto size-3' />
              </a>
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu>
    </div>
  ),
};

export const CustomTrigger: Story = {
  name: 'Features / Custom Trigger',
  render: () => (
    <div className='flex flex-col items-center gap-y-3 p-4'>
      <div className='max-w-120 text-sm text-subtle'>
        ContextMenu.Trigger with <code>asChild</code> can wrap any element. Right-click the button below.
      </div>
      <ContextMenu>
        <ContextMenu.Trigger asChild>
          <Button variant='outline'>Right-click me</Button>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content>
            <ContextMenu.Item>Action 1</ContextMenu.Item>
            <ContextMenu.Item>Action 2</ContextMenu.Item>
            <ContextMenu.Item>Action 3</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu>
    </div>
  ),
};

export const Interactive: Story = {
  name: 'Features / Interactive',
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

        <ContextMenu open={isOpen} onOpenChange={setIsOpen}>
          <ContextMenu.Trigger className='flex h-40 w-80 items-center justify-center rounded-md border-2 border-bdr-subtle border-dashed bg-surface-neutral-hover'>
            <span className='cursor-default text-subtle'>Right click here</span>
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content>
              <ContextMenu.Item onSelect={() => handleSelect('Cut')}>Cut</ContextMenu.Item>
              <ContextMenu.Item onSelect={() => handleSelect('Copy')}>Copy</ContextMenu.Item>
              <ContextMenu.Item onSelect={() => handleSelect('Paste')}>Paste</ContextMenu.Item>
              <ContextMenu.Separator />
              <ContextMenu.Item disabled onSelect={() => handleSelect('Export')}>
                Export (disabled)
              </ContextMenu.Item>
              <ContextMenu.Separator />
              <ContextMenu.Item
                onSelect={e => {
                  e.preventDefault();
                  setLastAction('Delete (menu stayed open)');
                }}
              >
                <Trash2 className='size-4 text-red-600' />
                <span className='text-red-600'>Delete (stay open)</span>
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu>
      </div>
    );
  },
};

export const RadioItems: Story = {
  name: 'Features / Radio Items',
  render: () => {
    const [viewMode, setViewMode] = useState('grid');

    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
        <div className='max-w-120 text-sm text-subtle'>
          Radio items allow single selection within a group.
          <br />
          Selecting a radio item does NOT close the menu by default.
        </div>
        <div className='text-sm'>
          <span className='text-subtle'>View mode: </span>
          <span className='font-semibold'>{viewMode}</span>
        </div>
        <ContextMenu>
          <ContextMenu.Trigger className='flex h-40 w-80 items-center justify-center rounded-md border-2 border-bdr-subtle border-dashed bg-surface-neutral-hover'>
            <span className='cursor-default text-subtle'>Right click to select view</span>
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content>
              <ContextMenu.Label>View Mode</ContextMenu.Label>
              <ContextMenu.RadioGroup value={viewMode} onValueChange={setViewMode}>
                <ContextMenu.RadioItem value='grid'>
                  <ContextMenu.ItemIndicator />
                  Grid View
                </ContextMenu.RadioItem>
                <ContextMenu.RadioItem value='list'>
                  <ContextMenu.ItemIndicator />
                  List View
                </ContextMenu.RadioItem>
                <ContextMenu.RadioItem value='compact'>
                  <ContextMenu.ItemIndicator />
                  Compact View
                </ContextMenu.RadioItem>
              </ContextMenu.RadioGroup>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu>
      </div>
    );
  },
};

export const CloseOnSelect: Story = {
  name: 'Features / Radio Close on Select',
  render: () => {
    const [sortBy, setSortBy] = useState('name');

    const options = [
      { value: 'name', label: 'Name' },
      { value: 'date', label: 'Date Modified' },
      { value: 'size', label: 'Size' },
      { value: 'type', label: 'Type' },
    ];

    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
        <div className='max-w-120 text-sm text-subtle'>
          Use <code>closeOnSelect</code> prop on <code>ContextMenu.RadioGroup</code> to automatically close the menu
          after selecting a radio item.
        </div>
        <div className='text-sm'>
          <span className='text-subtle'>Sort by: </span>
          <span className='font-semibold'>{options.find(o => o.value === sortBy)?.label}</span>
        </div>
        <ContextMenu>
          <ContextMenu.Trigger className='flex h-40 w-80 items-center justify-center rounded-md border-2 border-bdr-subtle border-dashed bg-surface-neutral-hover'>
            <span className='cursor-default text-subtle'>Right click to sort</span>
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content>
              <ContextMenu.Label>Sort By</ContextMenu.Label>
              <ContextMenu.RadioGroup value={sortBy} onValueChange={setSortBy} closeOnSelect>
                {options.map(option => (
                  <ContextMenu.RadioItem key={option.value} value={option.value}>
                    <ContextMenu.ItemIndicator />
                    {option.label}
                  </ContextMenu.RadioItem>
                ))}
              </ContextMenu.RadioGroup>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu>
      </div>
    );
  },
};
