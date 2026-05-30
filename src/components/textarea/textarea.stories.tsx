import { type ReactElement, useRef, useState } from 'react';

import { Button } from '@/components/button';
import { Tooltip } from '@/components/tooltip';
import { useBlinkAttention } from '@/hooks/use-blink-attention';
import { cn } from '@/utils';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { TextArea, type TextAreaProps } from './textarea';

type Story = StoryObj<TextAreaProps>;

export default {
  title: 'Components/TextArea',
  component: TextArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Optional field label text',
    },
    description: {
      control: 'text',
      description: 'Optional helper text displayed below label',
    },
    endAddon: {
      control: false,
      description: 'Optional helper content rendered below the field and aligned to the end side',
    },
    placeholder: {
      control: 'text',
      description: 'TextArea placeholder text',
    },
    error: {
      control: 'text',
      description: 'Validation message that triggers error state when present',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction and applies disabled styling',
    },
    readOnly: {
      control: 'boolean',
      description: 'Makes field non-editable with readonly styling',
    },
    processing: {
      control: 'boolean',
      description: 'Shows in-flight async state — animated border, shimmer overlay, progress cursor',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text rows',
    },
    resizable: {
      control: 'boolean',
      description: 'Enables vertical resizing of the textarea',
    },
    autoSize: {
      control: 'boolean',
      description: 'Enables automatic content-based sizing (uses CSS field-sizing with a JS fallback for Firefox)',
    },
  },
} satisfies Meta<TextAreaProps>;

export const Default: Story = {
  name: 'Examples / Default',
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  name: 'Examples / With Label',
  args: {
    label: 'Description',
    placeholder: 'Enter a description',
  },
};

export const WithDescription: Story = {
  name: 'Examples / With Description',
  args: {
    label: 'Bio',
    description: 'Tell us a little about yourself',
    placeholder: 'Write your bio here...',
  },
};

export const WithError: Story = {
  name: 'Examples / With Error',
  args: {
    label: 'Message',
    placeholder: 'Enter your message',
    error: 'Message is required',
    value: '',
  },
};

const MAX_LENGTH = 100;

export const WithCustomEndAddon: Story = {
  name: 'Examples / With Custom End Addon',
  render: () => {
    const [value, setValue] = useState('');
    const length = value.length;
    const overLimit = length > MAX_LENGTH;
    return (
      <div className='w-96 space-y-6 p-4'>
        <TextArea
          label='Express yourself'
          description='Write what is on your mind.'
          placeholder='Share your story...'
          rows={2}
          value={value}
          onInput={e => setValue((e.target as HTMLInputElement).value)}
          error={overLimit ? `Message must be ${MAX_LENGTH} characters or less` : undefined}
          endAddon={
            <Tooltip
              value={
                overLimit
                  ? `${length - MAX_LENGTH} characters over limit`
                  : `${MAX_LENGTH - length} characters remaining`
              }
              side='top'
              delay={300}
            >
              <div
                className={cn(
                  'absolute right-0 bottom-0 items-center',
                  'bg-surface-primary/50 text-sm tabular-nums',
                  'rounded-tl-sm rounded-br-sm px-1.5 py-0.5',
                  overLimit && 'text-error',
                )}
              >
                {length}/{MAX_LENGTH}
              </div>
            </Tooltip>
          }
        />
      </div>
    );
  },
};

export const FormExample: Story = {
  name: 'Examples / Form',
  render: () => (
    <div className='w-96 space-y-6 p-4'>
      <h3 className='mb-4 text-lg font-medium'>Feedback Form</h3>

      <TextArea label='Summary' description='Brief overview of your feedback' placeholder='Enter a short summary...' />

      <TextArea
        label='Details'
        description='Please provide as much detail as possible'
        placeholder='Describe your feedback in detail...'
        rows={4}
      />

      <TextArea label='Additional Notes' placeholder='Any other information...' rows={3} />
    </div>
  ),
};

export const Disabled: Story = {
  name: 'States / Disabled',
  args: {
    label: 'Disabled Field',
    placeholder: 'Cannot edit this field',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  name: 'States / Read-Only',
  args: {
    label: 'Read Only Field',
    value: 'This value cannot be changed but can be selected and copied.',
    readOnly: true,
  },
};

export const Processing: Story = {
  name: 'States / Processing',
  args: {
    label: 'Processing Field',
    value: 'Saving long-form content…',
    processing: true,
  },
};

export const States: Story = {
  name: 'States / All States',
  render: () => (
    <div className='w-80 space-y-6 p-4'>
      <div>
        <h3 className='mb-3 text-sm font-medium'>Default State</h3>
        <TextArea label='Default TextArea' placeholder='Enter text...' />
      </div>

      <div>
        <h3 className='mb-3 text-sm font-medium'>With Value</h3>
        <TextArea
          label='Filled TextArea'
          value='Sample multiline text content that spans across multiple lines to demonstrate the textarea behavior.'
        />
      </div>

      <div>
        <h3 className='mb-3 text-sm font-medium'>Error State</h3>
        <TextArea label='Invalid TextArea' placeholder='Enter valid data' error='This field is required' />
      </div>

      <div>
        <h3 className='mb-3 text-sm font-medium'>Disabled State</h3>
        <TextArea label='Disabled TextArea' placeholder='Cannot interact' disabled />
      </div>

      <div>
        <h3 className='mb-3 text-sm font-medium'>Read Only State</h3>
        <TextArea
          label='Read Only TextArea'
          value='This content cannot be edited but can be selected and copied.'
          readOnly
        />
      </div>

      <div>
        <h3 className='mb-3 text-sm font-medium'>Processing State</h3>
        <TextArea label='Processing TextArea' value='Saving long-form content…' processing />
      </div>

      <div>
        <h3 className='mb-3 text-sm font-medium'>Processing Overrides Error</h3>
        <TextArea label='Processing Wins' value='In flight' error='Error is hidden while processing' processing />
      </div>
    </div>
  ),
};

export const Resizing: Story = {
  name: 'Features / Resizing',
  render: () => (
    <div className='w-96 space-y-6 p-4'>
      <div>
        <h3 className='mb-3 text-sm font-medium'>Default (Not Resizable)</h3>
        <TextArea label='Notes' placeholder='This textarea cannot be resized' />
      </div>

      <div>
        <h3 className='mb-3 text-sm font-medium'>Resizable</h3>
        <TextArea label='Description' placeholder='Drag the bottom-right corner to resize' resizable />
      </div>

      <div>
        <h3 className='mb-3 text-sm font-medium'>Resizable with More Rows</h3>
        <TextArea label='Content' placeholder='Starts with 4 rows, can be resized' rows={4} resizable />
      </div>

      <div>
        <h3 className='mb-3 text-sm font-medium'>Auto-Size</h3>
        <TextArea
          label='Auto-sizing'
          placeholder='Grows automatically as you type (not supported in Firefox)'
          autoSize
        />
      </div>

      <div>
        <h3 className='mb-3 text-sm font-medium'>Auto-Size + Resizable</h3>
        <TextArea label='Combined' placeholder='Auto-sizes but can also be manually resized' autoSize resizable />
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  name: 'Features / Interactive',
  args: {
    label: 'Sample TextArea',
    description: 'This is a sample textarea field',
    placeholder: 'Type something...',
    rows: 3,
    disabled: false,
    readOnly: false,
  },
};

function HighlightDemo(): ReactElement {
  const [trigger, setTrigger] = useState(0);
  const highlightRef = useRef<HTMLDivElement>(null);
  useBlinkAttention(highlightRef, trigger);

  return (
    <div className='flex flex-col gap-y-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>
        Click the button to scroll the field into view and pulse the attention ring. Trigger logic lives in
        <code className='bg-surface-primary mx-1 rounded-sm px-1 py-0.5'>useBlinkAttention</code>; the field wears the
        ring via the <code className='bg-surface-primary mx-1 rounded-sm px-1 py-0.5'>highlightRef</code> prop so the
        pulse stays around the textarea itself, not the label or error. Clicking faster than the 1.2s animation restarts
        the ring on every click.
      </div>
      <Button onClick={() => setTrigger(t => t + 1)}>Highlight field</Button>
      <div className='h-96' />
      <TextArea
        highlightRef={highlightRef}
        label='Find me'
        description='Label and error remain outside the blink ring'
        value='Scroll target with multiple lines'
        readOnly
        rows={3}
      />
      <div className='h-96' />
    </div>
  );
}

export const Highlight: Story = {
  name: 'Features / Highlight',
  render: () => <HighlightDemo />,
};
