import { Checkbox, type CheckboxChecked, IconButton } from '@/components';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { ChevronDown, MoreVertical, Pen, X } from 'lucide-react';
import { useEffect, useState } from 'preact/hooks';

import { ListItem } from './list-item';

type Story = StoryObj<typeof ListItem>;

export default {
  title: 'Components/ListItem',
  component: ListItem,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ListItem>;

export const ContentVariations: Story = {
  name: 'Content Variations',
  render: () => (
    <div className='w-80 space-y-2'>
      <h3 className='text-sm font-semibold text-subtle mb-2'>Label Only</h3>
      <ListItem>
        <ListItem.Content label='Simple item' />
      </ListItem>
      <ListItem selected>
        <ListItem.Content label='Selected simple item' />
      </ListItem>

      <h3 className='text-sm font-semibold text-subtle mb-2 mt-4'>Label + Description</h3>
      <ListItem>
        <ListItem.Content label='Document.pdf' description='Shared by John Doe' />
      </ListItem>
      <ListItem selected>
        <ListItem.Content label='Presentation.pptx' description='Last modified yesterday' />
      </ListItem>

      <h3 className='text-sm font-semibold text-subtle mb-2 mt-4'>Label + Metadata</h3>
      <ListItem>
        <ListItem.Content label='Image.png' metadata='2.4 MB • PNG Image' />
      </ListItem>
      <ListItem selected>
        <ListItem.Content label='Video.mp4' metadata='156 MB • MP4 Video' />
      </ListItem>

      <h3 className='text-sm font-semibold text-subtle mb-2 mt-4'>Full Content</h3>
      <ListItem>
        <ListItem.Content
          label='Project Report'
          description='Quarterly performance analysis'
          metadata='Modified 2 hours ago • 1.2 MB'
        />
      </ListItem>
      <ListItem selected>
        <ListItem.Content
          label='Meeting Notes'
          description='Team sync discussion points'
          metadata='Created today • 245 KB'
        />
      </ListItem>
    </div>
  ),
};

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => {
    const [checked1, setChecked1] = useState<CheckboxChecked>(false);
    const [checked2, setChecked2] = useState<CheckboxChecked>(true);
    const [checked3, setChecked3] = useState<CheckboxChecked>('indeterminate');

    return (
      <div className='w-80 space-y-2'>
        <h3 className='text-sm font-semibold text-subtle mb-2'>File Browser Example</h3>

        <ListItem>
          <ListItem.Left>
            <Checkbox checked={checked1} onCheckedChange={setChecked1} aria-label='Select folder' />
            <IconButton icon={ChevronDown} variant='text' aria-label='Expand' className='w-5 h-5' />
          </ListItem.Left>
          <ListItem.Content label='src' description='Source files' metadata='12 items' />
        </ListItem>

        <ListItem selected>
          <ListItem.Left>
            <Checkbox checked={checked2} onCheckedChange={setChecked2} aria-label='Select file' />
          </ListItem.Left>
          <ListItem.Content label='index.tsx' description='Main entry point' metadata='Modified 2 hours ago' />
          <ListItem.Right>
            <IconButton icon={Pen} variant='text' size='sm' aria-label='Edit' />
            <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
          </ListItem.Right>
        </ListItem>

        <ListItem>
          <ListItem.Left>
            <Checkbox checked={checked3} onCheckedChange={setChecked3} aria-label='Select file' />
          </ListItem.Left>
          <ListItem.Content label='package.json' description='Dependencies and scripts' metadata='2.4 KB' />
          <ListItem.Right>
            <span className='text-xs text-subtle'>JSON</span>
            <IconButton icon={X} variant='text' size='sm' aria-label='Delete' />
          </ListItem.Right>
        </ListItem>
      </div>
    );
  },
};

export const Interactive: Story = {
  name: 'Interactive Selection',
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(1);

    const items = [
      { label: 'Dashboard', description: 'Overview and analytics', metadata: 'Home page' },
      { label: 'Projects', description: 'Manage your projects', metadata: '8 active projects' },
      { label: 'Team', description: 'Collaborate with others', metadata: '12 members' },
      { label: 'Settings', description: 'Configure preferences', metadata: 'Last updated today' },
      { label: 'Help & Support', description: 'Get assistance', metadata: 'Documentation' },
    ];

    return (
      <div className='w-80 space-y-1'>
        <h3 className='text-sm font-semibold text-subtle mb-3'>Click to select items</h3>
        {items.map((item, index) => (
          <ListItem
            key={index}
            selected={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
            className='cursor-pointer'
          >
            <ListItem.Content {...item} />
          </ListItem>
        ))}
      </div>
    );
  },
};

type PlaygroundArgs = {
  selected: boolean;
  label: string;
  description: string;
  metadata: string;
  showLeft: boolean;
  leftType: 'checkbox' | 'expand' | 'both';
  showRight: boolean;
  rightType: 'actions' | 'badge' | 'both';
};

export const InteractivePlayground: StoryObj<PlaygroundArgs> = {
  name: 'Interactive Playground',
  args: {
    selected: false,
    label: 'Playground Item',
    description: 'This is a description',
    metadata: 'Metadata text',
    showLeft: true,
    leftType: 'both',
    showRight: true,
    rightType: 'both',
  },
  argTypes: {
    selected: {
      control: 'boolean',
      description: 'Controls the selected state',
    },
    label: {
      control: 'text',
      description: 'Main label text',
    },
    description: {
      control: 'text',
      description: 'Description text',
    },
    metadata: {
      control: 'text',
      description: 'Metadata text',
    },
    showLeft: {
      control: 'boolean',
      description: 'Show left section',
    },
    leftType: {
      control: 'select',
      options: ['checkbox', 'expand', 'both'],
      description: 'Type of left section content',
    },
    showRight: {
      control: 'boolean',
      description: 'Show right section',
    },
    rightType: {
      control: 'select',
      options: ['actions', 'badge', 'both'],
      description: 'Type of right section content',
    },
  },
  render: args => {
    const [selected, setSelected] = useState(args.selected);
    const [checked, setChecked] = useState<CheckboxChecked>(false);

    useEffect(() => {
      setSelected(args.selected);
    }, [args.selected]);

    return (
      <div className='w-96'>
        <ListItem selected={selected} onClick={() => setSelected(!selected)} className='cursor-pointer'>
          {args.showLeft && (
            <ListItem.Left>
              {(args.leftType === 'checkbox' || args.leftType === 'both') && (
                <Checkbox checked={checked} onCheckedChange={setChecked} aria-label='Select item' />
              )}
              {(args.leftType === 'expand' || args.leftType === 'both') && (
                <IconButton icon={ChevronDown} variant='text' aria-label='Expand' className='w-5 h-5' />
              )}
            </ListItem.Left>
          )}
          <ListItem.Content label={args.label} description={args.description} metadata={args.metadata} />
          {args.showRight && (
            <ListItem.Right>
              {(args.rightType === 'badge' || args.rightType === 'both') && (
                <span className='text-xs text-subtle'>BADGE</span>
              )}
              {(args.rightType === 'actions' || args.rightType === 'both') && (
                <>
                  <IconButton icon={Pen} variant='text' size='sm' aria-label='Edit' />
                  <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
                </>
              )}
            </ListItem.Right>
          )}
        </ListItem>
      </div>
    );
  },
};
