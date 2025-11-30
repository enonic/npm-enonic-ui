import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Calendar, Eye, EyeOff, Mail, Search, User } from 'lucide-react';

import { Input, type InputProps } from './input';

type Story = StoryObj<InputProps>;

export default {
  title: 'Components/Input',
  component: Input,
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
    placeholder: {
      control: 'text',
      description: 'Input placeholder text',
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
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search'],
      description: 'Input type',
    },
    startAddon: {
      control: false,
      description: 'Optional prefix content (string or component)',
    },
    endAddon: {
      control: false,
      description: 'Optional suffix content (string or component)',
    },
  },
} satisfies Meta<InputProps>;

export const Default: Story = {
  name: 'Examples / Default',
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  name: 'Examples / With Label',
  args: {
    label: 'Full Name',
    placeholder: 'Enter your full name',
  },
};

export const WithDescription: Story = {
  name: 'Examples / With Description',
  args: {
    label: 'Email Address',
    description: "We'll use this to send you important updates",
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const WithError: Story = {
  name: 'Examples / With Error',
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    error: 'Username must be at least 3 characters long',
    value: 'ab',
  },
};

export const FormExample: Story = {
  name: 'Examples / Form',
  render: () => (
    <div className='w-96 space-y-6 p-4'>
      <h3 className='mb-4 font-medium text-lg'>User Registration</h3>

      <Input label='Full Name' description='Enter your first and last name' placeholder='John Doe' required />

      <Input
        label='Email Address'
        description="We'll use this for your account login"
        placeholder='john@example.com'
        type='email'
        startAddon={<Mail size={16} />}
        required
      />

      <Input
        label='Phone Number'
        description='Optional - for account recovery'
        placeholder='+1 (555) 123-4567'
        type='tel'
      />

      <Input label='Website' placeholder='mywebsite' startAddon='https://' endAddon='.com' />

      <Input
        label='Password'
        placeholder='Create a strong password'
        type='password'
        error='Password must be at least 8 characters long'
        startAddon={<User size={16} />}
        endAddon={<EyeOff size={16} />}
        required
      />
    </div>
  ),
};

export const States: Story = {
  name: 'States / All States',
  render: () => (
    <div className='w-80 space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Default State</h3>
        <Input label='Default Input' placeholder='Enter text...' />
      </div>

      <div>
        <h3 className='mb-3 font-medium text-sm'>With Value</h3>
        <Input label='Filled Input' value='Sample text content' />
      </div>

      <div>
        <h3 className='mb-3 font-medium text-sm'>Error State</h3>
        <Input label='Invalid Input' placeholder='Enter valid data' error='This field is required' />
      </div>

      <div>
        <h3 className='mb-3 font-medium text-sm'>Disabled State</h3>
        <Input label='Disabled Input' placeholder='Cannot interact' disabled />
      </div>

      <div>
        <h3 className='mb-3 font-medium text-sm'>Read Only State</h3>
        <Input label='Read Only Input' value='This cannot be edited' readOnly />
      </div>
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
    value: 'This value cannot be changed',
    readOnly: true,
  },
};

export const ReadOnlyStates: Story = {
  name: 'States / Read-Only with Addons',
  render: () => (
    <div className='w-96 space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Read Only - No Addons</h3>
        <Input label='User ID' description='This identifier cannot be changed' value='USR-12345' readOnly />
      </div>

      <div>
        <h3 className='mb-3 font-medium text-sm'>Read Only - Left Addon</h3>
        <Input
          label='System URL'
          description='This URL is automatically generated'
          startAddon='https://'
          value='app.example.com'
          readOnly
        />
      </div>

      <div>
        <h3 className='mb-3 font-medium text-sm'>Read Only - Both Addons</h3>
        <Input
          label='Account Balance'
          description='Balance is updated automatically'
          startAddon='$'
          endAddon='USD'
          value='1,234.56'
          readOnly
        />
      </div>

      <div>
        <h3 className='mb-3 font-medium text-sm'>Read Only - Icon Addons</h3>
        <Input
          label='Account Email'
          description='Email address from your profile settings'
          startAddon={<Mail size={16} />}
          endAddon={<User size={16} />}
          value='john.doe@company.com'
          readOnly
        />
      </div>

      <div>
        <h3 className='mb-3 font-medium text-sm'>Read Only - Long Value</h3>
        <Input
          label='API Token'
          description='Generated token for API access'
          startAddon='Bearer'
          value='sk_live_51HyPQeGqQKOtaBDfWZYgDqwXNOGfvVcQ8GrT3kJwNbHvFjQ2rTcK8YzHwV9mN'
          readOnly
        />
      </div>
    </div>
  ),
};

export const ErrorStates: Story = {
  name: 'States / Error with Addons',
  render: () => (
    <div className='w-96 space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Error - No Addons</h3>
        <Input
          label='Email Address'
          placeholder='Enter your email'
          type='email'
          value='invalid-email'
          error='Please enter a valid email address'
        />
      </div>

      <div>
        <h3 className='mb-3 font-medium text-sm'>Error - Left Addon</h3>
        <Input
          label='Website URL'
          placeholder='example.com'
          startAddon='https://'
          value='invalid url'
          error='Please enter a valid domain name'
        />
      </div>

      <div>
        <h3 className='mb-3 font-medium text-sm'>Error - Both Addons</h3>
        <Input
          label='Price Range'
          placeholder='100'
          startAddon='$'
          endAddon='USD'
          value='not-a-number'
          error='Please enter a valid numeric value'
        />
      </div>

      <div>
        <h3 className='mb-3 font-medium text-sm'>Error - Icon Addons</h3>
        <Input
          label='Search Query'
          placeholder='Search...'
          startAddon={<Search size={16} />}
          endAddon={<Calendar size={16} />}
          value='inv@lid characters!'
          error='Search query contains invalid characters'
        />
      </div>
    </div>
  ),
};

export const WithStringAddons: Story = {
  name: 'Features / String Addons',
  render: () => (
    <div className='w-80 space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Start Addon</h3>
        <Input label='Website URL' placeholder='example.com' startAddon='https://' />
      </div>
      <div>
        <h3 className='mb-3 font-medium text-sm'>End Addon</h3>
        <Input label='Price' placeholder='0.00' endAddon='USD' type='number' />
      </div>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Both Addons</h3>
        <Input label='Domain' placeholder='mysite' startAddon='https://' endAddon='.com' />
      </div>
    </div>
  ),
};

export const WithIconAddons: Story = {
  name: 'Features / Icon Addons',
  render: () => (
    <div className='w-80 space-y-6 p-4'>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Search Field</h3>
        <Input label='Search' placeholder='Search users...' startAddon={<Search size={16} />} />
      </div>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Email Input</h3>
        <Input label='Email' placeholder='Enter your email' type='email' startAddon={<Mail size={16} />} />
      </div>
      <div>
        <h3 className='mb-3 font-medium text-sm'>Password Input</h3>
        <Input
          label='Password'
          placeholder='Enter password'
          type='password'
          startAddon={<User size={16} />}
          endAddon={<Eye size={16} />}
        />
      </div>
    </div>
  ),
};

export const InputTypes: Story = {
  name: 'Features / Input Types',
  render: () => (
    <div className='w-80 space-y-6 p-4'>
      <Input label='Text' type='text' placeholder='Enter text' />
      <Input label='Email' type='email' placeholder='Enter email' />
      <Input label='Password' type='password' placeholder='Enter password' />
      <Input label='Number' type='number' placeholder='Enter number' />
      <Input label='Search' type='search' placeholder='Search...' />
      <Input label='URL' type='url' placeholder='https://example.com' />
      <Input label='Phone' type='tel' placeholder='+1 (555) 123-4567' />
    </div>
  ),
};

export const Interactive: Story = {
  name: 'Features / Interactive',
  args: {
    label: 'Sample Input',
    description: 'This is a sample input field',
    placeholder: 'Type something...',
    type: 'text',
    disabled: false,
    readOnly: false,
  },
};
