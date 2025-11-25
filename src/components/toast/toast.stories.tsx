import { Button } from '@/components/button';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Bell } from 'lucide-react';
import { useState } from 'preact/hooks';

import { Toast, type ToastProps } from './toast';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<ToastProps>;

export default meta;

type Story = StoryObj<ToastProps>;

export const DescriptionOnly: Story = {
  name: 'Examples / Description only',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Toast open={open} onOpenChange={setOpen}>
        <Toast.Description>This is a basic notification, without anything special.</Toast.Description>
      </Toast>
    );
  },
};

export const WithIcon: Story = {
  name: 'Examples / With icon',
  render: () => (
    <div className='flex flex-col gap-3'>
      <Toast>
        <Toast.Icon tone='success' />
        <Toast.Description>Success: Operation completed successfully.</Toast.Description>
      </Toast>
      <Toast>
        <Toast.Icon tone='info' />
        <Toast.Description>Info: Here is some useful information.</Toast.Description>
      </Toast>
      <Toast>
        <Toast.Icon tone='warning' />
        <Toast.Description>Warning: Please review before proceeding.</Toast.Description>
      </Toast>
      <Toast>
        <Toast.Icon tone='error' />
        <Toast.Description>Error: Something went wrong.</Toast.Description>
      </Toast>
      <Toast>
        <Toast.Icon>
          <Bell className='text-alt' strokeWidth={2} aria-hidden='true' />
        </Toast.Icon>
        <Toast.Description>Custom: Using a custom Bell icon.</Toast.Description>
      </Toast>
    </div>
  ),
};

export const WithClose: Story = {
  name: 'Examples / With Close',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className='flex flex-col gap-3 items-center'>
        <Toast open={open} onOpenChange={setOpen} withClose>
          <Toast.Icon tone='warning' />
          <Toast.Description>
            Editing is paused while we upgrade infrastructure. You will regain access as soon as the maintenance window
            ends.
          </Toast.Description>
        </Toast>
        <Button size='sm' variant='outline' onClick={() => setOpen(true)}>
          Open toast
        </Button>
      </div>
    );
  },
};

export const WithoutIcon: Story = {
  name: 'Examples / Without icon',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className='flex flex-col gap-3 items-center'>
        <Toast open={open} onOpenChange={setOpen} withClose>
          <Toast.Description>
            Editing is paused while we upgrade infrastructure. You will regain access as soon as the maintenance window
            ends.
          </Toast.Description>
        </Toast>
        <Button size='sm' variant='outline' onClick={() => setOpen(true)}>
          Open toast
        </Button>
      </div>
    );
  },
};

export const WithTitle: Story = {
  name: 'Examples / With title',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className='flex flex-col gap-3 items-center'>
        <Toast open={open} onOpenChange={setOpen} withClose>
          <Toast.Icon tone='warning' />
          <Toast.Title>Ye sir</Toast.Title>
          <Toast.Description>
            Editing is paused while we upgrade infrastructure. You will regain access as soon as the maintenance window
            ends.
          </Toast.Description>
        </Toast>
        <Button size='sm' variant='outline' onClick={() => setOpen(true)}>
          Open toast
        </Button>
      </div>
    );
  },
};

export const WithLink: Story = {
  name: 'Examples / With Link',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className='flex flex-col gap-3 items-center'>
        <Toast open={open} onOpenChange={setOpen} withClose>
          <Toast.Icon tone='warning' />
          <Toast.Title>Ye sir</Toast.Title>
          <Toast.Description>
            Editing is paused while we upgrade infrastructure. You will regain access as soon as the maintenance window
            ends.
          </Toast.Description>
          <Toast.Link href='#'>View status</Toast.Link>
        </Toast>
        <Button size='sm' variant='outline' onClick={() => setOpen(true)}>
          Open toast
        </Button>
      </div>
    );
  },
};

export const WithAction: Story = {
  name: 'Examples / With Action',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className='flex flex-col gap-3 items-center'>
        <Toast open={open} onOpenChange={setOpen} withClose>
          <Toast.Icon tone='error' />
          <Toast.Title>Ye sir</Toast.Title>
          <Toast.Description>
            Editing is paused while we upgrade infrastructure. You will regain access as soon as the maintenance window
            ends.
          </Toast.Description>
          <Toast.Link href='#'>View status</Toast.Link>
          <Toast.Button label='Notify me' onClick={() => undefined} />
        </Toast>
        <Button size='sm' variant='outline' onClick={() => setOpen(true)}>
          Open toast
        </Button>
      </div>
    );
  },
};

export const InSmallContainer: Story = {
  name: 'Examples / In Small Container',
  render: () => (
    <div className='w-64 border border-dashed border-gray-400 p-2'>
      <Toast>
        <Toast.Icon tone='info' />
        <Toast.Description>Toast shrinks to fit the container width.</Toast.Description>
      </Toast>
    </div>
  ),
};
