import { type ListboxProps, ListItem } from '@/components';
import { Listbox, type ListboxOption } from '@/components/listbox/listbox';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Folder, HelpCircle, Home, Settings, Users } from 'lucide-react';

type Story = StoryObj<typeof Listbox>;

export default {
  title: 'Components/Listbox',
  component: Listbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Listbox>;

const createListStory = (name: string, label: string, props: ListboxProps): Story => {
  return {
    name: name,
    render: () => (
      <div className='w-80 space-y-2'>
        <h3 className='text-sm font-semibold text-subtle mb-2'>{label}</h3>
        <Listbox {...props} />
      </div>
    ),
  };
};

const makeSimpleListOfItems = (): ListboxOption[] => {
  return [
    {
      value: 'A',
      element: (
        <div>
          <span>Text 1</span>
        </div>
      ),
    },
    {
      value: 'B',
      element: (
        <div>
          <span>Text 2</span>
        </div>
      ),
    },
    {
      value: 'C',
      element: (
        <div>
          <span>Text 3</span>
        </div>
      ),
    },
  ];
};

export const Default: Story = createListStory('Default', 'Simple List, non-selectable', {
  options: makeSimpleListOfItems(),
});

const makeListItemsList = (): ListboxOption[] => {
  return [
    {
      value: 'id1',
      element: (
        <ListItem className={'p-0'}>
          <ListItem.DefaultContent
            icon={<Home className='w-6 h-6' />}
            label='Dashboard'
            description='Overview and analytics'
          />
        </ListItem>
      ),
    },
    {
      value: 'id2',
      element: (
        <ListItem className={'p-0'}>
          <ListItem.DefaultContent
            icon={<Folder className='w-6 h-6' />}
            label='Projects'
            description='Manage your projects'
          />
        </ListItem>
      ),
    },
    {
      value: 'id3',
      element: (
        <ListItem className={'p-0'}>
          <ListItem.DefaultContent
            icon={<Users className='w-6 h-6' />}
            label='Team'
            description='Collaborate with others'
          />
        </ListItem>
      ),
    },
    {
      value: 'id4',
      element: (
        <ListItem className={'p-0'}>
          <ListItem.DefaultContent
            icon={<Settings className='w-6 h-6' />}
            label='Settings'
            description='Configure preferences'
          />
        </ListItem>
      ),
    },
    {
      value: 'id5',
      element: (
        <ListItem className={'p-0'}>
          <ListItem.DefaultContent
            icon={<HelpCircle className='w-6 h-6' />}
            label='Help & Support'
            description='Get assistance'
          />
        </ListItem>
      ),
    },
  ];
};

export const ListItems: Story = createListStory('List Items', 'List Items, single selection', {
  options: makeListItemsList(),
  className: 'border rounded-sm',
});

export const Disabled: Story = createListStory('Disabled List', 'Disabled List', {
  options: makeListItemsList(),
  disabled: true,
  className: 'border rounded-sm',
});
