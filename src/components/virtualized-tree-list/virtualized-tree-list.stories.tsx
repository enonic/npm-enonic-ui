import type { Meta, StoryObj } from '@storybook/preact-vite';
import { File, Folder, Pencil, Trash2 } from 'lucide-react';
import type React from 'react';
import { forwardRef, type ReactElement, useMemo, useRef, useState } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { Button, ListItem } from '@/components';
import { type FlatNode, VirtualizedTreeList } from './virtualized-tree-list';

type Story = StoryObj<typeof VirtualizedTreeList>;

export default {
  title: 'Components/VirtualizedTreeList',
  component: VirtualizedTreeList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VirtualizedTreeList>;

const TREE_ROOT_CLASS = 'h-80 w-100';
const STYLED_TREE_ROOT_CLASS = 'h-80 w-100 rounded-sm border border-bdr-subtle shadow-sm';

// Custom Virtuoso components for padding and gap styling
// Scroller handles padding (List's padding gets overwritten by Virtuoso's dynamic inline styles)
// Must be defined outside component to prevent remounting on each render
const virtuosoComponents = {
  Scroller: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ style, children, ...props }, ref) => (
    <div ref={ref} {...props} style={style} className='*:p-1'>
      {children}
    </div>
  )),
  List: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ style, children, ...props }, ref) => (
    <div ref={ref} {...props} style={style} className='flex flex-col gap-y-1.5'>
      {children}
    </div>
  )),
};

//
// * Helper Types & Data
//

type TreeNodeData = {
  label: string;
  icon: 'folder' | 'file';
};

type TreeDataSource = {
  id: string;
  label: string;
  icon: 'folder' | 'file';
  children?: TreeDataSource[];
};

// Sample hierarchical data
const sampleTreeData: TreeDataSource[] = [
  {
    id: '1',
    label: 'Documents',
    icon: 'folder',
    children: [
      {
        id: '1-1',
        label: 'Work',
        icon: 'folder',
        children: [
          { id: '1-1-1', label: 'Report.pdf', icon: 'file' },
          { id: '1-1-2', label: 'Budget.xlsx', icon: 'file' },
          { id: '1-1-3', label: 'Presentation.pptx', icon: 'file' },
        ],
      },
      {
        id: '1-2',
        label: 'Personal',
        icon: 'folder',
        children: [
          { id: '1-2-1', label: 'Resume.docx', icon: 'file' },
          { id: '1-2-2', label: 'CoverLetter.pdf', icon: 'file' },
        ],
      },
    ],
  },
  {
    id: '2',
    label: 'Pictures',
    icon: 'folder',
    children: [
      {
        id: '2-1',
        label: 'Vacation',
        icon: 'folder',
        children: [
          { id: '2-1-1', label: 'Beach.jpg', icon: 'file' },
          { id: '2-1-2', label: 'Mountain.jpg', icon: 'file' },
        ],
      },
      { id: '2-2', label: 'Profile.png', icon: 'file' },
    ],
  },
  { id: '3', label: 'readme.txt', icon: 'file' },
];

// Flatten tree data into flat nodes
function flattenTree(
  nodes: TreeDataSource[],
  expanded: ReadonlySet<string>,
  parentId: string | null = null,
  level = 1,
): FlatNode<TreeNodeData>[] {
  const result: FlatNode<TreeNodeData>[] = [];

  for (const node of nodes) {
    const hasChildren = !!(node.children && node.children.length > 0);
    const isExpanded = expanded.has(node.id);

    result.push({
      id: node.id,
      data: { label: node.label, icon: node.icon },
      level,
      parentId,
      hasChildren,
      isExpanded,
    });

    if (hasChildren && isExpanded && node.children) {
      result.push(...flattenTree(node.children, expanded, node.id, level + 1));
    }
  }

  return result;
}

// Generate large flat dataset for virtualization demo
function generateLargeDataset(count: number): FlatNode<TreeNodeData>[] {
  const result: FlatNode<TreeNodeData>[] = [];

  for (let i = 0; i < count; i++) {
    result.push({
      id: `item-${i}`,
      data: {
        label: `Item ${i}`,
        icon: 'file',
      },
      level: 1,
      parentId: null,
      hasChildren: false,
      isExpanded: false,
    });
  }

  return result;
}

//
// * Icon Helper
//

const getIcon = (iconType: 'folder' | 'file'): ReactElement => (iconType === 'folder' ? <Folder /> : <File />);

//
// * Flat List
//

export const FlatList: Story = {
  name: 'Basics / Flat List',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    const flatItems: FlatNode<TreeNodeData>[] = [
      {
        id: 'item-1',
        data: { label: 'First Item', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: 'item-2',
        data: { label: 'Second Item', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: 'item-3',
        data: { label: 'Third Item', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: 'item-4',
        data: { label: 'Fourth Item', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: 'item-5',
        data: { label: 'Fifth Item', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
    ];

    return (
      <div>
        <div className='mb-4 font-bold'>Flat List</div>
        <div className='mb-4 text-sm text-subtle'>Simple virtualized list without hierarchy or expand controls</div>
        <VirtualizedTreeList
          items={flatItems}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          virtuosoRef={virtuosoRef}
          aria-label='Simple list'
          className={TREE_ROOT_CLASS}
        >
          {({ items, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData>>
              ref={virtuosoRef}
              data={items}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row {...itemProps}>
                    <VirtualizedTreeList.RowContent>
                      <span className='text-sm'>{node.data.label}</span>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Basic
//

export const Basic: Story = {
  name: 'Examples / Basic',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2']));

    const handleExpand = (id: string): void => {
      setExpanded(prev => new Set([...prev, id]));
    };

    const handleCollapse = (id: string): void => {
      setExpanded(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

    const flatNodes = useMemo(() => flattenTree(sampleTreeData, expanded), [expanded]);

    return (
      <div>
        <div className='mb-4 font-bold'>Basic Virtualized TreeList</div>
        <div className='mb-4 text-sm text-subtle'>
          Virtualized tree with keyboard navigation. Use arrow keys to navigate, Enter/Space to select.
        </div>
        <VirtualizedTreeList
          items={flatNodes}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          onExpand={handleExpand}
          onCollapse={handleCollapse}
          virtuosoRef={virtuosoRef}
          aria-label='File browser'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData>>
              ref={virtuosoRef}
              data={items}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row {...itemProps}>
                    <VirtualizedTreeList.RowLeft>
                      <VirtualizedTreeList.RowLevelSpacer level={node.level} />
                      <VirtualizedTreeList.RowExpandControl
                        expanded={node.isExpanded}
                        hasChildren={node.hasChildren}
                        onToggle={() => (node.isExpanded ? handleCollapse(node.id) : handleExpand(node.id))}
                        selected={itemProps.selected}
                      />
                    </VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowContent>
                      <ListItem className='px-0 py-0'>
                        <ListItem.DefaultContent icon={getIcon(node.data.icon)} label={node.data.label} />
                      </ListItem>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Large Dataset
//

export const LargeDataset: Story = {
  name: 'Examples / Large Dataset',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [activeId, setActiveId] = useState<string | null>(null);

    const flatNodes = useMemo(() => generateLargeDataset(10000), []);

    return (
      <div>
        <div className='mb-4 font-bold'>Large Dataset</div>
        <div className='mb-4 text-sm text-subtle'>
          10,000 items demonstrating virtualization performance. Only visible items are rendered in the DOM.
          <br />
          Active: {activeId ?? 'none'} | Selected: {Array.from(selection).slice(0, 3).join(', ')}
          {selection.size > 3 ? ` (+${selection.size - 3} more)` : ''}
        </div>
        <VirtualizedTreeList
          items={flatNodes}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          active={activeId}
          onActiveChange={setActiveId}
          virtuosoRef={virtuosoRef}
          aria-label='Large file list'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData>>
              ref={virtuosoRef}
              data={items}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row {...itemProps}>
                    <VirtualizedTreeList.RowContent>
                      <ListItem className='px-0 py-0'>
                        <ListItem.DefaultContent icon={getIcon(node.data.icon)} label={node.data.label} />
                      </ListItem>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Multiple Selection
//

export const MultipleSelection: Story = {
  name: 'Features / Range Selection',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '1-1', '2']));

    const handleExpand = (id: string): void => {
      setExpanded(prev => new Set([...prev, id]));
    };

    const handleCollapse = (id: string): void => {
      setExpanded(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

    const flatNodes = useMemo(() => flattenTree(sampleTreeData, expanded), [expanded]);

    return (
      <div>
        <div className='mb-4 font-bold'>Range Selection</div>
        <div className='mb-4 text-sm text-subtle'>
          Click to select, Shift+click for range, Ctrl/Cmd+click to toggle.
          <br />
          Selected: {selection.size > 0 ? Array.from(selection).join(', ') : 'none'}
        </div>
        <VirtualizedTreeList
          items={flatNodes}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='multiple'
          onExpand={handleExpand}
          onCollapse={handleCollapse}
          virtuosoRef={virtuosoRef}
          aria-label='Multi-select file browser'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData>>
              ref={virtuosoRef}
              data={items}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row {...itemProps}>
                    <VirtualizedTreeList.RowLeft>
                      <VirtualizedTreeList.RowLevelSpacer level={node.level} />
                      <VirtualizedTreeList.RowExpandControl
                        expanded={node.isExpanded}
                        hasChildren={node.hasChildren}
                        onToggle={() => (node.isExpanded ? handleCollapse(node.id) : handleExpand(node.id))}
                        selected={itemProps.selected}
                      />
                    </VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowContent>
                      <ListItem className='px-0 py-0'>
                        <ListItem.DefaultContent icon={getIcon(node.data.icon)} label={node.data.label} />
                      </ListItem>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Checkbox Selection
//

export const CheckboxSelection: Story = {
  name: 'Features / Checkbox Selection',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [activeId, setActiveId] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '1-1', '2']));

    const handleExpand = (id: string): void => {
      setExpanded(prev => new Set([...prev, id]));
    };

    const handleCollapse = (id: string): void => {
      setExpanded(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

    const toggleSelection = (id: string): void => {
      const newSelection = new Set(selection);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      setSelection(newSelection);
    };

    const flatNodes = useMemo(() => flattenTree(sampleTreeData, expanded), [expanded]);

    return (
      <div>
        <div className='mb-4 font-bold'>Checkbox Selection</div>
        <div className='mb-4 text-sm text-subtle'>
          Click checkbox to toggle selection. Click row to set active (no selection change).
          <br />
          Active: {activeId ?? 'none'} | Selected: {selection.size > 0 ? Array.from(selection).join(', ') : 'none'}
        </div>
        <VirtualizedTreeList
          items={flatNodes}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='multiple'
          active={activeId}
          onActiveChange={setActiveId}
          onExpand={handleExpand}
          onCollapse={handleCollapse}
          virtuosoRef={virtuosoRef}
          aria-label='Checkbox selection file browser'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData>>
              ref={virtuosoRef}
              data={items}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row
                    {...itemProps}
                    onClick={e => {
                      // Focus tree container for keyboard navigation
                      const tree = e.currentTarget.closest<HTMLElement>('[role="tree"]');
                      tree?.focus();
                      // Only set active, don't change selection
                      setActiveId(node.id);
                    }}
                  >
                    <VirtualizedTreeList.RowLeft>
                      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                      <div
                        onClick={e => {
                          e.stopPropagation();
                          toggleSelection(node.id);
                        }}
                      >
                        <VirtualizedTreeList.RowSelectionControl rowId={node.id} selected={itemProps.selected} />
                      </div>
                      <VirtualizedTreeList.RowLevelSpacer level={node.level} />
                      <VirtualizedTreeList.RowExpandControl
                        expanded={node.isExpanded}
                        hasChildren={node.hasChildren}
                        onToggle={() => (node.isExpanded ? handleCollapse(node.id) : handleExpand(node.id))}
                        selected={itemProps.selected}
                      />
                    </VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowContent>
                      <ListItem className='px-0 py-0'>
                        <ListItem.DefaultContent icon={getIcon(node.data.icon)} label={node.data.label} />
                      </ListItem>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Keyboard Navigation
//

export const KeyboardNavigation: Story = {
  name: 'Behavior / Keyboard Navigation',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2']));
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleExpand = (id: string): void => {
      setExpanded(prev => new Set([...prev, id]));
    };

    const handleCollapse = (id: string): void => {
      setExpanded(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

    const flatNodes = useMemo(() => flattenTree(sampleTreeData, expanded), [expanded]);

    return (
      <div>
        <div className='mb-4 font-bold'>Keyboard Navigation</div>
        <div className='mb-4 text-sm text-subtle'>
          <strong>Try these keys:</strong>
          <br />• Arrow Up/Down - Move between items
          <br />• Arrow Right - Expand or move to first child
          <br />• Arrow Left - Collapse or move to parent
          <br />• Home/End - Jump to first/last item
          <br />• Enter/Space - Select item
        </div>
        <div className='mb-4 text-sm'>
          Active: <strong>{activeId ?? 'none'}</strong> | Selected:{' '}
          <strong>{selection.size > 0 ? Array.from(selection).join(', ') : 'none'}</strong>
        </div>
        <VirtualizedTreeList
          items={flatNodes}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          active={activeId}
          onActiveChange={setActiveId}
          onExpand={handleExpand}
          onCollapse={handleCollapse}
          virtuosoRef={virtuosoRef}
          aria-label='Keyboard navigation demo'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData>>
              ref={virtuosoRef}
              data={items}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row {...itemProps}>
                    <VirtualizedTreeList.RowLeft>
                      <VirtualizedTreeList.RowLevelSpacer level={node.level} />
                      <VirtualizedTreeList.RowExpandControl
                        expanded={node.isExpanded}
                        hasChildren={node.hasChildren}
                        onToggle={() => (node.isExpanded ? handleCollapse(node.id) : handleExpand(node.id))}
                        selected={itemProps.selected}
                      />
                    </VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowContent>
                      <ListItem className='px-0 py-0'>
                        <ListItem.DefaultContent icon={getIcon(node.data.icon)} label={node.data.label} />
                      </ListItem>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Loading State
//

export const WithLoading: Story = {
  name: 'States / Loading Items',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    // Mix of loaded items and loading placeholders
    const items: FlatNode<TreeNodeData | null>[] = [
      {
        id: '1',
        data: { label: 'Documents', icon: 'folder' },
        level: 1,
        parentId: null,
        hasChildren: true,
        isExpanded: true,
      },
      {
        id: '1-1',
        data: { label: 'Work', icon: 'folder' },
        level: 2,
        parentId: '1',
        hasChildren: false,
        isExpanded: false,
      },
      { id: '1-2', data: null, level: 2, parentId: '1', hasChildren: false, isExpanded: false, isLoading: true },
      {
        id: '2',
        data: { label: 'Pictures', icon: 'folder' },
        level: 1,
        parentId: null,
        hasChildren: true,
        isExpanded: true,
      },
      { id: '2-1', data: null, level: 2, parentId: '2', hasChildren: false, isExpanded: false, isLoading: true },
      { id: '2-2', data: null, level: 2, parentId: '2', hasChildren: false, isExpanded: false, isLoading: true },
      {
        id: '3',
        data: { label: 'readme.txt', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
    ];

    return (
      <div>
        <div className='mb-4 font-bold'>Loading Items</div>
        <div className='mb-4 text-sm text-subtle'>Some items are still loading and show a spinner</div>
        <VirtualizedTreeList
          items={items}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          virtuosoRef={virtuosoRef}
          aria-label='File browser with loading'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items: nodeItems, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData | null>>
              ref={virtuosoRef}
              data={nodeItems}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                if (node.isLoading || !node.data) {
                  return <VirtualizedTreeList.RowLoading level={node.level} />;
                }

                const itemProps = getItemProps(index, node);
                const nodeData = node.data;
                return (
                  <VirtualizedTreeList.Row {...itemProps}>
                    <VirtualizedTreeList.RowLeft>
                      <VirtualizedTreeList.RowLevelSpacer level={node.level} />
                      <VirtualizedTreeList.RowExpandControl
                        expanded={node.isExpanded}
                        hasChildren={node.hasChildren}
                        selected={itemProps.selected}
                      />
                    </VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowContent>
                      <ListItem className='px-0 py-0'>
                        <ListItem.DefaultContent icon={getIcon(nodeData.icon)} label={nodeData.label} />
                      </ListItem>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Disabled Items
//

export const WithDisabledItems: Story = {
  name: 'States / Disabled Items',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const disabledIds = new Set(['1-1', '2-1']);

    const items: FlatNode<TreeNodeData>[] = [
      {
        id: '1',
        data: { label: 'Documents', icon: 'folder' },
        level: 1,
        parentId: null,
        hasChildren: true,
        isExpanded: true,
      },
      {
        id: '1-1',
        data: { label: 'Work (disabled)', icon: 'folder' },
        level: 2,
        parentId: '1',
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: '1-2',
        data: { label: 'Personal', icon: 'folder' },
        level: 2,
        parentId: '1',
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: '2',
        data: { label: 'Pictures', icon: 'folder' },
        level: 1,
        parentId: null,
        hasChildren: true,
        isExpanded: true,
      },
      {
        id: '2-1',
        data: { label: 'Vacation (disabled)', icon: 'folder' },
        level: 2,
        parentId: '2',
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: '3',
        data: { label: 'readme.txt', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
    ];

    return (
      <div>
        <div className='mb-4 font-bold'>Disabled Items</div>
        <div className='mb-4 text-sm text-subtle'>Items &quot;Work&quot; and &quot;Vacation&quot; are disabled</div>
        <VirtualizedTreeList
          items={items}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          virtuosoRef={virtuosoRef}
          aria-label='File browser with disabled items'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items: nodeItems, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData>>
              ref={virtuosoRef}
              data={nodeItems}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const isDisabled = disabledIds.has(node.id);
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row {...itemProps} disabled={isDisabled}>
                    <VirtualizedTreeList.RowLeft>
                      <VirtualizedTreeList.RowLevelSpacer level={node.level} />
                    </VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowContent>
                      <ListItem className='px-0 py-0'>
                        <ListItem.DefaultContent icon={getIcon(node.data.icon)} label={node.data.label} />
                      </ListItem>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Placeholder State
//

export const PlaceholderState: Story = {
  name: 'States / Placeholder',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    const items: FlatNode<TreeNodeData | null>[] = [
      {
        id: '1',
        data: { label: 'Real Item', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
      { id: '2', data: null, level: 1, parentId: null, hasChildren: false, isExpanded: false },
      { id: '3', data: null, level: 2, parentId: null, hasChildren: false, isExpanded: false },
    ];

    return (
      <div>
        <div className='mb-4 font-bold'>Placeholder State</div>
        <div className='mb-4 text-sm text-subtle'>RowPlaceholder for known IDs with unknown data</div>
        <VirtualizedTreeList
          items={items}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          virtuosoRef={virtuosoRef}
          aria-label='File browser with placeholders'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items: nodeItems, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData | null>>
              ref={virtuosoRef}
              data={nodeItems}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                if (!node.data) {
                  return <VirtualizedTreeList.RowPlaceholder level={node.level} />;
                }

                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row {...itemProps}>
                    <VirtualizedTreeList.RowContent>
                      <span className='text-sm'>{node.data.label}</span>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Keyboard Range Selection
//

export const KeyboardRangeSelection: Story = {
  name: 'Features / Keyboard Range Selection',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [activeId, setActiveId] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '1-1', '2']));

    const handleExpand = (id: string): void => {
      setExpanded(prev => new Set([...prev, id]));
    };

    const handleCollapse = (id: string): void => {
      setExpanded(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

    const flatNodes = useMemo(() => flattenTree(sampleTreeData, expanded), [expanded]);

    return (
      <div>
        <div className='mb-4 font-bold'>Keyboard Range Selection</div>
        <div className='mb-4 text-sm text-subtle'>
          <strong>Shift+Arrow extends selection:</strong>
          <br />• Click an item to set anchor
          <br />• Shift+Arrow Down/Up to extend selection
          <br />• Ctrl+A toggles select all
          <br />• Escape clears selection
          <br />
          <br />
          Active: {activeId ?? 'none'} | Selected: {selection.size > 0 ? Array.from(selection).join(', ') : 'none'}
        </div>
        <VirtualizedTreeList
          items={flatNodes}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='multiple'
          active={activeId}
          onActiveChange={setActiveId}
          onExpand={handleExpand}
          onCollapse={handleCollapse}
          virtuosoRef={virtuosoRef}
          aria-label='Keyboard range selection demo'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData>>
              ref={virtuosoRef}
              data={items}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row {...itemProps}>
                    <VirtualizedTreeList.RowLeft>
                      <VirtualizedTreeList.RowLevelSpacer level={node.level} />
                      <VirtualizedTreeList.RowExpandControl
                        expanded={node.isExpanded}
                        hasChildren={node.hasChildren}
                        onToggle={() => (node.isExpanded ? handleCollapse(node.id) : handleExpand(node.id))}
                        selected={itemProps.selected}
                      />
                    </VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowContent>
                      <ListItem className='px-0 py-0'>
                        <ListItem.DefaultContent icon={getIcon(node.data.icon)} label={node.data.label} />
                      </ListItem>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Activation Callback
//

export const ActivationCallback: Story = {
  name: 'Features / Activation Callback',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [activeId, setActiveId] = useState<string | null>(null);
    const [lastActivated, setLastActivated] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2']));

    const handleExpand = (id: string): void => {
      setExpanded(prev => new Set([...prev, id]));
    };

    const handleCollapse = (id: string): void => {
      setExpanded(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

    const handleActivate = (id: string): void => {
      setLastActivated(id);
    };

    const flatNodes = useMemo(() => flattenTree(sampleTreeData, expanded), [expanded]);

    return (
      <div>
        <div className='mb-4 font-bold'>Activation Callback</div>
        <div className='mb-4 text-sm text-subtle'>
          <strong>Activate an item:</strong>
          <br />• Press Enter on active item
          <br />• Double-click an item
          <br />
          <br />
          Active: {activeId ?? 'none'} | Last Activated:{' '}
          <strong className='text-accent'>{lastActivated ?? 'none'}</strong>
        </div>
        <VirtualizedTreeList
          items={flatNodes}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          active={activeId}
          onActiveChange={setActiveId}
          onActivate={handleActivate}
          onExpand={handleExpand}
          onCollapse={handleCollapse}
          virtuosoRef={virtuosoRef}
          aria-label='Activation demo'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData>>
              ref={virtuosoRef}
              data={items}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row {...itemProps}>
                    <VirtualizedTreeList.RowLeft>
                      <VirtualizedTreeList.RowLevelSpacer level={node.level} />
                      <VirtualizedTreeList.RowExpandControl
                        expanded={node.isExpanded}
                        hasChildren={node.hasChildren}
                        onToggle={() => (node.isExpanded ? handleCollapse(node.id) : handleExpand(node.id))}
                        selected={itemProps.selected}
                      />
                    </VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowContent>
                      <ListItem className='px-0 py-0'>
                        <ListItem.DefaultContent icon={getIcon(node.data.icon)} label={node.data.label} />
                      </ListItem>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Navigation Only Mode
//

export const NavigationOnlyMode: Story = {
  name: 'Features / Navigation Only Mode',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2']));

    const handleExpand = (id: string): void => {
      setExpanded(prev => new Set([...prev, id]));
    };

    const handleCollapse = (id: string): void => {
      setExpanded(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

    const flatNodes = useMemo(() => flattenTree(sampleTreeData, expanded), [expanded]);

    return (
      <div>
        <div className='mb-4 font-bold'>Navigation Only Mode</div>
        <div className='mb-4 text-sm text-subtle'>
          <code>selectionMode=&quot;none&quot;</code> - Items can be navigated but not selected.
          <br />
          Click or arrow keys only change the active item.
          <br />
          <br />
          Active: {activeId ?? 'none'}
        </div>
        <VirtualizedTreeList
          items={flatNodes}
          selectionMode='none'
          active={activeId}
          onActiveChange={setActiveId}
          onExpand={handleExpand}
          onCollapse={handleCollapse}
          virtuosoRef={virtuosoRef}
          aria-label='Navigation only demo'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData>>
              ref={virtuosoRef}
              data={items}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row {...itemProps}>
                    <VirtualizedTreeList.RowLeft>
                      <VirtualizedTreeList.RowLevelSpacer level={node.level} />
                      <VirtualizedTreeList.RowExpandControl
                        expanded={node.isExpanded}
                        hasChildren={node.hasChildren}
                        onToggle={() => (node.isExpanded ? handleCollapse(node.id) : handleExpand(node.id))}
                        selected={itemProps.selected}
                      />
                    </VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowContent>
                      <ListItem className='px-0 py-0'>
                        <ListItem.DefaultContent icon={getIcon(node.data.icon)} label={node.data.label} />
                      </ListItem>
                    </VirtualizedTreeList.RowContent>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};

//
// * Action Mode (F2)
//

type ActionItemData = {
  label: string;
  description: string;
};

const actionItems: FlatNode<ActionItemData>[] = [
  {
    id: 'doc-1',
    data: { label: 'Project Proposal', description: 'Q4 2024 planning document' },
    level: 1,
    parentId: null,
    hasChildren: false,
    isExpanded: false,
  },
  {
    id: 'doc-2',
    data: { label: 'Budget Report', description: 'Annual financial summary' },
    level: 1,
    parentId: null,
    hasChildren: false,
    isExpanded: false,
  },
  {
    id: 'doc-3',
    data: { label: 'Team Notes', description: 'Meeting minutes and action items' },
    level: 1,
    parentId: null,
    hasChildren: false,
    isExpanded: false,
  },
  {
    id: 'doc-4',
    data: { label: 'Design Specs', description: 'UI component specifications' },
    level: 1,
    parentId: null,
    hasChildren: false,
    isExpanded: false,
  },
  {
    id: 'doc-5',
    data: { label: 'API Documentation', description: 'REST API reference guide' },
    level: 1,
    parentId: null,
    hasChildren: false,
    isExpanded: false,
  },
  {
    id: 'doc-6',
    data: { label: 'Release Notes', description: 'Version changelog and updates' },
    level: 1,
    parentId: null,
    hasChildren: false,
    isExpanded: false,
  },
  {
    id: 'doc-7',
    data: { label: 'User Manual', description: 'End-user documentation' },
    level: 1,
    parentId: null,
    hasChildren: false,
    isExpanded: false,
  },
  {
    id: 'doc-8',
    data: { label: 'Security Policy', description: 'Access control guidelines' },
    level: 1,
    parentId: null,
    hasChildren: false,
    isExpanded: false,
  },
  {
    id: 'doc-9',
    data: { label: 'Style Guide', description: 'Code formatting standards' },
    level: 1,
    parentId: null,
    hasChildren: false,
    isExpanded: false,
  },
  {
    id: 'doc-10',
    data: { label: 'Onboarding Guide', description: 'New developer setup instructions' },
    level: 1,
    parentId: null,
    hasChildren: false,
    isExpanded: false,
  },
];

export const ActionMode: Story = {
  name: 'Features / Action Mode (F2)',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [log, setLog] = useState<string[]>([]);

    const addLog = (msg: string): void => {
      setLog(prev => [...prev.slice(-4), msg]);
    };

    return (
      <div>
        <div className='mb-4 font-bold'>Action Mode (F2)</div>
        <div className='mb-4 rounded-sm bg-surface-primary p-3 text-sm'>
          <p className='mb-2 font-medium'>Keyboard shortcuts:</p>
          <ul className='space-y-1 text-subtle text-xs'>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>F2</kbd> - Enter action mode (focus buttons in row)
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Tab</kbd> - Cycle through buttons
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Tab</kbd> after last button - Exit action mode
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Escape</kbd> - Exit action mode immediately
            </li>
          </ul>
        </div>
        <VirtualizedTreeList
          items={actionItems}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          virtuosoRef={virtuosoRef}
          aria-label='Action mode demo'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items: nodeItems, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<ActionItemData>>
              ref={virtuosoRef}
              data={nodeItems}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row {...itemProps}>
                    <VirtualizedTreeList.RowLeft>
                      <File className='size-4 text-subtle group-data-[tone=inverse]:text-alt' />
                    </VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowContent>
                      <div className='flex flex-col'>
                        <span className='font-medium text-sm'>{node.data.label}</span>
                        <span className='text-subtle text-xs group-data-[tone=inverse]:text-alt'>
                          {node.data.description}
                        </span>
                      </div>
                    </VirtualizedTreeList.RowContent>
                    <VirtualizedTreeList.RowRight>
                      <VirtualizedTreeList.Action>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-6 gap-1 px-2'
                          onClick={() => addLog(`Edit: ${node.data.label}`)}
                        >
                          <Pencil className='size-3' />
                          Edit
                        </Button>
                      </VirtualizedTreeList.Action>
                      <VirtualizedTreeList.Action>
                        <Button
                          variant='solid'
                          size='sm'
                          className='h-6 gap-1 px-2'
                          onClick={() => addLog(`Delete: ${node.data.label}`)}
                        >
                          <Trash2 className='size-3' />
                          Delete
                        </Button>
                      </VirtualizedTreeList.Action>
                    </VirtualizedTreeList.RowRight>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
        <div className='mt-4 rounded-sm bg-surface-primary p-2'>
          <div className='mb-1 font-medium text-xs'>Action Log:</div>
          <pre className='h-20 overflow-auto text-subtle text-xs'>
            {log.length > 0 ? log.join('\n') : '(no actions yet)'}
          </pre>
        </div>
      </div>
    );
  },
};

//
// * Checkboxes on Right
//

export const CheckboxesOnRight: Story = {
  name: 'Examples / Checkboxes on Right',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [activeId, setActiveId] = useState<string | null>(null);

    const toggleSelection = (id: string): void => {
      const newSelection = new Set(selection);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      setSelection(newSelection);
    };

    const items: FlatNode<TreeNodeData>[] = [
      {
        id: 'task-1',
        data: { label: 'Complete documentation', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: 'task-2',
        data: { label: 'Review pull request', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: 'task-3',
        data: { label: 'Fix bug #123', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: 'task-4',
        data: { label: 'Write tests', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: 'task-5',
        data: { label: 'Deploy to staging', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: 'task-6',
        data: { label: 'Update dependencies', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
      {
        id: 'task-7',
        data: { label: 'Review security audit', icon: 'file' },
        level: 1,
        parentId: null,
        hasChildren: false,
        isExpanded: false,
      },
    ];

    return (
      <div>
        <div className='mb-4 font-bold'>Checkboxes on Right Side</div>
        <div className='mb-4 text-sm text-subtle'>
          Click checkbox to toggle selection. Click row to set active.
          <br />
          Active: {activeId ?? 'none'} | Selected: {selection.size > 0 ? Array.from(selection).join(', ') : 'none'}
        </div>
        <VirtualizedTreeList
          items={items}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='multiple'
          active={activeId}
          onActiveChange={setActiveId}
          virtuosoRef={virtuosoRef}
          aria-label='Task list'
          className={STYLED_TREE_ROOT_CLASS}
        >
          {({ items: nodeItems, getItemProps, containerProps }) => (
            <Virtuoso<FlatNode<TreeNodeData>>
              ref={virtuosoRef}
              data={nodeItems}
              className='h-full'
              components={virtuosoComponents}
              {...containerProps}
              itemContent={(index, node) => {
                const itemProps = getItemProps(index, node);
                return (
                  <VirtualizedTreeList.Row
                    {...itemProps}
                    onClick={e => {
                      // Focus tree container for keyboard navigation
                      const tree = e.currentTarget.closest<HTMLElement>('[role="tree"]');
                      tree?.focus();
                      // Only set active, don't change selection
                      setActiveId(node.id);
                    }}
                  >
                    <VirtualizedTreeList.RowContent>
                      <span className='text-sm'>{node.data.label}</span>
                    </VirtualizedTreeList.RowContent>
                    <VirtualizedTreeList.RowRight>
                      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                      <div
                        onClick={e => {
                          e.stopPropagation();
                          toggleSelection(node.id);
                        }}
                      >
                        <VirtualizedTreeList.RowSelectionControl rowId={node.id} selected={itemProps.selected} />
                      </div>
                    </VirtualizedTreeList.RowRight>
                  </VirtualizedTreeList.Row>
                );
              }}
            />
          )}
        </VirtualizedTreeList>
      </div>
    );
  },
};
