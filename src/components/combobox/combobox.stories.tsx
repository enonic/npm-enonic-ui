import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useEffect, useState } from 'preact/hooks';
import { type ReactElement, type RefObject, useRef } from 'react';
import { Combobox } from '@/components/combobox/combobox';
import { Listbox } from '@/components/listbox/listbox';

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
        <h3 className='font-medium text-md'>Need to confirm selection changes</h3>
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

export const Staged_Preselected: Story = {
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
          <p className='text-sm text-subtle'>Some items are preselected, changes require confirmation</p>
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
