import { Checkbox } from '@/components';
import { Listbox, type ListboxProps } from '@/components/listbox/listbox';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useEffect, useState } from 'preact/hooks';

type Story = StoryObj<ListboxProps<Data>>;

type Data = {
  id: string;
  name: string;
};

// Sample data for stories
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
} satisfies Meta<ListboxProps<Data>>;

export const SingleSelection: Story = {
  name: 'Single Selection',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Select a framework</h3>
        <Listbox
          selectionMode='single'
          selection={selection}
          setSelection={setSelection}
          items={frameworks}
          getValue={item => item.id}
          renderItem={item => <div className='flex-1'>{item.name}</div>}
        />
        <p className='text-sm text-main/70 mt-3'>
          Selected: {selection.size > 0 ? frameworks.find(f => selection.has(f.id))?.name : 'None'}
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
        <Listbox
          selectionMode='multiple'
          selection={selection}
          setSelection={setSelection}
          items={cities}
          getValue={item => item.id}
          renderItem={item => <div className='flex-1'>{item.name}</div>}
        />
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
        <Listbox
          selectionMode='multiple'
          selection={selection}
          setSelection={setSelection}
          items={frameworks}
          getValue={item => item.id}
          renderItem={item => {
            const isSelected = selection.has(item.id);
            return (
              <>
                <div className='flex-1'>{item.name}</div>
                <Checkbox
                  checked={isSelected}
                  tabIndex={-1}
                  onCheckedChange={() => {
                    const newSelection = new Set(selection);
                    if (isSelected) {
                      newSelection.delete(item.id);
                    } else {
                      newSelection.add(item.id);
                    }
                    setSelection(newSelection);
                  }}
                />
              </>
            );
          }}
        />
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
        <Listbox
          selectionMode='multiple'
          selection={selection}
          setSelection={setSelection}
          items={frameworks}
          getValue={item => item.id}
          renderItem={item => <div className='flex-1'>{item.name}</div>}
        />
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
        <Listbox
          className='max-h-40'
          selectionMode='single'
          selection={selection}
          setSelection={setSelection}
          items={countries}
          getValue={item => item.id}
          renderItem={item => <div className='flex-1'>{item.name}</div>}
        />
        <p className='text-sm text-main/70 mt-3'>
          Selected: {selection.size > 0 ? countries.find(c => selection.has(c.id))?.name : 'None'}
        </p>
      </div>
    );
  },
};

export const Uncontrolled: Story = {
  name: 'Uncontrolled Mode',
  render: () => {
    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Uncontrolled listbox with default selection</h3>
        <Listbox
          selectionMode='multiple'
          defaultSelection={new Set(['react', 'preact'])}
          items={frameworks}
          getValue={item => item.id}
          renderItem={item => <div className='flex-1'>{item.name}</div>}
        />
        <p className='text-sm text-main/70 mt-3'>Component manages its own state</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  name: 'Disabled State',
  render: () => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set(['react', 'vue']));

    return (
      <div className='p-4'>
        <h3 className='text-sm font-medium mb-3'>Disabled listbox</h3>
        <Listbox
          selectionMode='multiple'
          disabled
          selection={selection}
          setSelection={setSelection}
          items={frameworks}
          getValue={item => item.id}
          renderItem={item => <div className='flex-1'>{item.name}</div>}
        />
      </div>
    );
  },
};

export const InteractivePlayground: Story = {
  name: 'Interactive Playground',
  args: {
    selectionMode: 'single',
    disabled: false,
    label: 'Interactive Listbox',
  },
  render: args => {
    const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());

    // Reset selection when selectionMode changes
    useEffect(() => {
      if (args.selectionMode === 'single' && selection.size > 1) {
        const firstItem = Array.from(selection)[0];
        setSelection(new Set(firstItem ? [firstItem] : []));
      }
    }, [args.selectionMode]);

    return (
      <Listbox
        selectionMode={args.selectionMode}
        disabled={args.disabled}
        label={args.label}
        selection={selection}
        setSelection={setSelection}
        items={frameworks}
        getValue={item => item.id}
        renderItem={item => <div className='flex-1'>{item.name}</div>}
      />
    );
  },
};
