import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'preact/hooks';
import { Checkbox } from '@/components/checkbox';
import { GridList, type GridListProps } from '@/components/grid-list/grid-list';
import { IconButton } from '@/components/icon-button';

type Story = StoryObj<GridListProps>;

type Project = {
  id: string;
  name: string;
  status: 'active' | 'archived' | 'draft';
};

const projects: Project[] = [
  { id: 'proj-1', name: 'Website Redesign', status: 'active' },
  { id: 'proj-2', name: 'Mobile App', status: 'active' },
  { id: 'proj-3', name: 'API Integration', status: 'draft' },
  { id: 'proj-4', name: 'Database Migration', status: 'archived' },
  { id: 'proj-5', name: 'Security Audit', status: 'active' },
];

const statusColors: Record<Project['status'], string> = {
  active: 'bg-green-500/20 text-green-700 dark:text-green-400',
  archived: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
  draft: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
};

export default {
  title: 'Components/GridList',
  component: GridList,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the entire grid',
    },
    loop: {
      control: 'boolean',
      description: 'Enable looping navigation at boundaries',
    },
  },
} satisfies Meta<GridListProps>;

//
// * Examples
//

export const Basic: Story = {
  name: 'Examples / Basic',
  args: {
    disabled: false,
    loop: false,
  },
  render: ({ disabled, loop }) => {
    return (
      <div className='w-96 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Project List</h3>
        <GridList label='Project list' className='gap-1.5 rounded-xl p-2' disabled={disabled} loop={loop}>
          {projects.map(project => (
            <GridList.Row key={project.id} id={project.id} className='flex gap-2.5'>
              <GridList.Cell className='flex-1 self-stretch'>
                <GridList.Action>
                  <button
                    type='button'
                    className='cursor-pointer text-left font-medium text-sm hover:underline focus:outline-none'
                    onClick={() => alert(`Open: ${project.name}`)}
                  >
                    {project.name}
                  </button>
                </GridList.Action>
              </GridList.Cell>
              <GridList.Cell interactive={false}>
                <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[project.status]}`}>
                  {project.status}
                </span>
              </GridList.Cell>
              <GridList.Cell>
                <GridList.Action>
                  <IconButton
                    icon={MoreHorizontal}
                    size='sm'
                    variant='text'
                    onClick={() => alert(`Menu for: ${project.name}`)}
                  />
                </GridList.Action>
              </GridList.Cell>
            </GridList.Row>
          ))}
        </GridList>
        <p className='mt-3 text-sm text-subtle'>Tab into the list, then use arrow keys to navigate.</p>
      </div>
    );
  },
};

//
// * States
//

export const DisabledRow: Story = {
  name: 'States / Disabled Row',
  args: {
    disabled: false,
    loop: false,
  },
  render: ({ disabled, loop }) => {
    return (
      <div className='w-96 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Middle row disabled</h3>
        <GridList
          label='Project list with disabled row'
          className='gap-1.5 rounded-xl p-2'
          disabled={disabled}
          loop={loop}
        >
          {projects.slice(0, 3).map(project => (
            <GridList.Row key={project.id} id={project.id} disabled={project.id === 'proj-2'} className='flex gap-2.5'>
              <GridList.Cell className='flex-1 self-stretch'>
                <GridList.Action>
                  <button
                    type='button'
                    className='cursor-pointer text-left font-medium text-sm hover:underline focus:outline-none'
                    onClick={() => alert(`Open: ${project.name}`)}
                  >
                    {project.name}
                  </button>
                </GridList.Action>
              </GridList.Cell>
              <GridList.Cell interactive={false}>
                <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[project.status]}`}>
                  {project.status}
                </span>
              </GridList.Cell>
              <GridList.Cell>
                <GridList.Action>
                  <IconButton
                    icon={MoreHorizontal}
                    size='sm'
                    variant='text'
                    onClick={() => alert(`Menu for: ${project.name}`)}
                  />
                </GridList.Action>
              </GridList.Cell>
            </GridList.Row>
          ))}
        </GridList>
        <p className='mt-3 text-sm text-subtle'>Middle row is disabled and skipped during navigation.</p>
      </div>
    );
  },
};

export const DisabledGrid: Story = {
  name: 'States / Disabled Grid',
  args: {
    disabled: true,
    loop: false,
  },
  argTypes: {
    disabled: { control: false },
  },
  render: ({ disabled, loop }) => {
    return (
      <div className='w-96 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Entire grid disabled</h3>
        <GridList label='Disabled project list' className='gap-1.5 rounded-xl p-2' disabled={disabled} loop={loop}>
          {projects.slice(0, 3).map(project => (
            <GridList.Row key={project.id} id={project.id} className='flex gap-2.5'>
              <GridList.Cell interactive={false} className='flex-1'>
                <span className='font-medium text-sm'>{project.name}</span>
              </GridList.Cell>
              <GridList.Cell interactive={false}>
                <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[project.status]}`}>
                  {project.status}
                </span>
              </GridList.Cell>
            </GridList.Row>
          ))}
        </GridList>
      </div>
    );
  },
};

//
// * Behavior
//

export const KeyboardNavigation: Story = {
  name: 'Behavior / Keyboard Navigation',
  args: {
    disabled: false,
    loop: true,
  },
  render: ({ disabled, loop }) => {
    const [lastAction, setLastAction] = useState<string>('');

    return (
      <div className='w-110 p-4'>
        <h3 className='mb-3 font-medium text-sm'>Keyboard Navigation Demo</h3>
        <GridList label='Keyboard navigation demo' className='gap-1.5 rounded-xl p-2' disabled={disabled} loop={loop}>
          {projects.map(project => (
            <GridList.Row
              key={project.id}
              id={project.id}
              disabled={project.id === 'proj-2'}
              className='flex h-9 gap-2.5'
            >
              <GridList.Cell disabled={project.id === 'proj-4'}>
                <GridList.Action>
                  <Checkbox
                    disabled={project.id === 'proj-4'}
                    onCheckedChange={() => setLastAction(`Toggle checkbox: ${project.name}`)}
                  />
                </GridList.Action>
              </GridList.Cell>
              <GridList.Cell className='flex-1 self-stretch'>
                <GridList.Action>
                  <button
                    type='button'
                    className='text-left font-medium text-sm hover:underline focus:outline-none'
                    onClick={() => setLastAction(`Open: ${project.name}`)}
                  >
                    {project.name}
                  </button>
                </GridList.Action>
              </GridList.Cell>
              {project.id !== 'proj-3' && (
                <>
                  <GridList.Cell>
                    <GridList.Action>
                      <IconButton
                        icon={Edit2}
                        size='sm'
                        variant='text'
                        onClick={() => setLastAction(`Edit: ${project.name}`)}
                      />
                    </GridList.Action>
                  </GridList.Cell>
                  <GridList.Cell>
                    <GridList.Action>
                      <IconButton
                        icon={Trash2}
                        size='sm'
                        variant='text'
                        onClick={() => setLastAction(`Delete: ${project.name}`)}
                      />
                    </GridList.Action>
                  </GridList.Cell>
                </>
              )}
            </GridList.Row>
          ))}
        </GridList>

        <p className='mt-4 text-sm text-subtle'>Last action: {lastAction || 'None'}</p>
        <div className='mt-2 rounded-sm bg-surface-primary p-3 text-sm'>
          <p className='mb-2 font-medium'>Keyboard shortcuts:</p>
          <ul className='space-y-1 text-subtle text-xs'>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Tab</kbd> - Enter/Exit list
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>↑</kbd> /{' '}
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>↓</kbd> - Navigate rows
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>←</kbd> /{' '}
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>→</kbd> - Navigate cells
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Home</kbd> /{' '}
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>End</kbd> - First/Last cell in row
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Ctrl+Home</kbd> /{' '}
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Ctrl+End</kbd> - First/Last cell in grid
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Enter</kbd> /{' '}
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Space</kbd> - Activate focused element
            </li>
          </ul>
        </div>
      </div>
    );
  },
};
