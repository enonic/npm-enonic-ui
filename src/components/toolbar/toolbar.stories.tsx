import { Button } from '@/components/button';
import { IconButton } from '@/components/icon-button';
import { Menu } from '@/components/menu';
import { Toggle } from '@/components/toggle';
import { Tooltip } from '@/components/tooltip';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ClipboardPaste,
  Copy,
  Italic,
  MoreHorizontal,
  Redo,
  Save,
  Scissors,
  Search,
  Underline,
  Undo,
} from 'lucide-react';
import { useState } from 'react';

import { Toolbar } from './toolbar';

type Story = StoryObj<typeof Toolbar>;

export default {
  title: 'Components/Toolbar',
  component: Toolbar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Toolbar>;

//
// * Examples
//

export const Basic: Story = {
  name: 'Examples / Basic',
  render: () => (
    <Toolbar>
      <Toolbar.Container aria-label='Text editing'>
        <Toolbar.Item asChild>
          <IconButton variant='outline' size='sm' icon={Scissors} aria-label='Cut' />
        </Toolbar.Item>
        <Toolbar.Item asChild>
          <IconButton variant='outline' size='sm' icon={Copy} aria-label='Copy' />
        </Toolbar.Item>
        <Toolbar.Item asChild>
          <IconButton variant='outline' size='sm' icon={ClipboardPaste} aria-label='Paste' />
        </Toolbar.Item>
      </Toolbar.Container>
    </Toolbar>
  ),
};

export const BasicVertical: Story = {
  name: 'Examples / Basic Vertical',
  render: () => (
    <Toolbar orientation='vertical'>
      <Toolbar.Container aria-label='Actions'>
        <Toolbar.Item asChild>
          <IconButton variant='outline' size='sm' icon={Save} aria-label='Save' />
        </Toolbar.Item>
        <Toolbar.Item asChild>
          <IconButton variant='outline' size='sm' icon={Undo} aria-label='Undo' />
        </Toolbar.Item>
        <Toolbar.Item asChild>
          <IconButton variant='outline' size='sm' icon={Redo} aria-label='Redo' />
        </Toolbar.Item>
      </Toolbar.Container>
    </Toolbar>
  ),
};

export const WithSeparators: Story = {
  name: 'Examples / With Separators',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Separators provide visual grouping between toolbar items. They don&apos;t participate in keyboard navigation.
      </div>
      <Toolbar>
        <Toolbar.Container
          aria-label='Document actions'
          className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
        >
          <Toolbar.Item asChild>
            <IconButton variant='outline' size='sm' icon={Save} aria-label='Save' />
          </Toolbar.Item>
          <Toolbar.Separator />
          <Toolbar.Item asChild>
            <IconButton variant='outline' size='sm' icon={Scissors} aria-label='Cut' />
          </Toolbar.Item>
          <Toolbar.Item asChild>
            <IconButton variant='outline' size='sm' icon={Copy} aria-label='Copy' />
          </Toolbar.Item>
          <Toolbar.Item asChild>
            <IconButton variant='outline' size='sm' icon={ClipboardPaste} aria-label='Paste' />
          </Toolbar.Item>
          <Toolbar.Separator />
          <Toolbar.Item asChild>
            <IconButton variant='outline' size='sm' icon={Undo} aria-label='Undo' />
          </Toolbar.Item>
          <Toolbar.Item asChild>
            <IconButton variant='outline' size='sm' icon={Redo} aria-label='Redo' />
          </Toolbar.Item>
        </Toolbar.Container>
      </Toolbar>
    </div>
  ),
};

export const ComplexComposition: Story = {
  name: 'Examples / Complex Composition',
  render: () => {
    const [formatting, setFormatting] = useState<string[]>([]);
    const [textSize, setTextSize] = useState('medium');

    return (
      <div className='flex flex-col gap-y-3 p-4 items-center'>
        <div className='max-w-120 text-sm text-subtle'>
          Complex toolbar mixing buttons, Toggle component, ToggleGroup, and dropdown menu with radio items.
        </div>
        <Toolbar>
          <Toolbar.Container
            aria-label='Text editing toolbar'
            className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
          >
            <Toolbar.Item asChild>
              <Button variant='outline' size='sm'>
                Back
              </Button>
            </Toolbar.Item>
            <Toolbar.Separator />
            <Toolbar.Item asChild>
              <Toggle startIcon={Bold} aria-label='Toggle bold' />
            </Toolbar.Item>
            <Toolbar.Separator />
            <Toolbar.ToggleGroup type='multiple' value={formatting} onValueChange={setFormatting}>
              <Toolbar.Item asChild>
                <Toolbar.ToggleItem value='italic' aria-label='Italic'>
                  <Italic className='size-4' />
                </Toolbar.ToggleItem>
              </Toolbar.Item>
              <Toolbar.Item asChild>
                <Toolbar.ToggleItem value='underline' aria-label='Underline'>
                  <Underline className='size-4' />
                </Toolbar.ToggleItem>
              </Toolbar.Item>
            </Toolbar.ToggleGroup>
            <Toolbar.Separator />
            <Menu.Root>
              <Toolbar.Item asChild>
                <Menu.Trigger asChild>
                  <IconButton variant='outline' size='sm' icon={ChevronDown} aria-label='Text size options' />
                </Menu.Trigger>
              </Toolbar.Item>
              <Menu.Portal>
                <Menu.Content>
                  <Menu.Label>Text Size</Menu.Label>
                  <Menu.RadioGroup value={textSize} onValueChange={setTextSize}>
                    <Menu.RadioItem value='small'>
                      <Menu.ItemIndicator>•</Menu.ItemIndicator>
                      Small
                    </Menu.RadioItem>
                    <Menu.RadioItem value='medium'>
                      <Menu.ItemIndicator>•</Menu.ItemIndicator>
                      Medium
                    </Menu.RadioItem>
                    <Menu.RadioItem value='large'>
                      <Menu.ItemIndicator>•</Menu.ItemIndicator>
                      Large
                    </Menu.RadioItem>
                  </Menu.RadioGroup>
                </Menu.Content>
              </Menu.Portal>
            </Menu.Root>
          </Toolbar.Container>
        </Toolbar>
      </div>
    );
  },
};

//
// * States
//

export const DisabledItems: Story = {
  name: 'States / Disabled Items',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-120 text-sm text-subtle'>
        Disabled items are skipped during keyboard navigation but remain visible and accessible to screen readers.
      </div>
      <Toolbar>
        <Toolbar.Container
          aria-label='Actions'
          className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
        >
          <Toolbar.Item asChild>
            <IconButton variant='outline' size='sm' icon={Scissors} aria-label='Cut' />
          </Toolbar.Item>
          <Toolbar.Item asChild disabled>
            <IconButton variant='outline' size='sm' icon={Copy} aria-label='Copy' />
          </Toolbar.Item>
          <Toolbar.Item asChild>
            <IconButton variant='outline' size='sm' icon={ClipboardPaste} aria-label='Paste' />
          </Toolbar.Item>
          <Toolbar.Item asChild disabled>
            <IconButton variant='outline' size='sm' icon={Save} aria-label='Save' />
          </Toolbar.Item>
        </Toolbar.Container>
      </Toolbar>
    </div>
  ),
};

//
// * Features
//

export const ToggleGroupSingle: Story = {
  name: 'Features / Toggle Group Single',
  render: () => {
    const [align, setAlign] = useState<string>('left');

    return (
      <div className='flex flex-col gap-y-3 p-4 items-center'>
        <div className='max-w-120 text-sm text-subtle'>
          Single selection toggle group allows only one item to be selected at a time.
        </div>
        <Toolbar>
          <Toolbar.Container
            aria-label='Text alignment'
            className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
          >
            <Toolbar.ToggleGroup type='single' value={align} onValueChange={setAlign}>
              <Toolbar.ToggleItem value='left' aria-label='Align left'>
                <AlignLeft className='size-4' />
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem value='center' aria-label='Align center'>
                <AlignCenter className='size-4' />
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem value='right' aria-label='Align right'>
                <AlignRight className='size-4' />
              </Toolbar.ToggleItem>
            </Toolbar.ToggleGroup>
          </Toolbar.Container>
        </Toolbar>
      </div>
    );
  },
};

export const ToggleGroupMixed: Story = {
  name: 'Features / Toggle Group Mixed',
  render: () => {
    const [align, setAlign] = useState<string>('left');
    const [formatting, setFormatting] = useState<string[]>([]);

    return (
      <div className='flex flex-col gap-y-3 p-4 items-center'>
        <div className='max-w-120 text-sm text-subtle'>
          Mix of single and multiple selection toggle groups in one toolbar. Test keyboard navigation between groups.
        </div>
        <Toolbar>
          <Toolbar.Container
            aria-label='Text formatting'
            className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
          >
            <Toolbar.ToggleGroup type='multiple' value={formatting} onValueChange={setFormatting}>
              <Toolbar.ToggleItem value='bold' aria-label='Bold'>
                <Bold className='size-4' />
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem value='italic' aria-label='Italic'>
                <Italic className='size-4' />
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem value='underline' aria-label='Underline'>
                <Underline className='size-4' />
              </Toolbar.ToggleItem>
            </Toolbar.ToggleGroup>
            <Toolbar.Separator />
            <Toolbar.ToggleGroup type='single' value={align} onValueChange={setAlign}>
              <Toolbar.ToggleItem value='left' aria-label='Align left'>
                <AlignLeft className='size-4' />
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem value='center' aria-label='Align center'>
                <AlignCenter className='size-4' />
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem value='right' aria-label='Align right'>
                <AlignRight className='size-4' />
              </Toolbar.ToggleItem>
            </Toolbar.ToggleGroup>
          </Toolbar.Container>
        </Toolbar>
      </div>
    );
  },
};

export const AllItemsWithTooltips: Story = {
  name: 'Features / All Items with Tooltips',
  render: () => {
    const [align, setAlign] = useState<string>('left');
    const [formatting, setFormatting] = useState<string[]>([]);

    // ! It's necessary to put Toolbar.Item inside Tooltip, otherwise the tooltip will not be triggered properly.

    return (
      <div className='flex flex-col gap-y-3 p-4 items-center'>
        <div className='max-w-120 text-sm text-subtle'>
          Complete toolbar demonstrating all item types with tooltips: buttons, Toggle, ToggleGroup, and Menu. Hover
          over items to see tooltips.
        </div>
        <Toolbar>
          <Toolbar.Container
            aria-label='Full toolbar'
            className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
          >
            <Tooltip value='Search' asChild>
              <Toolbar.Item asChild>
                <Toggle className='p-0 w-10' variant='filled' startIcon={Search} aria-label='Undo' />
              </Toolbar.Item>
            </Tooltip>
            <Toolbar.Separator />
            <Tooltip value='Undo action' asChild>
              <Toolbar.Item asChild>
                <IconButton variant='outline' size='sm' icon={Undo} aria-label='Undo' />
              </Toolbar.Item>
            </Tooltip>
            <Tooltip value='Redo action' asChild>
              <Toolbar.Item asChild>
                <IconButton variant='outline' size='sm' icon={Redo} aria-label='Redo' />
              </Toolbar.Item>
            </Tooltip>
            <Toolbar.Separator />
            <Tooltip value='Toggle search' asChild>
              <Toolbar.Item asChild>
                <Toggle startIcon={Bold} aria-label='Toggle bold' />
              </Toolbar.Item>
            </Tooltip>
            <Toolbar.Separator />
            <Toolbar.ToggleGroup type='multiple' value={formatting} onValueChange={setFormatting}>
              <Tooltip value='Italic' asChild>
                <Toolbar.ToggleItem value='italic' aria-label='Italic'>
                  <div>
                    <Italic className='size-4' />
                  </div>
                </Toolbar.ToggleItem>
              </Tooltip>
              <Tooltip value='Underline' asChild>
                <Toolbar.ToggleItem value='underline' aria-label='Underline'>
                  <div>
                    <Underline className='size-4' />
                  </div>
                </Toolbar.ToggleItem>
              </Tooltip>
            </Toolbar.ToggleGroup>
            <Toolbar.Separator />
            <Toolbar.ToggleGroup type='single' value={align} onValueChange={setAlign}>
              <Tooltip value='Align left' asChild>
                <Toolbar.ToggleItem value='left' aria-label='Align left'>
                  <div>
                    <AlignLeft className='size-4' />
                  </div>
                </Toolbar.ToggleItem>
              </Tooltip>
              <Tooltip value='Align center' asChild>
                <Toolbar.ToggleItem value='center' aria-label='Align center'>
                  <div>
                    <AlignCenter className='size-4' />
                  </div>
                </Toolbar.ToggleItem>
              </Tooltip>
              <Tooltip value='Align right' asChild>
                <Toolbar.ToggleItem value='right' aria-label='Align right'>
                  <div>
                    <AlignRight className='size-4' />
                  </div>
                </Toolbar.ToggleItem>
              </Tooltip>
            </Toolbar.ToggleGroup>
            <Toolbar.Separator />
            <Menu.Root>
              <Tooltip value='More options' asChild>
                <Toolbar.Item asChild>
                  <Menu.Trigger asChild>
                    <IconButton variant='solid' size='sm' icon={MoreHorizontal} aria-label='More options' />
                  </Menu.Trigger>
                </Toolbar.Item>
              </Tooltip>
              <Menu.Portal>
                <Menu.Content align='end'>
                  <Menu.Item onSelect={() => console.log('Save')}>Save</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item onSelect={() => console.log('Option 1')}>Option 1</Menu.Item>
                  <Menu.Item onSelect={() => console.log('Option 2')}>Option 2</Menu.Item>
                </Menu.Content>
              </Menu.Portal>
            </Menu.Root>
          </Toolbar.Container>
        </Toolbar>
      </div>
    );
  },
};

//
// * Behavior
//

export const NoLoop: Story = {
  name: 'Behavior / No Loop',
  render: () => (
    <div className='flex flex-col gap-y-3 p-4 items-center'>
      <div className='max-w-80 text-sm text-subtle'>
        With <code className='px-1.5 py-0.5 text-xs font-mono bg-surface-neutral rounded'>loop=false</code>, arrow key
        navigation stops at first/last items. Press <kbd>←</kbd> or <kbd>→</kbd> to test.
      </div>
      <Toolbar loop={false}>
        <Toolbar.Container
          aria-label='No loop demo'
          className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
        >
          <Toolbar.Item asChild>
            <IconButton variant='outline' size='sm' icon={Scissors} aria-label='First (stops here)' />
          </Toolbar.Item>
          <Toolbar.Item asChild>
            <IconButton variant='outline' size='sm' icon={Copy} aria-label='Middle' />
          </Toolbar.Item>
          <Toolbar.Item asChild>
            <IconButton variant='outline' size='sm' icon={ClipboardPaste} aria-label='Last (stops here)' />
          </Toolbar.Item>
        </Toolbar.Container>
      </Toolbar>
    </div>
  ),
};

export const DynamicDisableStates: Story = {
  name: 'Behavior / Dynamic Disable States',
  render: () => {
    const [disableMode, setDisableMode] = useState<string>('all-enabled');

    return (
      <div className='flex flex-col gap-y-3 p-4 items-center'>
        <div className='max-w-120 text-sm text-subtle'>
          Test keyboard navigation with dynamically changing disabled states. Toggle between modes to see how focus and
          navigation adapt. Press <kbd>←</kbd> or <kbd>→</kbd> to test keyboard navigation.
        </div>
        <Toolbar>
          <Toolbar.Container
            aria-label='Dynamic disable demo'
            className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm'
          >
            <Toolbar.Item asChild disabled={disableMode === 'all-disabled' || disableMode === 'some-disabled'}>
              <Button
                variant='outline'
                size='sm'
                disabled={disableMode === 'all-disabled' || disableMode === 'some-disabled'}
              >
                Action 1
              </Button>
            </Toolbar.Item>
            <Toolbar.Item asChild disabled={disableMode === 'all-disabled'}>
              <Button variant='outline' size='sm' disabled={disableMode === 'all-disabled'}>
                Action 2
              </Button>
            </Toolbar.Item>
            <Toolbar.Item asChild disabled={disableMode === 'all-disabled' || disableMode === 'some-disabled'}>
              <Button
                variant='outline'
                size='sm'
                disabled={disableMode === 'all-disabled' || disableMode === 'some-disabled'}
              >
                Action 3
              </Button>
            </Toolbar.Item>
            <Toolbar.Item asChild disabled={disableMode === 'all-disabled'}>
              <Button variant='outline' size='sm' disabled={disableMode === 'all-disabled'}>
                Action 4
              </Button>
            </Toolbar.Item>
            <Toolbar.Item asChild disabled={disableMode === 'all-disabled' || disableMode === 'some-disabled'}>
              <Button
                variant='outline'
                size='sm'
                disabled={disableMode === 'all-disabled' || disableMode === 'some-disabled'}
              >
                Action 5
              </Button>
            </Toolbar.Item>
          </Toolbar.Container>
        </Toolbar>
        <div className='mt-4 flex flex-col gap-y-2 items-center'>
          <div className='text-sm font-semibold'>Disable Mode</div>
          <Toolbar>
            <Toolbar.Container
              aria-label='Disable mode selector'
              className='bg-surface-neutral border border-bdr-subtle rounded-xl shadow-sm p-2'
            >
              <Toolbar.ToggleGroup
                type='single'
                className='gap-0 p-0 [&>*:focus-visible]:z-10'
                value={disableMode}
                onValueChange={setDisableMode}
              >
                <Toolbar.ToggleItem
                  value='some-disabled'
                  label='Some disabled'
                  size='sm'
                  className='h-8 text-xs rounded-r-none'
                />
                <Toolbar.ToggleItem
                  value='all-enabled'
                  label='All enabled'
                  size='sm'
                  className='h-8 text-xs rounded-none'
                />
                <Toolbar.ToggleItem
                  value='all-disabled'
                  label='All disabled'
                  size='sm'
                  className='h-8 text-xs rounded-l-none'
                />
              </Toolbar.ToggleGroup>
            </Toolbar.Container>
          </Toolbar>
        </div>
      </div>
    );
  },
};
