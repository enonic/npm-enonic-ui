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
    checked: { control: 'boolean', description: 'Controls the checked state' },
    partial: { control: 'boolean', description: 'Sets the indeterminate state' },
    label: { control: 'text', description: 'Text label for the checkbox' },
    errorText: { control: 'text', description: 'Error message displayed when in error state' },
    state: {
      control: 'select',
      options: ['default', 'readOnly', 'disabled', 'error'],
      description: 'Controls the visual state',
    },
    alignment: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Controls label placement',
    },
  },
} satisfies Meta<CheckboxProps>;

const useCheckboxState = (
  initialChecked = false,
  initialPartial = false,
): {
  checked: boolean;
  partial: boolean;
  handleChange: (newChecked: boolean) => void;
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
  setPartial: React.Dispatch<React.SetStateAction<boolean>>;
} => {
  const [checked, setChecked] = useState(initialChecked);
  const [partial, setPartial] = useState(initialPartial);

  const handleChange = (newChecked: boolean): void => {
    if (partial) {
      setPartial(false);
    }
    setChecked(newChecked);
  };

  return { checked, partial, handleChange, setChecked, setPartial };
};

const renderCheckboxGroup = (state: CheckboxProps['state'], errorText?: string): JSX.Element => {
  const uncheckedBox = useCheckboxState(false);
  const checkedBox = useCheckboxState(true);
  const indeterminateBox = useCheckboxState(false, true);

  return (
    <div className='flex items-center gap-3'>
      <Checkbox
        label='Unchecked'
        state={state}
        checked={uncheckedBox.checked}
        onChange={uncheckedBox.handleChange}
        errorText={errorText}
      />
      <Checkbox
        label='Checked'
        state={state}
        checked={checkedBox.checked}
        onChange={checkedBox.handleChange}
        errorText={errorText}
      />
      <Checkbox
        label='Indeterminate'
        state={state}
        checked={indeterminateBox.checked}
        partial={indeterminateBox.partial}
        onChange={indeterminateBox.handleChange}
        errorText={errorText}
      />
    </div>
  );
};

export const DefaultState: Story = {
  name: 'Default State',
  render: () => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3'>Default checkboxes</h3>
      {renderCheckboxGroup('default')}
    </div>
  ),
};

export const ErrorState: Story = {
  name: 'Error State',
  args: {
    state: 'error',
    errorText: 'Error text',
  },
  render: () => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3 '>Error checkboxes</h3>
      {renderCheckboxGroup('error')}
    </div>
  ),
};

export const ErrorWithText: Story = {
  name: 'Error with Text',
  args: {
    state: 'error',
    errorText: 'Error text',
  },
  render: args => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3'>Error checkboxes with text</h3>
      {renderCheckboxGroup('error', args.errorText)}
    </div>
  ),
};

export const ReadOnlyState: Story = {
  name: 'ReadOnly State',
  render: () => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3'>ReadOnly checkboxes</h3>
      {renderCheckboxGroup('readOnly')}
    </div>
  ),
};

export const DisabledState: Story = {
  name: 'Disabled State',
  render: () => (
    <div className='p-4'>
      <h3 className='text-sm font-medium mb-3'>Disabled checkboxes</h3>
      {renderCheckboxGroup('disabled')}
    </div>
  ),
};

export const InteractivePlayground: Story = {
  name: 'Interactive Playground',
  args: {
    label: 'Playground CheckboxTest',
    checked: false,
    partial: false,
    state: 'default',
    alignment: 'left',
  },
  render: args => {
    const [checked, setChecked] = useState(args.checked ?? false);
    const [partial, setPartial] = useState(args.partial ?? false);

    useEffect(() => {
      setChecked(args.checked ?? false);
      setPartial(args.partial ?? false);
    }, [args.checked, args.partial]);

    return (
      <Checkbox
        {...args}
        checked={checked}
        partial={partial}
        onChange={newChecked => {
          if (partial) setPartial(false);
          setChecked(newChecked);
        }}
      />
    );
  },
};
