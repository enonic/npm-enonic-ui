import type { Meta, StoryObj } from '@storybook/preact-vite';
import type { ReactElement, ReactNode } from 'react';

import { Skeleton, type SkeletonProps } from './skeleton';

const meta: Meta<SkeletonProps> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    shape: {
      control: 'select',
      options: ['rectangle', 'circle'],
      description: 'Skeleton shape',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'auto'],
      description: 'Preset size (use "auto" for custom sizing via className)',
    },
    animated: {
      control: 'boolean',
      description: 'Enable pulse or shimmer animation (default: true)',
    },
  },
};
export default meta;

type Story = StoryObj<SkeletonProps>;

const Container = ({ children }: { children: ReactNode }): ReactElement => (
  <div className='w-80 space-y-3'>{children}</div>
);

// * Examples

export const Basic: Story = {
  name: 'Examples / Basic',
  render: () => (
    <Container>
      <Skeleton size='sm' />
      <Skeleton size='md' />
      <Skeleton size='lg' />
    </Container>
  ),
};

export const CardPlaceholder: Story = {
  name: 'Examples / Card Placeholder',
  render: () => (
    <div className='border-bdr-soft w-72 rounded-lg border p-4'>
      <div className='flex items-center gap-3'>
        <Skeleton shape='circle' size='md' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-3 w-1/2' />
        </div>
      </div>
      <Skeleton className='mt-4 h-20 w-full' />
      <div className='mt-4 flex gap-2'>
        <Skeleton className='h-8 w-20' />
        <Skeleton className='h-8 w-20' />
      </div>
    </div>
  ),
};

export const ListPlaceholder: Story = {
  name: 'Examples / List Placeholder',
  render: () => (
    <Skeleton.Group className='w-64 space-y-3'>
      {[1, 2, 3].map(i => (
        <div key={i} className='flex items-center gap-3'>
          <Skeleton shape='circle' size='sm' />
          <div className='flex-1 space-y-1.5'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
          </div>
        </div>
      ))}
    </Skeleton.Group>
  ),
};

// * Features

export const Shapes: Story = {
  name: 'Features / Shapes',
  render: () => (
    <div className='flex items-center gap-6'>
      <div className='flex flex-col items-center gap-2'>
        <Skeleton shape='rectangle' size='md' />
        <span className='text-subtle text-xs'>Rectangle</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <Skeleton shape='circle' size='md' />
        <span className='text-subtle text-xs'>Circle</span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Features / Sizes',
  render: () => (
    <div className='space-y-6'>
      <div>
        <h3 className='mb-3 text-sm font-medium'>Rectangle Sizes</h3>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <Skeleton shape='rectangle' size='sm' />
            <span className='text-subtle text-xs'>Small</span>
          </div>
          <div className='flex items-center gap-3'>
            <Skeleton shape='rectangle' size='md' />
            <span className='text-subtle text-xs'>Medium</span>
          </div>
          <div className='flex items-center gap-3'>
            <Skeleton shape='rectangle' size='lg' />
            <span className='text-subtle text-xs'>Large</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className='mb-3 text-sm font-medium'>Circle Sizes</h3>
        <div className='flex items-end gap-4'>
          <div className='flex flex-col items-center gap-2'>
            <Skeleton shape='circle' size='sm' />
            <span className='text-subtle text-xs'>Small</span>
          </div>
          <div className='flex flex-col items-center gap-2'>
            <Skeleton shape='circle' size='md' />
            <span className='text-subtle text-xs'>Medium</span>
          </div>
          <div className='flex flex-col items-center gap-2'>
            <Skeleton shape='circle' size='lg' />
            <span className='text-subtle text-xs'>Large</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const CustomSizing: Story = {
  name: 'Features / Custom Sizing',
  render: () => (
    <Container>
      <p className='text-subtle text-sm'>
        Use <code className='bg-surface-primary rounded px-1'>className</code> for custom dimensions:
      </p>
      <Skeleton className='h-3 w-full' />
      <Skeleton className='h-6 w-1/2' />
      <Skeleton className='h-10 w-40' />
      <Skeleton shape='circle' className='size-16' />
    </Container>
  ),
};

export const NoAnimation: Story = {
  name: 'Features / No Animation',
  render: () => (
    <div className='border-bdr-soft w-72 rounded-lg border p-4'>
      <div className='flex items-center gap-3'>
        <Skeleton animated={false} shape='circle' size='md' />
        <div className='flex-1 space-y-2'>
          <Skeleton animated={false} className='h-4 w-3/4' />
          <Skeleton animated={false} className='h-3 w-1/2' />
        </div>
      </div>
      <Skeleton animated={false} className='mt-4 h-20 w-full' />
    </div>
  ),
};

export const SynchronizedAnimation: Story = {
  name: 'Features / Synchronized Animation',
  render: () => (
    <div className='space-y-6'>
      <div>
        <p className='text-subtle mb-3 text-sm'>
          Without <code className='bg-surface-primary rounded px-1'>Skeleton.Group</code> (pulse animation):
        </p>
        <div className='flex items-center gap-3'>
          <Skeleton shape='circle' size='md' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-24' />
          </div>
        </div>
      </div>
      <div>
        <p className='text-subtle mb-3 text-sm'>
          With <code className='bg-surface-primary rounded px-1'>Skeleton.Group</code> (synchronized shimmer):
        </p>
        <Skeleton.Group className='flex items-center gap-3'>
          <Skeleton shape='circle' size='md' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-24' />
          </div>
        </Skeleton.Group>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  name: 'Features / Interactive',
  args: {
    shape: 'rectangle',
    size: 'md',
  },
};
