import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'preact/hooks';

import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { GridList, type GridListProps } from '@/components/grid-list/grid-list';
import { IconButton } from '@/components/icon-button';

import type { Meta, StoryObj } from '@storybook/preact-vite';

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
        <h3 className='mb-3 text-sm font-medium'>Project List</h3>
        <GridList label='Project list' className='gap-1.5 rounded-xl p-2' disabled={disabled} loop={loop}>
          {projects.map(project => (
            <GridList.Row key={project.id} id={project.id} className='flex gap-2.5'>
              <GridList.Cell className='flex-1 self-stretch'>
                <GridList.Action>
                  <button
                    type='button'
                    className='cursor-pointer text-left text-sm font-medium hover:underline focus:outline-none'
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
        <p className='text-subtle mt-3 text-sm'>Tab into the list, then use arrow keys to navigate.</p>
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
        <h3 className='mb-3 text-sm font-medium'>Middle row disabled</h3>
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
                    className='cursor-pointer text-left text-sm font-medium hover:underline focus:outline-none'
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
        <p className='text-subtle mt-3 text-sm'>Middle row is disabled and skipped during navigation.</p>
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
        <h3 className='mb-3 text-sm font-medium'>Entire grid disabled</h3>
        <GridList label='Disabled project list' className='gap-1.5 rounded-xl p-2' disabled={disabled} loop={loop}>
          {projects.slice(0, 3).map(project => (
            <GridList.Row key={project.id} id={project.id} className='flex gap-2.5'>
              <GridList.Cell interactive={false} className='flex-1'>
                <span className='text-sm font-medium'>{project.name}</span>
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

type Task = {
  id: string;
  name: string;
};

const tasks: Task[] = [
  { id: 'task-1', name: 'Review pull requests' },
  { id: 'task-2', name: 'Update documentation' },
  { id: 'task-3', name: 'Fix navigation bug' },
  { id: 'task-4', name: 'Write unit tests' },
  { id: 'task-5', name: 'Refactor auth module' },
  { id: 'task-6', name: 'Deploy to staging' },
  { id: 'task-7', name: 'Code review meeting' },
];

export const DynamicRows: Story = {
  name: 'Behavior / Dynamic Rows',
  args: {
    disabled: false,
    loop: false,
  },
  render: ({ disabled, loop }) => {
    const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set(['task-1', 'task-2', 'task-3', 'task-4']));

    const MIN_TASKS = 2;
    const MAX_TASKS = 7;

    const visibleTasks = tasks.filter(task => visibleIds.has(task.id));

    const addTask = (): void => {
      if (visibleIds.size >= MAX_TASKS) return;
      const hiddenTask = tasks.find(task => !visibleIds.has(task.id));
      if (hiddenTask) {
        setVisibleIds(prev => new Set([...prev, hiddenTask.id]));
      }
    };

    const removeTask = (): void => {
      if (visibleIds.size <= MIN_TASKS) return;
      const middleIndex = Math.floor(visibleTasks.length / 2);
      const taskToRemove = visibleTasks[middleIndex];
      if (taskToRemove) {
        setVisibleIds(prev => {
          const next = new Set(prev);
          next.delete(taskToRemove.id);
          return next;
        });
      }
    };

    return (
      <div className='w-96 p-4'>
        <h3 className='mb-3 text-sm font-medium'>Task List</h3>
        <div className='mb-3 flex gap-2'>
          <Button size='sm' variant='filled' onClick={addTask} disabled={visibleIds.size >= MAX_TASKS}>
            Add Task
          </Button>
          <Button size='sm' variant='filled' onClick={removeTask} disabled={visibleIds.size <= MIN_TASKS}>
            Remove Task
          </Button>
        </div>

        <GridList label='Task list' className='gap-1.5 rounded-xl p-2' disabled={disabled} loop={loop}>
          {visibleTasks.map(task => (
            <GridList.Row key={task.id} id={task.id} className='flex gap-2.5'>
              <GridList.Cell className='flex-1 self-stretch'>
                <GridList.Action>
                  <button
                    type='button'
                    className='cursor-pointer text-left text-sm font-medium hover:underline focus:outline-none'
                    onClick={() => alert(`Open: ${task.name}`)}
                  >
                    {task.name}
                  </button>
                </GridList.Action>
              </GridList.Cell>
              <GridList.Cell>
                <GridList.Action>
                  <IconButton icon={Edit2} size='sm' variant='text' onClick={() => alert(`Edit: ${task.name}`)} />
                </GridList.Action>
              </GridList.Cell>
              <GridList.Cell>
                <GridList.Action>
                  <IconButton icon={Trash2} size='sm' variant='text' onClick={() => alert(`Delete: ${task.name}`)} />
                </GridList.Action>
              </GridList.Cell>
            </GridList.Row>
          ))}
        </GridList>

        <p className='text-subtle mt-3 text-sm'>
          {visibleIds.size} of {MAX_TASKS} tasks shown. Active item is updated, when previous item removed.
        </p>
      </div>
    );
  },
};

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
        <h3 className='mb-3 text-sm font-medium'>Keyboard Navigation Demo</h3>
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
                    className='text-left text-sm font-medium hover:underline focus:outline-none'
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

        <p className='text-subtle mt-4 text-sm'>Last action: {lastAction || 'None'}</p>
        <div className='bg-surface-primary mt-2 rounded-sm p-3 text-sm'>
          <p className='mb-2 font-medium'>Keyboard shortcuts:</p>
          <ul className='text-subtle space-y-1 text-xs'>
            <li>
              <kbd className='bg-bdr-subtle text-main rounded px-1'>Tab</kbd> - Enter/Exit list
            </li>
            <li>
              <kbd className='bg-bdr-subtle text-main rounded px-1'>↑</kbd> /{' '}
              <kbd className='bg-bdr-subtle text-main rounded px-1'>↓</kbd> - Navigate rows
            </li>
            <li>
              <kbd className='bg-bdr-subtle text-main rounded px-1'>←</kbd> /{' '}
              <kbd className='bg-bdr-subtle text-main rounded px-1'>→</kbd> - Navigate cells
            </li>
            <li>
              <kbd className='bg-bdr-subtle text-main rounded px-1'>Home</kbd> /{' '}
              <kbd className='bg-bdr-subtle text-main rounded px-1'>End</kbd> - First/Last cell in row
            </li>
            <li>
              <kbd className='bg-bdr-subtle text-main rounded px-1'>Ctrl+Home</kbd> /{' '}
              <kbd className='bg-bdr-subtle text-main rounded px-1'>Ctrl+End</kbd> - First/Last cell in grid
            </li>
            <li>
              <kbd className='bg-bdr-subtle text-main rounded px-1'>Enter</kbd> /{' '}
              <kbd className='bg-bdr-subtle text-main rounded px-1'>Space</kbd> - Activate focused element
            </li>
          </ul>
        </div>
      </div>
    );
  },
};
