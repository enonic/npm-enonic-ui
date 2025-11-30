import type { Meta, StoryObj } from '@storybook/preact-vite';
import { type Dispatch, type ReactElement, type SetStateAction, useEffect, useState } from 'react';

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
      <h3 className='mb-3 font-medium text-sm'>Default checkboxes</h3>
      {renderCheckboxGroup({})}
    </div>
  ),
};

export const UncontrolledExample: Story = {
  name: 'Examples / Uncontrolled',
  render: () => (
    <div className='space-y-4 p-4'>
      <h3 className='mb-3 font-medium text-sm'>Uncontrolled checkboxes</h3>
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
      <h3 className='mb-3 font-medium text-sm'>Error checkboxes</h3>
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
      <h3 className='mb-3 font-medium text-sm'>Error checkboxes with text</h3>
      {renderCheckboxGroup({ error: true, errorMessage: args.errorMessage })}
    </div>
  ),
};

export const ReadOnlyState: Story = {
  name: 'States / Read-Only',
  render: () => (
    <div className='p-4'>
      <h3 className='mb-3 font-medium text-sm'>ReadOnly checkboxes</h3>
      {renderCheckboxGroup({ readOnly: true })}
      {renderCheckboxGroup({ readOnly: true, error: true })}
    </div>
  ),
};

export const DisabledState: Story = {
  name: 'States / Disabled',
  render: () => (
    <div className='p-4'>
      <h3 className='mb-3 font-medium text-sm'>Disabled checkboxes</h3>
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
        <h3 className='mb-3 font-medium text-sm'>Summary checkbox with child options</h3>
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
      <div className='space-y-4 p-4' style={{ '--color-ring-offset': 'var(--color-surface-selected)' }}>
        <h3 className='mb-3 font-medium text-sm'>Checkboxes on selected background</h3>

        <div className='group rounded bg-surface-selected p-4 text-alt' data-tone='inverse'>
          <h4 className='mb-3 font-medium text-sm'>Default State</h4>
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

        <div className='group rounded bg-surface-selected p-4 text-alt' data-tone='inverse'>
          <h4 className='mb-3 font-medium text-sm'>Error State</h4>
          {renderCheckboxGroup({ error: true, errorMessage: 'Error message' })}
        </div>

        <div className='group rounded bg-surface-selected p-4 text-alt' data-tone='inverse'>
          <h4 className='mb-3 font-medium text-sm'>ReadOnly State</h4>
          {renderCheckboxGroup({ readOnly: true })}
        </div>

        <div className='group rounded bg-surface-selected p-4 text-alt' data-tone='inverse'>
          <h4 className='mb-3 font-medium text-sm'>Disabled State</h4>
          {renderCheckboxGroup({ disabled: true })}
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
