import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useState } from 'preact/hooks';

import { SearchInput, type SearchInputProps } from './search-input';

type Story = StoryObj<SearchInputProps>;

export default {
  title: 'Components/Search input',
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
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction and applies disabled styling',
    },
    value: {
      control: 'text',
      description: 'Represents current search value',
    },
  },
} satisfies Meta<SearchInputProps>;

const renderSearchInput = (initialValue?: string): React.ReactElement => {
  const [searchText, setSearchText] = useState(initialValue ?? '');

  return (
    <div className='flex items-center gap-3'>
      <SearchInput placeholder='Enter text...' value={searchText} onChange={setSearchText} />
    </div>
  );
};

export const Default: Story = {
  args: {
    placeholder: 'Start typing...',
  },
};

export const Value_Set: Story = {
  args: {
    placeholder: 'A sunny day in...',
    value: 'Pre-filled search',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Search disabled...',
    disabled: true,
  },
};

export const Disabled_With_Value_Set: Story = {
  args: {
    disabled: true,
    value: 'Value set and disabled',
  },
};

export const All_Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {renderSearchInput()}
      {renderSearchInput('Value')}
      <SearchInput placeholder='Enter text...' disabled />
      <SearchInput placeholder='Disabled' value={'Value / Disabled'} disabled />
    </div>
  ),
};

export const InteractivePlayground: Story = {
  render: () => <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{renderSearchInput()}</div>,
};
