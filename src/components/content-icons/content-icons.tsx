import { ListItem } from '@/components/list-item/list-item';
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

type DemoItem = {
  key: string;
  label: string;
  description?: string;
  metadata?: string;
  icon: JSX.Element;
};

// This mirrors the mappings you used in your ContentIcon switch.
// No external types or props – just a visual reference.
const ITEMS: DemoItem[] = [
  { key: 'FOLDER', label: 'Folder', description: 'Container for items', icon: <FolderOpen /> },
  { key: 'FRAGMENT', label: 'Fragment', description: 'Reusable page part', icon: <FileChartPie /> },
  { key: 'IMAGE', label: 'Image (legacy)', description: 'Content with image', icon: <FileImage /> },
  { key: 'MEDIA', label: 'Media', description: 'Generic media root', icon: <SquarePlay /> },
  { key: 'MEDIA_ARCHIVE', label: 'Media: Archive', description: 'ZIP / archive files', icon: <Archive /> },
  { key: 'MEDIA_AUDIO', label: 'Media: Audio', description: 'Audio files', icon: <FileMusic /> },
  { key: 'MEDIA_CODE', label: 'Media: Code', description: 'Source code assets', icon: <SquareCode /> },
  { key: 'MEDIA_DATA', label: 'Media: Data', description: 'Data files', icon: <Database /> },
  { key: 'MEDIA_DOCUMENT', label: 'Media: Document', description: 'Docs & office files', icon: <FileText /> },
  { key: 'MEDIA_EXECUTABLE', label: 'Media: Executable', description: 'Executable/binary', icon: <FileTerminal /> },
  { key: 'MEDIA_IMAGE', label: 'Media: Image', description: 'Raster image files', icon: <ImageIcon /> },
  { key: 'MEDIA_PRESENTATION', label: 'Media: Presentation', description: 'Slides & decks', icon: <Presentation /> },
  { key: 'MEDIA_SPREADSHEET', label: 'Media: Spreadsheet', description: 'Tables & sheets', icon: <FileSpreadsheet /> },
  { key: 'MEDIA_TEXT', label: 'Media: Text', description: 'Plain/markup text', icon: <FileType /> },
  { key: 'MEDIA_UNKNOWN', label: 'Media: Unknown', description: 'Other/unknown type', icon: <FileQuestionMark /> },
  { key: 'MEDIA_VECTOR', label: 'Media: Vector', description: 'SVG & vector art', icon: <SplinePointer /> },
  { key: 'MEDIA_VIDEO', label: 'Media: Video', description: 'Video files', icon: <Film /> },
  { key: 'PAGE_TEMPLATE', label: 'Page Template', description: 'Page rendering', icon: <FileCog /> },
  { key: 'SHORTCUT', label: 'Shortcut', description: 'Link to another item', icon: <SquareArrowOutUpRight /> },
  { key: 'SITE', label: 'Site', description: 'Root of a site', icon: <Globe /> },
  { key: 'TEMPLATE_FOLDER', label: 'Template Folder', description: 'Holds templates', icon: <FolderCog /> },
  { key: 'UNSTRUCTURED', label: 'Unstructured', description: 'Generic content', icon: <Shapes /> },
  { key: 'DEFAULT', label: 'Default', description: 'Default', icon: <FileIcon /> },
];

export const ContentIcons = (): JSX.Element => {
  return (
    <div className='mx-auto'>
      <p className='mb-3 text-sm text-subtle'>Content icons</p>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1'>
        {ITEMS.map((it, idx) => (
          <ListItem key={it.key}>
            <ListItem.Left>{it.icon}</ListItem.Left>
            <ListItem.Content
              label={it.label}
              description={it.description}
              metadata={
                idx === 0 ? 'Home page' : idx === 1 ? '8 active projects' : idx === 2 ? '12 members' : undefined
              }
            />
            <ListItem.Right>{/* empty on purpose */}</ListItem.Right>
          </ListItem>
        ))}
      </div>
    </div>
  );
};

export default ContentIcons;
