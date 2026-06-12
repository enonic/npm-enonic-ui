import { type Dispatch, type ReactElement, type SetStateAction, useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { Checkbox, type CheckboxProps } from './checkbox';

type Story = StoryObj<CheckboxProps>;

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'select',
      options: [false, true, 'indeterminate'],
      description: 'Controls the checked state',
    },
    defaultChecked: {
      control: 'select',
      options: [false, true, 'indeterminate'],
      description: 'Default checked state for uncontrolled usage',
    },
    label: { control: 'text', description: 'Text label for the checkbox' },
    errorMessage: { control: 'text', description: 'Error message displayed when in error state' },
    error: { control: 'boolean', description: 'Shows error state' },
    disabled: { control: 'boolean', description: 'Disables the checkbox' },
    readOnly: { control: 'boolean', description: 'Makes the checkbox read-only' },
    required: { control: 'boolean', description: 'Makes the checkbox required' },
    name: { control: 'text', description: 'Form field name' },
    value: { control: 'text', description: 'Form field value' },
    align: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Controls label placement',
    },
  },
} satisfies Meta<CheckboxProps>;

const useCheckboxState = (
  initialChecked: boolean | 'indeterminate' = false,
): {
  checked: boolean | 'indeterminate';
  handleChange: (newChecked: boolean | 'indeterminate') => void;
  setChecked: Dispatch<SetStateAction<boolean | 'indeterminate'>>;
} => {
  const [checked, setChecked] = useState<boolean | 'indeterminate'>(initialChecked);

  const handleChange = (newChecked: boolean | 'indeterminate'): void => {
    setChecked(newChecked);
  };

  return { checked, handleChange, setChecked };
};

const renderCheckboxGroup = (options: {
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  errorMessage?: string;
}): ReactElement => {
  const uncheckedBox = useCheckboxState(false);
  const checkedBox = useCheckboxState(true);
  const indeterminateBox = useCheckboxState('indeterminate');

  return (
    <div className='flex items-center gap-3'>
      <Checkbox
        label='Unchecked'
        {...options}
        checked={uncheckedBox.checked}
        onCheckedChange={uncheckedBox.handleChange}
        errorMessage={options.errorMessage}
      />
      <Checkbox
        label='Checked'
        {...options}
        checked={checkedBox.checked}
        onCheckedChange={checkedBox.handleChange}
        errorMessage={options.errorMessage}
      />
      <Checkbox
        label='Indeterminate'
        {...options}
        checked={indeterminateBox.checked}
        onCheckedChange={indeterminateBox.handleChange}
        errorMessage={options.errorMessage}
      />
    </div>
  );
};

export const DefaultState: Story = {
  name: 'Examples / Default',
  render: () => (
    <div className='p-4'>
      <h3 className='mb-3 text-sm font-medium'>Default checkboxes</h3>
      {renderCheckboxGroup({})}
    </div>
  ),
};

export const UncontrolledExample: Story = {
  name: 'Examples / Uncontrolled',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='mb-3 text-sm font-medium'>Uncontrolled checkboxes</h3>
      <div className='space-y-2'>
        <Checkbox label='Default unchecked' />
        <Checkbox label='Default checked' defaultChecked />
        <Checkbox label='Default indeterminate' defaultChecked='indeterminate' />
      </div>
    </div>
  ),
};

export const ErrorState: Story = {
  name: 'States / Error',
  render: () => (
    <div className='p-4'>
      <h3 className='mb-3 text-sm font-medium'>Error checkboxes</h3>
      {renderCheckboxGroup({ error: true })}
    </div>
  ),
};

export const ErrorWithText: Story = {
  name: 'States / Error with Message',
  args: {
    errorMessage: 'Error message',
  },
  render: args => (
    <div className='p-4'>
      <h3 className='mb-3 text-sm font-medium'>Error checkboxes with text</h3>
      {renderCheckboxGroup({ error: true, errorMessage: args.errorMessage })}
    </div>
  ),
};

export const ReadOnlyState: Story = {
  name: 'States / Read-Only',
  render: () => (
    <div className='p-4'>
      <h3 className='mb-3 text-sm font-medium'>ReadOnly checkboxes</h3>
      {renderCheckboxGroup({ readOnly: true })}
      {renderCheckboxGroup({ readOnly: true, error: true })}
    </div>
  ),
};

export const DisabledState: Story = {
  name: 'States / Disabled',
  render: () => (
    <div className='p-4'>
      <h3 className='mb-3 text-sm font-medium'>Disabled checkboxes</h3>
      {renderCheckboxGroup({ disabled: true })}
      {renderCheckboxGroup({ disabled: true, error: true })}
    </div>
  ),
};

export const SummaryCheckbox: Story = {
  name: 'Features / Summary Checkbox',
  render: () => {
    const [option1, setOption1] = useState(false);
    const [option2, setOption2] = useState(false);

    const allChecked = option1 && option2;
    const someChecked = option1 || option2;
    const summaryState = allChecked ? true : someChecked ? 'indeterminate' : false;

    const handleSummaryChange = (checked: boolean | 'indeterminate'): void => {
      const newValue = checked === true;
      setOption1(newValue);
      setOption2(newValue);
    };

    return (
      <div className='space-y-3 p-4'>
        <h3 className='mb-3 text-sm font-medium'>Summary checkbox with child options</h3>
        <div className='space-y-2'>
          <Checkbox label='Select All' checked={summaryState} onCheckedChange={handleSummaryChange} />
          <div className='ml-6 space-y-2'>
            <Checkbox label='Option 1' checked={option1} onCheckedChange={checked => setOption1(checked === true)} />
            <Checkbox label='Option 2' checked={option2} onCheckedChange={checked => setOption2(checked === true)} />
          </div>
        </div>
      </div>
    );
  },
};

export const OnSelectedBackground: Story = {
  name: 'Features / On Selected Background',
  render: () => {
    const uncheckedBox = useCheckboxState(false);
    const checkedBox = useCheckboxState(true);
    const indeterminateBox = useCheckboxState('indeterminate');

    return (
      <div className='space-y-4 p-4'>
        <h3 className='mb-3 text-sm font-medium'>Checkboxes on selected background</h3>

        <div className='group bg-surface-selected text-alt rounded p-4' data-tone='inverse'>
          <h4 className='mb-3 text-sm font-medium'>Default State</h4>
          <div className='flex items-center gap-3'>
            <Checkbox label='Unchecked' checked={uncheckedBox.checked} onCheckedChange={uncheckedBox.handleChange} />
            <Checkbox label='Checked' checked={checkedBox.checked} onCheckedChange={checkedBox.handleChange} />
            <Checkbox
              label='Indeterminate'
              checked={indeterminateBox.checked}
              onCheckedChange={indeterminateBox.handleChange}
            />
          </div>
        </div>

        <div className='group bg-surface-selected text-alt rounded p-4' data-tone='inverse'>
          <h4 className='mb-3 text-sm font-medium'>Error State</h4>
          {renderCheckboxGroup({ error: true, errorMessage: 'Error message' })}
        </div>

        <div className='group bg-surface-selected text-alt rounded p-4' data-tone='inverse'>
          <h4 className='mb-3 text-sm font-medium'>ReadOnly State</h4>
          {renderCheckboxGroup({ readOnly: true })}
        </div>

        <div className='group bg-surface-selected text-alt rounded p-4' data-tone='inverse'>
          <h4 className='mb-3 text-sm font-medium'>Disabled State</h4>
          {renderCheckboxGroup({ disabled: true })}
        </div>
      </div>
    );
  },
};

export const UnlabeledClickArea: Story = {
  name: 'Features / Unlabeled Click Area',
  render: () => {
    const labeled = useCheckboxState(false);
    const unlabeled = useCheckboxState(false);
    const [showDebug, setShowDebug] = useState(false);

    const unchecked = useCheckboxState(false);
    const checked = useCheckboxState(true);
    const indeterminate = useCheckboxState('indeterminate');

    const dense1 = useCheckboxState(false);
    const dense2 = useCheckboxState(true);
    const dense3 = useCheckboxState(false);
    const dense4 = useCheckboxState(true);
    const dense5 = useCheckboxState(false);

    const overflow1 = useCheckboxState(false);
    const overflow2 = useCheckboxState(false);

    const zIndex1 = useCheckboxState(false);
    const zIndex2 = useCheckboxState(false);

    return (
      <div className='flex flex-col gap-6 p-4'>
        <div className='text-subtle max-w-140 text-sm'>
          Checkboxes without labels have an extended click area for better UX. The click area is implemented using a CSS
          pseudo-element positioned behind the checkbox.
        </div>

        {/* Debug toggle */}
        <div className='flex items-center gap-2'>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              aria-label='Show click areas (debug)'
              checked={showDebug}
              onChange={e => setShowDebug(e.currentTarget.checked)}
            />
            Show click areas (debug)
          </label>
        </div>

        {/* Section 1: Comparison */}
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Labeled vs Unlabeled</h4>
          <div className='flex items-center gap-8'>
            <div className='flex flex-col items-center gap-1'>
              <Checkbox label='With label' checked={labeled.checked} onCheckedChange={labeled.handleChange} />
              <span className='text-subtle text-xs'>Standard click area</span>
            </div>
            <div className='flex flex-col items-center gap-1'>
              <div className={showDebug ? '[&_span[aria-hidden]]:after:bg-blue-500/20' : ''}>
                <Checkbox checked={unlabeled.checked} onCheckedChange={unlabeled.handleChange} />
              </div>
              <span className='text-subtle text-xs'>Extended click area</span>
            </div>
          </div>
        </div>

        {/* Section 2: All states */}
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>All States (Unlabeled)</h4>
          <div className={`flex items-center gap-4 ${showDebug ? '[&_span[aria-hidden]]:after:bg-blue-500/20' : ''}`}>
            <div className='flex flex-col items-center gap-1'>
              <Checkbox checked={unchecked.checked} onCheckedChange={unchecked.handleChange} />
              <span className='text-subtle text-xs'>Unchecked</span>
            </div>
            <div className='flex flex-col items-center gap-1'>
              <Checkbox checked={checked.checked} onCheckedChange={checked.handleChange} />
              <span className='text-subtle text-xs'>Checked</span>
            </div>
            <div className='flex flex-col items-center gap-1'>
              <Checkbox checked={indeterminate.checked} onCheckedChange={indeterminate.handleChange} />
              <span className='text-subtle text-xs'>Indeterminate</span>
            </div>
          </div>
        </div>

        {/* Section 3: Dense layout */}
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Dense Layout</h4>
          <p className='text-subtle text-xs'>Multiple unlabeled checkboxes with minimal spacing (gap-2 = 8px)</p>
          <div className={`flex items-center gap-2 ${showDebug ? '[&_span[aria-hidden]]:after:bg-blue-500/20' : ''}`}>
            <Checkbox checked={dense1.checked} onCheckedChange={dense1.handleChange} />
            <Checkbox checked={dense2.checked} onCheckedChange={dense2.handleChange} />
            <Checkbox checked={dense3.checked} onCheckedChange={dense3.handleChange} />
            <Checkbox checked={dense4.checked} onCheckedChange={dense4.handleChange} />
            <Checkbox checked={dense5.checked} onCheckedChange={dense5.handleChange} />
          </div>
          <p className='text-subtle text-xs'>
            Note: With 7px extended area on each side, adjacent checkboxes may have overlapping click zones.
          </p>
        </div>

        {/* Section 4: Overflow clipping */}
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Overflow Clipping</h4>
          <p className='text-subtle text-xs'>
            Testing if <code className='bg-surface-alt rounded px-1'>overflow: hidden</code> clips the extended click
            area
          </p>
          <div className='flex items-center gap-4'>
            <div className='flex flex-col items-center gap-1'>
              <div
                className={`border-subtle overflow-hidden rounded border border-dashed ${showDebug ? '[&_span[aria-hidden]]:after:bg-blue-500/20' : ''}`}
              >
                <Checkbox checked={overflow1.checked} onCheckedChange={overflow1.handleChange} />
              </div>
              <span className='text-subtle text-xs'>overflow: hidden</span>
            </div>
            <div className='flex flex-col items-center gap-1'>
              <div
                className={`border-subtle overflow-visible rounded border border-dashed ${showDebug ? '[&_span[aria-hidden]]:after:bg-blue-500/20' : ''}`}
              >
                <Checkbox checked={overflow2.checked} onCheckedChange={overflow2.handleChange} />
              </div>
              <span className='text-subtle text-xs'>overflow: visible</span>
            </div>
          </div>
        </div>

        {/* Section 5: Z-index stacking */}
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Z-index Stacking Context</h4>
          <p className='text-subtle text-xs'>
            Testing checkbox inside containers that create new stacking contexts (
            <code className='bg-surface-alt rounded px-1'>z-index</code> or{' '}
            <code className='bg-surface-alt rounded px-1'>isolation</code>)
          </p>
          <div className='flex items-center gap-4'>
            <div className='flex flex-col items-center gap-1'>
              <div
                className={`border-subtle relative z-10 rounded border border-dashed px-1 py-0.25 ${showDebug ? '[&_span[aria-hidden]]:after:bg-blue-500/20' : ''}`}
              >
                <Checkbox checked={zIndex1.checked} onCheckedChange={zIndex1.handleChange} />
              </div>
              <span className='text-subtle text-xs'>z-index: 10</span>
            </div>
            <div className='flex flex-col items-center gap-1'>
              <div
                className={`border-subtle isolate rounded border border-dashed px-1 py-0.25 ${showDebug ? '[&_span[aria-hidden]]:after:bg-blue-500/20' : ''}`}
              >
                <Checkbox checked={zIndex2.checked} onCheckedChange={zIndex2.handleChange} />
              </div>
              <span className='text-subtle text-xs'>isolation: isolate</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const Interactive: Story = {
  name: 'Features / Interactive',
  args: {
    label: 'Playground Checkbox',
    checked: false,
    align: 'left',
    error: false,
    disabled: false,
    readOnly: false,
    required: false,
  },
  render: args => {
    const [checked, setChecked] = useState<boolean | 'indeterminate'>(args.checked ?? false);

    useEffect(() => {
      setChecked(args.checked ?? false);
    }, [args.checked]);

    return (
      <Checkbox
        {...args}
        checked={checked}
        onCheckedChange={(newChecked: boolean | 'indeterminate') => {
          setChecked(newChecked);
        }}
      />
    );
  },
};
