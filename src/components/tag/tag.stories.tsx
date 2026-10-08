import { type ReactElement, useState } from 'react';
import { fn } from 'storybook/test';

import { Tag, type TagProps } from '@/components/tag';

import type { Meta, StoryObj } from '@storybook/preact-vite';

const meta: Meta<TagProps> = {
  title: 'Components/Tag',
  component: Tag,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    as: { control: 'inline-radio', options: ['span', 'li'] },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    dragging: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<TagProps>;

const noop = fn();

export const Default: Story = {
  name: 'Examples / Default',
  render: args => (
    <Tag {...args}>
      <Tag.Label>alice</Tag.Label>
    </Tag>
  ),
};

export const WithPrefix: Story = {
  name: 'Examples / With Prefix',
  render: args => (
    <Tag {...args}>
      <Tag.Prefix>ID provider:</Tag.Prefix>
      <Tag.Label>Company directory</Tag.Label>
      <Tag.Remove aria-label='Remove ID provider: Company directory' onClick={noop} />
    </Tag>
  ),
};

const RemovableRow = (): ReactElement => {
  const [tags, setTags] = useState([
    { prefix: 'ID provider', label: 'Company directory' },
    { prefix: 'Status', label: 'Enabled' },
    { label: 'alice' },
  ]);

  if (tags.length === 0) {
    return <div className='text-subtle text-sm'>Every tag removed. Reload the story.</div>;
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {tags.map(tag => {
        const name = tag.prefix === undefined ? tag.label : `${tag.prefix}: ${tag.label}`;
        return (
          <Tag key={name}>
            {tag.prefix !== undefined && <Tag.Prefix>{tag.prefix}:</Tag.Prefix>}
            <Tag.Label>{tag.label}</Tag.Label>
            <Tag.Remove
              aria-label={`Remove ${name}`}
              onClick={() => setTags(held => held.filter(candidate => candidate !== tag))}
            />
          </Tag>
        );
      })}
    </div>
  );
};

export const Removable: Story = {
  name: 'Examples / Removable',
  render: () => <RemovableRow />,
};

export const WithHandle: Story = {
  name: 'Examples / With Handle',
  render: args => (
    <ul className='flex flex-wrap items-center gap-2'>
      {['design', 'frontend', 'accessibility'].map(label => (
        <Tag key={label} as='li' {...args}>
          <Tag.Handle aria-label={`Reorder ${label}`} className='cursor-grab' />
          <Tag.Label as='button' aria-label={`Edit: ${label}`} onClick={noop}>
            {label}
          </Tag.Label>
          <Tag.Remove aria-label={`Remove ${label}`} onClick={noop} />
        </Tag>
      ))}
    </ul>
  ),
};

const State = ({ caption, children }: { caption: string; children: ReactElement }): ReactElement => (
  <div className='flex flex-col items-start gap-1.5'>
    <span className='text-subtle text-xs'>{caption}</span>
    {children}
  </div>
);

export const States: Story = {
  name: 'States / Overview',
  parameters: {
    docs: {
      description: {
        story:
          "The states a list puts a tag in. `error` is red text and border, with the message attached by the caller as `title`; `disabled` mutes the chip and disables every part inside it; `dragging` is a ring and a grabbing cursor. The list decides when, and the drag itself is the list's — `TagInput` in `@enonic/input-types` sets `dragging` from dnd-kit's `isDragging`.",
      },
    },
  },
  render: () => (
    <div className='flex flex-wrap items-start gap-6'>
      <State caption='default'>
        <Tag>
          <Tag.Handle aria-label='Reorder' className='cursor-grab' />
          <Tag.Label>design</Tag.Label>
          <Tag.Remove aria-label='Remove' onClick={noop} />
        </Tag>
      </State>
      <State caption='error'>
        <Tag error title='Must be at most 10 characters'>
          <Tag.Handle aria-label='Reorder' className='cursor-grab' />
          <Tag.Label>unreasonably-long</Tag.Label>
          <Tag.Remove aria-label='Remove' onClick={noop} />
        </Tag>
      </State>
      <State caption='disabled'>
        <Tag disabled>
          <Tag.Handle aria-label='Reorder' />
          <Tag.Label as='button' onClick={noop}>
            read-only
          </Tag.Label>
          <Tag.Remove aria-label='Remove' onClick={noop} />
        </Tag>
      </State>
      <State caption='dragging'>
        <Tag dragging>
          <Tag.Handle aria-label='Reorder' className='cursor-grabbing' />
          <Tag.Label>on the move</Tag.Label>
          <Tag.Remove aria-label='Remove' onClick={noop} />
        </Tag>
      </State>
    </div>
  ),
};

export const LongLabel: Story = {
  name: 'States / Long Label',
  render: () => (
    <div className='w-64'>
      <Tag>
        <Tag.Prefix>Application:</Tag.Prefix>
        <Tag.Label>com.enonic.app.a.very.long.application.key.that.does.not.fit</Tag.Label>
        <Tag.Remove aria-label='Remove the application' onClick={noop} />
      </Tag>
    </div>
  ),
};

export const MixedRow: Story = {
  name: 'States / Mixed Row',
  parameters: {
    docs: {
      description: {
        story:
          'A chip with a handle or a cross is as tall as one without: the 24px buttons take no more height than the text.',
      },
    },
  },
  render: () => (
    <div className='flex flex-wrap items-start gap-2'>
      <Tag>
        <Tag.Label>read-only</Tag.Label>
      </Tag>
      <Tag>
        <Tag.Label>removable</Tag.Label>
        <Tag.Remove aria-label='Remove removable' onClick={noop} />
      </Tag>
      <Tag>
        <Tag.Handle aria-label='Reorder sortable' className='cursor-grab' />
        <Tag.Label>sortable</Tag.Label>
        <Tag.Remove aria-label='Remove sortable' onClick={noop} />
      </Tag>
      <Tag>
        <Tag.Prefix>Status:</Tag.Prefix>
        <Tag.Label>Enabled</Tag.Label>
      </Tag>
    </div>
  ),
};

export const LongPrefix: Story = {
  name: 'States / Long Prefix',
  parameters: {
    docs: {
      description: {
        story:
          "Short of room, prefix and label both truncate, and the cross stays inside the chip. What is cut is the caller's to show: here the full term is in `title`, so hovering a chip reveals it.",
      },
    },
  },
  render: () => (
    <div className='flex w-60 flex-col items-start gap-2'>
      {[
        { prefix: 'Authentication identity provider', label: 'Company directory' },
        { prefix: 'Authentication identity provider', label: 'ad' },
      ].map(({ prefix, label }) => (
        <Tag key={label} title={`${prefix}: ${label}`}>
          <Tag.Prefix>{prefix}:</Tag.Prefix>
          <Tag.Label>{label}</Tag.Label>
          <Tag.Remove aria-label={`Remove ${prefix}: ${label}`} onClick={noop} />
        </Tag>
      ))}
    </div>
  ),
};
