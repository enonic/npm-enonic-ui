import type { Meta, StoryObj } from '@storybook/preact-vite';

import { type CheckboxPropsTest, CheckboxTest } from './checkboxTest';

const meta: Meta<CheckboxPropsTest> = {
  title: 'Components/CheckboxTest',
  component: CheckboxTest,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    checked: { control: 'boolean' },
    partial: { control: 'boolean' },
    label: { control: 'text' },
    state: { control: 'select', options: ['default', 'error', 'readOnly', 'disabled'] },
    alignment: { control: 'select', options: ['left', 'right'] },
    errorText: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<CheckboxPropsTest>;

export const Default: Story = {
  render: () => (
    <div className='flex items-center space-x-6'>
      <CheckboxTest label='Unchecked' state='default' checked={false} partial={false} alignment='left' />
      <CheckboxTest label='Checked' state='default' checked={true} partial={false} alignment='left' />
      <CheckboxTest label='Indeterminate' state='default' checked={false} partial={true} alignment='left' />
    </div>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <div className='flex items-center space-x-6'>
      <CheckboxTest label='Unchecked' state='error' checked={false} partial={false} />
      <CheckboxTest label='Checked' state='error' checked={true} partial={false} />
      <CheckboxTest label='Indeterminate' state='error' checked={false} partial={true} />
    </div>
  ),
};

export const ErrorStateWithText: Story = {
  render: () => (
    <div className='flex items-center space-x-6'>
      <CheckboxTest label='Unchecked' state='error' checked={false} partial={false} errorText='This is an error' />
      <CheckboxTest label='Checked' state='error' checked={true} partial={false} errorText='This is an error' />
      <CheckboxTest label='Indeterminate' state='error' checked={false} partial={true} errorText='This is an error' />
    </div>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <div className='flex items-center space-x-6'>
      <CheckboxTest label='Unchecked' state='readOnly' checked={false} partial={false} />
      <CheckboxTest label='Checked' state='readOnly' checked={true} partial={false} />
      <CheckboxTest label='Indeterminate' state='readOnly' checked={false} partial={true} />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className='flex items-center space-x-6'>
      <CheckboxTest label='Unchecked' state='disabled' checked={false} partial={false} />
      <CheckboxTest label='Checked' state='disabled' checked={true} partial={false} />
      <CheckboxTest label='Indeterminate' state='disabled' checked={false} partial={true} />
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div className='flex items-center space-x-6'>
      <CheckboxTest label='Left' state='default' checked={false} partial={false} alignment={'left'} />
      <CheckboxTest label='Right' state='default' checked={true} partial={false} alignment={'right'} />
    </div>
  ),
};

export const InteractivePlayground: Story = {
  args: {
    ...Default.args,
    label: 'Interactive CheckboxTest',
    state: 'default',
    alignment: 'left',
    errorText: 'Something went wrong',
    checked: false,
    partial: false,
  },
};
