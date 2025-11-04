import { Combobox } from '@/components/combobox/combobox';
import { Listbox } from '@/components/listbox/listbox';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useEffect, useState } from 'preact/hooks';
import { type ReactElement, type RefObject, useRef } from 'react';

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
    <div className='flex flex-col justify-between w-full'>
      <div className='text-sm font-medium group-data-[tone=inverse]:text-alt'>{name}</div>
      <div className='text-xs text-subtle group-data-[tone=inverse]:text-alt'>{language}</div>
    </div>
  );
};

export const Basic: Story = {
  name: 'Basic Usage',
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
        <h3 className='text-md font-medium'>Basic Combobox</h3>
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
  name: 'Multiple Selection',
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
        <h3 className='text-md font-medium'>Multiple Selection</h3>
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

export const CustomFiltering: Story = {
  name: 'Custom Filtering',
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const [selection, setSelection] = useState<readonly string[]>([]);

    const filtered = value
      ? frameworks.filter(f => String(f.year).includes(value) || f.name.toLowerCase().includes(value.toLowerCase()))
      : frameworks;

    return (
      <div className='relative space-y-3'>
        <h3 className='text-md font-medium'>Custom Filtering</h3>
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
        <div className='px-3 py-2 bg-surface-primary rounded-sm'>
          <p className='text-sm text-main/70'>
            <span className='font-semibold'>Selected:</span> {selection}
          </p>
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  name: 'Disabled State',
  render: () => {
    return (
      <div className='relative space-y-3'>
        <h3 className='text-md font-medium'>Disabled</h3>
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
  name: 'With Error State',
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
        <h3 className='text-md font-medium'>Has errors</h3>
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
        <p className='text-sm text-error'>Something went wrong</p>
      </div>
    );
  },
};

export const LongList: Story = {
  name: 'Long List with Scroll',
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const longList = Array.from({ length: 50 }, (_, i) => ({
      id: `framework-${i + 1}`,
      name: `Framework ${i + 1}`,
    }));

    const filtered = value ? longList.filter(f => f.name.toLowerCase().includes(value.toLowerCase())) : longList;

    return (
      <div className='relative space-y-3'>
        <h3 className='text-md font-medium'>Long list, stays open on blur</h3>
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

export const Preselected: Story = {
  name: 'Preselected',
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
        <h3 className='text-md font-medium'>Some items are preselected</h3>
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

export const Staged: Story = {
  name: 'Confirm Selection Changes',
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
        <h3 className='text-md font-medium'>Need to confirm selection changes</h3>
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
  name: 'Confirm / Preselected',
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
          <h3 className='text-md font-medium'>Confirm selection changes</h3>
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

export const Playground: Story = {
  name: 'Interactive Playground',
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
    const { selectionMode, closeOnBlur, disabled, error, placeholder, defaultOpen } = args as PlaygroundArgs;
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
          <h3 className='text-md font-medium'>Playground</h3>
          <p className='text-sm text-subtle'>Try different configurations</p>
        </header>

        <div className='px-3 py-2 bg-surface-primary rounded-sm'>
          <h6 className='text-sm font-medium mb-2'>Current State:</h6>
          <p className='text-xs text-subtle'>
            <span className='font-semibold'>Search Value:</span> {value ?? '(empty)'}
          </p>
          <p className='text-xs text-subtle'>
            <span className='font-semibold'>Selected:</span> {selection.length > 0 ? selection.join(', ') : '(none)'}
          </p>
          <p className='text-xs text-subtle'>
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
              <Listbox.Content className='rounded-sm max-h-60'>
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

        {error && <p className='text-sm text-error'>There was an error with your selection</p>}
      </div>
    );
  },
};
