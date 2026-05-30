import {
  Bone,
  ChevronDown,
  Dog,
  File,
  FileText,
  Folder,
  Heart,
  HelpCircle,
  Home,
  Image,
  MoreVertical,
  Package,
  Pen,
  Settings,
  TriangleAlert,
  Users,
  Video,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'preact/hooks';

import { Checkbox, type CheckboxChecked } from '@/components/checkbox';
import { IconButton } from '@/components/icon-button';
import { cn } from '@/utils';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { ListItem } from './list-item';

type Story = StoryObj<typeof ListItem>;

export default {
  title: 'Components/ListItem',
  component: ListItem,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ListItem>;

export const Selection: Story = {
  name: 'Examples / Selection',
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState<number>(1);

    const items = [
      {
        icon: <Home className='size-6' />,
        label: 'Dashboard',
        description: 'Overview and analytics',
        metadata: 'Home page',
      },
      {
        icon: <Folder className='size-6' />,
        label: 'Projects',
        description: 'Manage your projects',
        metadata: '8 active projects',
      },
      {
        icon: <Users className='size-6' />,
        label: 'Team',
        description: 'Collaborate with others',
        metadata: '12 members',
      },
      {
        icon: <Settings className='size-6' />,
        label: 'Settings',
        description: 'Configure preferences',
        metadata: 'Last updated today',
      },
      {
        icon: <HelpCircle className='size-6' />,
        label: 'Help & Support',
        description: 'Get assistance',
        metadata: 'Documentation',
      },
    ];

    return (
      <div className='w-80 space-y-1'>
        <h3 className='text-subtle mb-3 text-sm font-semibold'>Click to select items</h3>
        {items.map((item, index) => (
          <ListItem
            key={item.label}
            selected={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
            className='cursor-pointer'
          >
            <ListItem.DefaultContent {...item} />
          </ListItem>
        ))}
      </div>
    );
  },
};

export const ContentVariations: Story = {
  name: 'Features / Content Variations',
  render: () => (
    <div className='w-80 space-y-2'>
      <h3 className='text-subtle mb-2 text-sm font-semibold'>Label Only</h3>
      <ListItem>
        <ListItem.DefaultContent label='Simple item' />
      </ListItem>
      <ListItem>
        <ListItem.DefaultContent icon={<FileText className='size-6' />} label='File.txt' />
      </ListItem>
      <ListItem selected>
        <ListItem.DefaultContent label='Selected simple item' />
      </ListItem>

      <h3 className='text-subtle mt-4 mb-2 text-sm font-semibold'>Label + Description</h3>
      <ListItem>
        <ListItem.DefaultContent label='Spreadsheet.xlsx' description='Financial Q4 report' />
      </ListItem>
      <ListItem>
        <ListItem.DefaultContent
          icon={<FileText className='size-6' />}
          label='Document.pdf'
          description='Shared by John Doe'
        />
      </ListItem>
      <ListItem selected>
        <ListItem.DefaultContent
          icon={<File className='size-6' />}
          label='Presentation.pptx'
          description='Last modified yesterday'
        />
      </ListItem>

      <h3 className='text-subtle mt-4 mb-2 text-sm font-semibold'>Label + Metadata</h3>
      <ListItem>
        <ListItem.DefaultContent label='Archive.zip' metadata='15.3 MB • ZIP Archive' />
      </ListItem>
      <ListItem>
        <ListItem.DefaultContent icon={<Image className='size-6' />} label='Image.png' metadata='2.4 MB • PNG Image' />
      </ListItem>
      <ListItem selected>
        <ListItem.DefaultContent icon={<Video className='size-6' />} label='Video.mp4' metadata='156 MB • MP4 Video' />
      </ListItem>

      <h3 className='text-subtle mt-4 mb-2 text-sm font-semibold'>Full Content</h3>
      <ListItem>
        <ListItem.DefaultContent
          label='Design System'
          description='Component library documentation'
          metadata='Updated yesterday • 3.4 MB'
        />
      </ListItem>
      <ListItem>
        <ListItem.DefaultContent
          icon={<FileText className='size-6' />}
          label='Project Report'
          description='Quarterly performance analysis'
          metadata='Modified 2 hours ago • 1.2 MB'
        />
      </ListItem>
      <ListItem selected>
        <ListItem.DefaultContent
          label='User Research'
          description='Interview transcripts and findings'
          metadata='Created last week • 512 KB'
        />
      </ListItem>
      <ListItem selected>
        <ListItem.DefaultContent
          icon={<FileText className='size-6' />}
          label='Meeting Notes'
          description='Team sync discussion points'
          metadata='Created today • 245 KB'
        />
      </ListItem>
    </div>
  ),
};

export const WithIcons: Story = {
  name: 'Features / With Icons',
  render: () => {
    const [checked1, setChecked1] = useState<CheckboxChecked>(false);
    const [checked2, setChecked2] = useState<CheckboxChecked>(true);
    const [checked3, setChecked3] = useState<CheckboxChecked>('indeterminate');

    return (
      <div className='w-80 space-y-2'>
        <h3 className='text-subtle mb-2 text-sm font-semibold'>File Browser Example</h3>

        <ListItem>
          <ListItem.Left>
            <Checkbox checked={checked1} onCheckedChange={setChecked1} aria-label='Select folder' />
            <IconButton icon={ChevronDown} variant='text' aria-label='Expand' className='size-5' />
          </ListItem.Left>
          <ListItem.DefaultContent
            icon={<Folder className='size-6' />}
            label='src'
            description='Source files'
            metadata='12 items'
          />
          <ListItem.Right>
            <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
          </ListItem.Right>
        </ListItem>

        <ListItem selected>
          <ListItem.Left>
            <Checkbox checked={checked2} onCheckedChange={setChecked2} aria-label='Select file' />
          </ListItem.Left>
          <ListItem.DefaultContent
            icon={<FileText className='size-6' />}
            label='index.tsx'
            description='Main entry point'
            metadata='Modified 2 hours ago'
          />
          <ListItem.Right>
            <IconButton icon={Pen} variant='solid' size='sm' aria-label='Edit' />
            <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
          </ListItem.Right>
        </ListItem>

        <ListItem>
          <ListItem.Left>
            <Checkbox checked={checked3} onCheckedChange={setChecked3} aria-label='Select file' />
          </ListItem.Left>
          <ListItem.DefaultContent
            icon={<Package className='size-6' />}
            label='package.json'
            description='Dependencies and scripts'
            metadata='2.4 KB'
          />
          <ListItem.Right>
            <span className='text-subtle text-xs'>JSON</span>
            <IconButton icon={X} variant='text' size='sm' aria-label='Delete' />
          </ListItem.Right>
        </ListItem>
      </div>
    );
  },
};

export const CustomContent: Story = {
  name: 'Features / Custom Content',
  render: () => (
    <div className='w-80 space-y-2'>
      <h3 className='text-subtle mb-2 text-sm font-semibold'>Custom Styled Content</h3>

      <ListItem className='rounded-xl p-1.5 outline-1 outline-purple-200'>
        <ListItem.Content className='rounded-lg bg-linear-to-r from-blue-50 to-purple-50 p-2'>
          <div className='flex items-center gap-3'>
            <div className='flex size-12 items-center justify-center rounded-full bg-blue-500'>
              <Dog className='size-10 text-white' stroke-width={1} />
            </div>
            <div>
              <h3 className='font-bold text-blue-900'>Argus</h3>
              <p className='text-sm text-blue-700'>Good boy</p>
            </div>
            <div className='ml-auto flex gap-2'>
              <Bone className='size-5 text-slate-400' />
              <Heart className='size-5 text-red-400' fill='currentColor' />
            </div>
          </div>
        </ListItem.Content>
      </ListItem>
    </div>
  ),
};

export const ClickableContent: Story = {
  name: 'Features / Wrapped Default Content',
  render: () => (
    <ListItem>
      <ListItem.Left>
        <div className='size-2 animate-pulse rounded-full bg-red-500' />
      </ListItem.Left>
      <ListItem.Content>
        <button
          className={cn([
            'hover:bg-surface-neutral-hover active:bg-surface-selected active:**:text-rev',
            '-m-1 cursor-pointer rounded-sm p-1',
          ])}
        >
          <ListItem.DefaultContent
            icon={<TriangleAlert className='size-8 text-red-600' strokeWidth={1.5} />}
            label='Critical Update'
            description='Immediate attention required'
          />
        </button>
      </ListItem.Content>
    </ListItem>
  ),
};

type PlaygroundArgs = {
  selected: boolean;
  label: string;
  description: string;
  metadata: string;
  showIcon: boolean;
  showLeft: boolean;
  leftType: 'checkbox' | 'expand' | 'both';
  showRight: boolean;
  rightType: 'actions' | 'badge' | 'both';
};

export const Interactive: StoryObj<PlaygroundArgs> = {
  name: 'Features / Interactive',
  args: {
    selected: false,
    label: 'Playground Item',
    description: 'This is a description',
    metadata: 'Metadata text',
    showIcon: true,
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
    showIcon: {
      control: 'boolean',
      description: 'Show icon in content',
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
        <ListItem
          selected={selected}
          onClick={() => setSelected(!selected)}
          className='cursor-pointer'
          style={selected ? { '--color-ring-offset': 'var(--color-surface-selected)' } : undefined}
        >
          {args.showLeft && (
            <ListItem.Left>
              {(args.leftType === 'checkbox' || args.leftType === 'both') && (
                <Checkbox checked={checked} onCheckedChange={setChecked} aria-label='Select item' />
              )}
              {(args.leftType === 'expand' || args.leftType === 'both') && (
                <IconButton icon={ChevronDown} variant='text' aria-label='Expand' className='size-5' />
              )}
            </ListItem.Left>
          )}
          <ListItem.DefaultContent
            icon={args.showIcon ? <File className='size-6' /> : undefined}
            label={args.label}
            description={args.description}
            metadata={args.metadata}
          />
          {args.showRight && (
            <ListItem.Right>
              {(args.rightType === 'badge' || args.rightType === 'both') && (
                <span className={cn('text-subtle text-xs', selected && 'text-rev')}>BADGE</span>
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
