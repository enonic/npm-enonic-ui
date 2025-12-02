import type { Meta, StoryObj } from '@storybook/preact-vite';
import { File, FileText, Folder, Image, Loader2, Video } from 'lucide-react';
import { type ReactElement, type ReactNode, useCallback, useState } from 'react';
import { Button, Input, ListItem, ROOT_PARENT_ID } from '@/components';
import { type FlatTreeNode, type TreeData, type TreeItems, TreeList } from '@/components/tree-list/tree-list';
import { useTreeList } from '@/providers';
import { cn } from '@/utils';

type Story = StoryObj<typeof TreeList>;

type ContentType = 'folder' | 'file' | 'image' | 'video' | 'document';
type ContentStatus = 'online' | 'offline' | 'scheduled' | 'expired';
const colorByStatus: Record<ContentStatus, string> = {
  online: 'text-green-600',
  offline: 'text-black',
  scheduled: 'text-gray-600',
  expired: 'text-gray-400',
};

let MAX_ITEMS = 35;

function getTreeRootClassName(): string {
  return cn(
    'h-120 w-145 focus-within:outline-none focus-within:ring-1 focus-within:ring-bdr-strong focus-within:ring-offset-1 focus-within:ring-offset-surface-neutral',
  );
}

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
  title: 'Components/TreeList (βeta)',
  component: TreeList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TreeList>;

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
    <TreeList.Row<ProjectData> key={item.id} item={item}>
      <TreeList.RowLeft>
        <TreeList.RowLevelSpacer level={item.level} />
        <TreeList.RowExpandControl data={item} />
      </TreeList.RowLeft>
      <TreeList.RowContent>
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
      </TreeList.RowContent>
    </TreeList.Row>
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

const getAvailableFeaturesBlock = (): ReactNode => {
  return (
    <div>
      <div className={'mb-4'}>+ Selection/Navigation/Expand/Collapse/Lazy loaded children</div>
      <div className={'mb-4'}>- No virtualization</div>
    </div>
  );
};

const renderNode = (item: FlatTreeNode<ContentData>): React.ReactElement => {
  return (
    <TreeList.Row<ContentData> key={item.id} item={item}>
      <TreeList.RowLeft>
        <TreeList.RowSelectionControl data={item} />
        <TreeList.RowLevelSpacer level={item.level} />
        <TreeList.RowExpandControl data={item} />
      </TreeList.RowLeft>
      <TreeList.RowContent>
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
      </TreeList.RowContent>
    </TreeList.Row>
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
        {getAvailableFeaturesBlock()}
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <div className={'flex items-center gap-2.5 pl-2.5'}>
            <span className={'grow'}></span>
          </div>

          <TreeList<ContentData>
            className={getTreeRootClassName()}
            fetchChildren={fetchChildren}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'multiple'}
          >
            <TreeList.Container>
              <TreeList.Content renderNode={renderNode} />
            </TreeList.Container>
          </TreeList>
        </div>
      </div>
    );
  },
};

export const ControlledExpanded: Story = {
  name: 'Examples / Controlled Expanded Items',
  render: () => {
    setMaxItems(10);
    setBatchSize(10);

    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [expandedItems, setExpandedItems] = useState<ReadonlySet<string>>(new Set(['0', '3']));
    const doFetchChildren = useCallback(
      async (parentId: string | undefined, offset = 0): Promise<{ items: ContentData[]; hasMore: boolean }> => {
        if (!parentId) {
          return {
            items: generateItems(offset, parentId, 5, ['folder']),
            hasMore: false,
          };
        }

        return fetchChildren(parentId, offset);
      },
      [],
    );

    return (
      <div className={''}>
        <div className={'mb-4 font-bold'}>Expanding items on load: (Folder 0) and (Folder 3)</div>
        <div className={'mb-4'}>Expanding items are controlled by the client</div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <TreeList<ContentData>
            className={getTreeRootClassName()}
            fetchChildren={doFetchChildren}
            expanded={expandedItems}
            onExpandedChange={setExpandedItems}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'multiple'}
          >
            <TreeList.Container>
              <TreeList.Content renderNode={renderNode} />
            </TreeList.Container>
          </TreeList>
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
          <TreeList<ProjectData>
            items={items}
            onItemsChange={setItems}
            className={getTreeRootClassName()}
            fetchChildren={fetchProjects}
            expanded={expandedItems}
            onExpandedChange={setExpandedItems}
            selectionMode={'single'}
          >
            <TreeList.Container>
              <TreeList.Content renderNode={renderProject} />
            </TreeList.Container>
          </TreeList>
        </div>
      </div>
    );
  },
};

export const CheckboxesOnTheRightTree: Story = {
  name: 'Examples / Checkboxes on the right side',
  render: () => {
    setMaxItems(50);
    setBatchSize(10);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    const renderItem = (item: FlatTreeNode<ContentData>): React.ReactElement => {
      return (
        <TreeList.Row<ContentData> key={item.id} item={item}>
          <TreeList.RowLeft>
            <TreeList.RowLevelSpacer level={item.level} />
            <TreeList.RowExpandControl data={item} />
          </TreeList.RowLeft>
          <TreeList.RowContent>{itemToView(item)}</TreeList.RowContent>
          <TreeList.RowRight>
            <TreeList.RowSelectionControl data={item} />
          </TreeList.RowRight>
        </TreeList.Row>
      );
    };

    return (
      <div className={''}>
        <div className={'mb-4'}>Checkboxes on the right side</div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <div className={'flex items-center gap-2.5 pl-2.5'}>
            <span className={'grow'}></span>
          </div>

          <TreeList<ContentData>
            className={getTreeRootClassName()}
            fetchChildren={fetchChildren}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'multiple'}
          >
            <TreeList.Container>
              <TreeList.Content renderNode={renderItem} />
            </TreeList.Container>
          </TreeList>
        </div>
      </div>
    );
  },
};

const createContentItems = (totalRoot: number): TreeItems<ContentData> => {
  const contents = generateItems(0, undefined, totalRoot);
  const nodes: Record<string, ContentData> = {};
  const children: Record<string, string[]> = {};
  const hasMore: Record<string, boolean> = {};

  contents.forEach(c => {
    nodes[c.id] = c;
  });

  children[ROOT_PARENT_ID] = contents.map(c => c.id);
  hasMore[ROOT_PARENT_ID] = true;

  return {
    nodes,
    children,
    hasMore,
  };
};

export const LongListTree: Story = {
  name: 'Examples / Long List (1000+ items)',
  render: () => {
    setMaxItems(1024);
    setBatchSize(50);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    const [items, setItems] = useState<TreeItems<ContentData>>(createContentItems(1000));

    const renderItem = (item: FlatTreeNode<ContentData>): React.ReactElement => {
      return (
        <TreeList.Row<ContentData> key={item.id} item={item}>
          <TreeList.RowLeft>
            <TreeList.RowLevelSpacer level={item.level} />
            <TreeList.RowExpandControl data={item} />
          </TreeList.RowLeft>
          <TreeList.RowContent>{itemToView(item)}</TreeList.RowContent>
          <TreeList.RowRight>
            <TreeList.RowSelectionControl data={item} />
          </TreeList.RowRight>
        </TreeList.Row>
      );
    };

    return (
      <div className={''}>
        <div className={'mb-4 font-bold'}>1000+ items (without virtualization!)</div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <div className={'flex items-center gap-2.5 pl-2.5'}>
            <span className={'grow'}></span>
          </div>

          <TreeList<ContentData>
            items={items}
            onItemsChange={setItems}
            className={getTreeRootClassName()}
            fetchChildren={fetchChildren}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'multiple'}
          >
            <TreeList.Container>
              <TreeList.Content renderNode={renderItem} />
            </TreeList.Container>
          </TreeList>
        </div>
      </div>
    );
  },
};

export const CRUD: Story = {
  name: 'Examples / Create Update Delete',
  render: () => {
    setMaxItems(1024);
    setBatchSize(50);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [items, setItems] = useState<TreeItems<ContentData>>(createContentItems(100));
    const [inputValue, setInputValue] = useState<string>('');
    const [expandedItems, setExpandedItems] = useState<ReadonlySet<string>>(new Set());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setInputValue(e.currentTarget.value);
    };

    const addNewItem = useCallback((): void => {
      const selectedItemId: string | undefined = items.nodes[Array.from(selection)[0]]?.id;
      const newItem = generateItem(`new-item-${Date.now()}`, 'file');

      if (selectedItemId) {
        // add items after the selected item
        const newNodes = { ...items.nodes, [newItem.id]: newItem };
        const newChildren = { ...items.children };
        const newHasMore = { ...items.hasMore };
        if (newChildren[selectedItemId]) {
          // selected item has children, add as its first child
          newChildren[selectedItemId] = [newItem.id, ...newChildren[selectedItemId]];

          setItems({
            nodes: newNodes,
            children: newChildren,
            hasMore: newHasMore,
          });
        }
      } else {
        // add as a new item in the root
        const newNodes = { ...items.nodes, [newItem.id]: newItem };
        const newChildren = { ...items.children };
        newChildren[ROOT_PARENT_ID] = [newItem.id, ...(newChildren[ROOT_PARENT_ID] ?? [])];
        const newHasMore = { ...items.hasMore };

        setItems({
          nodes: newNodes,
          children: newChildren,
          hasMore: newHasMore,
        });
      }
    }, [items, selection]);

    const removeSelectedItem = useCallback((): void => {
      const itemToDelete = items.nodes[Array.from(selection)[0]]?.id;

      if (itemToDelete) {
        const newNodes = { ...items.nodes };
        delete newNodes[itemToDelete];
        const newChildren = { ...items.children };
        newChildren[ROOT_PARENT_ID] = newChildren[ROOT_PARENT_ID]?.filter(id => id !== itemToDelete);
        const newHasMore = { ...items.hasMore };
        delete newHasMore[itemToDelete];

        setItems({
          nodes: newNodes,
          children: newChildren,
          hasMore: newHasMore,
        });

        setSelection(new Set());
      }
    }, [items, selection]);

    const updateSelectedItem = useCallback((): void => {
      const itemToUpdate = items.nodes[Array.from(selection)[0]];
      if (itemToUpdate) {
        const updatedItem = {
          ...itemToUpdate,
          name: inputValue,
        };
        const newNodes = {
          ...items.nodes,
          [itemToUpdate.id]: updatedItem,
        };
        setItems({
          nodes: newNodes,
          children: { ...items.children },
          hasMore: { ...items.hasMore },
        });

        setInputValue('');
      }
    }, [items, selection, inputValue]);

    const hasSelectedItemLoadedChildren = useCallback((): boolean => {
      const itemId = Array.from(selection)[0];
      return (items.children[itemId] ?? []).length > 0;
    }, [items, selection]);

    const renderItem = (item: FlatTreeNode<ContentData>): React.ReactElement => {
      return (
        <TreeList.Row<ContentData> key={item.id} item={item}>
          <TreeList.RowLeft>
            <TreeList.RowLevelSpacer level={item.level} />
            <TreeList.RowExpandControl data={item} />
          </TreeList.RowLeft>
          <TreeList.RowContent>{itemToView(item)}</TreeList.RowContent>
          <TreeList.RowRight>
            <TreeList.RowSelectionControl data={item} />
          </TreeList.RowRight>
        </TreeList.Row>
      );
    };

    return (
      <div className={''}>
        <div className={'mb-4 font-bold'}>Create / Remove / Update</div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <div className={'flex items-center gap-2.5 pl-2.5'}>
            <span className={'grow'}></span>
          </div>

          <div>
            <Input
              label='Change name of a selected node'
              disabled={selection.size === 0}
              className={'grow'}
              value={inputValue}
              onChange={handleChange}
            />
          </div>

          <div className='flex items-center justify-between gap-2'>
            <Button
              disabled={selection.size > 0 && !hasSelectedItemLoadedChildren()}
              className='h-10 w-30 border'
              label='Add'
              onClick={addNewItem}
            />
            <Button
              disabled={selection.size === 0 || inputValue.length === 0}
              className='h-10 w-30 shrink-0 border'
              label='Update'
              onClick={updateSelectedItem}
            />
            <Button
              disabled={selection.size === 0}
              className='h-10 w-30 border'
              label='Remove'
              onClick={removeSelectedItem}
            />
          </div>

          <TreeList<ContentData>
            items={items}
            onItemsChange={setItems}
            className={getTreeRootClassName()}
            fetchChildren={fetchChildren}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'single'}
            expanded={expandedItems}
            onExpandedChange={setExpandedItems}
          >
            <TreeList.Container>
              <TreeList.Content renderNode={renderItem} />
            </TreeList.Container>
          </TreeList>
        </div>
      </div>
    );
  },
};

export const ErrorOnLoad: Story = {
  name: 'Features / Errors handling',
  render: () => {
    setMaxItems(50);
    setBatchSize(10);

    const doFetchChildren = useCallback(
      async (parentId: string | undefined, offset = 0): Promise<{ items: ContentData[]; hasMore: boolean }> => {
        if (Math.random() < 0.5) {
          throw new Error('Random simulated error');
        }

        return fetchChildren(parentId, offset);
      },
      [],
    );

    return (
      <div className={''}>
        <div className={'mb-4 font-bold'}>Random errors on load</div>
        <div className={'mb-4'}>Displays default error handling for a failed children fetch </div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <div className={'flex items-center gap-2.5 pl-2.5'}>
            <span className={'grow'}></span>
          </div>

          <TreeList<ContentData>
            className={getTreeRootClassName()}
            fetchChildren={doFetchChildren}
            selectionMode={'multiple'}
          >
            <TreeList.Container>
              <TreeList.Content renderNode={renderNode} />
            </TreeList.Container>
          </TreeList>
        </div>
      </div>
    );
  },
};

export const CustomError: Story = {
  name: 'Features / Custom Loading Error',
  render: () => {
    setMaxItems(50);
    setBatchSize(10);

    const doFetchChildren = useCallback(
      async (parentId: string | undefined, offset = 0): Promise<{ items: ContentData[]; hasMore: boolean }> => {
        if (Math.random() < 0.5) {
          throw new Error('Random simulated error');
        }

        return fetchChildren(parentId, offset);
      },
      [],
    );

    const renderError = (_item: FlatTreeNode<ContentData>): React.ReactElement => {
      return <div className={'flex h-8 w-full items-center gap-4 bg-red-200 p-1'}>Click to retry loading</div>;
    };

    return (
      <div className={''}>
        <div className={'mb-4 font-bold'}>Custom loading error block</div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <div className={'flex items-center gap-2.5 pl-2.5'}>
            <span className={'grow'}></span>
          </div>

          <TreeList<ContentData>
            className={getTreeRootClassName()}
            fetchChildren={doFetchChildren}
            selectionMode={'multiple'}
          >
            <TreeList.Container>
              <TreeList.Content renderNode={renderNode} renderError={renderError} />
            </TreeList.Container>
          </TreeList>
        </div>
      </div>
    );
  },
};

export const CustomLoading: Story = {
  name: 'Features / Custom Loading Indicator',
  render: () => {
    setMaxItems(50);
    setBatchSize(10);

    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const renderLoading = (_item: FlatTreeNode<ContentData>): React.ReactElement => {
      return (
        <div className={'flex items-center gap-4 bg-gray-200'}>
          <Loader2 className='size-4 animate-spin text-main' />
          Custom loading element...
        </div>
      );
    };

    return (
      <div className={''}>
        <div className={'mb-4 font-bold'}>Custom loading indicator</div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <div className={'flex items-center gap-2.5 pl-2.5'}>
            <span className={'grow'}></span>
          </div>

          <TreeList<ContentData>
            className={getTreeRootClassName()}
            fetchChildren={fetchChildren}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'multiple'}
          >
            <TreeList.Container>
              <TreeList.Content renderNode={renderNode} renderLoading={renderLoading} />
            </TreeList.Container>
          </TreeList>
        </div>
      </div>
    );
  },
};

export const CustomRendering: Story = {
  name: 'Features / Control rows rendering',
  render: () => {
    setMaxItems(50);
    setBatchSize(10);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    const TreeListRowsWithContext = (): React.ReactElement => {
      const { items } = useTreeList<ContentData>();

      return (
        <>
          {items.map(item => (
            <TreeList.Row<ContentData> key={item.id} item={item}>
              <TreeList.RowLeft>
                <TreeList.RowLevelSpacer level={item.level} />
                <TreeList.RowExpandControl data={item} />
              </TreeList.RowLeft>
              <TreeList.RowContent>
                {item.nodeType === 'loading' ? <TreeList.LoadingRow key={item.id} item={item} /> : itemToView(item)}
              </TreeList.RowContent>
            </TreeList.Row>
          ))}
        </>
      );
    };

    return (
      <div className={''}>
        <div className={'mb-4 font-bold'}>Fully controlling rows rendering via context hook</div>
        <div className={'mb-4'}>Multi-selection / No checkboxes</div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <div className={'flex items-center gap-2.5 pl-2.5'}>
            <span className={'grow'}></span>
          </div>

          <TreeList<ContentData>
            className={getTreeRootClassName()}
            fetchChildren={fetchChildren}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'multiple'}
          >
            <TreeList.Container>
              <TreeListRowsWithContext />
            </TreeList.Container>
          </TreeList>
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
        <TreeList.Row<ContentData> key={item.id} item={item}>
          <TreeList.RowLeft>
            <TreeList.RowSelectionControl data={item} />
            <TreeList.RowLevelSpacer level={item.level} />
            <TreeList.RowExpandControl data={item} />
          </TreeList.RowLeft>
          <TreeList.RowContent>{itemToView(item)}</TreeList.RowContent>
        </TreeList.Row>
      );
    };

    return (
      <div className={''}>
        <div className={'mb-4'}>+ Selection/Navigation/Expand/Collapse/Lazy loaded children</div>
        <div className={'flex flex-col gap-5 border px-5 pt-2.5 pb-10'}>
          <TreeList<ContentData>
            className={getTreeRootClassName()}
            fetchChildren={fetchChildren}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'multiple'}
            isItemSelectable={isMediaItem}
          >
            <TreeList.Container>
              <TreeList.Content renderNode={renderItem} />
            </TreeList.Container>
          </TreeList>
        </div>
      </div>
    );
  },
};
