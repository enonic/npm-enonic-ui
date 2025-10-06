import { Checkbox } from '@/components';
import { Listbox } from '@/components/listbox/listbox';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useState } from 'preact/hooks';

type Story = StoryObj<typeof Listbox>;

type StoryData = {
  id: string;
  label: string;
};

const getValue = (item: unknown): string => (item as StoryData).id;
const renderItem = (item: unknown): React.ReactNode => <div className='flex-1'>{(item as StoryData).label}</div>;

export default {
  title: 'Components/Listbox',
  component: Listbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Listbox>;

export const Default: Story = {
  name: 'Single Selection',
  render: () => {
    const [selection, setSelection] = useState<Set<string>>(new Set());

    return (
      <Listbox
        selectionMode='single'
        selection={selection}
        setSelection={setSelection}
        items={[
          { id: 'a', label: 'Single 1' },
          { id: 'b', label: 'Single 2' },
          { id: 'c', label: 'Single 3' },
        ]}
        getValue={getValue}
        renderItem={renderItem}
      />
    );
  },
};

export const Multiple: Story = {
  name: 'Multiple Selection',
  render: () => {
    const [selection, setSelection] = useState<Set<string>>(new Set());

    return (
      <Listbox
        selectionMode='multiple'
        selection={selection}
        setSelection={setSelection}
        items={[
          { id: 'a', label: 'Multiple 1' },
          { id: 'b', label: 'Multiple 2' },
          { id: 'c', label: 'Multiple 3' },
        ]}
        getValue={getValue}
        renderItem={renderItem}
      />
    );
  },
};

export const Multiple_Uncontrolled: Story = {
  name: 'Uncontrolled',
  render: () => {
    return (
      <Listbox
        selectionMode='multiple'
        items={[
          { id: 'a', label: 'Multiple 1' },
          { id: 'b', label: 'Multiple 2' },
          { id: 'c', label: 'Multiple 3' },
        ]}
        getValue={getValue}
        renderItem={renderItem}
      />
    );
  },
};

export const Multiple_Preselected: Story = {
  name: 'Multiple With Preselected',
  render: () => {
    const [selection, setSelection] = useState<Set<string>>(new Set(['a', 'c']));

    return (
      <Listbox
        selectionMode='multiple'
        selection={selection}
        setSelection={setSelection}
        items={[
          { id: 'a', label: 'Item 1' },
          { id: 'b', label: 'Item 2' },
          { id: 'c', label: 'Item 3' },
        ]}
        getValue={getValue}
        renderItem={renderItem}
      />
    );
  },
};

export const Long_List_With_Scroll: Story = {
  name: 'Long List With Scroll',
  render: () => {
    const [selection, setSelection] = useState<Set<string>>(new Set());

    return (
      <Listbox
        selectionMode='multiple'
        selection={selection}
        setSelection={setSelection}
        items={Array.from({ length: 50 }, (_, i) => ({
          id: `item${i + 1}`,
          label: `Multiple ${i + 1}`,
        }))}
        getValue={getValue}
        renderItem={renderItem}
      />
    );
  },
};

export const Multiple_With_Checkboxes: Story = {
  name: 'Multiple With Checkboxes',
  render: () => {
    const [selection, setSelection] = useState<Set<string>>(new Set());

    return (
      <Listbox
        selectionMode='multiple'
        selection={selection}
        setSelection={setSelection}
        items={[
          { id: 'a', label: 'Item 1' },
          { id: 'b', label: 'Item 2' },
          { id: 'c', label: 'Item 3' },
        ]}
        getValue={getValue}
        renderItem={item => {
          const isSelected = selection.has(getValue(item));
          const onCheckedChange = (): void => {
            if (isSelected) {
              selection.delete(getValue(item));
            } else {
              selection.add(getValue(item));
            }

            setSelection(new Set(selection));
          };

          return (
            <>
              {renderItem(item)}
              <Checkbox checked={isSelected} tabIndex={-1} onCheckedChange={onCheckedChange} />
            </>
          );
        }}
      />
    );
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  render: () => {
    const [selection, setSelection] = useState<Set<string>>(new Set());

    return (
      <Listbox
        selectionMode='multiple'
        disabled={true}
        selection={selection}
        setSelection={setSelection}
        items={[
          { id: 'a', label: 'Item 1' },
          { id: 'b', label: 'Item 2' },
          { id: 'c', label: 'Item 3' },
        ]}
        getValue={getValue}
        renderItem={renderItem}
      />
    );
  },
};
