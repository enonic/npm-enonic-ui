import { type ReactNode, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Button } from '@/components/button';
import { Combobox } from '@/components/combobox';
import { ContextMenu } from '@/components/context-menu';
import { DatePicker } from '@/components/date-picker';
import { GridList } from '@/components/grid-list';
import { Listbox } from '@/components/listbox';
import { Menu } from '@/components/menu';
import { Menubar } from '@/components/menubar';
import { Selector } from '@/components/selector';
import { Tab } from '@/components/tab';
import { TimePicker } from '@/components/time-picker';
import { ToggleGroup } from '@/components/toggle-group';
import { Toolbar } from '@/components/toolbar';
import { TreeList } from '@/components/tree-list';
import { type FlatNode, VirtualizedTreeList } from '@/components/virtualized-tree-list';
import { useCombobox } from '@/providers';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { Dialog } from './dialog';

export default {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
  tags: ['dialog-shortcuts'],
} satisfies Meta<typeof Dialog>;

type Story = StoryObj<typeof Dialog>;

const items = ['One', 'Two'];
const nodes: FlatNode<string>[] = items.map(item => ({
  id: item,
  data: item,
  level: 1,
  parentId: null,
  hasChildren: false,
  isExpanded: false,
}));

const TreeRows = () => (
  <TreeList.Container>
    {items.map(item => (
      <TreeList.Row key={item} id={item}>
        <TreeList.RowLeft>
          <TreeList.RowSelectionControl rowId={item} />
        </TreeList.RowLeft>
        <TreeList.RowContent>{item}</TreeList.RowContent>
      </TreeList.Row>
    ))}
  </TreeList.Container>
);

const ListOptions = ({ label = 'Options' }: { label?: string }) => (
  <Listbox.Content label={label}>
    {items.map(item => (
      <Listbox.Item key={item} value={item}>
        {item}
      </Listbox.Item>
    ))}
  </Listbox.Content>
);

const StagedOptions = ({ tree }: { tree: boolean }) => {
  const { selection, onSelectionChange } = useCombobox();
  return tree ? (
    <Combobox.TreeContent>
      <TreeList
        selectionMode='multiple'
        selection={selection}
        onSelectionChange={next => onSelectionChange([...next])}
        aria-label='Options'
      >
        <TreeRows />
      </TreeList>
    </Combobox.TreeContent>
  ) : (
    <ListOptions />
  );
};

const StagedCombobox = ({ tree = false }: { tree?: boolean }) => {
  const [selection, setSelection] = useState<readonly string[]>([]);
  return (
    <div className='space-y-3'>
      <Combobox
        selectionMode='staged'
        contentType={tree ? 'tree' : 'auto'}
        selection={selection}
        onSelectionChange={setSelection}
      >
        <Combobox.Content>
          <Combobox.Control>
            <Combobox.Search>
              <Combobox.Input aria-label='Choose options' placeholder='Choose options' />
              <Combobox.Apply />
            </Combobox.Search>
          </Combobox.Control>
          <Combobox.Popup>
            <StagedOptions tree={tree} />
          </Combobox.Popup>
        </Combobox.Content>
      </Combobox>
      <p className='text-subtle text-sm'>Applied: {selection.join(', ') || 'None'}</p>
    </div>
  );
};

const firstStep = 'Pickers';
const groups: { title: string; widgets: Record<string, ReactNode> }[] = [
  {
    title: firstStep,
    widgets: {
      DatePicker: (
        <DatePicker native={false} defaultValue={new Date(2026, 9, 15)}>
          <DatePicker.Trigger>Choose date</DatePicker.Trigger>
          <DatePicker.Portal>
            <DatePicker.Content />
          </DatePicker.Portal>
        </DatePicker>
      ),
      TimePicker: <TimePicker native={false} defaultValue='12:30' />,
      Selector: (
        <Selector defaultValue='One'>
          <Selector.Trigger aria-label='Choose an option'>
            <Selector.Value />
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {items.map(item => (
                <Selector.Item key={item} value={item} textValue={item}>
                  <Selector.ItemText>{item}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
        </Selector>
      ),
    },
  },
  {
    title: 'Lists',
    widgets: {
      TreeList: (
        <TreeList selectionMode='multiple' aria-label='Options'>
          <TreeRows />
        </TreeList>
      ),
      VirtualizedTreeList: (
        <VirtualizedTreeList items={nodes} selectionMode='multiple' aria-label='Options'>
          {({ items, containerProps, getItemProps }) => (
            <Virtuoso
              {...containerProps}
              data={items}
              style={{ height: 120 }}
              itemContent={(index, node) => (
                <VirtualizedTreeList.Row {...getItemProps(index, node)}>
                  <VirtualizedTreeList.RowLeft>
                    <VirtualizedTreeList.RowSelectionControl rowId={node.id} />
                  </VirtualizedTreeList.RowLeft>
                  <VirtualizedTreeList.RowContent>{node.data}</VirtualizedTreeList.RowContent>
                </VirtualizedTreeList.Row>
              )}
            />
          )}
        </VirtualizedTreeList>
      ),
      GridList: (
        <GridList label='Actions'>
          <GridList.Row className='gap-1.5 p-2' id='one'>
            {items.map(item => (
              <GridList.Cell key={item}>
                <GridList.Action>
                  <Button label={item} />
                </GridList.Action>
              </GridList.Cell>
            ))}
          </GridList.Row>
        </GridList>
      ),
    },
  },
  {
    title: 'Menus',
    widgets: {
      Menu: (
        <Menu>
          <Menu.Trigger>Open menu</Menu.Trigger>
          <Menu.Portal>
            <Menu.Content>
              <Menu.Item>Action</Menu.Item>
              <Menu.RadioGroup defaultValue='One'>
                {items.map(item => (
                  <Menu.RadioItem key={item} value={item}>
                    {item}
                  </Menu.RadioItem>
                ))}
              </Menu.RadioGroup>
            </Menu.Content>
          </Menu.Portal>
        </Menu>
      ),
      ContextMenu: (
        <ContextMenu>
          <ContextMenu.Trigger className='border-bdr-subtle rounded-sm border p-4' tabIndex={0}>
            Right-click for menu
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content>
              <ContextMenu.Item>Action</ContextMenu.Item>
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger>More</ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent>
                    <ContextMenu.Item>Nested action</ContextMenu.Item>
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu>
      ),
      Menubar: (
        <Menubar>
          <Menubar.Nav aria-label='Application'>
            <Menubar.Menu>
              <Menubar.Trigger>File</Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content>
                  <Menubar.Item>Action</Menubar.Item>
                  <Menubar.RadioGroup defaultValue='One'>
                    {items.map(item => (
                      <Menubar.RadioItem key={item} value={item}>
                        {item}
                      </Menubar.RadioItem>
                    ))}
                  </Menubar.RadioGroup>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          </Menubar.Nav>
        </Menubar>
      ),
    },
  },
  {
    title: 'Actions',
    widgets: {
      Toolbar: (
        <Toolbar>
          <Toolbar.Container aria-label='Actions'>
            {items.map(item => (
              <Toolbar.Item key={item} asChild>
                <Button label={item} />
              </Toolbar.Item>
            ))}
          </Toolbar.Container>
        </Toolbar>
      ),
      ToggleGroup: (
        <ToggleGroup type='single' defaultValue='One'>
          {items.map(item => (
            <ToggleGroup.Item key={item} value={item}>
              {item}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      ),
    },
  },
  {
    title: 'Comboboxes',
    widgets: {
      'Staged Combobox': <StagedCombobox />,
      'Staged Tree Combobox': <StagedCombobox tree />,
    },
  },
  {
    title: 'Scope',
    widgets: {
      Listbox: (
        <Listbox selectionMode='multiple'>
          <ListOptions label='Inside dialog' />
        </Listbox>
      ),
    },
  },
];

export const WidgetShortcutPassthrough: Story = {
  name: 'Shortcuts / Widget Passthrough',
  render: () => {
    const [step, setStep] = useState(firstStep);
    const [primary, setPrimary] = useState(0);
    const [secondary, setSecondary] = useState(0);
    const modal = step !== 'Scope';

    return (
      <Dialog step={step} onStepChange={setStep}>
        <Dialog.Trigger asChild>
          <Button label='Open shortcut demo' />
        </Dialog.Trigger>
        {!modal && (
          <aside className='fixed top-8 left-8 w-48 space-y-3'>
            <h3 className='font-semibold'>Outside dialog</h3>
            <p className='text-subtle text-sm'>Enter keeps its normal selection behavior here.</p>
            <Listbox selectionMode='multiple'>
              <ListOptions label='Outside dialog' />
            </Listbox>
          </aside>
        )}
        <Dialog.Portal>
          {modal && <Dialog.Overlay />}
          <Dialog.Content className='w-160 max-w-full' modal={modal}>
            {groups.map(({ title }, index) => (
              <Dialog.StepHeader
                key={title}
                step={title}
                title={`${index + 1}. ${title}`}
                description={
                  index === 0
                    ? 'Use Cmd/Ctrl+Enter for Primary and Cmd/Ctrl+Shift+Enter for Secondary. Open selectors, date/time pickers, menus and staged comboboxes handle Enter locally.'
                    : undefined
                }
                withClose
              />
            ))}
            <Dialog.Body className='min-h-40 p-2'>
              {groups.map(({ title, widgets }) => (
                <Dialog.StepContent key={title} step={title}>
                  {step === title && (
                    <Tab defaultValue={Object.keys(widgets)[0]} activationMode='manual' autoFocusTrigger={false}>
                      <Tab.List aria-label={`${title} widgets`}>
                        {Object.entries(widgets).map(([widgetTitle]) => (
                          <Tab.DefaultTrigger key={widgetTitle} value={widgetTitle}>
                            {widgetTitle}
                          </Tab.DefaultTrigger>
                        ))}
                      </Tab.List>
                      {Object.entries(widgets).map(([widgetTitle, content]) => (
                        <Tab.Content key={widgetTitle} value={widgetTitle} className='space-y-3'>
                          <h3 className='font-semibold'>{widgetTitle}</h3>
                          {content}
                        </Tab.Content>
                      ))}
                    </Tab>
                  )}
                </Dialog.StepContent>
              ))}
            </Dialog.Body>
            <Dialog.Footer className='flex-wrap'>
              <output className='text-subtle basis-full text-sm' data-testid='shortcut-actions'>
                Primary: {primary} · Secondary: {secondary}
              </output>
              <Dialog.Shortcut className='sr-only' tabIndex={-1} onClick={() => setPrimary(count => count + 1)}>
                Primary
              </Dialog.Shortcut>
              <Dialog.Shortcut
                className='sr-only'
                tabIndex={-1}
                shortcut='secondary'
                onClick={() => setSecondary(count => count + 1)}
              >
                Secondary
              </Dialog.Shortcut>
              <Dialog.StepIndicator
                previousLabel='Previous'
                nextLabel='Next'
                lastStepLabel='Start over'
                onLastStep={() => setStep(firstStep)}
                dots
              />
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    );
  },
};
