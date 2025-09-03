import { ListItem } from '@/components/list-item/list-item';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import {
  Archive,
  Database,
  FileChartPie,
  FileCog,
  FileIcon,
  FileImage,
  FileMusic,
  FileQuestionMark,
  FileSpreadsheet,
  FileTerminal,
  FileText,
  FileType,
  Film,
  FolderCog,
  FolderOpen,
  Globe,
  ImageIcon,
  Presentation,
  Shapes,
  SplinePointer,
  SquareArrowOutUpRight,
  SquareCode,
  SquarePlay,
} from 'lucide-react';
import type { JSX } from 'react';

export default {
  title: 'Design/Icons',
  parameters: { layout: 'centered' },
} satisfies Meta;

type Story = StoryObj;

const IconListItem = ({
  icon,
  label,
  description,
}: {
  icon: JSX.Element;
  label: string;
  description?: string;
}): JSX.Element => (
  <ListItem>
    <ListItem.Left>{icon}</ListItem.Left>
    <ListItem.Content label={label} description={description} />
    <ListItem.Right>{/* intentionally empty */}</ListItem.Right>
  </ListItem>
);

export const IconsGrid: Story = {
  render: () => (
    <div className='mx-auto'>
      <p className='mb-3 text-sm text-subtle'>Content icons</p>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
        <IconListItem icon={<FolderOpen />} label='Folder' description='Container for items' />
        <IconListItem icon={<FileChartPie />} label='Fragment' description='Reusable page part' />
        <IconListItem icon={<FileImage />} label='Image (legacy)' description='Content with image' />
        <IconListItem icon={<SquarePlay />} label='Media' description='Generic media root' />
        <IconListItem icon={<Archive />} label='Media: Archive' description='ZIP / archive files' />
        <IconListItem icon={<FileMusic />} label='Media: Audio' description='Audio files' />
        <IconListItem icon={<SquareCode />} label='Media: Code' description='Source code assets' />
        <IconListItem icon={<Database />} label='Media: Data' description='Data files' />
        <IconListItem icon={<FileText />} label='Media: Document' description='Docs & office files' />
        <IconListItem icon={<FileTerminal />} label='Media: Executable' description='Executable/binary' />
        <IconListItem icon={<ImageIcon />} label='Media: Image' description='Raster image files' />
        <IconListItem icon={<Presentation />} label='Media: Presentation' description='Slides & decks' />
        <IconListItem icon={<FileSpreadsheet />} label='Media: Spreadsheet' description='Tables & sheets' />
        <IconListItem icon={<FileType />} label='Media: Text' description='Plain/markup text' />
        <IconListItem icon={<FileQuestionMark />} label='Media: Unknown' description='Other/unknown type' />
        <IconListItem icon={<SplinePointer />} label='Media: Vector' description='SVG & vector art' />
        <IconListItem icon={<Film />} label='Media: Video' description='Video files' />
        <IconListItem icon={<FileCog />} label='Page Template' description='Page rendering' />
        <IconListItem icon={<SquareArrowOutUpRight />} label='Shortcut' description='Link to another item' />
        <IconListItem icon={<Globe />} label='Site' description='Root of a site' />
        <IconListItem icon={<FolderCog />} label='Template Folder' description='Holds templates' />
        <IconListItem icon={<Shapes />} label='Unstructured' description='Generic content' />
        <IconListItem icon={<FileIcon />} label='Default' description='Default' />
      </div>
    </div>
  ),
};
