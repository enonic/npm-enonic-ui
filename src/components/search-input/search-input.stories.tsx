import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useEffect, useState } from 'react';

import { SearchInput, type SearchInputProps } from './search-input';

type Story = StoryObj<SearchInputProps>;

export default {
  title: 'Components/Search Input',
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Input placeholder text',
    },
    value: {
      control: 'text',
      description: 'Controlled search value',
    },
    defaultValue: {
      control: 'text',
      description: 'Default value for uncontrolled usage',
    },
    clearLabel: {
      control: 'text',
      description: 'Aria label for clear button',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction and applies disabled styling',
    },
    readOnly: {
      control: 'boolean',
      description: 'Makes the input read-only',
    },
    showSearchIcon: {
      control: 'boolean',
      description: 'Whether to show the search icon',
    },
    showClearButton: {
      control: 'boolean',
      description: 'Whether to show the clear button when there is a value',
    },
  },
} satisfies Meta<SearchInputProps>;

export const Default: Story = {
  name: 'Default',
  args: {
    placeholder: 'Search...',
  },
};

export const WithValue: Story = {
  name: 'With Value',
  render: () => {
    const [value, setValue] = useState('Example search');

    return <SearchInput value={value} onChange={setValue} placeholder='Search...' />;
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
    placeholder: 'Search is disabled',
  },
};

export const DisabledWithValue: Story = {
  name: 'Disabled With Value',
  args: {
    disabled: true,
    defaultValue: 'Search query',
    placeholder: 'Search...',
  },
};

export const ReadOnly: Story = {
  name: 'Read Only',
  args: {
    readOnly: true,
    defaultValue: 'Read only search',
    placeholder: 'Search...',
  },
};

export const CustomPlaceholder: Story = {
  name: 'Custom Placeholder',
  args: {
    placeholder: 'Type to filter results...',
  },
};

export const UncontrolledExample: Story = {
  name: 'Uncontrolled',
  render: () => (
    <div className='p-4 space-y-4'>
      <h3 className='text-sm font-medium mb-3'>Uncontrolled search inputs</h3>
      <div className='space-y-2'>
        <SearchInput placeholder='Default empty' />
        <SearchInput placeholder='Search...' defaultValue='Pre-filled value' />
      </div>
    </div>
  ),
};

export const ControlledExample: Story = {
  name: 'Controlled',
  render: () => {
    const [value, setValue] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);

    const mockData = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'];

    const handleSearch = (searchValue: string): void => {
      if (searchValue) {
        const filtered = mockData.filter(item => item.toLowerCase().includes(searchValue.toLowerCase()));
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
      setValue(searchValue);
    };

    return (
      <div className='p-4 w-96'>
        <h3 className='text-sm font-medium mb-3'>Controlled search with results</h3>
        <SearchInput value={value} onChange={handleSearch} placeholder='Search fruits...' />
        {searchResults.length > 0 && (
          <div className='mt-4 p-3 bg-surface-neutral rounded-sm border'>
            <h4 className='text-xs font-medium text-subtle mb-2'>Results:</h4>
            <ul className='space-y-1'>
              {searchResults.map(result => (
                <li key={result} className='text-sm'>
                  {result}
                </li>
              ))}
            </ul>
          </div>
        )}
        {value && searchResults.length === 0 && (
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
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    useEffect(() => {
      if (value) {
        setIsSearching(true);
        const timer = setTimeout(() => {
          setIsSearching(false);
          setSearchHistory(prev => [...prev, `Searched for: "${value}"`].slice(-5));
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [value]);

    return (
      <div className='p-4 w-96 relative'>
        <h3 className='text-sm font-medium mb-3'>Live search with debounce</h3>
        <SearchInput value={value} onChange={setValue} placeholder='Type to search...' />
        <div className='absolute bottom-0 translate-y-full'>
          {isSearching && <p className='mb-2 text-sm text-subtle'>Searching...</p>}
          {searchHistory.length > 0 && (
            <div>
              <h4 className='text-xs font-medium text-subtle mb-2'>Recent searches:</h4>
              <ul className='space-y-1'>
                {searchHistory.map((item, index) => (
                  <li key={index} className='text-sm text-subtle'>
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

export const NoSearchIcon: Story = {
  name: 'No Search Icon',
  args: {
    placeholder: 'Search...',
    showSearchIcon: false,
  },
};

export const NoClearButton: Story = {
  name: 'No Clear Button',
  args: {
    placeholder: 'Search...',
    showClearButton: false,
    defaultValue: 'Some text',
  },
};

export const InteractivePlayground: Story = {
  name: 'Interactive Playground',
  args: {
    placeholder: 'Search...',
    disabled: false,
    readOnly: false,
    clearLabel: 'Clear search',
  },
  render: args => {
    const [value, setValue] = useState(args.value ?? '');

    useEffect(() => {
      setValue(args.value ?? '');
    }, [args.value]);

    return (
      <div className='p-8'>
        <SearchInput
          {...args}
          value={value}
          onChange={(newValue: string) => {
            setValue(newValue);
          }}
        />
        <div className='mt-4 p-3 bg-surface-neutral rounded-sm'>
          <p className='text-sm'>
            <span className='font-medium'>Current value:</span> {value ? `"${value}"` : '(empty)'}
          </p>
        </div>
      </div>
    );
  },
};
