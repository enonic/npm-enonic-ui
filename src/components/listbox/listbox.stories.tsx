import { Checkbox, IconButton } from '@/components';
import { Listbox, type ListboxRootProps } from '@/components/listbox/listbox';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'preact/hooks';

type Story = StoryObj<ListboxRootProps>;

type Data = {
  id: string;
  name: string;
};

const frameworks: Data[] = [
  { id: 'react', name: 'React' },
  { id: 'vue', name: 'Vue' },
  { id: 'angular', name: 'Angular' },
  { id: 'svelte', name: 'Svelte' },
  { id: 'preact', name: 'Preact' },
];

const cities: Data[] = [
  { id: 'nyc', name: 'New York' },
  { id: 'london', name: 'London' },
  { id: 'tokyo', name: 'Tokyo' },
  { id: 'paris', name: 'Paris' },
  { id: 'barcelona', name: 'Barcelona' },
];

const countries: Data[] = Array.from({ length: 50 }, (_, i) => ({
  id: `country-${i + 1}`,
  name: `Country ${i + 1}`,
}));

export default {
  title: 'Components/Listbox',
  component: Listbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Selection mode',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the listbox',
    },
  },
} satisfies Meta<ListboxRootProps>;

export const SingleSelection: Story = {
  name: 'Single Selection',
  args: {
    selectionMode: 'single',
    disabled: false,
  },
  argTypes: {
    selectionMode: { control: false },
  },
  render: ({ disabled }) => {
    const [selection, setSelection] = useState<readonly string[]>([]);
    return (
      <div className='min-w-45 p-4'>
        <h3 className='text-sm font-medium mb-3'>Select a framework</h3>
        <Listbox selectionMode='single' disabled={disabled} selection={selection} onSelectionChange={setSelection}>
          <Listbox.Content label='Select a framework'>
            {frameworks.map(({ id, name }) => (
              <Listbox.Item key={id} value={id}>
                <div className='flex-1'>{name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>
        <p className='text-sm text-main/70 mt-3'>
          Selected: {selection.length > 0 ? frameworks.find(({ id }) => selection.includes(id))?.name : 'None'}
        </p>
      </div>
    );
  },
};

export const MultipleSelection: Story = {
  name: 'Multiple Selection',
  args: {
    selectionMode: 'multiple',
    disabled: false,
  },
  argTypes: {
    selectionMode: { control: false },
  },
  render: ({ disabled }) => {
    const [selection, setSelection] = useState<readonly string[]>([]);
    return (
      <div className='min-w-45 p-4'>
        <h3 className='text-sm font-medium mb-3'>Select cities to visit</h3>
        <Listbox selectionMode='multiple' disabled={disabled} selection={selection} onSelectionChange={setSelection}>
          <Listbox.Content label='Select cities to visit'>
            {cities.map(({ id, name }) => (
              <Listbox.Item key={id} value={id}>
                <div className='flex-1'>{name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>
        <p className='text-sm text-main/70 mt-3'>
          Selected {selection.length} {selection.length === 1 ? 'city' : 'cities'}
        </p>
      </div>
    );
  },
};

export const WithCheckboxes: Story = {
  name: 'Selection with Checkboxes',
  args: {
    selectionMode: 'multiple',
    disabled: false,
  },
  render: ({ selectionMode, disabled }) => {
    const [selection, setSelection] = useState<readonly string[]>(['preact']);
    return (
      <div className='min-w-52 p-4'>
        <h3 className='text-sm font-medium mb-3'>Choose your frameworks</h3>
        <Listbox
          selectionMode={selectionMode}
          disabled={disabled}
          selection={selection}
          onSelectionChange={setSelection}
        >
          <Listbox.Content label='Choose your frameworks'>
            {frameworks.map(({ id, name }) => {
              const isSelected = selection.includes(id);
              return (
                <Listbox.Item key={id} value={id}>
                  <div className='flex-1'>{name}</div>
                  <Checkbox
                    checked={isSelected}
                    tabIndex={-1}
                    onCheckedChange={() => {
                      const newSelection = isSelected ? selection.filter(v => v !== id) : [...selection, id];
                      setSelection(newSelection);
                    }}
                  />
                </Listbox.Item>
              );
            })}
          </Listbox.Content>
        </Listbox>
      </div>
    );
  },
};

export const Preselected: Story = {
  name: 'With Pre-selected Items',
  args: {
    selectionMode: 'multiple',
    disabled: false,
  },
  argTypes: {
    selectionMode: { control: false },
  },
  render: ({ disabled }) => {
    const [selection, setSelection] = useState<readonly string[]>(['react', 'vue', 'svelte']);
    return (
      <div className='min-w-52 p-4'>
        <h3 className='text-sm font-medium mb-3'>Your favorite frameworks</h3>
        <Listbox selectionMode='multiple' disabled={disabled} selection={selection} onSelectionChange={setSelection}>
          <Listbox.Content label='Your favorite frameworks'>
            {frameworks.map(({ id, name }) => (
              <Listbox.Item key={id} value={id}>
                <div className='flex-1'>{name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>
      </div>
    );
  },
};

export const Disabled: Story = {
  name: 'Disabled State',
  args: {
    selectionMode: 'single',
    disabled: true,
  },
  argTypes: {
    selectionMode: { control: false },
  },
  render: ({ selectionMode, disabled }) => {
    const [selection, setSelection] = useState<readonly string[]>(['react', 'vue']);
    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Disabled listbox</h3>
        <Listbox
          selectionMode={selectionMode}
          disabled={disabled}
          selection={selection}
          onSelectionChange={setSelection}
        >
          <Listbox.Content label='Disabled listbox'>
            {frameworks.map(({ id, name }) => (
              <Listbox.Item key={id} value={id}>
                <div className='flex-1'>{name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>
      </div>
    );
  },
};

export const LongList: Story = {
  name: 'Long List with Scroll',
  args: {
    selectionMode: 'single',
    disabled: false,
  },
  argTypes: {
    selectionMode: { control: false },
  },
  render: ({ disabled }) => {
    const [selection, setSelection] = useState<readonly string[]>([]);
    return (
      <div className='flex flex-col gap-y-3 p-4'>
        <div className='flex flex-col gap-y-3 items-center'>
          <h3 className='text-sm font-medium'>Select a country</h3>
          <Listbox selectionMode='single' disabled={disabled} selection={selection} onSelectionChange={setSelection}>
            <Listbox.Content className='max-h-40 flex-auto' label='Select a country'>
              {countries.map(({ id, name }) => (
                <Listbox.Item key={id} value={id}>
                  <div className='flex-1 whitespace-nowrap'>{name}</div>
                </Listbox.Item>
              ))}
            </Listbox.Content>
          </Listbox>
          <p className='text-sm text-main/70'>
            Selected: {selection.length > 0 ? countries.find(({ id }) => selection.includes(id))?.name : 'None'}
          </p>
        </div>
        <p className='text-sm text-main/70 mt-3'>
          {'Use '}
          <span className='inline-flex items-center gap-x-1 font-mono text-xs'>
            <span className='px-1 border border-main/20 rounded-sm'>↑</span>
            <span className='px-1 border border-main/20 rounded-sm'>↓</span>
            <span className='px-1 border border-main/20 rounded-sm'>Home</span>
            <span className='px-1 border border-main/20 rounded-sm'>End</span>
          </span>
          {' keys to navigate'}
        </p>
      </div>
    );
  },
};

export const OuterNavigation: Story = {
  name: 'Navigate from Outside',
  argTypes: {
    selectionMode: { control: false },
    disabled: { control: false },
  },
  render: () => {
    const [selection, setSelection] = useState<readonly string[]>([]);
    const [active, setActive] = useState<string | null | undefined>(undefined);

    const navHandler = (delta: number): void => {
      const activeIndex = active ? frameworks.findIndex(({ id }) => id === active) : -1;
      let newIndex = activeIndex + delta;
      if (newIndex < 0) {
        newIndex = frameworks.length - 1;
      }
      if (newIndex >= frameworks.length) {
        newIndex = 0;
      }
      setActive(frameworks[newIndex].id);
    };

    return (
      <div className='min-w-52 p-4'>
        <IconButton icon={ArrowUp} onClick={() => navHandler(-1)} variant='outline' shape='round' className='mr-1' />
        <IconButton icon={ArrowDown} onClick={() => navHandler(1)} variant='outline' shape='round' />

        <Listbox
          selectionMode='multiple'
          selection={selection}
          onSelectionChange={setSelection}
          active={active}
          setActive={setActive}
        >
          <Listbox.Content className='mt-4' tabIndex={-1}>
            {frameworks.map(({ id, name }) => (
              <Listbox.Item key={id} value={id}>
                <div className='flex-1'>{name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>

        <h3 className='text-sm text-subtle mt-3'>Navigate list using buttons</h3>
      </div>
    );
  },
};

export const WithCustomGroups: Story = {
  name: 'With Custom Group Headers',
  args: {
    selectionMode: 'multiple',
    disabled: false,
  },
  argTypes: {
    selectionMode: { control: false },
  },
  render: ({ disabled }) => {
    const [selection, setSelection] = useState<readonly string[]>(['react', 'vue']);

    const uiFrameworks = [
      { id: 'tailwind', name: 'Tailwind CSS' },
      { id: 'bootstrap', name: 'Bootstrap' },
    ];

    const jsFrameworks = [
      { id: 'react', name: 'React' },
      { id: 'vue', name: 'Vue' },
      { id: 'angular', name: 'Angular' },
      { id: 'svelte', name: 'Svelte' },
      { id: 'preact', name: 'Preact' },
    ];

    const experimental = [
      { id: 'solid', name: 'Solid' },
      { id: 'qwik', name: 'Qwik' },
    ];

    return (
      <div className='w-72 p-4'>
        <h3 className='text-sm font-medium mb-3'>Select frameworks (grouped)</h3>
        <Listbox selectionMode='multiple' disabled={disabled} selection={selection} onSelectionChange={setSelection}>
          <Listbox.Content className='max-h-60' label='Select frameworks (grouped)'>
            <div className='pt-3 pb-1 px-1 text-xs uppercase text-subtle font-semibold top-0 bg-surface-neutral'>
              UI Frameworks
            </div>
            {uiFrameworks.map(({ id, name }) => (
              <Listbox.Item key={id} value={id}>
                <div className='flex-1'>{name}</div>
              </Listbox.Item>
            ))}

            <div className='pt-3 pb-1 px-1 text-xs uppercase text-subtle font-semibold top-0 bg-surface-neutral'>
              JavaScript Frameworks
            </div>
            {jsFrameworks.map(({ id, name }) => (
              <Listbox.Item key={id} value={id}>
                <div className='flex-1'>{name}</div>
              </Listbox.Item>
            ))}

            <div className='pt-3 pb-1 px-1 text-xs uppercase text-subtle font-semibold sticky top-0 bg-surface-neutral'>
              Experimental
            </div>
            {experimental.map(({ id, name }) => (
              <Listbox.Item key={id} value={id}>
                <div className='flex-1'>{name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>

        <p className='text-sm text-main/70 mt-3'>Selected: {selection.length > 0 ? selection.join(', ') : 'None'}</p>
      </div>
    );
  },
};

export const Uncontrolled: Story = {
  name: 'Interactive Playground',
  render: ({ selectionMode, disabled }) => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3'>Uncontrolled listbox</h3>
      <Listbox selectionMode={selectionMode} disabled={disabled} defaultSelection={['react']}>
        <Listbox.Content>
          {frameworks.map(({ id, name }) => (
            <Listbox.Item key={id} value={id}>
              <div className='flex-1'>{name}</div>
            </Listbox.Item>
          ))}
        </Listbox.Content>
      </Listbox>
    </div>
  ),
};
