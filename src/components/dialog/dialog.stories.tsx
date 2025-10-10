import { Button } from '@/components/button';
import { Checkbox, type CheckboxChecked } from '@/components/checkbox';
import { Input } from '@/components/input';
import { SelectableListItem } from '@/components/selectable-list-item';
import { Separator } from '@/components/separator';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import {
  Archive,
  ArrowLeft,
  Calendar,
  Database,
  FileCog,
  FileImage,
  FileMusic,
  FileQuestionMark,
  FileSpreadsheet,
  FileTerminal,
  FileText,
  FileType,
  Film,
  Globe,
  ImageIcon,
  Presentation,
  Save,
  Shapes,
  SplinePointer,
  SquareArrowOutUpRight,
  SquareCode,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';

import { Dialog } from './dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const BasicControlled: Story = {
  name: 'Basic Controlled',
  render: () => {
    const [open, setOpen] = useState(false);

    const title = 'Simple Dialog';
    const description = 'This is a basic controlled dialog example. Click outside or press Escape to close.';

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open Dialog' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120'>
              <Dialog.DefaultHeader title={title} description={description} />
              <Dialog.Footer>
                <Button variant='outline' onClick={() => setOpen(false)} label='Cancel' />
                <Button variant='solid' onClick={() => setOpen(false)} label='Confirm' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const WithTrigger: Story = {
  name: 'With Trigger',
  render: () => {
    const [open, setOpen] = useState(false);

    const title = 'Triggered Dialog';
    const description = 'This dialog uses Dialog.Trigger component to open automatically.';

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <Button variant='solid' label='Open with Trigger' />
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className='w-120'>
            <Dialog.DefaultHeader title={title} description={description} />
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant='outline' label='Close' />
              </Dialog.Close>
              <Button variant='solid' onClick={() => setOpen(false)} label='Done' />
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    );
  },
};

export const WithCustomHeader: Story = {
  name: 'With Custom Header',
  render: () => {
    const [open, setOpen] = useState(false);

    const handleBack = (): void => {
      console.log('Back button clicked');
    };

    return (
      <div className='space-y-4'>
        <Button variant='outline' onClick={() => setOpen(true)} label='Open Dialog with Custom Header' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120'>
              <Dialog.Header>
                <div className='flex items-center justify-between gap-2.5'>
                  <Dialog.Title className='flex items-center gap-2'>
                    <Button
                      variant='text'
                      startIcon={ArrowLeft}
                      onClick={handleBack}
                      label='Back'
                      className='p-0 h-auto'
                    />
                  </Dialog.Title>
                  <Dialog.DefaultClose />
                </div>
                <Dialog.Description asChild>
                  <h2 className='text-lg font-semibold'>Custom Layout Example</h2>
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Body>
                <p className='text-subtle'>
                  This demonstrates a fully custom header layout with a Back button in the title area and an h2 element
                  in the description slot.
                </p>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='outline' onClick={() => setOpen(false)} label='Cancel' />
                <Button variant='solid' onClick={() => setOpen(false)} label='Continue' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const ArchiveDialog: Story = {
  name: 'Archive Items',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className='space-y-4'>
        <Button variant='outline' onClick={() => setOpen(true)} label='Open Archive Dialog' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='h-150'>
              <Dialog.DefaultHeader title='Archive Items' description={'You are about to archive 16 items'}>
                <SelectableListItem
                  className='place-self-stretch'
                  label='Accounts.SQL'
                  icon={<Database />}
                  defaultChecked
                >
                  <p className='text-success'>Online</p>
                </SelectableListItem>
              </Dialog.DefaultHeader>
              <Separator label='Other items that will be archived' />
              <Dialog.Body className='space-y-1'>
                <SelectableListItem label='Image.jpg' icon={<ImageIcon />} defaultChecked>
                  <p className='text-success'>Online</p>
                </SelectableListItem>
                <SelectableListItem label='Vector.svg' icon={<SplinePointer />} selected>
                  <p>Moved</p>
                </SelectableListItem>
                <SelectableListItem label='Report.docx' icon={<FileText />} selected defaultChecked>
                  <p>Modified</p>
                </SelectableListItem>
                <SelectableListItem label='Backup.zip' icon={<Archive />}>
                  <p>Unpublished</p>
                </SelectableListItem>
                <SelectableListItem label='Screenshot.png' icon={<FileImage />} defaultChecked>
                  <p>New</p>
                </SelectableListItem>
                <SelectableListItem label='Design.ai' icon={<Shapes />} selected>
                  <p>Modified</p>
                </SelectableListItem>
                <SelectableListItem label='Data.csv' icon={<Database />} defaultChecked>
                  <p className='text-success'>Online</p>
                </SelectableListItem>
                <SelectableListItem label='Video.mp4' icon={<Film />} selected>
                  <p>Moved</p>
                </SelectableListItem>
                <SelectableListItem label='Music.mp3' icon={<FileMusic />}>
                  <p>New</p>
                </SelectableListItem>
                <SelectableListItem label='Spreadsheet.xlsx' icon={<FileSpreadsheet />} selected defaultChecked>
                  <p>Modified</p>
                </SelectableListItem>
                <SelectableListItem label='Code.js' icon={<SquareCode />}>
                  <p>Unpublished</p>
                </SelectableListItem>
                <SelectableListItem label='Presentation.pptx' icon={<Presentation />} selected>
                  <p>Modified</p>
                </SelectableListItem>
                <SelectableListItem label='SiteRoot' icon={<Globe />}>
                  <p>Unpublished</p>
                </SelectableListItem>
                <SelectableListItem label='Template.tpl' icon={<FileCog />} selected>
                  <p>Modified</p>
                </SelectableListItem>
                <SelectableListItem label='Shortcut.url' icon={<SquareArrowOutUpRight />} defaultChecked>
                  <p>Moved</p>
                </SelectableListItem>
                <SelectableListItem label='Unknown.bin' icon={<FileQuestionMark />}>
                  <p>New</p>
                </SelectableListItem>
                <SelectableListItem label='Exec.exe' icon={<FileTerminal />} selected>
                  <p>Modified</p>
                </SelectableListItem>
                <SelectableListItem label='Default.txt' icon={<FileType />} defaultChecked>
                  <p className='text-success'>Online</p>
                </SelectableListItem>
              </Dialog.Body>

              <Dialog.Footer>
                <Button
                  variant='outline'
                  startIcon={Calendar}
                  onClick={() => setOpen(false)}
                  label='Schedule Archive'
                />
                <Button variant='solid' onClick={() => setOpen(false)} label='Archive (3)' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const FormDialog: Story = {
  name: 'Form Dialog',
  render: () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subscribe, setSubscribe] = useState<CheckboxChecked>(true);

    const handleSubmit = (): void => {
      console.log('Form submitted:', { name, email, subscribe });
      setOpen(false);
    };

    const title = 'User Information';
    const description = 'Please fill in your details below.';

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open Form' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120'>
              <Dialog.DefaultHeader title={title} description={description} />
              <Dialog.Body className='space-y-3'>
                <Input
                  label='Name'
                  value={name}
                  onChange={e => setName(e.currentTarget.value)}
                  placeholder='John Doe'
                />
                <Input
                  label='Email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.currentTarget.value)}
                  placeholder='john@example.com'
                />
                <Checkbox label='Subscribe to newsletter' checked={subscribe} onCheckedChange={setSubscribe} />
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant='outline' label='Cancel' />
                </Dialog.Close>
                <Button variant='solid' onClick={handleSubmit} label='Submit' startIcon={Save} />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const DestructiveDialog: Story = {
  name: 'Destructive Action',
  render: () => {
    const [open, setOpen] = useState(false);

    const handleDelete = (): void => {
      console.log('Item deleted');
      setOpen(false);
    };

    const title = 'Confirm Deletion';
    const description = 'Are you sure you want to delete this item? This action cannot be undone.';

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Delete Item' startIcon={Trash2} />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120'>
              <Dialog.DefaultHeader title={title} description={description} />
              <Dialog.Body>
                <div className='bg-error/10 border border-error/20 rounded-md p-3'>
                  <p className='text-sm text-error font-medium flex items-center gap-2'>
                    <TriangleAlert className='w-6 h-6 inline-block' />
                    <span>Warning: This is a permanent action</span>
                  </p>
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant='outline' label='Cancel' />
                </Dialog.Close>
                <Button
                  variant='filled'
                  className='bg-error text-alt hover:bg-error/90'
                  onClick={handleDelete}
                  label='Delete'
                  startIcon={Trash2}
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const NestedContent: Story = {
  name: 'Nested Content',
  render: () => {
    const [open, setOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('general');

    const title = 'Settings';
    const description = 'Manage your application preferences.';

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open Settings' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-160'>
              <Dialog.DefaultHeader title={title} description={description} />
              <Dialog.Body>
                <div className='flex gap-2 border-b border-bdr-subtle'>
                  <button
                    onClick={() => setSelectedTab('general')}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                      selectedTab === 'general' ? 'border-main text-main font-medium' : 'border-transparent text-subtle'
                    }`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setSelectedTab('advanced')}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                      selectedTab === 'advanced'
                        ? 'border-main text-main font-medium'
                        : 'border-transparent text-subtle'
                    }`}
                  >
                    Advanced
                  </button>
                </div>

                {selectedTab === 'general' && (
                  <div className='space-y-3'>
                    <Input label='Username' placeholder='Enter username' />
                    <Input label='Display Name' placeholder='Enter display name' />
                    <Checkbox label='Enable notifications' defaultChecked />
                  </div>
                )}

                {selectedTab === 'advanced' && (
                  <div className='space-y-3'>
                    <Checkbox label='Enable experimental features' />
                    <Checkbox label='Developer mode' />
                    <Checkbox label='Debug logging' />
                  </div>
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant='outline' label='Cancel' />
                </Dialog.Close>
                <Button variant='solid' onClick={() => setOpen(false)} label='Save Changes' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const OverlayEffect: Story = {
  name: 'Overlay Effect',
  render: () => {
    const [open, setOpen] = useState(false);

    const title = 'Overlay Demonstration';
    const description = 'Background content is dimmed and blurred by the overlay.';

    return (
      <div className='min-h-screen-80 p-8 space-y-6'>
        <div className='space-y-4'>
          <h1 className='text-3xl font-bold'>Background Content</h1>
          <p className='text-lg'>Demonstrates the Dialog overlay with backdrop blur and dimming effect.</p>
          <p className='text-subtle'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
          </p>
        </div>

        <div className='flex gap-3'>
          <Button variant='solid' onClick={() => setOpen(true)} label='Open Dialog' />
          <Button variant='outline' label='Secondary Action' disabled />
        </div>

        <div className='bg-surface-info border border-info rounded-md p-4'>
          <p className='text-sm text-info font-medium'>
            <span className='font-bold'>Info:</span> Informational message in the background.
          </p>
        </div>

        <div className='bg-surface-warn border border-warn rounded-md p-4'>
          <p className='text-sm text-warn font-medium flex items-center gap-2'>
            <TriangleAlert className='w-5 h-5' />
            <span>
              <span className='font-bold'>Warning:</span> Important background information.
            </span>
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-100'>
              <Dialog.DefaultHeader title={title} description={description} />
              <Dialog.Body className='space-y-2'>
                <p className='text-sm'>The overlay provides:</p>
                <ul className='text-sm text-subtle list-disc list-inside space-y-1'>
                  <li>Visual separation</li>
                  <li>Backdrop blur</li>
                  <li>Dimming effect</li>
                  <li>Click-outside-to-close</li>
                </ul>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='solid' onClick={() => setOpen(false)} label='Close' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};
