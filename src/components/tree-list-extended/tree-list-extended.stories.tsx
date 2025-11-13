import { Checkbox, type CheckboxChecked, IconButton, ListItem } from '@/components';
import { TreeListExtContent } from '@/components/tree-list-extended/tree-list-extended';
import { TreeList, type TreeNode } from '@/components/tree-list/tree-list';
import { cn } from '@/utils';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { File, FileText, Folder, Image, RefreshCcw, Video } from 'lucide-react';
import { type ReactNode, useCallback, useState } from 'react';
import { useEffect } from 'react';

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

function setMaxItems(value: number): void {
  MAX_ITEMS = value;
}

let BATCH_SIZE = 10;

function setBatchSize(value: number): void {
  BATCH_SIZE = value;
}

type ContentData = TreeNode & {
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
  title: 'Components/TreeListExt',
  component: TreeList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TreeList>;

const itemToView = (item: ContentData): ReactNode => {
  return (
    <ListItem className={'px-0 py-0'}>
      <ListItem.DefaultContent icon={item.icon} label={`${item.name} (${item.id})`} description={item.description} />
      <ListItem.Right>
        {item.hasChildren && <div>{`${item.children?.length ?? 0}/${MAX_ITEMS}`}</div>}
        <div className={cn(colorByStatus[item.status], 'text-sm capitalize', 'group-data-[tone=inverse]:text-alt')}>
          {item.status}
        </div>
      </ListItem.Right>
    </ListItem>
  );
};

const generateItems = (offset = 0, parentNode?: ContentData, batchSize = BATCH_SIZE): ContentData[] => {
  const newItems: ContentData[] = [];

  for (let i = 0; i < batchSize; i++) {
    const index = offset + i;
    const id = parentNode ? `${parentNode.id}-${index}` : `${index}`;
    const type: ContentType = (['folder', 'file', 'image', 'video', 'document'] as ContentType[])[
      Math.floor(Math.random() * 5)
    ];

    newItems.push({
      id,
      path: parentNode ? [...parentNode.path, parentNode.id] : [],
      type: type,
      icon: typesWithIcons[type],
      hasChildren: type === 'folder',
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
      description: `This is a ${type} item.`,
      status: (['online', 'offline', 'scheduled', 'expired'] as ContentStatus[])[Math.floor(Math.random() * 4)],
    });
  }

  return newItems;
};

async function fetchChildren(
  parentNode: ContentData | undefined,
  offset = 0,
): Promise<{ items: ContentData[]; total: number }> {
  await new Promise(r => setTimeout(r, 400));
  const total = MAX_ITEMS;
  const items: ContentData[] = generateItems(offset, parentNode, Math.min(BATCH_SIZE, total - offset));
  return { items, total };
}

function getRootNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.filter(node => node.path.length === 0);
}

function flattenNodes(nodes: TreeNode[]): TreeNode[] {
  const flatList: TreeNode[] = [];
  const traverse = (nodeList: TreeNode[]): void => {
    for (const node of nodeList) {
      flatList.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };
  traverse(nodes);
  return flatList;
}

export const LazyVirtualizedTree: Story = {
  name: 'External Lib: Virtualization',
  render: () => {
    setMaxItems(100);
    setBatchSize(10);
    const [items, setItems] = useState<ContentData[]>([]);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    const refresh = (): void => {
      setItems(generateItems());
    };

    useEffect(() => {
      refresh();
    }, []);

    const toggleSelectAll = useCallback(
      (checked: CheckboxChecked) => {
        if (checked === true) {
          const allItems = flattenNodes(items);
          setSelection(new Set(allItems.map(item => item.id)));
          setSelectAll(true);
        } else {
          setSelectAll(false);
          setSelection(new Set());
        }
      },
      [items],
    );

    const fetchChildrenAndSelect = async (
      parentNode: ContentData | undefined,
      offset = 0,
    ): Promise<{ items: ContentData[]; total: number }> => {
      const itemsData = await fetchChildren(parentNode, offset);

      if (selectAll) {
        const allItems = [...flattenNodes(items), ...itemsData.items];
        setSelection(new Set(allItems.map(item => item.id)));
      }

      return itemsData;
    };

    const itemToRow = (item: ContentData): React.ReactElement => {
      return (
        <>
          <TreeList.Row<ContentData> key={item.id} item={item}>
            <TreeList.RowLeft>
              <TreeList.RowSelectionControl data={item} />
              <TreeList.RowLevelSpacer level={item.path.length} />
              <TreeList.RowExpandControl data={item} />
            </TreeList.RowLeft>
            <TreeList.RowContent>{itemToView(item)}</TreeList.RowContent>
          </TreeList.Row>
        </>
      );
    };

    return (
      <div className={''}>
        <div>
          <div className={'mb-4'}>
            <span>Using external lib for Virtualization </span>
            <b>(react-viruoso)</b>
          </div>
          <div className={'mb-4'}>+ Virtualization/Lazy Load/Selection/Navigation/Expand/Collapse</div>
        </div>
        <div className={'grow'}>Total root items: {getRootNodes(items).length}</div>
        <div className={'flex flex-col gap-5 px-5 pt-2.5 pb-10 border'}>
          <div className={'flex items-center gap-2.5 pl-2.5'}>
            <Checkbox label='Select all' checked={selectAll} onCheckedChange={toggleSelectAll} />
            <span className={'grow'}></span>
            <IconButton icon={RefreshCcw} variant='text' title='Text variant' onClick={refresh} />
          </div>

          <TreeList<ContentData>
            className={'w-145 h-120'}
            fetchChildren={fetchChildrenAndSelect}
            items={items}
            setItems={setItems}
            selection={selection}
            onSelectionChange={setSelection}
            selectionMode={'multiple'}
          >
            <TreeList.Container>
              <TreeList.Content>
                <TreeListExtContent itemToRow={itemToRow} />
              </TreeList.Content>
            </TreeList.Container>
          </TreeList>
        </div>
      </div>
    );
  },
};
