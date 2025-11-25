import { Button } from '@/components/button';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import type { ReactElement, ReactNode } from 'react';

import { Separator, type SeparatorProps } from './separator';

const meta: Meta<SeparatorProps> = {
  title: 'UI/Separator',
  component: Separator,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<SeparatorProps>;

const Container = ({ children }: { children: ReactNode }): ReactElement => (
  <div className='w-80 space-y-3'>{children}</div>
);

export const WithoutLabel: Story = {
  name: 'Examples / Without Label',
  render: () => (
    <Container>
      <p className='text-sm'>Content above</p>
      <Separator />
      <p className='text-sm'>Content below</p>
    </Container>
  ),
};

export const WithShortLabel: Story = {
  name: 'Examples / With Short Label',
  render: () => (
    <Container>
      <p className='text-sm'>Content above</p>
      <Separator label='Details' />
      <p className='text-sm'>Content below</p>
    </Container>
  ),
};

export const WithLongLabel: Story = {
  name: 'Examples / With Long Label',
  render: () => (
    <Container>
      <p className='text-sm'>Content above</p>
      <Separator label='Separator Separator Separator Separator Separator' />
      <p className='text-sm'>Content below</p>
    </Container>
  ),
};

export const InlineWithButton: Story = {
  name: 'Examples / Inline with Button',
  render: () => (
    <Container>
      <div className='flex items-baseline gap-2'>
        <Separator label='Recent Items' />
        <Button size='sm'>View All</Button>
      </div>
    </Container>
  ),
};
