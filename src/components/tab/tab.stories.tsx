import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Bell, MessageSquare, Settings, User } from 'lucide-react';
import { useState } from 'react';

import { Tab, type TabRootProps } from './tab';

type Story = StoryObj<TabRootProps>;

export default {
  title: 'Components/Tab',
  component: Tab,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    activationMode: {
      control: 'radio',
      options: ['automatic', 'manual'],
      description: 'When automatic, tabs activate on focus. When manual, tabs activate on Enter/Space.',
    },
  },
  args: {
    activationMode: 'automatic',
  },
} satisfies Meta<TabRootProps>;

//
// * Examples
//

export const Basic: Story = {
  name: 'Examples / Basic',
  render: () => (
    <Tab.Root defaultValue='account' className='w-96'>
      <Tab.List aria-label='Account settings'>
        <Tab.Trigger value='account'>Account</Tab.Trigger>
        <Tab.Trigger value='password'>Password</Tab.Trigger>
        <Tab.Trigger value='settings'>Settings</Tab.Trigger>
      </Tab.List>
      <Tab.Content value='account' className='p-4'>
        <p className='text-sm text-subtle'>Manage your account settings and preferences.</p>
      </Tab.Content>
      <Tab.Content value='password' className='p-4'>
        <p className='text-sm text-subtle'>Change your password and security settings.</p>
      </Tab.Content>
      <Tab.Content value='settings' className='p-4'>
        <p className='text-sm text-subtle'>Configure application settings.</p>
      </Tab.Content>
    </Tab.Root>
  ),
};

export const WithIcons: Story = {
  name: 'Examples / With Icons',
  render: () => (
    <Tab.Root defaultValue='profile' className='w-96'>
      <Tab.List aria-label='Navigation'>
        <Tab.DefaultTrigger value='profile' icon={User}>
          Profile
        </Tab.DefaultTrigger>
        <Tab.DefaultTrigger value='messages' icon={MessageSquare}>
          Messages
        </Tab.DefaultTrigger>
        <Tab.DefaultTrigger value='notifications' icon={Bell}>
          Notifications
        </Tab.DefaultTrigger>
      </Tab.List>
      <Tab.Content value='profile' className='p-4'>
        <p className='text-sm text-subtle'>Profile content</p>
      </Tab.Content>
      <Tab.Content value='messages' className='p-4'>
        <p className='text-sm text-subtle'>Messages content</p>
      </Tab.Content>
      <Tab.Content value='notifications' className='p-4'>
        <p className='text-sm text-subtle'>Notifications content</p>
      </Tab.Content>
    </Tab.Root>
  ),
};

export const WithCount: Story = {
  name: 'Examples / With Count',
  render: () => (
    <Tab.Root defaultValue='tab1' className='w-96'>
      <Tab.List aria-label='Tabs with counters'>
        <Tab.DefaultTrigger value='tab1' count={7}>
          Tab 1
        </Tab.DefaultTrigger>
        <Tab.DefaultTrigger value='tab2' count={24}>
          Tab 2
        </Tab.DefaultTrigger>
        <Tab.DefaultTrigger value='tab3' count={'99+'}>
          Tab 3
        </Tab.DefaultTrigger>
      </Tab.List>
      <Tab.Content value='tab1' className='p-4'>
        <p className='text-sm text-subtle'>Tab 1 content with 7 items</p>
      </Tab.Content>
      <Tab.Content value='tab2' className='p-4'>
        <p className='text-sm text-subtle'>Tab 2 content with 24 items</p>
      </Tab.Content>
      <Tab.Content value='tab3' className='p-4'>
        <p className='text-sm text-subtle'>Tab 3 content with 99+ items</p>
      </Tab.Content>
    </Tab.Root>
  ),
};

export const LongText: Story = {
  name: 'Examples / Long Text',
  render: () => (
    <Tab.Root defaultValue='text' className='w-96'>
      <Tab.List aria-label='Long text examples'>
        <Tab.DefaultTrigger value='text'>Very long tab label that should truncate</Tab.DefaultTrigger>
        <Tab.DefaultTrigger value='icon-left' icon={User}>
          Long label with icon on left
        </Tab.DefaultTrigger>
        <Tab.DefaultTrigger value='icon-count' icon={User} count={99}>
          Icon and count
        </Tab.DefaultTrigger>
      </Tab.List>
      <Tab.Content value='text' className='p-4'>
        <p className='text-sm text-subtle'>Text only tab content</p>
      </Tab.Content>
      <Tab.Content value='icon-left' className='p-4'>
        <p className='text-sm text-subtle'>Icon on left tab content</p>
      </Tab.Content>
      <Tab.Content value='icon-count' className='p-4'>
        <p className='text-sm text-subtle'>Icon and count tab content</p>
      </Tab.Content>
    </Tab.Root>
  ),
};

export const Overflow: Story = {
  name: 'Examples / Overflow',
  render: () => (
    <Tab.Root defaultValue='overview' className='w-80'>
      <Tab.ListOverflow>
        <Tab.List aria-label='Overflow tabs'>
          <Tab.DefaultTrigger value='overview'>Overview</Tab.DefaultTrigger>
          <Tab.DefaultTrigger value='activity'>Activity Feed</Tab.DefaultTrigger>
          <Tab.DefaultTrigger value='analytics'>Analytics Dashboard</Tab.DefaultTrigger>
          <Tab.DefaultTrigger value='notifications'>Notifications</Tab.DefaultTrigger>
          <Tab.DefaultTrigger value='billing'>Billing & Plans</Tab.DefaultTrigger>
          <Tab.DefaultTrigger value='team'>Team Members</Tab.DefaultTrigger>
          <Tab.DefaultTrigger value='integrations'>Integrations</Tab.DefaultTrigger>
        </Tab.List>
      </Tab.ListOverflow>
      <Tab.Content value='overview' className='p-4'>
        <p className='text-sm text-subtle'>Overview content</p>
      </Tab.Content>
      <Tab.Content value='activity' className='p-4'>
        <p className='text-sm text-subtle'>Activity content</p>
      </Tab.Content>
      <Tab.Content value='analytics' className='p-4'>
        <p className='text-sm text-subtle'>Analytics content</p>
      </Tab.Content>
      <Tab.Content value='notifications' className='p-4'>
        <p className='text-sm text-subtle'>Notifications content</p>
      </Tab.Content>
      <Tab.Content value='billing' className='p-4'>
        <p className='text-sm text-subtle'>Billing content</p>
      </Tab.Content>
      <Tab.Content value='team' className='p-4'>
        <p className='text-sm text-subtle'>Team content</p>
      </Tab.Content>
      <Tab.Content value='integrations' className='p-4'>
        <p className='text-sm text-subtle'>Integrations content</p>
      </Tab.Content>
    </Tab.Root>
  ),
};

export const OverflowResizable: Story = {
  name: 'Examples / Overflow (Resizable)',
  render: () => (
    <div className='w-120 resize-x overflow-auto rounded border border-border p-4'>
      <Tab.Root defaultValue='overview'>
        <Tab.ListOverflow>
          <Tab.List aria-label='Resizable overflow tabs'>
            <Tab.DefaultTrigger value='overview'>Overview</Tab.DefaultTrigger>
            <Tab.DefaultTrigger value='activity'>Activity Feed</Tab.DefaultTrigger>
            <Tab.DefaultTrigger value='analytics'>Analytics Dashboard</Tab.DefaultTrigger>
            <Tab.DefaultTrigger value='notifications'>Notifications</Tab.DefaultTrigger>
            <Tab.DefaultTrigger value='billing'>Billing & Plans</Tab.DefaultTrigger>
            <Tab.DefaultTrigger value='team'>Team Members</Tab.DefaultTrigger>
            <Tab.DefaultTrigger value='integrations'>Integrations</Tab.DefaultTrigger>
          </Tab.List>
        </Tab.ListOverflow>
        <Tab.Content value='overview' className='p-4'>
          <p className='text-sm text-subtle'>Overview content</p>
        </Tab.Content>
        <Tab.Content value='activity' className='p-4'>
          <p className='text-sm text-subtle'>Activity content</p>
        </Tab.Content>
        <Tab.Content value='analytics' className='p-4'>
          <p className='text-sm text-subtle'>Analytics content</p>
        </Tab.Content>
        <Tab.Content value='notifications' className='p-4'>
          <p className='text-sm text-subtle'>Notifications content</p>
        </Tab.Content>
        <Tab.Content value='billing' className='p-4'>
          <p className='text-sm text-subtle'>Billing content</p>
        </Tab.Content>
        <Tab.Content value='team' className='p-4'>
          <p className='text-sm text-subtle'>Team content</p>
        </Tab.Content>
        <Tab.Content value='integrations' className='p-4'>
          <p className='text-sm text-subtle'>Integrations content</p>
        </Tab.Content>
      </Tab.Root>
    </div>
  ),
};

export const OverflowMinWidth: Story = {
  name: 'Examples / Overflow (Min Width)',
  render: () => (
    <div className='space-y-8'>
      <div>
        <p className='mb-2 text-sm text-subtle'>Default (6.25rem) — short labels get padded out</p>
        <Tab.Root defaultValue='a' className='w-96'>
          <Tab.ListOverflow>
            <Tab.List aria-label='Default min width'>
              <Tab.DefaultTrigger value='a'>A</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='b'>B</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='c'>C</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='d'>D</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='e'>E</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='f'>F</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='g'>G</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='h'>H</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='i'>I</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='j'>J</Tab.DefaultTrigger>
            </Tab.List>
          </Tab.ListOverflow>
        </Tab.Root>
      </div>

      <div>
        <p className='mb-2 text-sm text-subtle'>Narrow (3rem) — tabs shrink closer to content</p>
        <Tab.Root defaultValue='a' className='w-96'>
          <Tab.ListOverflow minTabWidth='3rem'>
            <Tab.List aria-label='Narrow min width'>
              <Tab.DefaultTrigger value='a'>A</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='b'>B</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='c'>C</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='d'>D</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='e'>E</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='f'>F</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='g'>G</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='h'>H</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='i'>I</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='j'>J</Tab.DefaultTrigger>
            </Tab.List>
          </Tab.ListOverflow>
        </Tab.Root>
      </div>

      <div>
        <p className='mb-2 text-sm text-subtle'>Wide (10rem) — tabs are wider, long labels fit</p>
        <Tab.Root defaultValue='overview' className='w-96'>
          <Tab.ListOverflow minTabWidth='10rem'>
            <Tab.List aria-label='Wide min width'>
              <Tab.DefaultTrigger value='overview'>Overview</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='activity'>Activity Feed</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='analytics'>Analytics Dashboard</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='notifications'>Notifications</Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='team'>Team Members</Tab.DefaultTrigger>
            </Tab.List>
          </Tab.ListOverflow>
        </Tab.Root>
      </div>
    </div>
  ),
};

export const OverflowFewTabs: Story = {
  name: 'Examples / Overflow (No Overflow)',
  render: () => (
    <div className='w-96 space-y-4'>
      <p className='text-sm text-subtle'>ListOverflow wrapper is present but tabs fit — no arrow buttons are shown.</p>
      <Tab.Root defaultValue='tab1'>
        <Tab.ListOverflow>
          <Tab.List aria-label='Few tabs'>
            <Tab.DefaultTrigger value='tab1'>Tab 1</Tab.DefaultTrigger>
            <Tab.DefaultTrigger value='tab2'>Tab 2</Tab.DefaultTrigger>
            <Tab.DefaultTrigger value='tab3'>Tab 3</Tab.DefaultTrigger>
          </Tab.List>
        </Tab.ListOverflow>
        <Tab.Content value='tab1' className='p-4'>
          <p className='text-sm text-subtle'>Tab 1 content</p>
        </Tab.Content>
        <Tab.Content value='tab2' className='p-4'>
          <p className='text-sm text-subtle'>Tab 2 content</p>
        </Tab.Content>
        <Tab.Content value='tab3' className='p-4'>
          <p className='text-sm text-subtle'>Tab 3 content</p>
        </Tab.Content>
      </Tab.Root>
    </div>
  ),
};

export const WithError: Story = {
  name: 'Examples / With Error',
  render: () => (
    <Tab.Root defaultValue='tab1' className='w-120'>
      <Tab.List aria-label='Tabs with error states'>
        <Tab.DefaultTrigger value='tab1' icon={User}>
          Icon
        </Tab.DefaultTrigger>
        <Tab.DefaultTrigger value='tab2' icon={MessageSquare} count={12}>
          Icon & Count
        </Tab.DefaultTrigger>
        <Tab.DefaultTrigger value='tab3' icon={Settings} error>
          Icon & Error
        </Tab.DefaultTrigger>
      </Tab.List>
      <Tab.Content value='tab1' className='p-4'>
        <p className='text-sm text-subtle'>Text only tab content</p>
      </Tab.Content>
      <Tab.Content value='tab2' className='p-4'>
        <p className='text-sm text-subtle'>Tab with icon content</p>
      </Tab.Content>
      <Tab.Content value='tab3' className='p-4'>
        <p className='text-sm text-subtle'>Tab with icon and count content</p>
      </Tab.Content>
      <Tab.Content value='tab4' className='p-4'>
        <p className='text-error text-sm'>This tab has an error indicator!</p>
      </Tab.Content>
    </Tab.Root>
  ),
};

//
// * States
//

export const DisabledTab: Story = {
  name: 'States / Disabled Tab',
  render: () => (
    <Tab.Root defaultValue='tab1' className='w-96'>
      <Tab.List aria-label='Tabs with disabled'>
        <Tab.Trigger value='tab1'>Enabled</Tab.Trigger>
        <Tab.Trigger value='tab2' disabled>
          Disabled
        </Tab.Trigger>
        <Tab.Trigger value='tab3'>Enabled</Tab.Trigger>
      </Tab.List>
      <Tab.Content value='tab1' className='p-4'>
        <p className='text-sm text-subtle'>First tab content</p>
      </Tab.Content>
      <Tab.Content value='tab2' className='p-4'>
        <p className='text-sm text-subtle'>Second tab content (unreachable)</p>
      </Tab.Content>
      <Tab.Content value='tab3' className='p-4'>
        <p className='text-sm text-subtle'>Third tab content</p>
      </Tab.Content>
    </Tab.Root>
  ),
};

//
// * Features
//

export const Controlled: Story = {
  name: 'Features / Controlled',
  render: () => {
    const [value, setValue] = useState('tab1');

    return (
      <div className='space-y-4'>
        <Tab.Root value={value} onValueChange={setValue} className='w-96'>
          <Tab.List aria-label='Controlled tabs'>
            <Tab.Trigger value='tab1'>Tab 1</Tab.Trigger>
            <Tab.Trigger value='tab2'>Tab 2</Tab.Trigger>
            <Tab.Trigger value='tab3'>Tab 3</Tab.Trigger>
          </Tab.List>
          <Tab.Content value='tab1' className='p-4'>
            <p className='text-sm text-subtle'>Content 1</p>
          </Tab.Content>
          <Tab.Content value='tab2' className='p-4'>
            <p className='text-sm text-subtle'>Content 2</p>
          </Tab.Content>
          <Tab.Content value='tab3' className='p-4'>
            <p className='text-sm text-subtle'>Content 3</p>
          </Tab.Content>
        </Tab.Root>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => setValue('tab1')}
            className='rounded bg-surface-neutral-hover px-3 py-1 text-sm'
          >
            Select Tab 1
          </button>
          <button
            type='button'
            onClick={() => setValue('tab2')}
            className='rounded bg-surface-neutral-hover px-3 py-1 text-sm'
          >
            Select Tab 2
          </button>
        </div>
        <p className='text-sm text-subtle'>
          Current: <span className='font-semibold'>{value}</span>
        </p>
      </div>
    );
  },
};

export const Interactive: Story = {
  name: 'Features / Interactive',
  args: {
    activationMode: 'automatic',
  },
  render: args => {
    const [value, setValue] = useState('tab1');

    return (
      <div className='w-96 space-y-6'>
        <p className='text-sm text-subtle'>
          Activation mode: <span className='font-semibold'>{args.activationMode}</span>
          {args.activationMode === 'manual' && ' (arrow keys move focus, Enter/Space selects)'}
        </p>

        <div className='rounded-lg border border-border p-6'>
          <Tab.Root value={value} onValueChange={setValue} activationMode={args.activationMode} className='w-full'>
            <Tab.List aria-label='Interactive tabs'>
              <Tab.DefaultTrigger value='tab1' icon={User}>
                Account
              </Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='tab2' icon={Settings} error>
                Settings
              </Tab.DefaultTrigger>
              <Tab.DefaultTrigger value='tab3' icon={Bell} disabled>
                Disabled
              </Tab.DefaultTrigger>
            </Tab.List>
            <Tab.Content value='tab1' className='p-4'>
              <p className='text-sm text-subtle'>Account content</p>
            </Tab.Content>
            <Tab.Content value='tab2' className='p-4'>
              <p className='text-sm text-subtle'>Settings content</p>
            </Tab.Content>
            <Tab.Content value='tab3' className='p-4'>
              <p className='text-sm text-subtle'>Disabled content</p>
            </Tab.Content>
          </Tab.Root>
        </div>

        <p className='text-sm'>
          <span className='text-subtle'>Selected: </span>
          <span className='font-semibold'>{value}</span>
        </p>
      </div>
    );
  },
};

//
// * Behavior
//

export const KeyboardNavigation: Story = {
  name: 'Behavior / Keyboard Navigation',
  args: {
    activationMode: 'automatic',
  },
  render: args => (
    <div className='max-w-120 space-y-6'>
      <div className='rounded bg-surface-neutral p-4'>
        <ul className='space-y-1 text-sm'>
          <li>
            <kbd className='rounded bg-surface-neutral-hover px-1'>Tab</kbd> - Enter/exit the tab list
          </li>
          <li>
            <kbd className='rounded bg-surface-neutral-hover px-1'>Arrow Left/Right</kbd> - Move between tabs
            {args.activationMode === 'automatic' && ' (and select)'}
          </li>
          <li>
            <kbd className='rounded bg-surface-neutral-hover px-1'>Home</kbd> - Move to first tab
          </li>
          <li>
            <kbd className='rounded bg-surface-neutral-hover px-1'>End</kbd> - Move to last tab
          </li>
          {args.activationMode === 'manual' && (
            <li>
              <kbd className='rounded bg-surface-neutral-hover px-1'>Enter/Space</kbd> - Select focused tab
            </li>
          )}
        </ul>
      </div>
      <p className='text-sm text-subtle'>
        Activation mode: <span className='font-semibold'>{args.activationMode}</span>
      </p>
      <Tab.Root defaultValue='tab1' activationMode={args.activationMode} className='w-96'>
        <Tab.List aria-label='Keyboard test'>
          <Tab.Trigger value='tab1'>First</Tab.Trigger>
          <Tab.Trigger value='tab2'>Second</Tab.Trigger>
          <Tab.Trigger value='tab3' disabled>
            Disabled
          </Tab.Trigger>
          <Tab.Trigger value='tab4'>Fourth</Tab.Trigger>
        </Tab.List>
        <Tab.Content value='tab1' className='p-4'>
          <p className='text-sm text-subtle'>First tab content</p>
        </Tab.Content>
        <Tab.Content value='tab2' className='p-4'>
          <p className='text-sm text-subtle'>Second tab content</p>
        </Tab.Content>
        <Tab.Content value='tab3' className='p-4'>
          <p className='text-sm text-subtle'>Third tab content</p>
        </Tab.Content>
        <Tab.Content value='tab4' className='p-4'>
          <p className='text-sm text-subtle'>Fourth tab content</p>
        </Tab.Content>
      </Tab.Root>
    </div>
  ),
};
