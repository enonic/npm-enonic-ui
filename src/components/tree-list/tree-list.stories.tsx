import type { Meta, StoryObj } from '@storybook/preact-vite';
import { File, Folder } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { ListItem } from '@/components';
import { TreeList } from './tree-list';

type Story = StoryObj<typeof TreeList>;

export default {
  title: 'Components/TreeList',
  component: TreeList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TreeList>;

const TREE_ROOT_CLASS = 'h-80 w-100';
const STYLED_TREE_ROOT_CLASS = 'h-80 w-100 rounded-sm border border-bdr-subtle shadow-sm';

// #region Flat List

export const FlatList: Story = {
  name: 'Basics / Flat List',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    const flatItems = [
      { id: 'item-1', label: 'First Item' },
      { id: 'item-2', label: 'Second Item' },
      { id: 'item-3', label: 'Third Item' },
      { id: 'item-4', label: 'Fourth Item' },
      { id: 'item-5', label: 'Fifth Item' },
    ];

    return (
      <div>
        <div className='mb-4 font-bold'>Flat List</div>
        <div className='mb-4 text-sm text-subtle'>Simple list without hierarchy or expand controls</div>
        <TreeList
          className={TREE_ROOT_CLASS}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
        >
          <TreeList.Container>
            {flatItems.map(item => (
              <TreeList.Row key={item.id} id={item.id}>
                <TreeList.RowContent>
                  <span className='text-sm'>{item.label}</span>
                </TreeList.RowContent>
              </TreeList.Row>
            ))}
          </TreeList.Container>
        </TreeList>
      </div>
    );
  },
};

// #endregion

// #region Hierarchical Tree Data

type SimpleItem = {
  id: string;
  label: string;
  level: number;
  hasChildren: boolean;
  icon: ReactNode;
};

const simpleItems: SimpleItem[] = [
  { id: '1', label: 'Documents', level: 1, hasChildren: true, icon: <Folder /> },
  { id: '1-1', label: 'Work', level: 2, hasChildren: true, icon: <Folder /> },
  { id: '1-1-1', label: 'Report.pdf', level: 3, hasChildren: false, icon: <File /> },
  { id: '1-1-2', label: 'Budget.xlsx', level: 3, hasChildren: false, icon: <File /> },
  { id: '1-2', label: 'Personal', level: 2, hasChildren: false, icon: <Folder /> },
  { id: '2', label: 'Pictures', level: 1, hasChildren: true, icon: <Folder /> },
  { id: '2-1', label: 'Vacation', level: 2, hasChildren: false, icon: <Folder /> },
  { id: '3', label: 'readme.txt', level: 1, hasChildren: false, icon: <File /> },
];

// #endregion

// #region Basic Tree

export const Basic: Story = {
  name: 'Examples / Basic Tree',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '1-1', '2']));

    const toggleExpanded = (id: string): void => {
      setExpanded(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };

    const visibleItems = simpleItems.filter(item => {
      if (item.level === 1) return true;
      const parentId = item.id.substring(0, item.id.lastIndexOf('-'));
      return expanded.has(parentId);
    });

    return (
      <div>
        <div className='mb-4 font-bold'>Basic TreeList - Data-agnostic UI</div>
        <div className='mb-4 text-sm text-subtle'>
          Hierarchical tree with expand/collapse. Data management is handled externally.
        </div>
        <TreeList
          className={STYLED_TREE_ROOT_CLASS}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
        >
          <TreeList.Container>
            {visibleItems.map(item => (
              <TreeList.Row key={item.id} id={item.id}>
                <TreeList.RowLeft>
                  <TreeList.RowLevelSpacer level={item.level} />
                  <TreeList.RowExpandControl
                    expanded={expanded.has(item.id)}
                    hasChildren={item.hasChildren}
                    onToggle={() => toggleExpanded(item.id)}
                    selected={selection.has(item.id)}
                  />
                </TreeList.RowLeft>
                <TreeList.RowContent>
                  <ListItem className='px-0 py-0'>
                    <ListItem.DefaultContent icon={item.icon} label={item.label} />
                  </ListItem>
                </TreeList.RowContent>
              </TreeList.Row>
            ))}
          </TreeList.Container>
        </TreeList>
      </div>
    );
  },
};

// #endregion

// #region Multiple Selection

export const MultipleSelection: Story = {
  name: 'Examples / Multiple Selection',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2']));

    const toggleExpanded = (id: string): void => {
      setExpanded(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };

    const visibleItems = simpleItems.filter(item => {
      if (item.level === 1) return true;
      const parentId = item.id.substring(0, item.id.lastIndexOf('-'));
      return expanded.has(parentId);
    });

    return (
      <div>
        <div className='mb-4 font-bold'>Multiple Selection</div>
        <div className='mb-4 text-sm text-subtle'>Selected: {Array.from(selection).join(', ') || 'none'}</div>
        <TreeList
          className={STYLED_TREE_ROOT_CLASS}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='multiple'
        >
          <TreeList.Container>
            {visibleItems.map(item => (
              <TreeList.Row key={item.id} id={item.id}>
                <TreeList.RowLeft>
                  <TreeList.RowSelectionControl selected={selection.has(item.id)} />
                  <TreeList.RowLevelSpacer level={item.level} />
                  <TreeList.RowExpandControl
                    expanded={expanded.has(item.id)}
                    hasChildren={item.hasChildren}
                    onToggle={() => toggleExpanded(item.id)}
                    selected={selection.has(item.id)}
                  />
                </TreeList.RowLeft>
                <TreeList.RowContent>
                  <ListItem className='px-0 py-0'>
                    <ListItem.DefaultContent icon={item.icon} label={item.label} />
                  </ListItem>
                </TreeList.RowContent>
              </TreeList.Row>
            ))}
          </TreeList.Container>
        </TreeList>
      </div>
    );
  },
};

// #endregion

// #region Disabled Items

export const WithDisabledItems: Story = {
  name: 'States / Disabled Items',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const disabledIds = new Set(['1-1', '2-1']);

    return (
      <div>
        <div className='mb-4 font-bold'>Disabled Items</div>
        <div className='mb-4 text-sm text-subtle'>Items &quot;Work&quot; and &quot;Vacation&quot; are disabled</div>
        <TreeList
          className={STYLED_TREE_ROOT_CLASS}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
        >
          <TreeList.Container>
            {simpleItems.map(item => (
              <TreeList.Row key={item.id} id={item.id} disabled={disabledIds.has(item.id)}>
                <TreeList.RowLeft>
                  <TreeList.RowLevelSpacer level={item.level} />
                </TreeList.RowLeft>
                <TreeList.RowContent>
                  <ListItem className='px-0 py-0'>
                    <ListItem.DefaultContent icon={item.icon} label={item.label} />
                  </ListItem>
                </TreeList.RowContent>
              </TreeList.Row>
            ))}
          </TreeList.Container>
        </TreeList>
      </div>
    );
  },
};

// #endregion

// #region Loading State

export const LoadingState: Story = {
  name: 'States / Loading',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    return (
      <div>
        <div className='mb-4 font-bold'>Loading State</div>
        <div className='mb-4 text-sm text-subtle'>RowLoading shows spinner (customizable via children)</div>
        <TreeList
          className={STYLED_TREE_ROOT_CLASS}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
        >
          <TreeList.Container>
            <TreeList.Row id='item-1'>
              <TreeList.RowContent>
                <span className='text-sm'>Loaded Item 1</span>
              </TreeList.RowContent>
            </TreeList.Row>
            <TreeList.Row id='item-2'>
              <TreeList.RowContent>
                <span className='text-sm'>Loaded Item 2</span>
              </TreeList.RowContent>
            </TreeList.Row>
            <TreeList.RowLoading />
            <TreeList.RowLoading>
              <span className='text-sm text-subtle'>Custom loading text...</span>
            </TreeList.RowLoading>
          </TreeList.Container>
        </TreeList>
      </div>
    );
  },
};

// #endregion

// #region Placeholder State

export const PlaceholderState: Story = {
  name: 'States / Placeholder',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    return (
      <div>
        <div className='mb-4 font-bold'>Placeholder State</div>
        <div className='mb-4 text-sm text-subtle'>RowPlaceholder for known IDs with unknown data</div>
        <TreeList
          className={STYLED_TREE_ROOT_CLASS}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
        >
          <TreeList.Container>
            <TreeList.Row id='item-1'>
              <TreeList.RowContent>
                <span className='text-sm'>Real Item</span>
              </TreeList.RowContent>
            </TreeList.Row>
            <TreeList.RowPlaceholder />
            <TreeList.RowPlaceholder level={2} />
            <TreeList.RowPlaceholder level={2}>
              <span className='text-sm'>Custom placeholder content</span>
            </TreeList.RowPlaceholder>
          </TreeList.Container>
        </TreeList>
      </div>
    );
  },
};

// #endregion

// #region Checkboxes on Right

export const CheckboxesOnRight: Story = {
  name: 'Examples / Checkboxes on Right',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    const flatItems = [
      { id: 'task-1', label: 'Complete documentation' },
      { id: 'task-2', label: 'Review pull request' },
      { id: 'task-3', label: 'Fix bug #123' },
      { id: 'task-4', label: 'Write tests' },
    ];

    return (
      <div>
        <div className='mb-4 font-bold'>Checkboxes on Right Side</div>
        <TreeList
          className={STYLED_TREE_ROOT_CLASS}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='multiple'
        >
          <TreeList.Container>
            {flatItems.map(item => (
              <TreeList.Row key={item.id} id={item.id}>
                <TreeList.RowContent>
                  <span className='text-sm'>{item.label}</span>
                </TreeList.RowContent>
                <TreeList.RowRight>
                  <TreeList.RowSelectionControl selected={selection.has(item.id)} />
                </TreeList.RowRight>
              </TreeList.Row>
            ))}
          </TreeList.Container>
        </TreeList>
      </div>
    );
  },
};

// #endregion
