import type { Meta, StoryObj } from '@storybook/preact-vite';
import { BadgeInfo } from 'lucide-react';
import { useCallback, useState } from 'preact/hooks';
import type { ReactElement } from 'react';

export default {
  title: 'Design/Colors',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
  },
} satisfies Meta;

type Story = StoryObj;

type ColorSwatchProps = {
  name: string;
  variable: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
};

const ColorSwatch = ({ name, variable, description, size = 'md' }: ColorSwatchProps): ReactElement => {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    void navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [name]);

  const sizeClasses = {
    sm: 'h-12',
    md: 'h-20',
    lg: 'h-24',
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className='group hover:-translate-y-0.5 relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-bdr-soft bg-surface-neutral text-left transition-all duration-200 hover:border-bdr-strong hover:shadow-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-3 focus-visible:ring-offset-ring-offset'
      title={`Click to copy: ${name}`}
    >
      <div className={`w-full ${sizeClasses[size]}`} style={{ backgroundColor: `var(${variable})` }} />
      <div className='flex flex-col gap-1 p-3'>
        <div className='font-bold font-mono text-main text-sm tracking-tight'>{name}</div>
        {description && <div className='text-subtle text-xs leading-tight'>{description}</div>}
        <div className='font-mono text-[10px] text-subtle uppercase tracking-wider opacity-60'>{variable}</div>
      </div>
      {copied && (
        <div className='fade-in slide-in-from-top-1 absolute top-2 right-2 animate-in rounded-md bg-surface-success px-2.5 py-1 font-semibold text-success text-xs tracking-wide shadow-lg'>
          COPIED
        </div>
      )}
    </button>
  );
};

type ColorGroupProps = {
  title: string;
  description?: string;
  badge?: string;
  colors: { name: string; variable: string; description?: string }[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'sm' | 'md' | 'lg';
};

const ColorGroup = ({ title, description, badge, colors, columns = 6, size = 'md' }: ColorGroupProps): ReactElement => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  return (
    <section className='mb-12'>
      <div className='mb-5 flex items-start justify-between gap-4'>
        <div className='flex-1'>
          <div className='mb-2 flex items-center gap-3'>
            <h3 className='font-bold text-2xl text-main tracking-tight'>{title}</h3>
            {badge && (
              <span className='rounded-full border border-bdr-soft bg-surface-primary px-3 py-0.5 font-semibold text-subtle text-xs uppercase tracking-wider'>
                {badge}
              </span>
            )}
          </div>
          {description && <p className='max-w-2xl text-sm text-subtle leading-relaxed'>{description}</p>}
        </div>
      </div>
      <div className={`grid gap-4 ${gridCols[columns]}`}>
        {colors.map(color => (
          <ColorSwatch key={color.variable} {...color} size={size} />
        ))}
      </div>
    </section>
  );
};

const SectionDivider = (): ReactElement => (
  <div className='my-16 flex items-center gap-4'>
    <div className='h-px flex-1 bg-linear-to-r from-transparent via-bdr-soft to-transparent' />
  </div>
);

const PageHeader = ({ title, subtitle, note }: { title: string; subtitle: string; note?: string }): ReactElement => (
  <header className='mb-12 border-bdr-soft border-b pb-8'>
    <div className='mb-6 flex items-start justify-between gap-8'>
      <div className='flex-1'>
        <h1 className='mb-3 font-bold text-5xl text-main tracking-tight'>{title}</h1>
        <p className='max-w-3xl text-lg text-subtle leading-relaxed'>{subtitle}</p>
      </div>
      <div className='flex items-center gap-2 rounded-full border border-bdr-soft bg-surface-primary px-4 py-2'>
        <div className='size-2 animate-pulse rounded-full bg-success' />
        <span className='font-semibold text-subtle text-xs uppercase tracking-wider'>Interactive</span>
      </div>
    </div>
    {note && (
      <div className='relative overflow-hidden rounded-lg bg-surface-primary p-5'>
        <div className='-translate-y-16 absolute top-0 right-0 size-32 translate-x-16 rounded-full bg-info/10' />
        <div className='relative flex gap-3'>
          {/* <div className='shrink-0 text-2xl'>💡</div> */}
          <BadgeInfo className='size-6 shrink-0 text-info' />
          <div>
            <div className='mb-1 font-bold text-main text-sm uppercase tracking-wider'>Important Note</div>
            <p className='text-sm text-subtle leading-relaxed'>{note}</p>
          </div>
        </div>
      </div>
    )}
  </header>
);

export const BasicPalette: Story = {
  render: () => (
    <div className='min-h-screen bg-surface-neutral p-8 md:p-12'>
      <div className='mx-auto max-w-7xl'>
        <PageHeader
          title='Foundation Palette'
          subtitle='Base color primitives that form the foundation of the design system. These are the building blocks for all semantic tokens.'
          note="These are foundation colors. Don't use them directly in components. Instead, create semantic color tokens in your app theme that reference these base colors."
        />

        <ColorGroup
          title='Neutral Scale'
          description='Complete grayscale spectrum for text, backgrounds, and UI elements. Carefully balanced for optimal contrast and visual hierarchy.'
          badge='13 shades'
          columns={6}
          size='lg'
          colors={[
            { name: 'black', variable: '--color-black' },
            { name: 'grey-950', variable: '--color-grey-950' },
            { name: 'grey-900', variable: '--color-grey-900' },
            { name: 'grey-850', variable: '--color-grey-850' },
            { name: 'grey-800', variable: '--color-grey-800' },
            { name: 'grey-700', variable: '--color-grey-700' },
            { name: 'grey-600', variable: '--color-grey-600' },
            { name: 'grey-500', variable: '--color-grey-500' },
            { name: 'grey-400', variable: '--color-grey-400' },
            { name: 'grey-300', variable: '--color-grey-300' },
            { name: 'grey-200', variable: '--color-grey-200' },
            { name: 'grey-100', variable: '--color-grey-100' },
            { name: 'grey-50', variable: '--color-grey-50' },
            { name: 'white', variable: '--color-white' },
          ]}
        />

        <SectionDivider />

        <ColorGroup
          title='Feedback System'
          description='Semantic colors for communicating status and user feedback with clarity and accessibility'
          badge='4 families'
          columns={4}
          colors={[
            { name: 'info', variable: '--color-fbk-info', description: 'Base info' },
            { name: 'info-subtle', variable: '--color-fbk-info-subtle', description: 'Lighter variant' },
            { name: 'info-surface-light', variable: '--color-fbk-info-surface-light', description: 'Light theme bg' },
            { name: 'info-surface-dark', variable: '--color-fbk-info-surface-dark', description: 'Dark theme bg' },
            { name: 'warn', variable: '--color-fbk-warn', description: 'Base warning' },
            { name: 'warn-subtle', variable: '--color-fbk-warn-subtle', description: 'Lighter variant' },
            { name: 'warn-surface-light', variable: '--color-fbk-warn-surface-light', description: 'Light theme bg' },
            { name: 'warn-surface-dark', variable: '--color-fbk-warn-surface-dark', description: 'Dark theme bg' },
            { name: 'success', variable: '--color-fbk-success', description: 'Base success' },
            { name: 'success-subtle', variable: '--color-fbk-success-subtle', description: 'Lighter variant' },
            {
              name: 'success-surface-light',
              variable: '--color-fbk-success-surface-light',
              description: 'Light theme bg',
            },
            {
              name: 'success-surface-dark',
              variable: '--color-fbk-success-surface-dark',
              description: 'Dark theme bg',
            },
            { name: 'danger', variable: '--color-fbk-danger', description: 'Base danger' },
            { name: 'danger-subtle', variable: '--color-fbk-danger-subtle', description: 'Lighter variant' },
            {
              name: 'danger-surface-light',
              variable: '--color-fbk-danger-surface-light',
              description: 'Light theme bg',
            },
            { name: 'danger-surface-dark', variable: '--color-fbk-danger-surface-dark', description: 'Dark theme bg' },
          ]}
        />

        <SectionDivider />

        <ColorGroup
          title='Accent Colors'
          description='Special purpose colors for unique interface elements'
          columns={3}
          colors={[
            { name: 'purple', variable: '--color-purple', description: 'For visited links' },
            { name: 'purple-subtle', variable: '--color-purple-subtle', description: 'Lighter variant' },
            { name: 'juke', variable: '--color-juke', description: 'Accent color' },
            { name: 'blue', variable: '--color-blue', description: 'Select accent' },
            { name: 'blue-subtle', variable: '--color-blue-subtle', description: 'Lighter variant' },
          ]}
        />
      </div>
    </div>
  ),
};

export const SemanticColors: Story = {
  render: () => (
    <div className='min-h-screen bg-surface-neutral p-8 md:p-12'>
      <div className='mx-auto max-w-7xl'>
        <PageHeader
          title='Semantic Tokens'
          subtitle='Theme-aware color tokens that intelligently adapt between light and dark modes. Use these for consistent, accessible theming across your application.'
        />

        <ColorGroup
          title='Text & Elements'
          description='Primary color tokens for text content and interactive elements'
          badge='Theme-aware'
          columns={3}
          colors={[
            { name: 'main', variable: '--color-main', description: 'Primary text' },
            { name: 'main-hover', variable: '--color-main-hover', description: 'Clickable text (links)' },
            { name: 'subtle', variable: '--color-subtle', description: 'Secondary text' },
            { name: 'alt', variable: '--color-alt', description: 'Locked, never changes' },
            { name: 'rev', variable: '--color-rev', description: 'Reversed version' },
            { name: 'alt-rev', variable: '--color-alt-rev', description: 'Locked reversed' },
            { name: 'muted', variable: '--color-muted', description: 'Non-interactive elements' },
          ]}
        />

        <SectionDivider />

        <ColorGroup
          title='Feedback Tokens'
          description='Semantic feedback colors with automatic theme adaptation'
          badge='Theme-aware'
          columns={4}
          colors={[
            { name: 'info', variable: '--color-info', description: 'Info text/icons' },
            { name: 'info-rev', variable: '--color-info-rev', description: 'On info backgrounds' },
            { name: 'warn', variable: '--color-warn', description: 'Warning text/icons' },
            { name: 'warn-rev', variable: '--color-warn-rev', description: 'On warn backgrounds' },
            { name: 'success', variable: '--color-success', description: 'Success text/icons' },
            { name: 'success-rev', variable: '--color-success-rev', description: 'On success backgrounds' },
            { name: 'error', variable: '--color-error', description: 'Error text/icons' },
            { name: 'error-rev', variable: '--color-error-rev', description: 'On error backgrounds' },
          ]}
        />

        <SectionDivider />

        <ColorGroup
          title='Surface System'
          description='Layered background colors that create depth and visual hierarchy through elevation'
          badge='Elevation'
          columns={4}
          colors={[
            { name: 'surface-neutral', variable: '--color-surface-neutral', description: 'Base level' },
            { name: 'surface-neutral-hover', variable: '--color-surface-neutral-hover', description: 'Neutral hover' },
            { name: 'surface-selected', variable: '--color-surface-selected', description: 'Selected items' },
            {
              name: 'surface-selected-hover',
              variable: '--color-surface-selected-hover',
              description: 'Selected hover',
            },
            { name: 'surface-primary', variable: '--color-surface-primary', description: 'Elevation 1' },
            { name: 'surface-secondary', variable: '--color-surface-secondary', description: 'Elevation 2' },
            { name: 'surface-tertiary', variable: '--color-surface-tertiary', description: 'Elevation 3' },
            { name: 'surface-shimmer', variable: '--color-surface-shimmer', description: 'Processing glaze' },
            { name: 'surface-info', variable: '--color-surface-info', description: 'Info background' },
            { name: 'surface-warn', variable: '--color-surface-warn', description: 'Warning background' },
            { name: 'surface-success', variable: '--color-surface-success', description: 'Success background' },
            { name: 'surface-error', variable: '--color-surface-error', description: 'Error background' },
            { name: 'surface-muted', variable: '--color-surface-muted', description: 'Inactive background' },
          ]}
        />

        <SectionDivider />

        <div className='grid gap-12 lg:grid-cols-2'>
          <ColorGroup
            title='Borders'
            description='Subtle to strong border emphasis'
            columns={2}
            colors={[
              { name: 'bdr-subtle', variable: '--color-bdr-subtle', description: 'Low emphasis' },
              { name: 'bdr-soft', variable: '--color-bdr-soft', description: 'Medium emphasis' },
              { name: 'bdr-strong', variable: '--color-bdr-strong', description: 'High emphasis' },
              { name: 'bdr-select', variable: '--color-bdr-select', description: 'Select accent' },
            ]}
          />

          <ColorGroup
            title='Focus Indicators'
            description='Accessible focus ring system'
            columns={2}
            colors={[
              { name: 'ring', variable: '--color-ring', description: 'Focus ring color' },
              { name: 'ring-offset', variable: '--color-ring-offset', description: 'Matches element background' },
            ]}
          />
        </div>
      </div>
    </div>
  ),
};

export const ComponentColors: Story = {
  render: () => (
    <div className='min-h-screen bg-surface-neutral p-8 md:p-12'>
      <div className='mx-auto max-w-7xl'>
        <PageHeader
          title='Component Tokens'
          subtitle='Component-specific color tokens optimized for particular UI patterns and interactions.'
        />

        <ColorGroup
          title='Button System'
          description='Comprehensive button variant colors mapped to specific interaction states'
          badge='11 tokens'
          columns={4}
          colors={[
            { name: 'btn-primary', variable: '--color-btn-primary', description: 'Text/Outline variants' },
            { name: 'btn-primary-hover', variable: '--color-btn-primary-hover', description: 'Text/Outline hover' },
            { name: 'btn-secondary', variable: '--color-btn-secondary', description: 'Filled variant' },
            { name: 'btn-secondary-hover', variable: '--color-btn-secondary-hover', description: 'Filled hover' },
            { name: 'btn-tertiary', variable: '--color-btn-tertiary', description: 'Solid variant' },
            { name: 'btn-tertiary-hover', variable: '--color-btn-tertiary-hover', description: 'Solid hover' },
            { name: 'btn-active', variable: '--color-btn-active', description: 'Toggle/trigger pressed' },
            { name: 'btn-active-hover', variable: '--color-btn-active-hover', description: 'Toggle hover' },
            { name: 'btn-error', variable: '--color-btn-error', description: 'Error actions' },
            { name: 'btn-error-hover', variable: '--color-btn-error-hover', description: 'Error hover' },
            { name: 'btn-error-active', variable: '--color-btn-error-active', description: 'Error pressed' },
          ]}
        />

        <SectionDivider />

        <div className='grid gap-12 lg:grid-cols-2'>
          <ColorGroup
            title='Form Controls'
            description='Input and form element states'
            columns={1}
            colors={[{ name: 'input-disabled', variable: '--color-input-disabled', description: 'Disabled state' }]}
          />

          <ColorGroup
            title='Links'
            description='Hyperlink state colors'
            columns={1}
            colors={[{ name: 'link-visited', variable: '--color-link-visited', description: 'Visited state' }]}
          />
        </div>

        <SectionDivider />

        <ColorGroup
          title='Tooltips'
          description='Tooltip color system'
          columns={2}
          colors={[
            { name: 'tooltip', variable: '--color-tooltip', description: 'Background' },
            { name: 'tooltip-foreground', variable: '--color-tooltip-foreground', description: 'Text' },
          ]}
        />

        <SectionDivider />

        <ColorGroup
          title='Avatars'
          description='Avatar color system'
          columns={2}
          colors={[
            { name: 'avatar-fallback', variable: '--color-avatar-fallback', description: 'Fallback background' },
          ]}
        />

        <SectionDivider />

        <ColorGroup
          title='Overlay & Effects'
          description='Modal overlays and special visual effects'
          columns={2}
          colors={[
            { name: 'overlay', variable: '--color-overlay', description: 'Modal backdrop' },
            { name: 'docs', variable: '--color-docs', description: 'Not used yet' },
          ]}
        />
      </div>
    </div>
  ),
};
