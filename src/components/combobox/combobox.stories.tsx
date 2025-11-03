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
    return (
      <div className='relative space-y-1'>
        <h3 className='text-md font-medium mb-3'>Basic Combobox</h3>
        <Combobox.Root>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search frameworks' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Listbox.Content>
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

export const Multi: Story = {
  name: 'Multiple Selection',
  render: () => {
    return (
      <div className='relative space-y-1'>
        <h3 className='text-md font-medium mb-3'>Basic Combobox</h3>
        <Combobox.Root selectionMode={'multiple'}>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search frameworks' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Listbox.Content>
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

export const CustomFiltering: Story = {
  name: 'Custom Filtering',
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const [selection, setSelection] = useState<readonly string[]>([]);

    const filtered = value
      ? frameworks.filter(f => String(f.year).includes(value) || f.name.toLowerCase().includes(value.toLowerCase()))
      : frameworks;

    return (
      <div className='relative space-y-1'>
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
              <Listbox.Content>
                {filtered.map(({ id, ...rest }) => (
                  <Listbox.Item key={id} value={id}>
                    <ListboxItemContent {...rest} />
                  </Listbox.Item>
                ))}
              </Listbox.Content>
            </Combobox.Popup>
          </Combobox.Content>
        </Combobox.Root>
        <p className='text-sm text-main/70'>Selected: {selection}</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  name: 'Disabled State',
  render: () => {
    return (
      <div className='relative '>
        <Combobox.Root disabled>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search frameworks' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>
            <Combobox.Popup>
              <Listbox.Content>
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

    return (
      <div className='relative space-y-2'>
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
              <Listbox.Content>
                {frameworks.map(({ id, ...rest }) => (
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

    return (
      <div className='relative '>
        <h3 className='text-md font-medium mb-3'>Long list, stays open on blur</h3>
        <Combobox.Root value={value} onChange={setValue}>
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
                {longList.map(({ id, name }) => (
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
    const [selection, setSelection] = useState<readonly string[]>(['react', 'vue']);

    return (
      <div className='relative space-y-1'>
        <h3 className='text-md font-medium mb-3'>Some items are preselected</h3>
        <Combobox.Root selection={selection} onSelectionChange={setSelection} selectionMode={'multiple'}>
          <Combobox.Content>
            <Combobox.Control>
              <Combobox.Search>
                <Combobox.SearchIcon />
                <Combobox.Input ref={createInputRefAndFocus()} placeholder='Search frameworks' />
                <Combobox.Toggle />
              </Combobox.Search>
            </Combobox.Control>

            <Combobox.Popup>
              <Listbox.Content>
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
