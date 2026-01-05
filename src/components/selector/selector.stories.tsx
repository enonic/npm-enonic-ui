import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useState } from 'preact/hooks';
import { type ReactElement, useRef } from 'react';
import { Selector } from '@/components/selector/selector';
import { Button } from '../button';
import { Input } from '../input';

type Story = StoryObj;

type Fruit = {
  value: string;
  label: string;
  disabled?: boolean;
};

// Helper to create a label lookup function for Selector.Value render prop
const getLabel =
  (items: { value: string; label: string }[]) =>
  (v: string): string | undefined =>
    items.find(i => i.value === v)?.label;

const fruits: Fruit[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grapes', label: 'Grapes' },
  { value: 'kiwi', label: 'Kiwi' },
  { value: 'mango', label: 'Mango' },
  { value: 'orange', label: 'Orange' },
  { value: 'peach', label: 'Peach' },
  { value: 'pineapple', label: 'Pineapple' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'watermelon', label: 'Watermelon' },
];

const groupedFoods = {
  fruits: [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'grapes', label: 'Grapes' },
  ],
  vegetables: [
    { value: 'broccoli', label: 'Broccoli' },
    { value: 'carrot', label: 'Carrot', disabled: true },
    { value: 'cucumber', label: 'Cucumber' },
    { value: 'spinach', label: 'Spinach' },
  ],
  proteins: [
    { value: 'beef', label: 'Beef' },
    { value: 'chicken', label: 'Chicken' },
    { value: 'fish', label: 'Fish' },
    { value: 'tofu', label: 'Tofu' },
  ],
};

// Flattened foods for label lookup
const allFoods = [...groupedFoods.fruits, ...groupedFoods.vegetables, ...groupedFoods.proteins];

export default {
  title: 'Components/Selector',
  component: Selector.Root,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

// Helper component for custom item content
const ItemContent = ({ label, description }: { label: string; description?: string }): ReactElement => {
  return (
    <div className='flex w-full flex-col'>
      <span className='font-medium text-sm'>{label}</span>
      {description && <span className='text-subtle text-xs group-data-[state=selected]:text-alt'>{description}</span>}
    </div>
  );
};

//
// Examples
//

export const Basic: Story = {
  name: 'Examples / Basic',
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    return (
      <div className='w-64 space-y-3'>
        <h3 className='font-medium text-md'>Basic Selector</h3>
        <Selector.Root value={value} onValueChange={setValue}>
          <Selector.Trigger>
            <Selector.Value placeholder='Select a fruit'>{getLabel(fruits)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {fruits.map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
          <Selector.HiddenSelect />
        </Selector.Root>
      </div>
    );
  },
};

export const WithPlaceholder: Story = {
  name: 'Examples / With Placeholder',
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    return (
      <div className='w-64 space-y-3'>
        <h3 className='font-medium text-md'>With Placeholder</h3>
        <p className='text-sm text-subtle'>Shows placeholder text when no value is selected</p>
        <Selector.Root value={value} onValueChange={setValue}>
          <Selector.Trigger>
            <Selector.Value placeholder='Choose your favorite fruit...'>{getLabel(fruits)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {fruits.slice(0, 6).map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
        </Selector.Root>
      </div>
    );
  },
};

export const Preselected: Story = {
  name: 'Examples / Preselected',
  render: () => {
    const [value, setValue] = useState<string | undefined>('cherry');
    const items = fruits.slice(0, 8);

    return (
      <div className='w-64 space-y-3'>
        <h3 className='font-medium text-md'>Preselected Value</h3>
        <p className='text-sm text-subtle'>Opens with cherry already selected</p>
        <Selector.Root value={value} onValueChange={setValue}>
          <Selector.Trigger>
            <Selector.Value placeholder='Select a fruit'>{v => items.find(i => i.value === v)?.label}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {items.map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
        </Selector.Root>
      </div>
    );
  },
};

export const WithGroups: Story = {
  name: 'Examples / With Groups',
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    return (
      <div className='w-64 space-y-3'>
        <h3 className='font-medium text-md'>Grouped Items</h3>
        <p className='text-sm text-subtle'>Items organized in labeled groups</p>
        <Selector.Root value={value} onValueChange={setValue}>
          <Selector.Trigger>
            <Selector.Value placeholder='Select food'>{getLabel(allFoods)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              <Selector.Group>
                <Selector.Label>Fruits</Selector.Label>
                {groupedFoods.fruits.map(({ value, label }) => (
                  <Selector.Item key={value} value={value} textValue={label}>
                    <Selector.ItemText>{label}</Selector.ItemText>
                    <Selector.ItemIndicator />
                  </Selector.Item>
                ))}
              </Selector.Group>

              <Selector.Separator />

              <Selector.Group>
                <Selector.Label>Vegetables</Selector.Label>
                {groupedFoods.vegetables.map(({ value, label, disabled }) => (
                  <Selector.Item key={value} value={value} disabled={disabled} textValue={label}>
                    <Selector.ItemText>{label}</Selector.ItemText>
                    <Selector.ItemIndicator />
                  </Selector.Item>
                ))}
              </Selector.Group>

              <Selector.Separator />

              <Selector.Group>
                <Selector.Label>Proteins</Selector.Label>
                {groupedFoods.proteins.map(({ value, label }) => (
                  <Selector.Item key={value} value={value} textValue={label}>
                    <Selector.ItemText>{label}</Selector.ItemText>
                    <Selector.ItemIndicator />
                  </Selector.Item>
                ))}
              </Selector.Group>
            </Selector.Viewport>
          </Selector.Content>
        </Selector.Root>
      </div>
    );
  },
};

//
// States
//

export const Disabled: Story = {
  name: 'States / Disabled',
  render: () => {
    return (
      <div className='w-64 space-y-3'>
        <h3 className='font-medium text-md'>Disabled</h3>
        <Selector.Root disabled defaultValue='apple'>
          <Selector.Trigger>
            <Selector.Value placeholder='Select a fruit'>{getLabel(fruits)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {fruits.slice(0, 5).map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
        </Selector.Root>
      </div>
    );
  },
};

export const WithError: Story = {
  name: 'States / Error',
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    return (
      <div className='w-64 space-y-2'>
        <h3 className='font-medium text-md'>Error State</h3>
        <Selector.Root value={value} onValueChange={setValue} error>
          <Selector.Trigger>
            <Selector.Value placeholder='Select a fruit'>{getLabel(fruits)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {fruits.slice(0, 6).map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
        </Selector.Root>
        <p className='text-error'>Please select a valid option</p>
      </div>
    );
  },
};

export const Required: Story = {
  name: 'States / Required',
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const formRef = useRef<HTMLFormElement>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: Event): void => {
      e.preventDefault();
      setSubmitted(true);
    };

    return (
      <form ref={formRef} onSubmit={handleSubmit} className='w-64 space-y-3'>
        <h3 className='font-medium text-md'>Required Field</h3>
        <p className='text-sm text-subtle'>The hidden select enables native form validation</p>
        <Selector.Root value={value} onValueChange={setValue} name='fruit' required>
          <Selector.Trigger>
            <Selector.Value placeholder='Select a fruit *'>{getLabel(fruits)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {fruits.slice(0, 6).map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
          <Selector.HiddenSelect />
        </Selector.Root>
        <button type='submit' className='rounded-sm bg-btn-default px-4 py-2 text-on-dark text-sm hover:bg-btn-hover'>
          Submit
        </button>
        {submitted && value && <p className='text-sm text-success'>Form submitted with: {value}</p>}
      </form>
    );
  },
};

//
// Features
//

export const LongList: Story = {
  name: 'Features / Long List',
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    const longList = Array.from({ length: 50 }, (_, i) => ({
      value: `item-${i + 1}`,
      label: `Item ${i + 1}`,
    }));

    return (
      <div className='w-64 space-y-3'>
        <h3 className='font-medium text-md'>Long List with Scrolling</h3>
        <p className='text-sm text-subtle'>Use PageUp/PageDown to jump 10 items</p>
        <Selector.Root value={value} onValueChange={setValue}>
          <Selector.Trigger>
            <Selector.Value placeholder='Select an item'>{getLabel(longList)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {longList.map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
        </Selector.Root>
      </div>
    );
  },
};

export const CustomItemContent: Story = {
  name: 'Features / Custom Item Content',
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    const options = [
      { value: 'draft', label: 'Draft', description: 'Not yet published' },
      { value: 'pending', label: 'Pending Review', description: 'Awaiting approval' },
      { value: 'published', label: 'Published', description: 'Live on the site' },
      { value: 'archived', label: 'Archived', description: 'No longer visible' },
    ];

    return (
      <div className='w-72 space-y-3'>
        <h3 className='font-medium text-md'>Custom Item Content</h3>
        <p className='text-sm text-subtle'>Items with rich content (label + description)</p>
        <Selector.Root value={value} onValueChange={setValue}>
          <Selector.Trigger>
            <Selector.Value placeholder='Select status'>{getLabel(options)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {options.map(({ value, label, description }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <ItemContent label={label} description={description} />
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
        </Selector.Root>
      </div>
    );
  },
};

export const WithForm: Story = {
  name: 'Features / With Form',
  render: () => {
    const [formData, setFormData] = useState<{ name: string; fruit: string } | null>(null);

    const handleSubmit = (e: Event): void => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = new FormData(form);
      setFormData({
        name: data.get('name') as string,
        fruit: data.get('fruit') as string,
      });
    };

    return (
      <form onSubmit={handleSubmit} className='w-80 space-y-4'>
        <h3 className='font-medium text-md'>Form Integration</h3>
        <p className='text-sm text-subtle'>The hidden select works with native form submission</p>

        <div className='space-y-2'>
          <label htmlFor='name' className='block font-medium text-sm'>
            Name
          </label>
          <Input id='name' name='name' required placeholder='Enter your name' />
        </div>

        <div className='space-y-2'>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className='block font-medium text-sm'>Favorite Fruit</label>
          <Selector.Root name='fruit' required>
            <Selector.Trigger>
              <Selector.Value placeholder='Select a fruit'>{getLabel(fruits)}</Selector.Value>
              <Selector.Icon />
            </Selector.Trigger>
            <Selector.Content>
              <Selector.Viewport>
                {fruits.slice(0, 8).map(({ value, label }) => (
                  <Selector.Item key={value} value={value} textValue={label}>
                    <Selector.ItemText>{label}</Selector.ItemText>
                    <Selector.ItemIndicator />
                  </Selector.Item>
                ))}
              </Selector.Viewport>
            </Selector.Content>
            <Selector.HiddenSelect />
          </Selector.Root>
        </div>

        <Button variant='solid' type='submit' label='Submit Form' />

        {formData && (
          <div className='rounded-sm bg-surface-primary p-3'>
            <p className='font-medium text-sm'>Submitted Data:</p>
            <pre className='mt-1 text-subtle text-xs'>{JSON.stringify(formData, null, 2)}</pre>
          </div>
        )}
      </form>
    );
  },
};

export const Controlled: Story = {
  name: 'Features / Controlled',
  render: () => {
    const [value, setValue] = useState<string | undefined>('banana');
    const [open, setOpen] = useState(false);

    return (
      <div className='w-80 space-y-3'>
        <h3 className='font-medium text-md'>Controlled State</h3>
        <div className='rounded-sm bg-surface-primary p-3'>
          <p className='text-sm'>
            <span className='font-medium'>Value:</span> {value ?? '(none)'}
          </p>
          <p className='text-sm'>
            <span className='font-medium'>Open:</span> {open ? 'true' : 'false'}
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => setValue('cherry')}
            className='rounded-sm bg-btn-default px-3 py-1.5 text-on-dark text-sm hover:bg-btn-hover'
          >
            Set Cherry
          </button>
          <button
            type='button'
            onClick={() => setValue(undefined)}
            className='rounded-sm bg-surface-neutral-hover px-3 py-1.5 text-sm hover:bg-surface-neutral-pressed'
          >
            Clear
          </button>
          <button
            type='button'
            onClick={() => setOpen(!open)}
            className='rounded-sm bg-surface-neutral-hover px-3 py-1.5 text-sm hover:bg-surface-neutral-pressed'
          >
            Toggle Open
          </button>
        </div>
        <Selector.Root value={value} onValueChange={setValue} open={open} onOpenChange={setOpen}>
          <Selector.Trigger>
            <Selector.Value placeholder='Controlled selector'>{getLabel(fruits)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {fruits.slice(0, 8).map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
        </Selector.Root>
      </div>
    );
  },
};

type PlaygroundArgs = {
  disabled: boolean;
  error: boolean;
  required: boolean;
  placeholder: string;
  defaultOpen: boolean;
};

export const Interactive: StoryObj<PlaygroundArgs> = {
  name: 'Features / Interactive',
  args: {
    disabled: false,
    error: false,
    required: false,
    placeholder: 'Select a fruit',
    defaultOpen: false,
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disable the selector',
    },
    error: {
      control: 'boolean',
      description: 'Show error state',
    },
    required: {
      control: 'boolean',
      description: 'Make selection required',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Open dropdown by default',
    },
  },
  render: args => {
    const { disabled, error, required, placeholder, defaultOpen } = args;
    const [value, setValue] = useState<string | undefined>();

    return (
      <div className='w-80 space-y-3'>
        <header>
          <h3 className='font-medium text-md'>Playground</h3>
          <p className='text-sm text-subtle'>Use the controls to configure the selector</p>
        </header>
        <div className='rounded-sm bg-surface-primary px-3 py-2'>
          <p className='text-sm'>
            <span className='font-medium'>Selected:</span> {value ?? '(none)'}
          </p>
        </div>
        <Selector.Root
          value={value}
          onValueChange={setValue}
          disabled={disabled}
          error={error}
          required={required}
          defaultOpen={defaultOpen}
        >
          <Selector.Trigger>
            <Selector.Value placeholder={placeholder}>{getLabel(fruits)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {fruits.map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
          <Selector.HiddenSelect />
        </Selector.Root>
        {error && <p className='text-error text-sm'>Please select a valid option</p>}
      </div>
    );
  },
};

//
// Behavior
//

export const KeyboardNavigation: Story = {
  name: 'Behavior / Keyboard Navigation',
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    return (
      <div className='w-80 space-y-3'>
        <h3 className='font-medium text-md'>Keyboard Navigation</h3>
        <div className='rounded-sm bg-surface-primary p-3 text-sm'>
          <p className='mb-2 font-medium'>Keyboard shortcuts:</p>
          <ul className='space-y-1 text-subtle text-xs'>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Arrow Keys</kbd> - Navigate options
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Enter</kbd> /{' '}
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Space</kbd> - Select option
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Escape</kbd> - Close without selecting
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>Home</kbd> /{' '}
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>End</kbd> - Jump to first/last
            </li>
            <li>
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>PageUp</kbd> /{' '}
              <kbd className='rounded bg-bdr-subtle px-1 text-main'>PageDown</kbd> - Jump 10 items
            </li>
          </ul>
        </div>
        <Selector.Root value={value} onValueChange={setValue}>
          <Selector.Trigger>
            <Selector.Value placeholder='Focus me and use keyboard'>{getLabel(fruits)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {fruits.map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
        </Selector.Root>
      </div>
    );
  },
};

export const TypeToSelect: Story = {
  name: 'Behavior / Type to Select',
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    return (
      <div className='w-80 space-y-3'>
        <h3 className='font-medium text-md'>Type to Select</h3>
        <div className='rounded-sm bg-surface-primary p-3 text-sm'>
          <p className='mb-2 font-medium'>Type-ahead behavior:</p>
          <ul className='space-y-1 text-subtle text-xs'>
            <li>Focus the selector and type letters to jump to matching options</li>
            <li>
              Type <kbd className='rounded bg-bdr-subtle px-1 text-main'>b</kbd> repeatedly to cycle through items
              starting with &quot;B&quot;
            </li>
            <li>Type quickly for multi-character search (e.g., &quot;str&quot; for Strawberry)</li>
          </ul>
        </div>
        <Selector.Root value={value} onValueChange={setValue}>
          <Selector.Trigger>
            <Selector.Value placeholder='Type letters to search...'>{getLabel(fruits)}</Selector.Value>
            <Selector.Icon />
          </Selector.Trigger>
          <Selector.Content>
            <Selector.Viewport>
              {fruits.map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                  <Selector.ItemIndicator />
                </Selector.Item>
              ))}
            </Selector.Viewport>
          </Selector.Content>
        </Selector.Root>
        {value && (
          <p className='text-sm text-subtle'>
            Selected: <span className='font-medium'>{value}</span>
          </p>
        )}
      </div>
    );
  },
};
