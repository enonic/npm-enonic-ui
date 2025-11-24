import { Button } from '@/components/button';
import type { Meta, StoryObj } from '@storybook/preact-vite';
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
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Toast open={open} onOpenChange={setOpen}>
        <Toast.Icon icon='error' />
        <Toast.Description>This is a basic notification, with an icon.</Toast.Description>
      </Toast>
    );
  },
};

export const WithClose: Story = {
  name: 'Examples / With Close',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className='flex flex-col gap-3 items-center'>
        <Toast open={open} onOpenChange={setOpen} withClose>
          <Toast.Icon icon='warning' />
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
          <Toast.Icon icon='warning' />
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
          <Toast.Icon icon='warning' />
          <Toast.Title>Ye sir</Toast.Title>
          <Toast.Description>
            Editing is paused while we upgrade infrastructure. You will regain access as soon as the maintenance window
            ends.
          </Toast.Description>
          <Toast.Link href='https://mega'>View status</Toast.Link>
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
          <Toast.Icon icon='error' />
          <Toast.Title>Ye sir</Toast.Title>
          <Toast.Description>
            Editing is paused while we upgrade infrastructure. You will regain access as soon as the maintenance window
            ends.
          </Toast.Description>
          <Toast.Link href='https://mega'>View status</Toast.Link>
          <Toast.Button label='Notify me' onClick={() => undefined} />
        </Toast>
        <Button size='sm' variant='outline' onClick={() => setOpen(true)}>
          Open toast
        </Button>
      </div>
    );
  },
};
