import type { Meta, StoryObj } from '@storybook/preact-vite';
import { type JSX, useEffect, useState } from 'react';

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
  setChecked: React.Dispatch<React.SetStateAction<boolean | 'indeterminate'>>;
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
}): JSX.Element => {
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
  name: 'Default State',
  render: () => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3'>Default checkboxes</h3>
      {renderCheckboxGroup({})}
    </div>
  ),
};

export const ErrorState: Story = {
  name: 'Error State',
  render: () => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3 '>Error checkboxes</h3>
      {renderCheckboxGroup({ error: true })}
    </div>
  ),
};

export const ErrorWithText: Story = {
  name: 'Error with Text',
  args: {
    errorMessage: 'Error message',
  },
  render: args => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3'>Error checkboxes with text</h3>
      {renderCheckboxGroup({ error: true, errorMessage: args.errorMessage })}
    </div>
  ),
};

export const ReadOnlyState: Story = {
  name: 'ReadOnly State',
  render: () => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3'>ReadOnly checkboxes</h3>
      {renderCheckboxGroup({ readOnly: true })}
      {renderCheckboxGroup({ readOnly: true, error: true })}
    </div>
  ),
};

export const DisabledState: Story = {
  name: 'Disabled State',
  render: () => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3'>Disabled checkboxes</h3>
      {renderCheckboxGroup({ disabled: true })}
      {renderCheckboxGroup({ disabled: true, error: true })}
    </div>
  ),
};

export const InteractivePlayground: Story = {
  name: 'Interactive Playground',
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

export const UncontrolledExample: Story = {
  name: 'Uncontrolled Example',
  render: () => (
    <div className='p-4 space-y-4'>
      <h3 className='text-sm font-medium mb-3'>Uncontrolled checkboxes</h3>
      <div className='space-y-2'>
        <Checkbox label='Default unchecked' />
        <Checkbox label='Default checked' defaultChecked />
        <Checkbox label='Default indeterminate' defaultChecked='indeterminate' />
      </div>
    </div>
  ),
};

export const SummaryCheckbox: Story = {
  name: 'Summary Checkbox',
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
      <div className='p-4 space-y-3'>
        <h3 className='text-sm font-medium mb-3'>Summary checkbox with child options</h3>
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
