import { IconButton } from '@/components';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { File, FileText, Folder, Image, MoreVertical, Package, Pen, Settings, User, Video, X } from 'lucide-react';
import { useEffect, useState } from 'preact/hooks';

import { SelectableListItem } from './selectable-list-item';

type Story = StoryObj<typeof SelectableListItem>;

export default {
  title: 'Components/SelectableListItem',
  component: SelectableListItem,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof SelectableListItem>;

export const Examples: Story = {
  name: 'Examples / Selection',
  render: () => (
    <div className='w-96 space-y-2'>
      <SelectableListItem
        icon={<File className='w-6 h-6' />}
        label='Report.pdf'
        description='Shared by John'
        metadata='PDF Document • 12 KB'
        defaultChecked={false}
      >
        <IconButton icon={X} variant='text' size='sm' aria-label='Delete' />
        <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
      </SelectableListItem>
      <SelectableListItem
        icon={<FileText className='w-6 h-6' />}
        label='Meeting Notes.docx'
        description='Last edited yesterday'
        metadata='Word Document • 8.5 KB'
        defaultChecked={true}
      >
        <IconButton icon={Pen} variant='text' size='sm' aria-label='Edit' />
        <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
      </SelectableListItem>
      <SelectableListItem
        readOnly={true}
        icon={<Folder className='w-6 h-6' />}
        label='System Files'
        description='Protected folder'
        metadata='Folder • 5 items'
        defaultChecked={'indeterminate'}
      >
        <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
        <IconButton icon={X} variant='text' size='sm' aria-label='Delete' />
      </SelectableListItem>
      <SelectableListItem
        selected
        icon={<Image className='w-6 h-6' />}
        label='Logo.png'
        description='Company branding'
        metadata='PNG Image • 2.4 MB'
        defaultChecked={false}
      >
        <IconButton icon={X} variant='text' size='sm' aria-label='Delete' />
        <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
      </SelectableListItem>

      <SelectableListItem
        selected
        icon={<Video className='w-6 h-6' />}
        label='Tutorial.mp4'
        description='Product demo'
        metadata='MP4 Video • 156 MB'
        defaultChecked={'indeterminate'}
      >
        <IconButton icon={Pen} variant='text' size='sm' aria-label='Edit' />
        <IconButton icon={X} variant='text' size='sm' aria-label='Delete' />
      </SelectableListItem>

      <SelectableListItem
        readOnly={true}
        selected
        icon={<Package className='w-6 h-6' />}
        label='Archive.zip'
        description='Read-only backup'
        metadata='ZIP Archive • 45 MB'
        defaultChecked={'indeterminate'}
      >
        <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
        <IconButton icon={X} variant='text' size='sm' aria-label='Delete' />
      </SelectableListItem>
    </div>
  ),
};

export const ContentVariations: Story = {
  name: 'Features / Content Variations',
  render: () => (
    <div className='w-96 space-y-4'>
      <h3 className='text-sm font-semibold text-subtle mb-2'>Label Only</h3>
      <div className='space-y-2'>
        <SelectableListItem label='Simple item' defaultChecked={false} />
        <SelectableListItem label='Selected item' defaultChecked={true} />
      </div>

      <h3 className='text-sm font-semibold text-subtle mb-2'>Label + Icon</h3>
      <div className='space-y-2'>
        <SelectableListItem icon={<File className='w-6 h-6' />} label='Document.pdf' defaultChecked={false} />
        <SelectableListItem icon={<Folder className='w-6 h-6' />} label='Projects' defaultChecked={true} />
      </div>

      <h3 className='text-sm font-semibold text-subtle mb-2'>Label + Description</h3>
      <div className='space-y-2'>
        <SelectableListItem label='Meeting notes' description='Team sync discussion' defaultChecked={false} />
        <SelectableListItem label='Project plan' description='Q4 roadmap and goals' defaultChecked={true} />
      </div>

      <h3 className='text-sm font-semibold text-subtle mb-2'>Label + Description + Icon</h3>
      <div className='space-y-2'>
        <SelectableListItem
          icon={<FileText className='w-6 h-6' />}
          label='Report.docx'
          description='Quarterly financial report'
          defaultChecked={false}
        />
        <SelectableListItem
          icon={<Image className='w-6 h-6' />}
          label='Logo.png'
          description='Company branding asset'
          defaultChecked={true}
        />
      </div>

      <h3 className='text-sm font-semibold text-subtle mb-2'>All Elements</h3>
      <div className='space-y-2'>
        <SelectableListItem
          icon={<Video className='w-6 h-6' />}
          label='Tutorial.mp4'
          description='Product onboarding video'
          metadata='156 MB • MP4 Video'
          defaultChecked={false}
        >
          <IconButton icon={Pen} variant='text' size='sm' aria-label='Edit' />
          <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
        </SelectableListItem>
        <SelectableListItem
          icon={<Package className='w-6 h-6' />}
          label='Archive.zip'
          description='Project backup files'
          metadata='45.7 MB • ZIP Archive'
          defaultChecked={true}
        >
          <IconButton icon={X} variant='text' size='sm' aria-label='Delete' />
          <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
        </SelectableListItem>
        <SelectableListItem
          icon={<Settings className='w-6 h-6' />}
          label='Config.json'
          description='Application settings'
          metadata='2.4 KB • JSON'
          defaultChecked={'indeterminate'}
          readOnly
        >
          <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
        </SelectableListItem>
      </div>
    </div>
  ),
};

type PlaygroundArgs = {
  checked: boolean | 'indeterminate';
  selected: boolean;
  readOnly: boolean;
  label: string;
  description: string;
  metadata: string;
  showIcon: boolean;
  iconType: 'file' | 'folder' | 'image' | 'video' | 'user';
  showActions: boolean;
};

export const Interactive: StoryObj<PlaygroundArgs> = {
  name: 'Features / Interactive',
  args: {
    checked: false,
    selected: false,
    readOnly: false,
    label: 'Report.pdf',
    description: 'Shared by John',
    metadata: '12 KB',
    showIcon: true,
    iconType: 'file',
    showActions: true,
  },
  argTypes: {
    checked: {
      control: 'select',
      options: [false, true, 'indeterminate'],
      description: 'Controls the checked state',
    },
    selected: {
      control: 'boolean',
      description: 'Controls the selected background state',
    },
    readOnly: {
      control: 'boolean',
      description: 'Makes the checkbox read-only',
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
      description: 'Show icon',
    },
    iconType: {
      control: 'select',
      options: ['file', 'folder', 'image', 'video', 'user'],
      description: 'Type of icon to display',
    },
    showActions: {
      control: 'boolean',
      description: 'Show action buttons',
    },
  },
  render: args => {
    const [checked, setChecked] = useState<boolean | 'indeterminate'>(args.checked);

    useEffect(() => {
      setChecked(args.checked);
    }, [args.checked]);

    const iconMap = {
      file: <File className='w-6 h-6' />,
      folder: <Folder className='w-6 h-6' />,
      image: <Image className='w-6 h-6' />,
      video: <Video className='w-6 h-6' />,
      user: <User className='w-6 h-6' />,
    };

    return (
      <div className='w-96'>
        <SelectableListItem
          icon={args.showIcon ? iconMap[args.iconType] : undefined}
          selected={args.selected}
          readOnly={args.readOnly}
          label={args.label}
          description={args.description}
          metadata={args.metadata}
          checked={checked}
          onCheckedChange={(newChecked: boolean | 'indeterminate') => {
            setChecked(newChecked);
          }}
        >
          {args.showActions && (
            <>
              <IconButton icon={Pen} variant='text' size='sm' aria-label='Edit' />
              <IconButton icon={MoreVertical} variant='text' size='sm' aria-label='More options' />
            </>
          )}
        </SelectableListItem>
      </div>
    );
  },
};
