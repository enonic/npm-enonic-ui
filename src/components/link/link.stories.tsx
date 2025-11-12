import type { Meta, StoryObj } from '@storybook/preact-vite';
import { ChevronRight, CornerUpRight, Download, FileText, Info, Mail, Phone } from 'lucide-react';

import { Link, type LinkProps } from './link';

type Story = StoryObj<LinkProps>;

const externalOptions = {
  auto: 'auto',
  true: true,
  false: false,
} as const;

const leftIconOptions = {
  none: false,
  arrow: true,
  Info,
  Download,
  FileText,
} as const;

const rightIconOptions = {
  auto: undefined,
  none: false,
  external: true,
  Info,
  ChevronRight,
} as const;

export default {
  title: 'Components/Link',
  component: Link,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    href: { control: 'text', description: 'Destination URL' },
    children: { control: 'text', description: 'Link text (rendered as children)' },

    external: {
      options: Object.keys(externalOptions),
      mapping: externalOptions,
      control: { type: 'radio' },
      description: "auto = detect by origin; true/false to force. Defaults to 'auto'.",
      table: { defaultValue: { summary: 'auto' } },
    },
    newTab: {
      control: 'boolean',
      description: 'Open in new tab; by default derives from `external`',
    },

    leftIcon: {
      options: Object.keys(leftIconOptions),
      mapping: leftIconOptions,
      control: { type: 'radio' },
      description: 'Left icon: none = no icon; arrow = ArrowRight; or pick a Lucide icon',
    },
    rightIcon: {
      options: Object.keys(rightIconOptions),
      mapping: rightIconOptions,
      control: { type: 'radio' },
      description:
        'Right icon: auto (undefined) lets the component decide; external = force ExternalLink; none = no icon; or pick a Lucide icon',
    },
  },
} satisfies Meta<LinkProps>;

export const InternalLink: Story = {
  name: 'Examples / Internal Link',
  args: {
    href: '/about',
    children: 'Learn more about us',
  },
};

export const ExternalLink: Story = {
  name: 'Examples / External Link',
  args: {
    href: 'https://enonic.com',
    children: 'Visit Enonic',
  },
};

export const MailtoLink: Story = {
  name: 'Examples / Mailto Link',
  args: {
    href: 'mailto:hello@example.com',
    children: 'Send us an email',
  },
};

export const TelLink: Story = {
  name: 'Examples / Tel Link',
  args: {
    href: 'tel:+1234567890',
    children: 'Call us',
  },
};

export const AllStates: Story = {
  name: 'States / All States',
  render: () => (
    <div className='space-y-6 p-6'>
      <div className='grid grid-cols-2 gap-8'>
        <div>
          <h3 className='text-sm font-medium mb-3'>Internal Links</h3>
          <div className='flex flex-col gap-3'>
            <Link href='/'>Simple internal</Link>
            <Link href='#section'>Hash link</Link>
            <Link href='/about' leftIcon={true}>
              With left icon
            </Link>
            <Link href='/docs' leftIcon={FileText} rightIcon={CornerUpRight}>
              With both icons
            </Link>
          </div>
        </div>
        <div>
          <h3 className='text-sm font-medium mb-3'>External Links</h3>
          <div className='flex flex-col gap-3'>
            <Link href='https://enonic.com'>Auto-detected external</Link>
            <Link href='https://github.com' leftIcon={true}>
              With arrow icon
            </Link>
            <Link href='https://docs.enonic.com' rightIcon={false}>
              No external icon
            </Link>
            <Link href='mailto:hello@example.com'>Email link</Link>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const LinkTypes: Story = {
  name: 'Features / Link Types',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Internal Links</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='/'>Home</Link>
          <Link href='/about'>About</Link>
          <Link href='#section'>Jump to section</Link>
          <Link href='/docs/guide.pdf'>Download guide</Link>
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>External Links (auto-detected)</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='https://enonic.com'>Visit Enonic</Link>
          <Link href='https://github.com'>GitHub</Link>
          <Link href='http://example.com'>Example site</Link>
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Special Protocol Links</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='mailto:hello@example.com'>Email us</Link>
          <Link href='tel:+1234567890'>Call support</Link>
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Forced External/Internal</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='/about' external={true}>
            About (forced external)
          </Link>
          <Link href='https://enonic.com' external={false}>
            Enonic (forced internal)
          </Link>
        </div>
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  name: 'Features / With Icons',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Left Icons</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='/docs' leftIcon={true}>
            Documentation
          </Link>
          <Link href='/download' leftIcon={Download}>
            Download
          </Link>
          <Link href='/info' leftIcon={Info}>
            Information
          </Link>
          <Link href='/files' leftIcon={FileText}>
            Files
          </Link>
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Right Icons (Auto for External)</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='https://github.com'>GitHub (auto icon)</Link>
          <Link href='/internal'>Internal link (no icon)</Link>
          <Link href='/internal' rightIcon={ChevronRight}>
            Continue
          </Link>
          <Link href='/internal' rightIcon={true}>
            Forced external icon
          </Link>
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Both Icons</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='/docs/api' leftIcon={FileText} rightIcon={ChevronRight}>
            API Documentation
          </Link>
          <Link href='https://github.com/enonic' leftIcon={true} rightIcon={true}>
            View on GitHub
          </Link>
          <Link href='/download' leftIcon={Download} rightIcon={false}>
            Download (no right icon)
          </Link>
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Special Protocol Icons</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='mailto:contact@example.com' leftIcon={Mail}>
            Email Support
          </Link>
          <Link href='tel:+1234567890' leftIcon={Phone}>
            Call Sales
          </Link>
        </div>
      </div>
    </div>
  ),
};

export const LongText: Story = {
  name: 'Features / Long Text',
  render: () => (
    <div className='space-y-6 p-4 max-w-md'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Long Link Text</h3>
        <div className='space-y-3'>
          <Link href='#'>
            This is a very long link text that will wrap to multiple lines when the container is not wide enough
          </Link>
          <Link href='#' leftIcon={Info}>
            Long link text with a left icon that should align properly when text wraps
          </Link>
          <Link href='https://example.com'>
            Long external link text that automatically shows an external icon at the end
          </Link>
          <Link href='#' leftIcon={FileText} rightIcon={ChevronRight}>
            This link has both icons and long text that wraps nicely
          </Link>
        </div>
      </div>
    </div>
  ),
};

export const TruncatedLinks: Story = {
  name: 'Features / Truncated',
  render: () => (
    <div className='space-y-6 p-4 max-w-sm'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Regular Link</h3>
        <div className='space-y-2'>
          <Link href='https://example.com/very/long/path/to/some/document.pdf' className='max-w-full'>
            <span className='truncate'>
              https://example.com/very/long/path/to/some/important/document/with/very/long/name.pdf
            </span>
          </Link>
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>With Left Icon</h3>
        <div className='space-y-2'>
          <Link
            href='https://github.com/user/repository/blob/main/src/components/index.tsx'
            leftIcon={FileText}
            className='max-w-full'
          >
            <span className='truncate'>
              https://github.com/user/repository/blob/main/src/components/very/long/path/index.tsx
            </span>
          </Link>
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>With Right Icon</h3>
        <div className='space-y-2'>
          <Link href='https://example.com/download/file.pdf' rightIcon={Download} className='max-w-full'>
            <span className='truncate'>
              Download very long document name that exceeds the available container width.pdf
            </span>
          </Link>
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>With Both Icons</h3>
        <div className='space-y-2'>
          <Link href='#' leftIcon={Info} rightIcon={ChevronRight} className='max-w-full'>
            <span className='truncate'>Very long link text that should be truncated while preserving both icons</span>
          </Link>
        </div>
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  name: 'Features / Custom Styling',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Custom Classes</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='#' className='text-lg font-bold'>
            Large Bold Link
          </Link>
          <Link href='#' className='text-xs'>
            Small Link
          </Link>
          <Link href='#' className='text-primary-500'>
            Primary Color Link
          </Link>
          <Link href='#' className='no-underline hover:underline'>
            No underline until hover
          </Link>
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  name: 'Features / Interactive',
  args: {
    href: 'https://enonic.com',
    children: 'Visit Enonic',
    external: externalOptions.auto,
    newTab: undefined,
    leftIcon: leftIconOptions.none,
    rightIcon: rightIconOptions.auto,
  },
};

export const NewTabBehavior: Story = {
  name: 'Behavior / New Tab',
  render: () => (
    <div className='space-y-6 p-4'>
      <div>
        <h3 className='text-sm font-medium mb-3'>Default Behavior</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='/about'>Internal (same tab)</Link>
          <Link href='https://enonic.com'>External (new tab)</Link>
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Forced New Tab</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='/about' newTab={true}>
            Internal (forced new tab)
          </Link>
          <Link href='https://enonic.com' newTab={true}>
            External (explicit new tab)
          </Link>
        </div>
      </div>
      <div>
        <h3 className='text-sm font-medium mb-3'>Forced Same Tab</h3>
        <div className='flex flex-wrap gap-4'>
          <Link href='/about' newTab={false}>
            Internal (same tab)
          </Link>
          <Link href='https://enonic.com' newTab={false}>
            External (forced same tab)
          </Link>
        </div>
      </div>
    </div>
  ),
};
