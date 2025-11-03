import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useEffect, useState } from 'react';

import { SearchInput } from './search-input';

const meta: Meta<typeof SearchInput> = {
  title: 'Components/Search Input',
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  name: 'Default',
  render: () => (
    <SearchInput className='w-2xs' placeholder='Search...'>
      <SearchInput.Icon />
      <SearchInput.Input />
      <SearchInput.Clear />
    </SearchInput>
  ),
};

export const WithValue: Story = {
  name: 'With Value',
  render: () => {
    const [value, setValue] = useState('Example search');
    return (
      <SearchInput className='w-2xs' value={value} onChange={setValue} placeholder='Search...'>
        <SearchInput.Icon />
        <SearchInput.Input />
        <SearchInput.Clear />
      </SearchInput>
    );
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  render: () => (
    <SearchInput disabled placeholder='Search is disabled'>
      <SearchInput.Icon />
      <SearchInput.Input />
      <SearchInput.Clear />
    </SearchInput>
  ),
};

export const DisabledWithValue: Story = {
  name: 'Disabled With Value',
  render: () => (
    <SearchInput disabled defaultValue='Search query' placeholder='Search...'>
      <SearchInput.Icon />
      <SearchInput.Input />
      <SearchInput.Clear />
    </SearchInput>
  ),
};

export const ReadOnly: Story = {
  name: 'Read Only',
  render: () => (
    <SearchInput readOnly defaultValue='Read only search' placeholder='Search...'>
      <SearchInput.Icon />
      <SearchInput.Input />
      <SearchInput.Clear />
    </SearchInput>
  ),
};

export const UncontrolledExample: Story = {
  name: 'Uncontrolled',
  render: () => (
    <div className='w-xs space-y-4'>
      <h3 className='text-sm font-medium mb-3'>Uncontrolled search inputs</h3>
      <div className='space-y-2'>
        <SearchInput placeholder='Default empty'>
          <SearchInput.Icon />
          <SearchInput.Input />
          <SearchInput.Clear />
        </SearchInput>

        <SearchInput placeholder='Search...' defaultValue='Pre-filled value'>
          <SearchInput.Icon />
          <SearchInput.Input />
          <SearchInput.Clear />
        </SearchInput>
      </div>
    </div>
  ),
};

export const ControlledExample: Story = {
  name: 'Controlled',
  render: () => {
    const [value, setValue] = useState('');
    const [results, setResults] = useState<string[]>([]);

    const mockData = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'];

    const handleSearch = (v: string): void => {
      setValue(v);
      if (v) {
        const filtered = mockData.filter(item => item.toLowerCase().includes(v.toLowerCase()));
        setResults(filtered);
      } else {
        setResults([]);
      }
    };

    return (
      <div className='w-xs'>
        <h3 className='text-sm font-medium mb-3'>Controlled search with results</h3>

        <SearchInput value={value} onChange={handleSearch} placeholder='Search fruits...'>
          <SearchInput.Icon />
          <SearchInput.Input />
          <SearchInput.Clear />
        </SearchInput>

        {results.length > 0 && (
          <div className='mt-4 p-3 bg-surface-neutral rounded-sm border'>
            <h4 className='text-xs font-medium text-subtle mb-2'>Results:</h4>
            <ul className='space-y-1'>
              {results.map(r => (
                <li key={r} className='text-sm'>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
        {value && results.length === 0 && (
          <div className='mt-4 p-3 bg-surface-neutral rounded-sm border'>
            <p className='text-sm text-subtle'>No results found</p>
          </div>
        )}
      </div>
    );
  },
};

export const LiveSearch: Story = {
  name: 'Live Search',
  render: () => {
    const [value, setValue] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
      if (!value) {
        return;
      }
      setIsSearching(true);
      const t = setTimeout(() => {
        setIsSearching(false);
        setHistory(prev => [...prev, `Searched for: "${value}"`].slice(-5));
      }, 500);
      return () => clearTimeout(t);
    }, [value]);

    return (
      <div className='w-xs relative'>
        <h3 className='text-sm font-medium mb-3'>Live search with debounce</h3>
        <SearchInput value={value} onChange={setValue} placeholder='Type to search...'>
          <SearchInput.Icon />
          <SearchInput.Input />
          <SearchInput.Clear />
        </SearchInput>

        <div className='absolute bottom-0 translate-y-full'>
          {isSearching && <p className='mb-2 text-sm text-subtle'>Searching...</p>}
          {history.length > 0 && (
            <div>
              <h4 className='text-xs font-medium text-subtle mb-2'>Recent searches:</h4>
              <ul className='space-y-1'>
                {history.map((item, i) => (
                  <li key={i} className='text-sm text-subtle break-all'>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  },
};

export const NoIcon: Story = {
  name: 'No Icon',
  render: () => (
    <SearchInput className='w-2xs' placeholder='Search...'>
      <SearchInput.Input />
      <SearchInput.Clear />
    </SearchInput>
  ),
};

export const NoClear: Story = {
  name: 'No Clear Button',
  render: () => (
    <SearchInput defaultValue='Some text' placeholder='Search...'>
      <SearchInput.Icon />
      <SearchInput.Input />
    </SearchInput>
  ),
};

export const InteractivePlayground: Story = {
  name: 'Interactive Playground',
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className='w-xs'>
        <SearchInput value={value} onChange={setValue} placeholder='Search...'>
          <SearchInput.Icon />
          <SearchInput.Input />
          <SearchInput.Clear />
        </SearchInput>
        <div className='mt-4 p-3 bg-surface-neutral rounded-sm'>
          <p className='text-sm'>
            <span className='font-medium'>Current value:</span>
            <span className='break-all'>{value ? `"${value}"` : '(empty)'}</span>
          </p>
        </div>
      </div>
    );
  },
};
