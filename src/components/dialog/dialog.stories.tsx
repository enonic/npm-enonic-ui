import { Button } from '@/components/button';
import { Checkbox, type CheckboxChecked } from '@/components/checkbox';
import { Input } from '@/components/input';
import { SelectableListItem } from '@/components/selectable-list-item';
import { Separator } from '@/components/separator';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Calendar, Database, FileIcon, ImageIcon, Save, SplinePointer, Trash2, TriangleAlert } from 'lucide-react';
import { useState } from 'preact/hooks';

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

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open Dialog' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120 space-y-4'>
              <Dialog.Title>Simple Dialog</Dialog.Title>
              <Dialog.Description>
                This is a basic controlled dialog example. Click outside or press Escape to close.
              </Dialog.Description>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setOpen(false)} label='Cancel' />
                <Button variant='solid' onClick={() => setOpen(false)} label='Confirm' />
              </div>
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

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <Button variant='solid' label='Open with Trigger' />
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className='w-120 space-y-4'>
            <Dialog.Title>Triggered Dialog</Dialog.Title>
            <Dialog.Description>This dialog uses Dialog.Trigger component to open automatically.</Dialog.Description>

            <div className='flex justify-end gap-2'>
              <Dialog.Close asChild>
                <Button variant='outline' label='Close' />
              </Dialog.Close>
              <Button variant='solid' onClick={() => setOpen(false)} label='Done' />
            </div>
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
    const [message, setMessage] = useState('');

    return (
      <div className='space-y-4'>
        <Button variant='outline' onClick={() => setOpen(true)} label='Open Dialog with Header' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120 space-y-4'>
              <Dialog.Header title='Dialog with Message' message={message} onMessageChange={setMessage} />

              <div>
                <p className='text-subtle'>
                  The header allows editing a message. Start typing or click the message area to edit.
                </p>
              </div>

              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setOpen(false)} label='Cancel' />
                <Button variant='solid' onClick={() => setOpen(false)} label='Save' />
              </div>
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
    const [message, setMessage] = useState('Start typing or click here to add an archive message');

    return (
      <div className='space-y-4'>
        <Button variant='outline' onClick={() => setOpen(true)} label='Open Archive Dialog' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-220 space-y-4'>
              <Dialog.Header title='Archive Items' message={message} onMessageChange={setMessage} />

              <SelectableListItem label='Accounts.SQL' icon={<Database />} defaultChecked>
                <p className='text-success'>Online</p>
              </SelectableListItem>

              <Separator label='Other items that will be archived' />

              <div className='space-y-1'>
                <SelectableListItem label='Image.jpg' icon={<ImageIcon />} defaultChecked>
                  <p className='text-success'>Online</p>
                </SelectableListItem>
                <SelectableListItem label='Vector.svg' icon={<SplinePointer />} defaultChecked>
                  <p className='text-success'>Online</p>
                </SelectableListItem>
                <SelectableListItem label='File.doc' icon={<FileIcon />} selected>
                  <p>Modified</p>
                </SelectableListItem>
              </div>

              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  startIcon={Calendar}
                  onClick={() => setOpen(false)}
                  label='Schedule Archive'
                />
                <Button variant='solid' onClick={() => setOpen(false)} label='Archive (3)' />
              </div>
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

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open Form' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120 space-y-4'>
              <Dialog.Title>User Information</Dialog.Title>
              <Dialog.Description>Please fill in your details below.</Dialog.Description>
              <div className='space-y-3'>
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
              </div>

              <div className='flex justify-end gap-2'>
                <Dialog.Close asChild>
                  <Button variant='outline' label='Cancel' />
                </Dialog.Close>
                <Button variant='solid' onClick={handleSubmit} label='Submit' startIcon={Save} />
              </div>
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

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Delete Item' startIcon={Trash2} />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120 space-y-4'>
              <Dialog.Title>Confirm Deletion</Dialog.Title>
              <Dialog.Description>
                Are you sure you want to delete this item? This action cannot be undone.
              </Dialog.Description>
              <Separator />
              <div className='bg-error/10 border border-error/20 rounded-md p-3'>
                <p className='text-sm text-error font-medium flex items-center gap-2'>
                  <TriangleAlert className='w-6 h-6 inline-block' />
                  <span>Warning: This is a permanent action</span>
                </p>
              </div>

              <div className='flex justify-end gap-2'>
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
              </div>
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

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open Settings' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-160 space-y-4'>
              <Dialog.Title>Settings</Dialog.Title>
              <Dialog.Description>Manage your application preferences.</Dialog.Description>
              <Separator />
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
                    selectedTab === 'advanced' ? 'border-main text-main font-medium' : 'border-transparent text-subtle'
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

              <div className='flex justify-end gap-2'>
                <Dialog.Close asChild>
                  <Button variant='outline' label='Cancel' />
                </Dialog.Close>
                <Button variant='solid' onClick={() => setOpen(false)} label='Save Changes' />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};
