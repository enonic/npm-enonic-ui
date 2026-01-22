import type { Meta, StoryObj } from '@storybook/preact-vite';
import { File, Folder, ListTree } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { forwardRef, type ReactElement, type RefObject, useRef } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { Combobox } from '@/components/combobox/combobox';
import { Listbox } from '@/components/listbox/listbox';
import { Toggle } from '@/components/toggle';
import { type FlatNode, VirtualizedTreeList } from '@/components/virtualized-tree-list/virtualized-tree-list';
import { useCombobox } from '@/providers';
import { cn } from '@/utils';

type Story = StoryObj;

type Option = {
  id: string;
  name: string;
  language: string;
  year: number;
};

const frameworks: Option[] = [
  { id: 'react', name: 'React', language: 'JavaScript', year: 2013 },
  { id: 'preact', name: 'Preact', language: 'JavaScript', year: 2015 },
  { id: 'vue', name: 'Vue', language: 'JavaScript', year: 2014 },
  { id: 'svelte', name: 'Svelte', language: 'JavaScript', year: 2016 },
  { id: 'solid', name: 'Solid', language: 'TypeScript', year: 2018 },
  { id: 'qwik', name: 'Qwik', language: 'TypeScript', year: 2021 },
];

export default {
  title: 'Components/Combobox',
  component: Combobox.Root,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

const createInputRefAndFocus = (): RefObject<HTMLInputElement> => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  return inputRef;
};

const ListboxItemContent = ({ name, language }: Omit<Option, 'id'>): ReactElement => {
  return (
    <div className='flex w-full flex-col justify-between'>
      <div className='font-medium text-sm group-data-[tone=inverse]:text-alt'>{name}</div>
      <div className='text-subtle text-xs group-data-[tone=inverse]:text-alt'>{language}</div>
    </div>
  );
};

export const Basic: Story = {
  name: 'Examples / Basic',
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    const filtered = value
      ? frameworks.filter(
          f =>
            f.name.toLowerCase().includes(value.toLowerCase()) ||
            f.language.toLowerCase().includes(value.toLowerCase()),
        )
      : frameworks;

    return (
      <div className='relative space-y-3'>
        <h3 className='font-medium text-md'>Basic Combobox</h3>
        <Combobox.Root value={value} onChange={setValue}>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search frameworks' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Listbox.Content className='rounded-sm'>
                {filtered.map(({ id, ...rest }) => (
                  <Listbox.Item key={id} value={id}>
                    <ListboxItemContent {...rest} />
                  </Listbox.Item>
                ))}
              </Listbox.Content>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
      </div>
    );
  },
};

export const Multi: Story = {
  name: 'Examples / Multi-Select',
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    const filtered = value
      ? frameworks.filter(
          f =>
            f.name.toLowerCase().includes(value.toLowerCase()) ||
            f.language.toLowerCase().includes(value.toLowerCase()),
        )
      : frameworks;

    return (
      <div className='relative space-y-3'>
        <h3 className='font-medium text-md'>Multiple Selection</h3>
        <Combobox.Root value={value} onChange={setValue} selectionMode={'multiple'}>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search frameworks' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Listbox.Content className='rounded-sm'>
                {filtered.map(({ id, ...rest }) => (
                  <Listbox.Item key={id} value={id}>
                    <ListboxItemContent {...rest} />
                  </Listbox.Item>
                ))}
              </Listbox.Content>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
      </div>
    );
  },
};

export const Preselected: Story = {
  name: 'Examples / Preselected',
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const [selection, setSelection] = useState<readonly string[]>(['react', 'vue']);

    const filtered = value
      ? frameworks.filter(
          f =>
            f.name.toLowerCase().includes(value.toLowerCase()) ||
            f.language.toLowerCase().includes(value.toLowerCase()),
        )
      : frameworks;

    return (
      <div className='relative space-y-3'>
        <h3 className='font-medium text-md'>Some items are preselected</h3>
        <Combobox.Root
          value={value}
          onChange={setValue}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode={'multiple'}
        >
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search frameworks' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Listbox.Content className='rounded-sm'>
                {filtered.map(({ id, ...rest }) => (
                  <Listbox.Item key={id} value={id}>
                    <ListboxItemContent {...rest} />
                  </Listbox.Item>
                ))}
              </Listbox.Content>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
      </div>
    );
  },
};

const frameworkTreeData: TreeDataSource[] = [
  {
    id: 'javascript',
    label: 'JavaScript',
    icon: 'folder',
    children: [
      { id: 'react', label: 'React', icon: 'file' },
      { id: 'preact', label: 'Preact', icon: 'file' },
      { id: 'vue', label: 'Vue', icon: 'file' },
      { id: 'svelte', label: 'Svelte', icon: 'file' },
    ],
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    icon: 'folder',
    children: [
      { id: 'solid', label: 'Solid', icon: 'file' },
      { id: 'qwik', label: 'Qwik', icon: 'file' },
    ],
  },
];

const treeVirtuosoComponents = {
  Scroller: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ style, children, className, ...props }, ref) => (
      <div ref={ref} {...props} style={style} className={cn('rounded-sm *:p-1', className)}>
        {children}
      </div>
    ),
  ),
  List: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ style, children, className, ...props }, ref) => (
      <div ref={ref} {...props} style={style} className={cn('flex flex-col gap-y-1.5', className)}>
        {children}
      </div>
    ),
  ),
};

const getIcon = (iconType: 'folder' | 'file'): ReactElement => (iconType === 'folder' ? <Folder /> : <File />);

export const WithLeftToggleButton: Story = {
  name: 'Examples / Left Toggle Button',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [value, setValue] = useState<string | undefined>();
    const [isTreeView, setIsTreeView] = useState(false);

    // Tree state
    const [treeSelection, setTreeSelection] = useState<ReadonlySet<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['javascript', 'typescript']));
    const [activeId, setActiveId] = useState<string | null>('javascript');

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

    // List filtering
    const filteredList = value
      ? frameworks.filter(
          f =>
            f.name.toLowerCase().includes(value.toLowerCase()) ||
            f.language.toLowerCase().includes(value.toLowerCase()),
        )
      : frameworks;

    // Tree filtering
    const flatNodes = useMemo(() => flattenTree(frameworkTreeData, expanded), [expanded]);
    const filteredNodes = useMemo(() => {
      if (!value) return flatNodes;
      const searchLower = value.toLowerCase();
      return flatNodes.filter(node => node.data.label.toLowerCase().includes(searchLower));
    }, [flatNodes, value]);

    // Reset active to first item when filtered list changes
    useEffect(() => {
      if (isTreeView) {
        const firstNode = filteredNodes[0];
        if (firstNode) {
          const activeInList = activeId && filteredNodes.some(node => node.id === activeId);
          if (!activeInList) {
            setActiveId(firstNode.id);
          }
        }
      }
    }, [filteredNodes, activeId, isTreeView]);

    // Tree height calculation
    const ROW_HEIGHT = 32;
    const MAX_HEIGHT = 240;
    const GAP = 6;
    const PADDING = 8;
    const nodesCount = filteredNodes.length;
    const treeHeight = useMemo(() => {
      const contentHeight = nodesCount * ROW_HEIGHT + Math.max(nodesCount - 1, 0) * GAP + PADDING;
      return Math.min(contentHeight, MAX_HEIGHT);
    }, [nodesCount]);

    return (
      <div className='relative w-80 space-y-3'>
        <h3 className='font-medium text-md'>Toggle Button in Icon Position</h3>
        <p className='text-sm text-subtle'>
          View mode: <span className='font-semibold'>{isTreeView ? 'Tree' : 'List'}</span>
        </p>
        <Combobox.Root value={value} onChange={setValue} contentType={isTreeView ? 'tree' : 'auto'} closeOnBlur={false}>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search className='pl-0'>
                <Toggle
                  startIcon={ListTree}
                  size='sm'
                  iconSize='md'
                  aria-label='Toggle view mode'
                  pressed={isTreeView}
                  onPressedChange={() => setIsTreeView(prev => !prev)}
                  tabIndex={-1}
                  className={cn(
                    'ml-1.25 size-9 shrink-0 rounded-[0.1875rem] p-0 text-subtle hover:bg-surface-neutral-hover',
                    'after:-inset-1.25 after:-z-10 relative z-0 overflow-visible after:pointer-events-auto after:absolute after:rounded-sm after:content-[""]',
                  )}
                />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search...' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              {isTreeView ? (
                <Combobox.TreeContent style={{ height: treeHeight }}>
                  <VirtualizedTreeList
                    items={filteredNodes}
                    preserveFilteredSelection
                    clearSelectionOnEscape={false}
                    selection={treeSelection}
                    onSelectionChange={setTreeSelection}
                    selectionMode='single'
                    active={activeId}
                    onActiveChange={setActiveId}
                    onExpand={handleExpand}
                    onCollapse={handleCollapse}
                    virtuosoRef={virtuosoRef}
                    aria-label='Framework browser'
                    className='h-full'
                  >
                    {({ items, getItemProps, containerProps }) => (
                      <Virtuoso<FlatNode<TreeNodeData>>
                        ref={virtuosoRef}
                        data={items}
                        components={treeVirtuosoComponents}
                        {...containerProps}
                        className={cn('h-full', containerProps.className)}
                        itemContent={(index, node) => {
                          const itemProps = getItemProps(index, node);
                          return (
                            <VirtualizedTreeList.Row {...itemProps} selectable={node.data.icon === 'file'}>
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
                                <div className='flex items-center gap-2'>
                                  <span className='shrink-0 text-subtle group-data-[tone=inverse]:text-alt'>
                                    {getIcon(node.data.icon)}
                                  </span>
                                  <span className='truncate text-sm'>{node.data.label}</span>
                                </div>
                              </VirtualizedTreeList.RowContent>
                            </VirtualizedTreeList.Row>
                          );
                        }}
                      />
                    )}
                  </VirtualizedTreeList>
                </Combobox.TreeContent>
              ) : (
                <Listbox.Content className='rounded-sm'>
                  {filteredList.map(({ id, ...rest }) => (
                    <Listbox.Item key={id} value={id}>
                      <ListboxItemContent {...rest} />
                    </Listbox.Item>
                  ))}
                </Listbox.Content>
              )}
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
      </div>
    );
  },
};

export const Disabled: Story = {
  name: 'States / Disabled',
  render: () => {
    return (
      <div className='relative space-y-3'>
        <h3 className='font-medium text-md'>Disabled</h3>
        <Combobox.Root disabled>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input placeholder='Search frameworks' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>
            <Combobox.Popup>
              <Listbox.Content className='rounded-sm'>
                {frameworks.map(({ id, ...rest }) => (
                  <Listbox.Item key={id} value={id}>
                    <ListboxItemContent {...rest} />
                  </Listbox.Item>
                ))}
              </Listbox.Content>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
      </div>
    );
  },
};

export const WithError: Story = {
  name: 'States / Error',
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    const filtered = value
      ? frameworks.filter(
          f =>
            f.name.toLowerCase().includes(value.toLowerCase()) ||
            f.language.toLowerCase().includes(value.toLowerCase()),
        )
      : frameworks;

    return (
      <div className='relative space-y-3'>
        <h3 className='font-medium text-md'>Has errors</h3>
        <Combobox.Root value={value} onChange={setValue} error>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search frameworks' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>
            <Combobox.Popup>
              <Listbox.Content className='rounded-sm'>
                {filtered.map(({ id, ...rest }) => (
                  <Listbox.Item key={id} value={id}>
                    <ListboxItemContent {...rest} />
                  </Listbox.Item>
                ))}
              </Listbox.Content>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
        <p className='text-error text-sm'>Something went wrong</p>
      </div>
    );
  },
};

export const LongList: Story = {
  name: 'Features / Long List',
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const longList = Array.from({ length: 50 }, (_, i) => ({
      id: `framework-${i + 1}`,
      name: `Framework ${i + 1}`,
    }));

    const filtered = value ? longList.filter(f => f.name.toLowerCase().includes(value.toLowerCase())) : longList;

    return (
      <div className='relative space-y-3'>
        <h3 className='font-medium text-md'>Long list, stays open on blur</h3>
        <Combobox.Root value={value} onChange={setValue} closeOnBlur={false}>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Select from long list' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Listbox.Content className='max-h-60'>
                {filtered.map(({ id, name }) => (
                  <Listbox.Item key={id} value={id}>
                    <div className='text-sm'>{name}</div>
                  </Listbox.Item>
                ))}
              </Listbox.Content>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
      </div>
    );
  },
};

export const CustomFiltering: Story = {
  name: 'Features / Custom Filtering',
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const [selection, setSelection] = useState<readonly string[]>([]);

    const filtered = value
      ? frameworks.filter(f => String(f.year).includes(value) || f.name.toLowerCase().includes(value.toLowerCase()))
      : frameworks;

    return (
      <div className='relative space-y-3'>
        <h3 className='font-medium text-md'>Custom Filtering</h3>
        <Combobox.Root value={value} onChange={setValue} selection={selection} onSelectionChange={setSelection}>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Type year (e.g., 2018)' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Listbox.Content className='rounded-sm'>
                {filtered.map(({ id, ...rest }) => (
                  <Listbox.Item key={id} value={id}>
                    <ListboxItemContent {...rest} />
                  </Listbox.Item>
                ))}
              </Listbox.Content>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
        <div className='rounded-sm bg-surface-primary px-3 py-2'>
          <p className='text-sm text-subtle'>
            <span className='font-semibold'>Selected:</span> {selection}
          </p>
        </div>
      </div>
    );
  },
};

export const Staged: Story = {
  name: 'Features / Staged Selection',
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    const filtered = value
      ? frameworks.filter(
          f =>
            f.name.toLowerCase().includes(value.toLowerCase()) ||
            f.language.toLowerCase().includes(value.toLowerCase()),
        )
      : frameworks;

    return (
      <div className='relative w-80 space-y-3'>
        <header>
          <h3 className='font-medium text-md'>Need to confirm selection changes</h3>
          <p className='text-sm text-subtle'>
            Apply with button or <kbd className='rounded bg-surface-primary px-1 font-mono text-xs'>⌘/Ctrl+Enter</kbd>
          </p>
        </header>
        <Combobox.Root value={value} onChange={setValue} selectionMode={'staged'} closeOnBlur={false}>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search frameworks' />
                <Combobox.Apply />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Listbox.Content className='rounded-sm'>
                {filtered.map(({ id, ...rest }) => (
                  <Listbox.Item key={id} value={id}>
                    <ListboxItemContent {...rest} />
                  </Listbox.Item>
                ))}
              </Listbox.Content>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
      </div>
    );
  },
};

export const StagedPreselected: Story = {
  name: 'Features / Staged with Preselected',
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const [selection, setSelection] = useState<readonly string[]>(['react', 'vue']);

    const filtered = value
      ? frameworks.filter(
          f =>
            f.name.toLowerCase().includes(value.toLowerCase()) ||
            f.language.toLowerCase().includes(value.toLowerCase()),
        )
      : frameworks;

    return (
      <div className='relative w-80 space-y-3'>
        <header>
          <h3 className='font-medium text-md'>Confirm selection changes</h3>
          <p className='text-sm text-subtle'>
            Apply with button or <kbd className='rounded bg-surface-primary px-1 font-mono text-xs'>⌘/Ctrl+Enter</kbd>
          </p>
        </header>
        <Combobox.Root
          value={value}
          onChange={setValue}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode={'staged'}
          closeOnBlur={false}
        >
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search frameworks' />
                <Combobox.Apply />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Listbox.Content className='rounded-sm'>
                {filtered.map(({ id, ...rest }) => (
                  <Listbox.Item key={id} value={id}>
                    <ListboxItemContent {...rest} />
                  </Listbox.Item>
                ))}
              </Listbox.Content>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
      </div>
    );
  },
};

type PlaygroundArgs = {
  selectionMode: 'single' | 'multiple' | 'staged';
  closeOnBlur: boolean;
  disabled: boolean;
  error: boolean;
  placeholder: string;
  defaultOpen: boolean;
};

export const Interactive: StoryObj<PlaygroundArgs> = {
  name: 'Features / Interactive',
  args: {
    selectionMode: 'single',
    closeOnBlur: true,
    disabled: false,
    error: false,
    placeholder: 'Search frameworks',
    defaultOpen: false,
  },
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple', 'staged'],
      description: 'Selection mode for the combobox',
    },
    closeOnBlur: {
      control: 'boolean',
      description: 'Close dropdown when clicking outside',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the combobox',
    },
    error: {
      control: 'boolean',
      description: 'Show error state',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for input',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Open dropdown by default',
    },
  },
  render: args => {
    const { selectionMode, closeOnBlur, disabled, error, placeholder, defaultOpen } = args;
    const [value, setValue] = useState<string | undefined>();
    const [selection, setSelection] = useState<readonly string[]>([]);

    const filtered = value
      ? frameworks.filter(
          f =>
            f.name.toLowerCase().includes(value.toLowerCase()) ||
            f.language.toLowerCase().includes(value.toLowerCase()),
        )
      : frameworks;

    return (
      <div className='relative w-96 space-y-3'>
        <header>
          <h3 className='font-medium text-md'>Playground</h3>
          <p className='text-sm text-subtle'>Try different configurations</p>
        </header>
        <div className='rounded-sm bg-surface-primary px-3 py-2'>
          <h6 className='mb-2 font-medium text-sm'>Current State:</h6>
          <p className='text-subtle text-xs'>
            <span className='font-semibold'>Search Value:</span> {value ?? '(empty)'}
          </p>
          <p className='text-subtle text-xs'>
            <span className='font-semibold'>Selected:</span> {selection.length > 0 ? selection.join(', ') : '(none)'}
          </p>
          <p className='text-subtle text-xs'>
            <span className='font-semibold'>Mode:</span> {selectionMode}
          </p>
        </div>

        <Combobox.Root
          value={value}
          onChange={setValue}
          selection={selection}
          onSelectionChange={setSelection}
          selectionMode={selectionMode}
          closeOnBlur={closeOnBlur}
          disabled={disabled}
          error={error}
          defaultOpen={defaultOpen}
        >
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder={placeholder} />
                {selectionMode === 'staged' && <Combobox.Apply />}
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Listbox.Content className='max-h-60 rounded-sm'>
                {filtered.length > 0 ? (
                  filtered.map(({ id, ...rest }) => (
                    <Listbox.Item key={id} value={id}>
                      <ListboxItemContent {...rest} />
                    </Listbox.Item>
                  ))
                ) : (
                  <div className='px-4 py-3 text-sm text-subtle'>No frameworks found</div>
                )}
              </Listbox.Content>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
        {error && <p className='text-error text-sm'>There was an error with your selection</p>}
      </div>
    );
  },
};

//
// * Tree Content Stories
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

export const TreeContent: Story = {
  name: 'Features / Tree Content',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [value, setValue] = useState<string | undefined>();
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2']));
    const [activeId, setActiveId] = useState<string | null>('1'); // First item active by default

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

    // Filter nodes based on search value
    const filteredNodes = useMemo(() => {
      if (!value) return flatNodes;
      const searchLower = value.toLowerCase();
      return flatNodes.filter(node => node.data.label.toLowerCase().includes(searchLower));
    }, [flatNodes, value]);

    // Reset active to first item when filtered list changes and active item is not in list
    useEffect(() => {
      const firstNode = filteredNodes[0];
      if (firstNode) {
        const activeInList = activeId && filteredNodes.some(node => node.id === activeId);
        if (!activeInList) {
          setActiveId(firstNode.id);
        }
      }
    }, [filteredNodes, activeId]);

    // Calculate dynamic height based on visible items
    // Virtuoso requires explicit height - max-height alone causes 0 height
    const ROW_HEIGHT = 32; // Row height including gap (py-1.5 + content)
    const MAX_HEIGHT = 240; // max-h-60 equivalent (15rem = 240px)
    const GAP = 6; // gap-y-1.5 = 6px
    const PADDING = 8; // p-1 on scroller = 4px * 2

    const nodesCount = filteredNodes.length;
    const treeHeight = useMemo(() => {
      const contentHeight = nodesCount * ROW_HEIGHT + Math.max(nodesCount - 1, 0) * GAP + PADDING;
      return Math.min(contentHeight, MAX_HEIGHT);
    }, [nodesCount]);

    return (
      <div className='relative w-80 space-y-3'>
        <h3 className='font-medium text-md'>Combobox with Tree Content</h3>
        <p className='text-sm text-subtle'>Uses VirtualizedTreeList for hierarchical content</p>
        <Combobox.Root value={value} onChange={setValue} closeOnBlur={false} contentType='tree'>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search files...' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Combobox.TreeContent style={{ height: treeHeight }}>
                <VirtualizedTreeList
                  items={filteredNodes}
                  preserveFilteredSelection
                  clearSelectionOnEscape={false}
                  selection={selection}
                  onSelectionChange={setSelection}
                  selectionMode='multiple'
                  active={activeId}
                  onActiveChange={setActiveId}
                  onExpand={handleExpand}
                  onCollapse={handleCollapse}
                  virtuosoRef={virtuosoRef}
                  aria-label='File browser'
                  className='h-full'
                >
                  {({ items, getItemProps, containerProps }) => (
                    <Virtuoso<FlatNode<TreeNodeData>>
                      ref={virtuosoRef}
                      data={items}
                      components={treeVirtuosoComponents}
                      {...containerProps}
                      className={cn('h-full', containerProps.className)}
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
                              <div className='flex items-center gap-2'>
                                <span className='shrink-0 text-subtle group-data-[tone=inverse]:text-alt'>
                                  {getIcon(node.data.icon)}
                                </span>
                                <span className='truncate text-sm'>{node.data.label}</span>
                              </div>
                            </VirtualizedTreeList.RowContent>
                            <VirtualizedTreeList.RowRight>
                              <VirtualizedTreeList.RowSelectionControl rowId={node.id} />
                            </VirtualizedTreeList.RowRight>
                          </VirtualizedTreeList.Row>
                        );
                      }}
                    />
                  )}
                </VirtualizedTreeList>
              </Combobox.TreeContent>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
        <div className='rounded-sm bg-surface-primary px-3 py-2'>
          <p className='text-sm text-subtle'>
            <span className='font-semibold'>Selected:</span> {Array.from(selection).join(', ') || '(none)'}
          </p>
        </div>
      </div>
    );
  },
};

// Inner component to connect VirtualizedTreeList with Combobox's staged selection
const StagedTreeContent = ({
  items,
  activeId,
  onActiveChange,
  onExpand,
  onCollapse,
  virtuosoRef,
  treeHeight,
}: {
  items: FlatNode<TreeNodeData>[];
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
  onExpand: (id: string) => void;
  onCollapse: (id: string) => void;
  virtuosoRef: RefObject<VirtuosoHandle>;
  treeHeight: number;
}): ReactElement => {
  const { selection, onSelectionChange } = useCombobox();

  // Convert Set changes to array for Combobox's staged selection
  const handleTreeSelectionChange = useCallback(
    (newSelection: ReadonlySet<string>) => {
      onSelectionChange(Array.from(newSelection));
    },
    [onSelectionChange],
  );

  return (
    <Combobox.TreeContent style={{ height: treeHeight }}>
      <VirtualizedTreeList
        items={items}
        preserveFilteredSelection
        clearSelectionOnEscape={false}
        selection={selection}
        onSelectionChange={handleTreeSelectionChange}
        selectionMode='multiple'
        active={activeId}
        onActiveChange={onActiveChange}
        onExpand={onExpand}
        onCollapse={onCollapse}
        virtuosoRef={virtuosoRef}
        aria-label='File browser'
        className='h-full'
      >
        {({ items: visibleItems, getItemProps, containerProps }) => (
          <Virtuoso<FlatNode<TreeNodeData>>
            ref={virtuosoRef}
            data={visibleItems}
            components={treeVirtuosoComponents}
            {...containerProps}
            className={cn('h-full', containerProps.className)}
            itemContent={(index, node) => {
              const itemProps = getItemProps(index, node);
              return (
                <VirtualizedTreeList.Row {...itemProps}>
                  <VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowLevelSpacer level={node.level} />
                    <VirtualizedTreeList.RowExpandControl
                      expanded={node.isExpanded}
                      hasChildren={node.hasChildren}
                      onToggle={() => (node.isExpanded ? onCollapse(node.id) : onExpand(node.id))}
                      selected={itemProps.selected}
                    />
                  </VirtualizedTreeList.RowLeft>
                  <VirtualizedTreeList.RowContent>
                    <div className='flex items-center gap-2'>
                      <span className='shrink-0 text-subtle group-data-[tone=inverse]:text-alt'>
                        {getIcon(node.data.icon)}
                      </span>
                      <span className='truncate text-sm'>{node.data.label}</span>
                    </div>
                  </VirtualizedTreeList.RowContent>
                  <VirtualizedTreeList.RowRight>
                    <VirtualizedTreeList.RowSelectionControl rowId={node.id} />
                  </VirtualizedTreeList.RowRight>
                </VirtualizedTreeList.Row>
              );
            }}
          />
        )}
      </VirtualizedTreeList>
    </Combobox.TreeContent>
  );
};

export const TreeContentStaged: Story = {
  name: 'Features / Tree Content Staged',
  render: () => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [value, setValue] = useState<string | undefined>();
    const [appliedSelection, setAppliedSelection] = useState<readonly string[]>(['1', '1-1']); // Preselected: Documents, Work
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2']));
    const [activeId, setActiveId] = useState<string | null>('1');

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

    // Filter nodes based on search value
    const filteredNodes = useMemo(() => {
      if (!value) return flatNodes;
      const searchLower = value.toLowerCase();
      return flatNodes.filter(node => node.data.label.toLowerCase().includes(searchLower));
    }, [flatNodes, value]);

    // Reset active to first item when filtered list changes and active item is not in list
    useEffect(() => {
      const firstNode = filteredNodes[0];
      if (firstNode) {
        const activeInList = activeId && filteredNodes.some(node => node.id === activeId);
        if (!activeInList) {
          setActiveId(firstNode.id);
        }
      }
    }, [filteredNodes, activeId]);

    // Calculate dynamic height based on visible items
    const ROW_HEIGHT = 32;
    const MAX_HEIGHT = 240;
    const GAP = 6;
    const PADDING = 8;

    const nodesCount = filteredNodes.length;
    const treeHeight = useMemo(() => {
      const contentHeight = nodesCount * ROW_HEIGHT + Math.max(nodesCount - 1, 0) * GAP + PADDING;
      return Math.min(contentHeight, MAX_HEIGHT);
    }, [nodesCount]);

    return (
      <div className='relative w-80 space-y-3'>
        <header>
          <h3 className='font-medium text-md'>Tree with Staged Selection</h3>
          <p className='text-sm text-subtle'>
            Apply with button or <kbd className='rounded bg-surface-primary px-1 font-mono text-xs'>⌘/Ctrl+Enter</kbd>
          </p>
        </header>
        <Combobox.Root
          value={value}
          onChange={setValue}
          selection={appliedSelection}
          onSelectionChange={setAppliedSelection}
          selectionMode='staged'
          contentType='tree'
          closeOnBlur={false}
        >
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search files...' />
                <Combobox.Apply />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <StagedTreeContent
                items={filteredNodes}
                activeId={activeId}
                onActiveChange={setActiveId}
                onExpand={handleExpand}
                onCollapse={handleCollapse}
                virtuosoRef={virtuosoRef}
                treeHeight={treeHeight}
              />
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
        <div className='rounded-sm bg-surface-primary px-3 py-2'>
          <p className='text-sm text-subtle'>
            <span className='font-semibold'>Applied:</span> {appliedSelection.join(', ') || '(none)'}
          </p>
        </div>
      </div>
    );
  },
};

export const Portal: Story = {
  name: 'Features / Portal',
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const [selection, setSelection] = useState<readonly string[]>([]);

    const filtered = value
      ? frameworks.filter(
          f =>
            f.name.toLowerCase().includes(value.toLowerCase()) ||
            f.language.toLowerCase().includes(value.toLowerCase()),
        )
      : frameworks;

    const selectionDisplay =
      selection.length > 0 ? selection.map(id => frameworks.find(f => f.id === id)?.name ?? id).join(', ') : '(none)';

    return (
      <div className='mx-auto max-w-md space-y-6'>
        <div>
          <h3 className='font-medium text-md'>Portal Mode</h3>
          <p className='text-sm text-subtle'>
            The dropdown renders in <code className='rounded bg-surface-primary px-1 text-xs'>document.body</code>,
            escaping overflow containers.
          </p>
        </div>

        <div
          className='relative mx-auto h-32 w-80 overflow-hidden rounded-md border border-bdr-subtle border-dashed p-4'
          style={{ overflow: 'hidden' }}
        >
          <p className='mb-2 text-subtle text-xs'>Container with overflow: hidden</p>

          <Combobox.Root value={value} onChange={setValue} selection={selection} onSelectionChange={setSelection}>
            <Combobox.Content>
              <Combobox.Control>
                <Combobox.Search>
                  <Combobox.SearchIcon />
                  <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search frameworks' />
                  <Combobox.Toggle />
                </Combobox.Search>
              </Combobox.Control>

              <Combobox.Portal>
                <Combobox.Popup>
                  <Listbox.Content className='rounded-sm'>
                    {filtered.map(({ id, ...rest }) => (
                      <Listbox.Item key={id} value={id}>
                        <ListboxItemContent {...rest} />
                      </Listbox.Item>
                    ))}
                  </Listbox.Content>
                </Combobox.Popup>
              </Combobox.Portal>
            </Combobox.Content>
          </Combobox.Root>
        </div>

        <div className='mx-auto w-80 rounded-sm bg-surface-primary px-3 py-2'>
          <p className='text-sm text-subtle'>
            <span className='font-semibold'>Selected:</span> {selectionDisplay}
          </p>
        </div>
      </div>
    );
  },
};
