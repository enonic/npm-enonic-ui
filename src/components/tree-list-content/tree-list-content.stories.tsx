import type { Meta, StoryObj } from '@storybook/preact-vite';
import { File, FileText, Folder, Image, Loader2, Video } from 'lucide-react';
import { type ReactElement, type ReactNode, useCallback, useState } from 'react';
import { ListItem } from '@/components';
import { useTreeListContent } from '@/providers/tree-list-content-provider';
import { cn } from '@/utils';
import { type FlatTreeNode, ROOT_PARENT_ID, type TreeData, type TreeItems, TreeListContent } from './tree-list-content';

type Story = StoryObj<typeof TreeListContent>;

type ContentType = 'folder' | 'file' | 'image' | 'video' | 'document';
type ContentStatus = 'online' | 'offline' | 'scheduled' | 'expired';
const colorByStatus: Record<ContentStatus, string> = {
  online: 'text-green-600',
  offline: 'text-black',
  scheduled: 'text-gray-600',
  expired: 'text-gray-400',
};

let MAX_ITEMS = 35;

const TREE_ROOT_CLASS =
  'h-120 w-145 focus-within:outline-none focus-within:ring-1 focus-within:ring-bdr-strong focus-within:ring-offset-1 focus-within:ring-offset-surface-neutral';

function setMaxItems(value: number): void {
  MAX_ITEMS = value;
}

let BATCH_SIZE = 10;

function setBatchSize(value: number): void {
  BATCH_SIZE = value;
}

type ContentData = TreeData & {
  name: string;
  description: string;
  icon: ReactNode;
  status: ContentStatus;
  type: ContentType;
};

const typesWithIcons: Record<ContentType, ReactNode> = {
  folder: <Folder />,
  file: <File />,
  image: <Image />,
  video: <Video />,
  document: <FileText />,
};

export default {
  title: 'Components/TreeListContent (Legacy)',
  component: TreeListContent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TreeListContent>;

const itemToView = (node: FlatTreeNode<ContentData>): ReactNode => {
  const item = node.data;

  return (
    <ListItem className={'px-0 py-0'}>
      <ListItem.DefaultContent icon={item.icon} label={`${item.name} (${item.id})`} description={item.description} />
      <ListItem.Right>
        <div className={cn(colorByStatus[item.status], 'text-sm capitalize', 'group-data-[tone=inverse]:text-alt')}>
          {item.status}
        </div>
      </ListItem.Right>
    </ListItem>
  );
};

const generateItem = (id: string, type: ContentType): ContentData => {
  return {
    id,
    type: type,
    icon: typesWithIcons[type],
    hasChildren: type === 'folder',
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
    description: `This is a ${type} item.`,
    status: (['online', 'offline', 'scheduled', 'expired'] as ContentStatus[])[Math.floor(Math.random() * 4)],
  };
};

const generateItems = (
  offset = 0,
  parentId?: string,
  batchSize = BATCH_SIZE,
  allowedTypes: ContentType[] = ['folder', 'file', 'image', 'video', 'document'],
): ContentData[] => {
  const newItems: ContentData[] = [];

  for (let i = 0; i < batchSize; i++) {
    const index = offset + i;
    const id = parentId ? `${parentId}-${index}` : `${index}`;
    const type: ContentType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];

    newItems.push(generateItem(id, type));
  }

  return newItems;
};

async function fetchChildren(
  parentId: string | undefined,
  offset = 0,
): Promise<{ items: ContentData[]; hasMore: boolean }> {
  await new Promise(r => setTimeout(r, 500));
  const total = MAX_ITEMS;
  const items: ContentData[] = generateItems(offset, parentId, Math.min(BATCH_SIZE, total - offset));
  return { items, hasMore: offset + items.length < total };
}

type ProjectData = {
  id: string;
  country: string;
  hasChildren: boolean;
  label: string;
  projectName?: string;
  language?: string;
  hasIcon?: boolean;
  href?: string;
  isLayer?: boolean;
};

const renderProject = (item: FlatTreeNode<ProjectData>): ReactElement => {
  return (
    <TreeListContent.Row<ProjectData> key={item.id} item={item}>
      <TreeListContent.RowLeft>
        <TreeListContent.RowLevelSpacer level={item.level} />
        <TreeListContent.RowExpandControl data={item} />
      </TreeListContent.RowLeft>
      <TreeListContent.RowContent>
        <div className='flex items-center gap-2'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full border-1 text-sm'>
            {item.data.country}
          </span>
          <div className='min-w-0 text-left'>
            <h1 className='truncate font-semibold text-base group-data-[tone=inverse]:text-alt'>
              {item.data.label}
              {item.data.language ? (
                <span className='text-sm text-subtle group-data-[tone=inverse]:text-alt'>{` (${item.data.language})`}</span>
              ) : null}
            </h1>
            <p className='truncate text-sm text-subtle group-data-[tone=inverse]:text-alt'>{item.data.projectName}</p>
          </div>
        </div>
      </TreeListContent.RowContent>
    </TreeListContent.Row>
  );
};

function createProjects(): TreeItems<ProjectData> {
  const projects: ProjectData[] = [
    {
      id: 'features',
      country: 'US',
      hasChildren: true,
      label: `Features`,
      projectName: `features`,
      language: 'en',
    },
    {
      id: 'superhero',
      country: 'GB',
      hasChildren: false,
      label: `Superhero Blog`,
      projectName: `sample-blog`,
      language: 'en',
    },
    {
      id: 'fe-de',
      country: 'DE',
      hasChildren: true,
      label: `Features`,
      projectName: `fe-de`,
      language: 'de',
    },
    {
      id: 'fe-nl',
      country: 'NL',
      hasChildren: false,
      label: `Features`,
      projectName: `fe-nl`,
      language: 'nl',
    },
    {
      id: 'fe-au',
      country: 'AU',
      hasChildren: false,
      label: `Features`,
      projectName: `fe-au`,
      language: 'de-au',
    },
  ];

  const nodes: Record<string, ProjectData> = {};
  const children: Record<string, string[]> = {};
  const hasMore: Record<string, boolean> = {};

  projects.forEach(p => {
    nodes[p.id] = p;
  });

  children[ROOT_PARENT_ID] = ['features', 'superhero'];
  children.features = ['fe-de', 'fe-nl'];
  children['fe-de'] = ['fe-au'];

  return {
    nodes,
    children,
    hasMore,
  };
}

const isMediaItem = (item: ContentData): boolean => {
  return item.type === 'document' || item.type === 'image' || item.type === 'video';
};

const renderNode = (item: FlatTreeNode<ContentData>): React.ReactElement => {
  return (
    <TreeListContent.Row<ContentData> key={item.id} item={item}>
      <TreeListContent.RowLeft>
        <TreeListContent.RowSelectionControl data={item} />
        <TreeListContent.RowLevelSpacer level={item.level} />
        <TreeListContent.RowExpandControl data={item} />
      </TreeListContent.RowLeft>
      <TreeListContent.RowContent>
        <ListItem className={'px-0 py-0'}>
          <ListItem.DefaultContent
            icon={item.data.icon}
            label={`${item.data.name} (${item.id})`}
            description={item.data.description}
          />
          <ListItem.Right>
            <div
              className={cn(
                colorByStatus[item.data.status],
                'text-sm capitalize',
                'group-data-[tone=inverse]:text-alt',
              )}
            >
              {item.data.status}
            </div>
          </ListItem.Right>
        </ListItem>
      </TreeListContent.RowContent>
    </TreeListContent.Row>
  );
};

export const Uncontrolled: Story = {
  name: 'Examples / Uncontrolled',
  render: () => {
    setMaxItems(50);
    setBatchSize(10);

    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    return (
      <div className={''}>
        <div className={'mb-4 font-bold'}>Uncontrolled Tree, all properties are controlled by the component</div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <TreeListContent<ContentData>
            className={TREE_ROOT_CLASS}
            fetchChildren={fetchChildren}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'multiple'}
          >
            <TreeListContent.Container>
              <TreeListContent.Items renderNode={renderNode} />
            </TreeListContent.Container>
          </TreeListContent>
        </div>
      </div>
    );
  },
};

export const ProjectSelection: Story = {
  name: 'Examples / Projects (Controlled Items)',
  render: () => {
    setMaxItems(10);
    setBatchSize(10);

    const [expandedItems, setExpandedItems] = useState<ReadonlySet<string>>(new Set(['features', 'fe-de']));
    const [items, setItems] = useState<TreeItems<ProjectData>>(createProjects());
    const fetchProjects = useCallback(
      async (_parentId: string | undefined, _offset = 0): Promise<{ items: ProjectData[]; hasMore: boolean }> => {
        return Promise.resolve({ items: [], hasMore: false });
      },
      [],
    );

    return (
      <div className={''}>
        <div className={'mb-4 font-bold'}>Projects</div>
        <div className={'mb-4'}>Project items are set and stored outside of the component</div>
        <div className={'flex flex-col gap-5 border border-bdr-soft px-5 pt-2.5 pb-10'}>
          <TreeListContent<ProjectData>
            items={items}
            onItemsChange={setItems}
            className={TREE_ROOT_CLASS}
            fetchChildren={fetchProjects}
            expanded={expandedItems}
            onExpandedChange={setExpandedItems}
            selectionMode={'single'}
          >
            <TreeListContent.Container>
              <TreeListContent.Items renderNode={renderProject} />
            </TreeListContent.Container>
          </TreeListContent>
        </div>
      </div>
    );
  },
};

export const MediaOnly: Story = {
  name: 'Features / Media Only Selection',
  render: () => {
    setMaxItems(50);
    setBatchSize(10);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    const renderItem = (item: FlatTreeNode<ContentData>): React.ReactElement => {
      return (
        <TreeListContent.Row<ContentData> key={item.id} item={item}>
          <TreeListContent.RowLeft>
            <TreeListContent.RowSelectionControl data={item} />
            <TreeListContent.RowLevelSpacer level={item.level} />
            <TreeListContent.RowExpandControl data={item} />
          </TreeListContent.RowLeft>
          <TreeListContent.RowContent>{itemToView(item)}</TreeListContent.RowContent>
        </TreeListContent.Row>
      );
    };

    return (
      <div className={''}>
        <div className={'mb-4'}>+ Selection/Navigation/Expand/Collapse/Lazy loaded children</div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <TreeListContent<ContentData>
            className={TREE_ROOT_CLASS}
            fetchChildren={fetchChildren}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'multiple'}
            isItemSelectable={isMediaItem}
          >
            <TreeListContent.Container>
              <TreeListContent.Items renderNode={renderItem} />
            </TreeListContent.Container>
          </TreeListContent>
        </div>
      </div>
    );
  },
};

export const CustomRendering: Story = {
  name: 'Features / Custom Rows Rendering',
  render: () => {
    setMaxItems(50);
    setBatchSize(10);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    const TreeListRowsWithContext = (): React.ReactElement => {
      const { items } = useTreeListContent<ContentData>();

      return (
        <>
          {items.map(item => (
            <TreeListContent.Row<ContentData> key={item.id} item={item}>
              <TreeListContent.RowLeft>
                <TreeListContent.RowLevelSpacer level={item.level} />
                <TreeListContent.RowExpandControl data={item} />
              </TreeListContent.RowLeft>
              <TreeListContent.RowContent>
                {item.nodeType === 'loading' ? (
                  <div className='flex items-center gap-2'>
                    <Loader2 className='size-4 animate-spin' />
                    <span>Loading...</span>
                  </div>
                ) : (
                  itemToView(item)
                )}
              </TreeListContent.RowContent>
            </TreeListContent.Row>
          ))}
        </>
      );
    };

    return (
      <div className={''}>
        <div className={'mb-4 font-bold'}>Fully controlling rows rendering via context hook</div>
        <div className={'mb-4'}>Multi-selection / No checkboxes</div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <TreeListContent<ContentData>
            className={TREE_ROOT_CLASS}
            fetchChildren={fetchChildren}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'multiple'}
          >
            <TreeListContent.Container>
              <TreeListRowsWithContext />
            </TreeListContent.Container>
          </TreeListContent>
        </div>
      </div>
    );
  },
};
