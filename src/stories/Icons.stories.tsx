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
import type { ReactElement } from 'react';
import { ListItem, type ListItemDefaultContentProps } from '@/components/list-item/list-item';
import {
  CircleDiscIcon,
  FilledCircleAlertIcon,
  FilledCircleCheckIcon,
  FilledCircleInfoIcon,
  FilledCircleXIcon,
  FilledOctagonAlertIcon,
  FilledSquareCheckIcon,
  FilledSquareMinusIcon,
} from '@/icons';

export default {
  title: 'Design/Icons',
  parameters: { layout: 'centered' },
} satisfies Meta;

type Story = StoryObj;

const IconListItem = ({
  icon,
  label,
  description,
}: Pick<ListItemDefaultContentProps, 'label' | 'description' | 'icon'>): ReactElement => (
  <ListItem>
    <ListItem.Left>{icon}</ListItem.Left>
    <ListItem.DefaultContent label={label} description={description} />
  </ListItem>
);

export const CustomIcons: Story = {
  render: () => (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
      <IconListItem
        icon={<FilledSquareCheckIcon />}
        label='Filled Square Check'
        description='Filled square with check'
      />
      <IconListItem
        icon={<FilledSquareMinusIcon />}
        label='Filled Square Minus'
        description='Filled square with minus'
      />
      <IconListItem
        icon={<FilledOctagonAlertIcon />}
        label='Filled Octagon Alert'
        description='Filled octagon with alert'
      />
      <IconListItem
        icon={<FilledCircleAlertIcon />}
        label='Filled Circle Alert'
        description='Filled circle with alert'
      />
      <IconListItem icon={<FilledCircleInfoIcon />} label='Filled Circle Info' description='Filled circle with info' />
      <IconListItem
        icon={<FilledCircleCheckIcon />}
        label='Filled Circle Check'
        description='Filled circle with check'
      />
      <IconListItem icon={<FilledCircleXIcon />} label='Filled Circle X' description='Filled circle with x' />
      <IconListItem icon={<CircleDiscIcon />} label='Circle Disc' description='Circle with a disc inside' />
    </div>
  ),
};

export const ContentIcons: Story = {
  render: () => (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
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
  ),
};
