import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Avatar, type AvatarRootProps } from '@/components/avatar/avatar';

type Story = StoryObj<AvatarRootProps>;

type User = {
  name: string;
  avatar?: string;
  alt: string;
};

const users: User[] = [
  {
    name: 'Mikita Taukachou',
    avatar: 'https://avatars.githubusercontent.com/u/1847621?v=4',
    alt: '@edloidas',
  },
  {
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=12',
    alt: '@johndoe',
  },
  {
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=25',
    alt: '@janesmith',
  },
  {
    name: 'Bob Wilson',
    // No avatar - will use fallback
    alt: '@bobwilson',
  },
  {
    name: 'Alice Brown',
    avatar: 'https://example.com/invalid-image-to-test-fallback.jpg',
    alt: '@alicebrown',
  },
];

function getInitials(name: string): string {
  if (!name.trim()) {
    return '';
  }

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

export default {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Avatar size',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Avatar shape',
    },
  },
} satisfies Meta<AvatarRootProps>;

export const Single: Story = {
  name: 'Examples / Single',
  args: {
    size: 'md',
    shape: 'circle',
  },
  render: ({ size, shape }) => {
    const user = users[0];
    return (
      <div className='p-4'>
        <h3 className='mb-3 font-medium text-sm'>User Profile</h3>
        <div className='flex items-center gap-x-3'>
          <Avatar size={size} shape={shape}>
            <Avatar.Image src={user.avatar} alt={user.alt} />
            <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
          </Avatar>
          <div>
            <p className='font-medium text-sm'>{user.name}</p>
            <p className='text-subtle text-xs'>Frontend Architect</p>
          </div>
        </div>
      </div>
    );
  },
};

export const WithFallback: Story = {
  name: 'Examples / With Fallback',
  args: {
    size: 'md',
    shape: 'circle',
  },
  render: ({ size, shape }) => {
    const user = users[3]; // User without avatar
    return (
      <div className='p-4'>
        <h3 className='mb-3 font-medium text-sm'>No Image - Shows Fallback</h3>
        <div className='flex items-center gap-x-3'>
          <Avatar size={size} shape={shape}>
            <Avatar.Image src={user.avatar} alt={user.alt} />
            <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
          </Avatar>
          <div>
            <p className='font-medium text-sm'>{user.name}</p>
            <p className='text-subtle text-xs'>Designer</p>
          </div>
        </div>
      </div>
    );
  },
};

export const Multiple: Story = {
  name: 'Examples / Multiple',
  args: {
    size: 'md',
    shape: 'circle',
  },
  render: ({ size, shape }) => (
    <div className='p-4'>
      <h3 className='mb-3 font-medium text-sm'>Team Members</h3>
      <div className='flex flex-col gap-y-3'>
        {users.map(({ name, avatar, alt }) => (
          <div key={alt} className='flex items-center gap-x-3'>
            <Avatar size={size} shape={shape}>
              <Avatar.Image src={avatar} alt={name} />
              <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
            </Avatar>
            <p className='font-medium text-sm'>{name}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Features / Sizes',
  args: {
    shape: 'circle',
  },
  argTypes: {
    size: { control: false },
  },
  render: ({ shape }) => {
    const user = users[0];
    return (
      <div className='p-4'>
        <h3 className='mb-3 font-medium text-sm'>Avatar Sizes</h3>
        <div className='flex items-center gap-x-4'>
          <div className='flex flex-col items-center gap-y-2'>
            <Avatar size='sm' shape={shape}>
              <Avatar.Image src={user.avatar} alt={user.alt} />
              <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
            </Avatar>
            <span className='text-subtle text-xs'>Small</span>
          </div>
          <div className='flex flex-col items-center gap-y-2'>
            <Avatar size='md' shape={shape}>
              <Avatar.Image src={user.avatar} alt={user.alt} />
              <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
            </Avatar>
            <span className='text-subtle text-xs'>Medium</span>
          </div>
          <div className='flex flex-col items-center gap-y-2'>
            <Avatar size='lg' shape={shape}>
              <Avatar.Image src={user.avatar} alt={user.alt} />
              <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
            </Avatar>
            <span className='text-subtle text-xs'>Large</span>
          </div>
        </div>
      </div>
    );
  },
};

export const Shapes: Story = {
  name: 'Features / Shapes',
  args: {
    size: 'lg',
  },
  argTypes: {
    shape: { control: false },
  },
  render: ({ size }) => {
    const user = users[0];
    return (
      <div className='p-4'>
        <h3 className='mb-3 font-medium text-sm'>Avatar Shapes</h3>
        <div className='flex items-center gap-x-4'>
          <div className='flex flex-col items-center gap-y-2'>
            <Avatar size={size} shape='circle'>
              <Avatar.Image src={user.avatar} alt={user.alt} />
              <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
            </Avatar>
            <span className='text-subtle text-xs'>Circle</span>
          </div>
          <div className='flex flex-col items-center gap-y-2'>
            <Avatar size={size} shape='square'>
              <Avatar.Image src={user.avatar} alt={user.alt} />
              <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
            </Avatar>
            <span className='text-subtle text-xs'>Square</span>
          </div>
        </div>
      </div>
    );
  },
};

export const AvatarGroup: Story = {
  name: 'Features / Avatar Group',
  args: {
    size: 'md',
    shape: 'circle',
  },
  render: ({ size, shape }) => (
    <div className='flex flex-col items-center gap-y-3 p-4'>
      <h3 className='font-medium text-sm'>Project Contributors</h3>
      <div className='-space-x-2 flex'>
        {users.slice(0, 4).map(({ name, avatar, alt }) => (
          <Avatar key={alt} size={size} shape={shape} className='ring-2 ring-surface-neutral'>
            <Avatar.Image src={avatar} alt={alt} />
            <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
          </Avatar>
        ))}
        <Avatar size={size} shape={shape} className='ring-2 ring-surface-neutral'>
          <Avatar.Fallback>+2</Avatar.Fallback>
        </Avatar>
      </div>
      <p className='text-subtle text-xs'>6 contributors total</p>
    </div>
  ),
};

export const WithCustomFallback: Story = {
  name: 'Features / Custom Fallback',
  args: {
    size: 'lg',
    shape: 'circle',
  },
  render: ({ size, shape }) => (
    <div className='p-4'>
      <h3 className='mb-3 font-medium text-sm'>Custom Fallback Examples</h3>
      <div className='flex items-center gap-x-4'>
        <div className='flex flex-col items-center gap-y-2'>
          <Avatar size={size} shape={shape}>
            <Avatar.Image src='' alt='User' />
            <Avatar.Fallback>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className='size-1/2'
              >
                <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                <circle cx='12' cy='7' r='4' />
              </svg>
            </Avatar.Fallback>
          </Avatar>
          <span className='text-subtle text-xs'>Icon</span>
        </div>
        <div className='flex flex-col items-center gap-y-2'>
          <Avatar size={size} shape={shape}>
            <Avatar.Image src='' alt='User' />
            <Avatar.Fallback className='bg-blue-500 text-white'>AB</Avatar.Fallback>
          </Avatar>
          <span className='text-subtle text-xs'>Colored</span>
        </div>
        <div className='flex flex-col items-center gap-y-2'>
          <Avatar size={size} shape={shape}>
            <Avatar.Image src='' alt='User' />
            <Avatar.Fallback className='text-2xl'>🎨</Avatar.Fallback>
          </Avatar>
          <span className='text-subtle text-xs'>Emoji</span>
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  name: 'Features / Interactive',
  render: ({ size, shape }) => {
    const user = users[0];
    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
        <h3 className='font-medium text-sm'>Customize Avatar</h3>
        <Avatar size={size} shape={shape}>
          <Avatar.Image src={user.avatar} alt={user.alt} />
          <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
        </Avatar>
      </div>
    );
  },
};
