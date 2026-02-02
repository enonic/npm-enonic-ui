import type { Meta, StoryObj } from '@storybook/preact-vite';
import { File, Folder, Pencil, Trash2 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { Button, ListItem } from '@/components';
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

// Container wrapper for consistent layout across stories
const STORY_CONTAINER_CLASS = 'w-120 space-y-4';
// TreeList height variants (width handled by container)
const TREE_HEIGHT_SM = 'h-60'; // 5-8 items
const TREE_HEIGHT_MD = 'h-70'; // 8-15 items
const TREE_HEIGHT_LG = 'h-80'; // 15+ items
// Styled variant with border
const treeListClass = (height: string): string => `${height} rounded-sm border border-bdr-subtle shadow-sm`;

//
// * Examples
//

export const FlatList: Story = {
  name: 'Examples / Flat List',
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
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Flat List</div>
        <div className='text-sm text-subtle'>Simple list without hierarchy or expand controls</div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_SM)}
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

// Generate 500 items for flat list demo
const flatListLargeItems = Array.from({ length: 500 }, (_, i) => ({
  id: `item-${i + 1}`,
  label: `Item ${String(i + 1).padStart(3, '0')}`,
}));

export const FlatListLarge: Story = {
  name: 'Examples / Flat List (500 Items)',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [active, setActive] = useState<string | undefined>(undefined);

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Flat List (500 Items)</div>
        <div className='text-sm text-subtle'>
          Large flat list with 500 items. Use PageUp/PageDown for fast navigation.
        </div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_LG)}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          active={active}
          onActiveChange={setActive}
        >
          <TreeList.Container>
            {flatListLargeItems.map(item => (
              <TreeList.Row key={item.id} id={item.id}>
                <TreeList.RowContent>
                  <span className='text-sm'>{item.label}</span>
                </TreeList.RowContent>
              </TreeList.Row>
            ))}
          </TreeList.Container>
        </TreeList>
        <div className='text-sm text-subtle'>Active: {active || 'none'} (500 items total)</div>
      </div>
    );
  },
};

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

export const Basic: Story = {
  name: 'Examples / Basic Tree',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(['1', '1-1', '2']));

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
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Basic TreeList</div>
        <div className='text-sm text-subtle'>
          Hierarchical tree with expand/collapse. Data management handled externally.
        </div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_MD)}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          expanded={expanded}
          onExpandedChange={setExpanded}
        >
          <TreeList.Container>
            {visibleItems.map(item => (
              <TreeList.Row
                key={item.id}
                id={item.id}
                level={item.level}
                hasChildren={item.hasChildren}
                expanded={expanded.has(item.id)}
              >
                <TreeList.RowLeft>
                  <TreeList.RowLevelSpacer level={item.level} />
                  <TreeList.RowExpandControl
                    rowId={item.id}
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

export const MultipleSelection: Story = {
  name: 'Examples / Multiple Selection',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(['1', '2']));

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
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Multiple Selection</div>
        <div className='rounded-sm bg-surface-primary p-3 text-sm'>
          <p className='mb-2 font-medium'>Keyboard shortcuts:</p>
          <ul className='space-y-1 text-subtle text-xs'>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Click</kbd> - Select item (replaces selection)
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Ctrl/Cmd+Click</kbd> - Toggle item
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Shift+Click</kbd> - Range select
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Shift+Arrow</kbd> - Extend range
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Ctrl/Cmd+A</kbd> - Select all / Deselect all
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Space</kbd> - Toggle selection
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Escape</kbd> - Clear selection
            </li>
          </ul>
        </div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_MD)}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='multiple'
          expanded={expanded}
          onExpandedChange={setExpanded}
        >
          <TreeList.Container>
            {visibleItems.map(item => (
              <TreeList.Row
                key={item.id}
                id={item.id}
                level={item.level}
                hasChildren={item.hasChildren}
                expanded={expanded.has(item.id)}
              >
                <TreeList.RowLeft>
                  <TreeList.RowSelectionControl rowId={item.id} />
                  <TreeList.RowLevelSpacer level={item.level} />
                  <TreeList.RowExpandControl
                    rowId={item.id}
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
        <div className='text-sm text-subtle'>Selected: {Array.from(selection).join(', ') || 'none'}</div>
      </div>
    );
  },
};

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
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Checkboxes on Right Side</div>
        <div className='text-sm text-subtle'>Selection controls can be placed on either side</div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_SM)}
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
                  <TreeList.RowSelectionControl rowId={item.id} />
                </TreeList.RowRight>
              </TreeList.Row>
            ))}
          </TreeList.Container>
        </TreeList>
      </div>
    );
  },
};

export const SelectionModes: Story = {
  name: 'Examples / Selection Modes',
  render: () => {
    const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('single');
    const [variant, setVariant] = useState<'none' | 'checkbox' | 'radio'>('none');
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    // Reset selection when mode changes
    // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally reset only when mode changes
    useEffect(() => {
      setSelection(new Set());
    }, [selectionMode]);

    const flatItems = [
      { id: 'item-1', label: 'Option A' },
      { id: 'item-2', label: 'Option B' },
      { id: 'item-3', label: 'Option C' },
      { id: 'item-4', label: 'Option D' },
      { id: 'item-5', label: 'Option E' },
    ];

    // Determine if we should show the control
    const showControl = variant !== 'none';
    // Map variant to prop value (undefined when 'none', explicit value otherwise)
    const variantProp = variant === 'none' ? undefined : variant;

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Selection Modes</div>
        <div className='mb-4 flex gap-4'>
          <label className='flex items-center gap-2 text-sm'>
            Selection Mode:
            <select
              value={selectionMode}
              onChange={e => setSelectionMode(e.currentTarget.value as 'single' | 'multiple')}
              className='rounded border border-bdr-subtle bg-surface-primary px-2 py-1 text-sm'
            >
              <option value='single'>Single</option>
              <option value='multiple'>Multiple</option>
            </select>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            Indicator:
            <select
              value={variant}
              onChange={e => setVariant(e.currentTarget.value as 'none' | 'checkbox' | 'radio')}
              className='rounded border border-bdr-subtle bg-surface-primary px-2 py-1 text-sm'
            >
              <option value='none'>None (background only)</option>
              <option value='checkbox'>Checkbox</option>
              <option value='radio'>Radio</option>
            </select>
          </label>
        </div>
        <div className='mb-2 text-sm text-subtle'>
          {variant === 'none' && 'Selection indicated by background styling only.'}
          {variant === 'checkbox' && 'Checkbox indicators for selection.'}
          {variant === 'radio' && 'Radio indicators for selection.'}
        </div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_SM)}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode={selectionMode}
        >
          <TreeList.Container>
            {flatItems.map(item => (
              <TreeList.Row key={item.id} id={item.id}>
                {showControl && (
                  <TreeList.RowLeft>
                    <TreeList.RowSelectionControl rowId={item.id} variant={variantProp} />
                  </TreeList.RowLeft>
                )}
                <TreeList.RowContent>
                  <span className='text-sm'>{item.label}</span>
                </TreeList.RowContent>
              </TreeList.Row>
            ))}
          </TreeList.Container>
        </TreeList>
        <div className='text-sm text-subtle'>Selected: {Array.from(selection).join(', ') || 'none'}</div>
      </div>
    );
  },
};

export const ItemActivation: Story = {
  name: 'Examples / Item Activation',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [lastActivated, setLastActivated] = useState<string | null>(null);

    const flatItems = [
      { id: 'doc-1', label: 'Project Proposal.docx' },
      { id: 'doc-2', label: 'Meeting Notes.md' },
      { id: 'doc-3', label: 'Budget Report.xlsx' },
      { id: 'doc-4', label: 'Presentation.pptx' },
      { id: 'doc-5', label: 'README.txt' },
    ];

    const getLabel = (id: string): string => flatItems.find(item => item.id === id)?.label ?? id;

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Item Activation</div>
        <div className='rounded-sm bg-surface-primary p-3 text-sm'>
          <p className='mb-2 font-medium'>Activation triggers:</p>
          <ul className='space-y-1 text-subtle text-xs'>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Enter</kbd> - Activate focused item
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Double-click</kbd> - Activate clicked item
            </li>
          </ul>
        </div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_SM)}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          onActivate={id => setLastActivated(id)}
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
        <div className='text-sm text-subtle'>
          Activated: <span className='font-medium'>{lastActivated ? getLabel(lastActivated) : 'none'}</span>
        </div>
      </div>
    );
  },
};

//
// * States
//

export const WithDisabledItems: Story = {
  name: 'States / Disabled Items',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const disabledIds = new Set(['1-1', '2-1']);

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Disabled Items</div>
        <div className='text-sm text-subtle'>
          Items &quot;Work&quot; and &quot;Vacation&quot; are disabled. They are skipped during keyboard navigation and
          cannot be selected.
        </div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_MD)}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
        >
          <TreeList.Container>
            {simpleItems.map(item => (
              <TreeList.Row
                key={item.id}
                id={item.id}
                disabled={disabledIds.has(item.id)}
                level={item.level}
                hasChildren={item.hasChildren}
              >
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

export const MixedInteraction: Story = {
  name: 'States / Mixed Interaction',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const navigateOnlyIds = new Set(['1-1']);

    // Demonstrates all three interaction levels:
    // - 'none': loading and placeholder items (skipped in navigation) - handled by not rendering TreeList.Row
    // - 'navigate-only': can focus but cannot select
    // - 'full': normal interactive items (default for TreeList when disabled=false)
    const getItemInteraction = (id: string): 'full' | 'navigate-only' =>
      navigateOnlyIds.has(id) ? 'navigate-only' : 'full';

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Mixed Interaction Levels</div>
        <div className='text-sm text-subtle'>
          Shows all interaction levels: loading/placeholder items are skipped, &quot;Work&quot; is focusable but not
          selectable (<code>&apos;navigate-only&apos;</code>), others are fully interactive.
        </div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_MD)}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          getItemInteraction={getItemInteraction}
        >
          <TreeList.Container>
            {simpleItems.slice(0, 3).map(item => (
              <TreeList.Row
                key={item.id}
                id={item.id}
                disabled={navigateOnlyIds.has(item.id)}
                level={item.level}
                hasChildren={item.hasChildren}
              >
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
            <TreeList.RowLoading level={2} />
            {simpleItems.slice(5, 7).map(item => (
              <TreeList.Row key={item.id} id={item.id} level={item.level} hasChildren={item.hasChildren}>
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
            <TreeList.RowPlaceholder level={2} />
            <TreeList.Row id='3' level={1} hasChildren={false}>
              <TreeList.RowContent>
                <ListItem className='px-0 py-0'>
                  <ListItem.DefaultContent icon={<File />} label='readme.txt' />
                </ListItem>
              </TreeList.RowContent>
            </TreeList.Row>
          </TreeList.Container>
        </TreeList>
      </div>
    );
  },
};

export const LoadingState: Story = {
  name: 'States / Loading',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Loading State</div>
        <div className='text-sm text-subtle'>RowLoading shows spinner (customizable via children)</div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_SM)}
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

export const PlaceholderState: Story = {
  name: 'States / Placeholder',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Placeholder State</div>
        <div className='text-sm text-subtle'>RowPlaceholder for known IDs with unknown data</div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_SM)}
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

//
// * Features
//

// Extended tree data with parent references for navigation
type TreeItem = {
  id: string;
  label: string;
  level: number;
  parentId: string | undefined;
  hasChildren: boolean;
  childIds: string[];
  icon: ReactNode;
};

const treeItems: TreeItem[] = [
  {
    id: '1',
    label: 'Documents',
    level: 1,
    parentId: undefined,
    hasChildren: true,
    childIds: ['1-1', '1-2'],
    icon: <Folder />,
  },
  {
    id: '1-1',
    label: 'Work',
    level: 2,
    parentId: '1',
    hasChildren: true,
    childIds: ['1-1-1', '1-1-2'],
    icon: <Folder />,
  },
  { id: '1-1-1', label: 'Report.pdf', level: 3, parentId: '1-1', hasChildren: false, childIds: [], icon: <File /> },
  { id: '1-1-2', label: 'Budget.xlsx', level: 3, parentId: '1-1', hasChildren: false, childIds: [], icon: <File /> },
  { id: '1-2', label: 'Personal', level: 2, parentId: '1', hasChildren: false, childIds: [], icon: <Folder /> },
  { id: '2', label: 'Pictures', level: 1, parentId: undefined, hasChildren: true, childIds: ['2-1'], icon: <Folder /> },
  { id: '2-1', label: 'Vacation', level: 2, parentId: '2', hasChildren: false, childIds: [], icon: <Folder /> },
  { id: '3', label: 'readme.txt', level: 1, parentId: undefined, hasChildren: false, childIds: [], icon: <File /> },
];

const treeItemsMap = new Map(treeItems.map(item => [item.id, item]));

export const TreeNavigation: Story = {
  name: 'Features / Tree Navigation',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(['1', '1-1', '2']));
    const [active, setActive] = useState<string | undefined>(undefined);

    // Callbacks for tree navigation
    const getParentId = (id: string): string | undefined => treeItemsMap.get(id)?.parentId;
    const getFirstChildId = (id: string): string | undefined => {
      const item = treeItemsMap.get(id);
      return item?.childIds[0];
    };

    // Filter visible items based on expanded state
    const visibleItems = treeItems.filter(item => {
      if (item.level === 1) return true;
      // Check if all ancestors are expanded
      let currentId = item.parentId;
      while (currentId) {
        if (!expanded.has(currentId)) return false;
        currentId = treeItemsMap.get(currentId)?.parentId;
      }
      return true;
    });

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Tree Navigation</div>
        <div className='rounded-sm bg-surface-primary p-3 text-sm'>
          <p className='mb-2 font-medium'>Keyboard shortcuts:</p>
          <ul className='space-y-1 text-subtle text-xs'>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Arrow Up/Down</kbd> - Navigate items
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Arrow Right</kbd> - Expand node / Move to child
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Arrow Left</kbd> - Collapse node / Move to parent
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Home</kbd> /{' '}
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>End</kbd> - Jump to first/last
            </li>
          </ul>
        </div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_MD)}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          active={active}
          onActiveChange={setActive}
          expanded={expanded}
          onExpandedChange={setExpanded}
          getParentId={getParentId}
          getFirstChildId={getFirstChildId}
        >
          <TreeList.Container>
            {visibleItems.map(item => (
              <TreeList.Row
                key={item.id}
                id={item.id}
                level={item.level}
                hasChildren={item.hasChildren}
                expanded={expanded.has(item.id)}
              >
                <TreeList.RowLeft>
                  <TreeList.RowLevelSpacer level={item.level} />
                  <TreeList.RowExpandControl
                    rowId={item.id}
                    expanded={expanded.has(item.id)}
                    hasChildren={item.hasChildren}
                    onToggle={() => {
                      setExpanded(prev => {
                        const next = new Set(prev);
                        if (next.has(item.id)) {
                          next.delete(item.id);
                        } else {
                          next.add(item.id);
                        }
                        return next;
                      });
                    }}
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
        <div className='text-sm text-subtle'>Active: {active || 'none'}</div>
      </div>
    );
  },
};

export const NavigationOnly: Story = {
  name: 'Features / Navigation Only Mode',
  render: () => {
    const [active, setActive] = useState<string | undefined>(undefined);

    const flatItems = [
      { id: 'item-1', label: 'Navigate with Arrow keys' },
      { id: 'item-2', label: 'Home/End to jump' },
      { id: 'item-3', label: 'Click to set active' },
      { id: 'item-4', label: 'No selection in this mode' },
      { id: 'item-5', label: 'Space/Enter do nothing' },
    ];

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Navigation Only</div>
        <div className='text-sm text-subtle'>
          With <code className='rounded bg-surface-neutral px-1 font-mono text-xs'>selectionMode=&quot;none&quot;</code>
          , items can be navigated but not selected.
        </div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_SM)}
          selectionMode='none'
          active={active}
          onActiveChange={setActive}
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
        <div className='text-sm text-subtle'>Active: {active || 'none'}</div>
      </div>
    );
  },
};

// Generate 50 items for page navigation demo
const longListItems = Array.from({ length: 50 }, (_, i) => ({
  id: `item-${i + 1}`,
  label: `Item ${String(i + 1).padStart(2, '0')}`,
}));

export const PageNavigation: Story = {
  name: 'Features / Page Navigation',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [active, setActive] = useState<string | undefined>(undefined);

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Page Navigation</div>
        <div className='rounded-sm bg-surface-primary p-3 text-sm'>
          <p className='mb-2 font-medium'>Keyboard shortcuts:</p>
          <ul className='space-y-1 text-subtle text-xs'>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>PageUp</kbd> /{' '}
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>PageDown</kbd> - Jump by page
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Home</kbd> /{' '}
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>End</kbd> - Jump to first/last
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Arrow Up/Down</kbd> - Navigate one item
            </li>
          </ul>
        </div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_LG)}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
          active={active}
          onActiveChange={setActive}
        >
          <TreeList.Container>
            {longListItems.map(item => (
              <TreeList.Row key={item.id} id={item.id}>
                <TreeList.RowContent>
                  <span className='text-sm'>{item.label}</span>
                </TreeList.RowContent>
              </TreeList.Row>
            ))}
          </TreeList.Container>
        </TreeList>
        <div className='text-sm text-subtle'>Active: {active || 'none'} (50 items total)</div>
      </div>
    );
  },
};

type ActionItem = {
  id: string;
  label: string;
  description: string;
};

const actionItems: ActionItem[] = [
  { id: 'doc-1', label: 'Project Proposal', description: 'Q4 2024 planning document' },
  { id: 'doc-2', label: 'Budget Report', description: 'Annual financial summary' },
  { id: 'doc-3', label: 'Team Notes', description: 'Meeting minutes and action items' },
  { id: 'doc-4', label: 'Design Specs', description: 'UI component specifications' },
  { id: 'doc-5', label: 'API Documentation', description: 'REST API reference guide' },
];

export const ActionMode: Story = {
  name: 'Features / Action Mode (F2)',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [log, setLog] = useState<string[]>([]);

    const addLog = (msg: string): void => {
      setLog(prev => [...prev.slice(-4), msg]);
    };

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Action Mode (F2)</div>
        <div className='rounded-sm bg-surface-primary p-3 text-sm'>
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
        <TreeList
          className={treeListClass(TREE_HEIGHT_MD)}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='single'
        >
          <TreeList.Container>
            {actionItems.map(item => (
              <TreeList.Row key={item.id} id={item.id}>
                <TreeList.RowLeft>
                  <File className='size-4 text-subtle group-data-[tone=inverse]:text-alt' />
                </TreeList.RowLeft>
                <TreeList.RowContent>
                  <div className='flex flex-col'>
                    <span className='font-medium text-sm'>{item.label}</span>
                    <span className='text-subtle text-xs group-data-[tone=inverse]:text-alt'>{item.description}</span>
                  </div>
                </TreeList.RowContent>
                <TreeList.RowRight>
                  <TreeList.Action>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-6 gap-1 px-2'
                      onClick={() => addLog(`Edit: ${item.label}`)}
                    >
                      <Pencil className='size-3' />
                      Edit
                    </Button>
                  </TreeList.Action>
                  <TreeList.Action>
                    <Button
                      variant='solid'
                      size='sm'
                      className='h-6 gap-1 px-2'
                      onClick={() => addLog(`Delete: ${item.label}`)}
                    >
                      <Trash2 className='size-3' />
                      Delete
                    </Button>
                  </TreeList.Action>
                </TreeList.RowRight>
              </TreeList.Row>
            ))}
          </TreeList.Container>
        </TreeList>
        <div className='rounded-sm bg-surface-primary p-2'>
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
// * Behavior
//

type ClearActiveTreeItem = {
  id: string;
  label: string;
  level: number;
  parentId: string | undefined;
  hasChildren: boolean;
  icon: ReactNode;
};

const clearActiveTreeItems: ClearActiveTreeItem[] = [
  { id: 'projects', label: 'Projects', level: 1, parentId: undefined, hasChildren: true, icon: <Folder /> },
  { id: 'projects-web', label: 'Web Apps', level: 2, parentId: 'projects', hasChildren: true, icon: <Folder /> },
  {
    id: 'projects-web-1',
    label: 'Dashboard.tsx',
    level: 3,
    parentId: 'projects-web',
    hasChildren: false,
    icon: <File />,
  },
  {
    id: 'projects-web-2',
    label: 'Settings.tsx',
    level: 3,
    parentId: 'projects-web',
    hasChildren: false,
    icon: <File />,
  },
  { id: 'projects-mobile', label: 'Mobile App', level: 2, parentId: 'projects', hasChildren: false, icon: <Folder /> },
  { id: 'docs', label: 'Documentation', level: 1, parentId: undefined, hasChildren: true, icon: <Folder /> },
  { id: 'docs-readme', label: 'README.md', level: 2, parentId: 'docs', hasChildren: false, icon: <File /> },
  { id: 'docs-api', label: 'API.md', level: 2, parentId: 'docs', hasChildren: false, icon: <File /> },
  { id: 'config', label: 'config.json', level: 1, parentId: undefined, hasChildren: false, icon: <File /> },
  { id: 'package', label: 'package.json', level: 1, parentId: undefined, hasChildren: false, icon: <File /> },
];

const clearActiveTreeItemsMap = new Map(clearActiveTreeItems.map(item => [item.id, item]));

export const ClearActiveOnReclick: Story = {
  name: 'Behavior / Clear Active On Reclick',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [active, setActive] = useState<string | undefined>(undefined);
    const [lastActivated, setLastActivated] = useState<string | undefined>(undefined);
    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(['projects', 'projects-web', 'docs']));

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

    // Filter visible items based on expanded state
    const visibleItems = clearActiveTreeItems.filter(item => {
      if (item.level === 1) return true;
      let currentId = item.parentId;
      while (currentId) {
        if (!expanded.has(currentId)) return false;
        currentId = clearActiveTreeItemsMap.get(currentId)?.parentId;
      }
      return true;
    });

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>Clear Active On Reclick</div>
        <div className='text-sm text-subtle'>
          With <code className='rounded bg-surface-neutral px-1 font-mono text-xs'>clearActiveOnReclick=true</code>,
          single-clicking an already active item when selection is empty will clear the active state.
        </div>
        <div className='rounded-sm bg-surface-primary p-3 text-sm'>
          <ul className='space-y-1 text-subtle text-xs'>
            <li>Click item → becomes active (highlighted)</li>
            <li>Click same item again → active clears (only when selection empty)</li>
            <li>Click checkbox → toggle selection</li>
            <li>Double-click → still fires onActivate (not affected)</li>
          </ul>
        </div>
        <TreeList
          className={treeListClass(TREE_HEIGHT_MD)}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='multiple'
          active={active}
          onActiveChange={setActive}
          onActivate={setLastActivated}
          expanded={expanded}
          onExpandedChange={setExpanded}
          clearActiveOnReclick
        >
          <TreeList.Container>
            {visibleItems.map(item => (
              <TreeList.Row
                key={item.id}
                id={item.id}
                level={item.level}
                hasChildren={item.hasChildren}
                expanded={expanded.has(item.id)}
              >
                <TreeList.RowLeft>
                  <TreeList.RowSelectionControl rowId={item.id} />
                  <TreeList.RowLevelSpacer level={item.level} />
                  <TreeList.RowExpandControl
                    rowId={item.id}
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
        <div className='text-sm text-subtle'>
          <div>Active: {active || 'none'}</div>
          <div>Selected: {selection.size > 0 ? Array.from(selection).join(', ') : 'none'}</div>
          <div>Double-clicked: {lastActivated || 'none'}</div>
        </div>
      </div>
    );
  },
};

export const Invalidation: Story = {
  name: 'Behavior / Invalidation',
  render: function Render() {
    const [items, setItems] = useState(simpleItems);
    const [active, setActive] = useState<string | undefined>('1-1');
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set(['1-1', '1-2']));
    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(['1', '1-1', '2']));

    const removeItem = (id: string): void => {
      setItems(prev => prev.filter(item => item.id !== id));
    };

    const resetItems = (): void => {
      setItems(simpleItems);
      setActive('1-1');
      setSelection(new Set(['1-1', '1-2']));
      setExpanded(new Set(['1', '1-1', '2']));
    };

    const visibleItems = items.filter(item => {
      if (item.level === 1) return true;
      // Find parent: remove last segment from id
      const parentId = item.id.substring(0, item.id.lastIndexOf('-'));
      return expanded.has(parentId);
    });

    return (
      <div className={STORY_CONTAINER_CLASS}>
        <div className='font-bold'>State Invalidation</div>
        <div className='text-sm text-subtle'>When items are removed, active/selection state automatically updates</div>

        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' size='sm' onClick={() => active && removeItem(active)} disabled={!active}>
            Remove Active
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const first = [...selection][0];
              if (first) removeItem(first);
            }}
            disabled={selection.size === 0}
          >
            Remove First Selected
          </Button>
          <Button variant='outline' size='sm' onClick={resetItems}>
            Reset
          </Button>
        </div>

        <div className='rounded-sm bg-surface-neutral-subtle p-2 text-sm'>
          <div>
            <strong>Active:</strong> {active ?? 'null'}
          </div>
          <div>
            <strong>Selected:</strong> {[...selection].join(', ') || 'none'}
          </div>
          <div>
            <strong>Items:</strong> {items.length}
          </div>
        </div>

        <TreeList
          className={treeListClass(TREE_HEIGHT_MD)}
          active={active}
          onActiveChange={setActive}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode='multiple'
          expanded={expanded}
          onExpandedChange={setExpanded}
        >
          <TreeList.Container>
            {visibleItems.map(item => (
              <TreeList.Row key={item.id} id={item.id}>
                <TreeList.RowLevelSpacer level={item.level} />
                {item.hasChildren ? <TreeList.RowExpandControl id={item.id} /> : <div className='size-5' aria-hidden />}
                <TreeList.RowSelectionControl rowId={item.id} />
                <TreeList.RowLeft>{item.icon}</TreeList.RowLeft>
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
