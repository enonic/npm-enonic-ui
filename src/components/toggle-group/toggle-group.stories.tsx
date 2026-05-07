import type { Meta, StoryObj } from '@storybook/preact-vite';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, Strikethrough, Underline } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../button';
import { ToggleGroup } from './toggle-group';

type Story = StoryObj<typeof ToggleGroup>;

export default {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToggleGroup>;

//
// Examples
//

export const SingleSelection: Story = {
  name: 'Examples / Single Selection',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Text Alignment (Single Selection)</h3>
        <p className='mb-3 text-sm text-subtle'>Only one option can be selected at a time, like radio buttons.</p>
        <ToggleGroup type='single' defaultValue='left'>
          <ToggleGroup.Item value='left' variant='filled' startIcon={AlignLeft} aria-label='Align left' />
          <ToggleGroup.Item value='center' variant='filled' startIcon={AlignCenter} aria-label='Align center' />
          <ToggleGroup.Item value='right' variant='filled' startIcon={AlignRight} aria-label='Align right' />
          <ToggleGroup.Item value='justify' variant='filled' startIcon={AlignJustify} aria-label='Justify' />
        </ToggleGroup>
      </div>
    </div>
  ),
};

export const MultipleSelection: Story = {
  name: 'Examples / Multiple Selection',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Text Formatting (Multiple Selection)</h3>
        <p className='mb-3 text-sm text-subtle'>Multiple options can be selected independently, like checkboxes.</p>
        <ToggleGroup type='multiple' defaultValue={['bold']}>
          <ToggleGroup.Item value='bold' variant='filled' startIcon={Bold} aria-label='Bold' />
          <ToggleGroup.Item value='italic' variant='filled' startIcon={Italic} aria-label='Italic' />
          <ToggleGroup.Item value='underline' variant='filled' startIcon={Underline} aria-label='Underline' />
          <ToggleGroup.Item
            value='strikethrough'
            variant='filled'
            startIcon={Strikethrough}
            aria-label='Strikethrough'
          />
        </ToggleGroup>
      </div>
    </div>
  ),
};

export const WithLabels: Story = {
  name: 'Examples / With Labels',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Single Selection with Labels</h3>
        <ToggleGroup type='single' defaultValue='left'>
          <ToggleGroup.Item value='left' variant='filled' label='Left' startIcon={AlignLeft} />
          <ToggleGroup.Item value='center' variant='filled' label='Center' startIcon={AlignCenter} />
          <ToggleGroup.Item value='right' variant='filled' label='Right' startIcon={AlignRight} />
        </ToggleGroup>
      </div>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Multiple Selection with Labels</h3>
        <ToggleGroup type='multiple' defaultValue={[]}>
          <ToggleGroup.Item value='bold' variant='filled' label='Bold' startIcon={Bold} />
          <ToggleGroup.Item value='italic' variant='filled' label='Italic' startIcon={Italic} />
          <ToggleGroup.Item value='underline' variant='filled' label='Underline' startIcon={Underline} />
        </ToggleGroup>
      </div>
    </div>
  ),
};

//
// States
//

export const DisabledGroup: Story = {
  name: 'States / Disabled Group',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Disabled Group (Single Selection)</h3>
        <p className='mb-3 text-sm text-subtle'>All items are disabled when the group is disabled.</p>
        <ToggleGroup type='single' defaultValue='left' disabled>
          <ToggleGroup.Item value='left' variant='filled' startIcon={AlignLeft} aria-label='Align left' />
          <ToggleGroup.Item value='center' variant='filled' startIcon={AlignCenter} aria-label='Align center' />
          <ToggleGroup.Item value='right' variant='filled' startIcon={AlignRight} aria-label='Align right' />
        </ToggleGroup>
      </div>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Disabled Group (Multiple Selection)</h3>
        <ToggleGroup type='multiple' defaultValue={['bold', 'italic']} disabled>
          <ToggleGroup.Item value='bold' variant='filled' startIcon={Bold} aria-label='Bold' />
          <ToggleGroup.Item value='italic' variant='filled' startIcon={Italic} aria-label='Italic' />
          <ToggleGroup.Item value='underline' variant='filled' startIcon={Underline} aria-label='Underline' />
        </ToggleGroup>
      </div>
    </div>
  ),
};

export const DisabledItems: Story = {
  name: 'States / Disabled Items',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Disabled Individual Items (Single Selection)</h3>
        <p className='mb-3 text-sm text-subtle'>Individual items can be disabled while others remain enabled.</p>
        <ToggleGroup type='single' defaultValue='left'>
          <ToggleGroup.Item value='left' variant='filled' startIcon={AlignLeft} aria-label='Align left' />
          <ToggleGroup.Item
            value='center'
            variant='filled'
            startIcon={AlignCenter}
            aria-label='Align center'
            disabled
          />
          <ToggleGroup.Item value='right' variant='filled' startIcon={AlignRight} aria-label='Align right' />
          <ToggleGroup.Item value='justify' variant='filled' startIcon={AlignJustify} aria-label='Justify' disabled />
        </ToggleGroup>
      </div>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Disabled Individual Items (Multiple Selection)</h3>
        <ToggleGroup type='multiple' defaultValue={['bold']}>
          <ToggleGroup.Item value='bold' variant='filled' startIcon={Bold} aria-label='Bold' />
          <ToggleGroup.Item value='italic' variant='filled' startIcon={Italic} aria-label='Italic' disabled />
          <ToggleGroup.Item value='underline' variant='filled' startIcon={Underline} aria-label='Underline' />
          <ToggleGroup.Item
            value='strikethrough'
            variant='filled'
            startIcon={Strikethrough}
            aria-label='Strikethrough'
            disabled
          />
        </ToggleGroup>
      </div>
    </div>
  ),
};

//
// Features
//

export const ControlledSingleSelection: Story = {
  name: 'Features / Controlled Single Selection',
  render: () => {
    const [value, setValue] = useState<string>('left');

    return (
      <div className='space-y-4 p-4'>
        <div>
          <h3 className='mb-3 font-medium text-sm'>Controlled Single Selection</h3>
          <ToggleGroup type='single' value={value} onValueChange={setValue}>
            <ToggleGroup.Item value='left' variant='filled' startIcon={AlignLeft} aria-label='Align left' />
            <ToggleGroup.Item value='center' variant='filled' startIcon={AlignCenter} aria-label='Align center' />
            <ToggleGroup.Item value='right' variant='filled' startIcon={AlignRight} aria-label='Align right' />
            <ToggleGroup.Item value='justify' variant='filled' startIcon={AlignJustify} aria-label='Justify' />
          </ToggleGroup>
        </div>
        <div className='space-y-2'>
          <p className='text-sm text-subtle'>
            <strong>Current value:</strong> {value || '(none)'}
          </p>
          <div className='flex gap-2'>
            <Button variant='filled' size='sm' label='Set Left' onClick={() => setValue('left')} />
            <Button variant='filled' size='sm' label='Set Center' onClick={() => setValue('center')} />
            <Button variant='filled' size='sm' label='Clear' onClick={() => setValue('')} />
          </div>
        </div>
      </div>
    );
  },
};

export const ControlledMultipleSelection: Story = {
  name: 'Features / Controlled Multiple Selection',
  render: () => {
    const [values, setValues] = useState<string[]>(['bold', 'italic']);

    return (
      <div className='space-y-4 p-4'>
        <div>
          <h3 className='mb-3 font-medium text-sm'>Controlled Multiple Selection</h3>
          <ToggleGroup type='multiple' value={values} onValueChange={setValues}>
            <ToggleGroup.Item value='bold' variant='filled' startIcon={Bold} aria-label='Bold' />
            <ToggleGroup.Item value='italic' variant='filled' startIcon={Italic} aria-label='Italic' />
            <ToggleGroup.Item value='underline' variant='filled' startIcon={Underline} aria-label='Underline' />
            <ToggleGroup.Item
              value='strikethrough'
              variant='filled'
              startIcon={Strikethrough}
              aria-label='Strikethrough'
            />
          </ToggleGroup>
        </div>
        <div className='space-y-2'>
          <p className='text-sm text-subtle'>
            <strong>Current values:</strong> {values.length ? values.join(', ') : '(none)'}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='filled'
              size='sm'
              label='Select All'
              onClick={() => setValues(['bold', 'italic', 'underline', 'strikethrough'])}
            />
            <Button variant='filled' size='sm' label='Clear All' onClick={() => setValues([])} />
          </div>
        </div>
      </div>
    );
  },
};

export const UncontrolledMode: Story = {
  name: 'Features / Uncontrolled Mode',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Uncontrolled Single Selection</h3>
        <p className='mb-3 text-sm text-subtle'>Uses defaultValue and reports changes via onValueChange callback.</p>
        <ToggleGroup
          type='single'
          defaultValue='center'
          onValueChange={(value: string) => console.log('Single selection changed to:', value)}
        >
          <ToggleGroup.Item value='left' variant='filled' startIcon={AlignLeft} aria-label='Align left' />
          <ToggleGroup.Item value='center' variant='filled' startIcon={AlignCenter} aria-label='Align center' />
          <ToggleGroup.Item value='right' variant='filled' startIcon={AlignRight} aria-label='Align right' />
        </ToggleGroup>
      </div>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Uncontrolled Multiple Selection</h3>
        <ToggleGroup
          type='multiple'
          defaultValue={['bold', 'underline']}
          onValueChange={(values: string[]) => console.log('Multiple selection changed to:', values)}
        >
          <ToggleGroup.Item value='bold' variant='filled' startIcon={Bold} aria-label='Bold' />
          <ToggleGroup.Item value='italic' variant='filled' startIcon={Italic} aria-label='Italic' />
          <ToggleGroup.Item value='underline' variant='filled' startIcon={Underline} aria-label='Underline' />
        </ToggleGroup>
      </div>
      <p className='mt-3 text-sm text-subtle'>Check the console to see state changes.</p>
    </div>
  ),
};

export const OrientationComparison: Story = {
  name: 'Features / Orientation',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Horizontal Orientation (Default)</h3>
        <ToggleGroup type='single' orientation='horizontal' defaultValue='left'>
          <ToggleGroup.Item value='left' variant='filled' startIcon={AlignLeft} aria-label='Align left' />
          <ToggleGroup.Item value='center' variant='filled' startIcon={AlignCenter} aria-label='Align center' />
          <ToggleGroup.Item value='right' variant='filled' startIcon={AlignRight} aria-label='Align right' />
        </ToggleGroup>
      </div>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Vertical Orientation</h3>
        <ToggleGroup type='single' orientation='vertical' defaultValue='left' className='flex-col'>
          <ToggleGroup.Item value='left' variant='filled' startIcon={AlignLeft} label='Left' className='w-32' />
          <ToggleGroup.Item value='center' variant='filled' startIcon={AlignCenter} label='Center' className='w-32' />
          <ToggleGroup.Item value='right' variant='filled' startIcon={AlignRight} label='Right' className='w-32' />
        </ToggleGroup>
      </div>
    </div>
  ),
};

//
// Behavior
//

export const KeyboardNavigation: Story = {
  name: 'Behavior / Keyboard Navigation',
  render: () => (
    <div className='max-w-2xl space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Single Selection (Toolbar Pattern)</h3>
        <div className='mb-3 rounded bg-primary/10 bg-surface-primary p-4'>
          <ul className='space-y-1 text-sm'>
            <li>
              <kbd>Tab</kbd> - Enter/exit the group (focuses active or first item)
            </li>
            <li>
              <kbd>Arrow Keys</kbd> - Move focus between items (does not select)
            </li>
            <li>
              <kbd>Space</kbd> or <kbd>Enter</kbd> - Toggle the focused item on/off
            </li>
            <li>
              <kbd>Home</kbd> - Jump to first enabled item
            </li>
            <li>
              <kbd>End</kbd> - Jump to last enabled item
            </li>
          </ul>
        </div>
        <ToggleGroup type='single' defaultValue='left'>
          <ToggleGroup.Item value='left' variant='filled' label='Left' startIcon={AlignLeft} />
          <ToggleGroup.Item value='center' variant='filled' label='Center' startIcon={AlignCenter} />
          <ToggleGroup.Item value='right' variant='filled' label='Right' startIcon={AlignRight} />
          <ToggleGroup.Item value='justify' variant='filled' label='Justify' startIcon={AlignJustify} />
        </ToggleGroup>
      </div>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Multiple Selection (Toolbar Pattern)</h3>
        <div className='mb-3 rounded bg-primary/10 bg-surface-primary p-4'>
          <ul className='space-y-1 text-sm'>
            <li>
              <kbd>Tab</kbd> - Enter/exit the group (focuses active or first item)
            </li>
            <li>
              <kbd>Arrow Keys</kbd> - Move focus between items (does not toggle)
            </li>
            <li>
              <kbd>Space</kbd> or <kbd>Enter</kbd> - Toggle the focused item on/off
            </li>
            <li>
              <kbd>Home</kbd> - Jump to first enabled item
            </li>
            <li>
              <kbd>End</kbd> - Jump to last enabled item
            </li>
          </ul>
        </div>
        <ToggleGroup type='multiple' defaultValue={['bold']}>
          <ToggleGroup.Item value='bold' variant='filled' label='Bold' startIcon={Bold} />
          <ToggleGroup.Item value='italic' variant='filled' label='Italic' startIcon={Italic} />
          <ToggleGroup.Item value='underline' variant='filled' label='Underline' startIcon={Underline} />
          <ToggleGroup.Item value='strikethrough' variant='filled' label='Strikethrough' startIcon={Strikethrough} />
        </ToggleGroup>
      </div>
    </div>
  ),
};

//
// Interactive
//

export const Interactive: Story = {
  name: 'Features / Interactive',
  render: () => {
    const [type, setType] = useState<'single' | 'multiple'>('single');
    const [value, setValue] = useState<string>('left');
    const [multiValue, setMultiValue] = useState<string[]>(['bold']);
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
    const [disabled, setDisabled] = useState(false);

    return (
      <div className='max-w-2xl space-y-6 p-4'>
        <div>
          <h3 className='mb-3 font-medium text-sm'>Interactive Playground</h3>
          <p className='mb-3 text-sm text-subtle'>
            Try different selection modes, orientations, and keyboard navigation.
          </p>
        </div>

        <div className='space-y-4'>
          <div className='flex flex-wrap items-start gap-4'>
            <div>
              <h3 className='mb-2 block font-medium text-subtle text-xs'>Selection Mode</h3>
              <ToggleGroup
                type='single'
                value={type}
                onValueChange={(value: string) => setType(value as 'single' | 'multiple')}
              >
                <ToggleGroup.Item value='single' variant='filled' size='sm' label='Single' />
                <ToggleGroup.Item value='multiple' variant='filled' size='sm' label='Multiple' />
              </ToggleGroup>
            </div>

            <div>
              <h3 className='mb-2 block font-medium text-subtle text-xs'>Orientation</h3>
              <ToggleGroup
                type='single'
                value={orientation}
                onValueChange={(value: string) => setOrientation(value as 'horizontal' | 'vertical')}
              >
                <ToggleGroup.Item value='horizontal' variant='filled' size='sm' label='Horizontal' />
                <ToggleGroup.Item value='vertical' variant='filled' size='sm' label='Vertical' />
              </ToggleGroup>
            </div>

            <div>
              <h3 className='mb-2 block font-medium text-subtle text-xs'>State</h3>
              <ToggleGroup
                type='single'
                value={disabled ? 'disabled' : 'enabled'}
                onValueChange={(value: string) => setDisabled(value === 'disabled')}
              >
                <ToggleGroup.Item value='enabled' variant='filled' size='sm' label='Enabled' />
                <ToggleGroup.Item value='disabled' variant='filled' size='sm' label='Disabled' />
              </ToggleGroup>
            </div>
          </div>

          <div className='rounded-lg border border-border bg-surface-secondary p-6'>
            {type === 'single' ? (
              <ToggleGroup
                type='single'
                value={value}
                onValueChange={setValue}
                orientation={orientation}
                disabled={disabled}
                className={orientation === 'vertical' ? 'flex-col' : ''}
              >
                <ToggleGroup.Item value='left' variant='filled' label='Left' startIcon={AlignLeft} />
                <ToggleGroup.Item value='center' variant='filled' label='Center' startIcon={AlignCenter} />
                <ToggleGroup.Item value='right' variant='filled' label='Right' startIcon={AlignRight} />
                <ToggleGroup.Item value='justify' variant='filled' label='Justify' startIcon={AlignJustify} />
              </ToggleGroup>
            ) : (
              <ToggleGroup
                type='multiple'
                value={multiValue}
                onValueChange={setMultiValue}
                orientation={orientation}
                disabled={disabled}
                className={orientation === 'vertical' ? 'flex-col' : ''}
              >
                <ToggleGroup.Item value='bold' variant='filled' label='Bold' startIcon={Bold} />
                <ToggleGroup.Item value='italic' variant='filled' label='Italic' startIcon={Italic} />
                <ToggleGroup.Item value='underline' variant='filled' label='Underline' startIcon={Underline} />
                <ToggleGroup.Item
                  value='strikethrough'
                  variant='filled'
                  label='Strikethrough'
                  startIcon={Strikethrough}
                />
              </ToggleGroup>
            )}
          </div>

          <div className='rounded bg-primary/10 p-4'>
            <p className='text-sm'>
              <strong>Current value:</strong>{' '}
              {type === 'single' ? value || '(none)' : multiValue.length ? multiValue.join(', ') : '(none)'}
            </p>
          </div>
        </div>
      </div>
    );
  },
};
