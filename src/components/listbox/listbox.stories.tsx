import { Checkbox, IconButton } from '@/components';
import { Listbox } from '@/components/listbox/listbox';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'preact/hooks';

type Story = StoryObj<typeof Listbox>;

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
    label: {
      control: 'text',
      description: 'Accessible label for the listbox',
    },
  },
} satisfies Meta;

export const SingleSelection: Story = {
  name: 'Single Selection',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Select a framework</h3>
        <Listbox selectionMode='single' selection={selection} setSelection={setSelection}>
          <Listbox.Content>
            {frameworks.map(f => (
              <Listbox.Item key={f.id} value={f.id}>
                <div className='flex-1'>{f.name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>
        <p className='text-sm text-main/70 mt-3'>
          Selected: {selection.size > 0 ? frameworks.find(fr => selection.has(fr.id))?.name : 'None'}
        </p>
      </div>
    );
  },
};

export const MultipleSelection: Story = {
  name: 'Multiple Selection',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Select cities to visit</h3>
        <Listbox selectionMode='multiple' selection={selection} setSelection={setSelection}>
          <Listbox.Content>
            {cities.map(c => (
              <Listbox.Item key={c.id} value={c.id}>
                <div className='flex-1'>{c.name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>
        <p className='text-sm text-main/70 mt-3'>
          Selected {selection.size} {selection.size === 1 ? 'city' : 'cities'}
        </p>
      </div>
    );
  },
};

export const WithCheckboxes: Story = {
  name: 'Multiple Selection with Checkboxes',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set(['preact']));
    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Choose your frameworks</h3>
        <Listbox selectionMode='multiple' selection={selection} setSelection={setSelection}>
          <Listbox.Content>
            {frameworks.map(f => {
              const isSelected = selection.has(f.id);
              return (
                <Listbox.Item key={f.id} value={f.id}>
                  <div className='flex-1'>{f.name}</div>
                  <Checkbox
                    checked={isSelected}
                    tabIndex={-1}
                    onCheckedChange={() => {
                      const newSelection = new Set(selection);
                      if (isSelected) {
                        newSelection.delete(f.id);
                      } else {
                        newSelection.add(f.id);
                      }
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
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set(['react', 'vue', 'svelte']));
    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Your favorite frameworks</h3>
        <Listbox selectionMode='multiple' selection={selection} setSelection={setSelection}>
          <Listbox.Content>
            {frameworks.map(f => (
              <Listbox.Item key={f.id} value={f.id}>
                <div className='flex-1'>{f.name}</div>
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
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Select a country (use ↑↓ arrows, Home/End keys to navigate)</h3>
        <Listbox selectionMode='single' selection={selection} setSelection={setSelection}>
          <Listbox.Content className='max-h-40'>
            {countries.map(c => (
              <Listbox.Item key={c.id} value={c.id}>
                <div className='flex-1'>{c.name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>
        <p className='text-sm text-main/70 mt-3'>
          Selected: {selection.size > 0 ? countries.find(ct => selection.has(ct.id))?.name : 'None'}
        </p>
      </div>
    );
  },
};

export const NotFocusable: Story = {
  name: 'Not Focusable',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Listbox is not focusable</h3>
        <Listbox selectionMode='multiple' selection={selection} setSelection={setSelection}>
          <Listbox.Content domFocusable={false}>
            {frameworks.map(f => (
              <Listbox.Item key={f.id} value={f.id}>
                <div className='flex-1'>{f.name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>
      </div>
    );
  },
};

export const Visual_Focus: Story = {
  name: 'Visual Focus',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>
          DOM focusable: <b>false</b>
        </h3>
        <h3 className='text-sm font-medium mb-3'>
          Visual focus: <b>true</b>
        </h3>
        <Listbox selectionMode='multiple' selection={selection} setSelection={setSelection}>
          <Listbox.Content domFocusable={false} visualFocus={true}>
            {frameworks.map(f => (
              <Listbox.Item key={f.id} value={f.id}>
                <div className='flex-1'>{f.name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>
        <h3 className='text-sm mt-3 font-medium'>No navigation with keyboard because listbox is not focusable</h3>
      </div>
    );
  },
};

export const Outer_Navigation: Story = {
  name: 'Navigate from Outside',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
    const [active, setActive] = useState<string | undefined>(undefined);

    const navHandler = (delta: number): void => {
      const activeIndex = active ? frameworks.findIndex(f => f.id === active) : -1;
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
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>
          DOM focusable: <b>false</b>
        </h3>
        <h3 className='text-sm font-medium mb-3'>
          Visual focus: <b>true</b>
        </h3>

        <IconButton icon={ArrowUp} onClick={() => navHandler(-1)} variant='text' shape='round' className='mr-1' />
        <IconButton icon={ArrowDown} onClick={() => navHandler(1)} variant='text' shape='round' />

        <Listbox
          selectionMode='multiple'
          selection={selection}
          setSelection={setSelection}
          active={active}
          setActive={setActive}
        >
          <Listbox.Content className='mt-4' domFocusable={false} visualFocus={true}>
            {frameworks.map(f => (
              <Listbox.Item key={f.id} value={f.id}>
                <div className='flex-1'>{f.name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>

        <h3 className='text-sm font-medium mt-3'>Navigate list using outer controls</h3>
      </div>
    );
  },
};

export const Uncontrolled: Story = {
  name: 'Uncontrolled Mode',
  render: () => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3'>Uncontrolled listbox with default selection</h3>
      <Listbox selectionMode='multiple' defaultSelection={new Set(['react', 'preact'])}>
        <Listbox.Content>
          {frameworks.map(f => (
            <Listbox.Item key={f.id} value={f.id}>
              <div className='flex-1'>{f.name}</div>
            </Listbox.Item>
          ))}
        </Listbox.Content>
      </Listbox>
      <p className='text-sm text-main/70 mt-3'>Component manages its own state</p>
    </div>
  ),
};

export const Disabled: Story = {
  name: 'Disabled State',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set(['react', 'vue']));
    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Disabled listbox</h3>
        <Listbox selectionMode='multiple' disabled selection={selection} setSelection={setSelection}>
          <Listbox.Content>
            {frameworks.map(f => (
              <Listbox.Item key={f.id} value={f.id}>
                <div className='flex-1'>{f.name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>
      </div>
    );
  },
};

export const WithCustomGroups: Story = {
  name: 'With Custom Group Headers',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set(['react', 'vue']));

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
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Select frameworks (grouped)</h3>
        <Listbox selectionMode='multiple' selection={selection} setSelection={setSelection}>
          <Listbox.Content className='max-h-60 w-100'>
            <div className='px-4 py-1 text-xs uppercase text-subtle font-semibold top-0 bg-surface-neutral'>
              UI Frameworks
            </div>
            {uiFrameworks.map(f => (
              <Listbox.Item key={f.id} value={f.id}>
                <div className='flex-1'>{f.name}</div>
              </Listbox.Item>
            ))}

            <div className='px-4 py-1 text-xs uppercase text-subtle font-semibold top-0 bg-surface-neutral'>
              JavaScript Frameworks
            </div>
            {jsFrameworks.map(f => (
              <Listbox.Item key={f.id} value={f.id}>
                <div className='flex-1'>{f.name}</div>
              </Listbox.Item>
            ))}

            <div className='px-4 py-1 text-xs uppercase text-subtle font-semibold sticky top-0 bg-surface-neutral'>
              🧪 Experimental
            </div>
            {experimental.map(f => (
              <Listbox.Item key={f.id} value={f.id}>
                <div className='flex-1'>{f.name}</div>
              </Listbox.Item>
            ))}
          </Listbox.Content>
        </Listbox>

        <p className='text-sm text-main/70 mt-3 max-w-100'>
          Selected: {Array.from(selection).length > 0 ? Array.from(selection).join(', ') : 'None'}
        </p>
      </div>
    );
  },
};
