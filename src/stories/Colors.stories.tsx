import { BadgeInfo, Check, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/preact-vite';
import type { ReactElement } from 'react';

import {
  contrastRatio,
  isOpaque,
  parseColor,
  passesAA,
  passesAAA,
  passesNonText,
  type ResolvedColor,
  type Rgb,
} from './contrast';

export default {
  title: 'Design/Colors',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    a11y: {
      // The swatches and contrast cells render deliberately low-contrast sample
      // text purely to illustrate token legibility. Exclude them so axe-core
      // audits the real page chrome instead of flagging the demonstrations.
      context: { exclude: [['[data-a11y-demo]']] },
    },
  },
} satisfies Meta;

type Story = StoryObj;

//
// * Contrast Hooks & Badges
//

// Resolve the rendered color of the element the returned callback ref is attached
// to. A callback ref (not an object ref) guarantees the node is captured on attach —
// object refs read inside a layout effect can be null depending on the surrounding
// tree under preact/compat. Re-reads whenever the theme class on <html> changes.
const useResolvedColor = (
  property: 'backgroundColor' | 'color',
): [(node: HTMLElement | null) => void, ResolvedColor | undefined] => {
  const nodeRef = useRef<HTMLElement | null>(null);
  const [color, setColor] = useState<ResolvedColor>();

  const read = useCallback(() => {
    if (nodeRef.current) setColor(parseColor(getComputedStyle(nodeRef.current)[property]));
  }, [property]);

  useEffect(() => {
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [read]);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      nodeRef.current = node;
      read();
    },
    [read],
  );

  return [ref, color];
};

// The text tokens a swatch is measured against, resolved from the live theme so
// values track the toolbar. `main`/`rev` are the standard text color and its
// reverse; `surfaceNeutral` is the page background a foreground token sits on.
type ThemeColors = { main: Rgb; rev: Rgb; surfaceNeutral: Rgb };

const useThemeColors = (): ThemeColors | undefined => {
  const [colors, setColors] = useState<ThemeColors>();
  useEffect(() => {
    const read = (): void => {
      const cs = getComputedStyle(document.documentElement);
      const main = parseColor(cs.getPropertyValue('--color-main'));
      const rev = parseColor(cs.getPropertyValue('--color-rev'));
      const surfaceNeutral = parseColor(cs.getPropertyValue('--color-surface-neutral'));
      if (main && rev && surfaceNeutral) {
        setColors({ main: main.rgb, rev: rev.rgb, surfaceNeutral: surfaceNeutral.rgb });
      }
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return colors;
};

// How a token is used determines which contrast question is meaningful:
// - surface:    text sits ON this fill        → best of main/rev text, AA/AAA
// - foreground: this IS text on the page      → token vs surface-neutral, AA/AAA
// - non-text:   borders, focus rings, etc.    → token vs surface-neutral, WCAG 1.4.11 (3:1)
// - disabled:   disabled-state tokens         → ratio shown, but WCAG-exempt (no pass/fail)
// - none:       inverse/paired/translucent tokens best judged in the Contrast matrix
type SwatchRole = 'surface' | 'foreground' | 'non-text' | 'disabled' | 'none';

const ComplianceChip = ({ label, pass }: { label: string; pass: boolean }): ReactElement => (
  <span
    data-pass={pass}
    className='data-[pass=false]:border-error/30 data-[pass=true]:border-success/30 data-[pass=false]:text-error data-[pass=true]:text-success inline-flex items-center gap-0.5 rounded border px-1 py-px font-mono text-[9px] font-semibold tracking-wide uppercase'
  >
    {label}
    {pass ? <Check className='size-2.5' /> : <X className='size-2.5' />}
  </span>
);
ComplianceChip.displayName = 'ComplianceChip';

type BadgeMode = 'text' | 'non-text' | 'exempt';

type ContrastBadgeProps = { ratio: number; mode?: BadgeMode; tag?: string; title?: string };

const badgeChips = (ratio: number, mode: BadgeMode): ReactElement => {
  if (mode === 'non-text') return <ComplianceChip label='UI 3:1' pass={passesNonText(ratio)} />;
  if (mode === 'exempt') {
    return (
      <span className='border-bdr-soft text-subtle inline-flex items-center rounded border px-1 py-px font-mono text-[9px] font-semibold tracking-wide uppercase'>
        exempt
      </span>
    );
  }
  return (
    <>
      <ComplianceChip label='AA' pass={passesAA(ratio)} />
      <ComplianceChip label='AAA' pass={passesAAA(ratio)} />
    </>
  );
};

const ContrastBadge = ({ ratio, mode = 'text', tag, title }: ContrastBadgeProps): ReactElement => (
  <div className='mt-0.5 flex items-center gap-1.5' title={title}>
    {tag && <span className='text-subtle font-mono text-[9px] tracking-wider uppercase'>{tag}</span>}
    <span className='text-subtle font-mono text-[10px] tabular-nums'>{ratio.toFixed(2)}:1</span>
    {badgeChips(ratio, mode)}
  </div>
);
ContrastBadge.displayName = 'ContrastBadge';

//
// * Swatches
//

type ColorSwatchProps = {
  name: string;
  variable: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  usage?: SwatchRole;
};

// Resolve the right contrast question for a token's role. Returns the ratio, the
// badge mode (text AA/AAA vs non-text 3:1) and a short tag explaining what's measured.
const swatchContrast = (
  role: SwatchRole,
  fill: Rgb,
  theme: ThemeColors,
): { ratio: number; mode: BadgeMode; tag: string; title: string } | undefined => {
  if (role === 'surface') {
    const ratio = Math.max(contrastRatio(fill, theme.main), contrastRatio(fill, theme.rev));
    return { ratio, mode: 'text', tag: 'on fill', title: 'Best contrast for main/rev text placed on this fill' };
  }
  if (role === 'foreground') {
    return {
      ratio: contrastRatio(fill, theme.surfaceNeutral),
      mode: 'text',
      tag: 'as text',
      title: 'Contrast of this token used as text on surface-neutral',
    };
  }
  if (role === 'non-text') {
    return {
      ratio: contrastRatio(fill, theme.surfaceNeutral),
      mode: 'non-text',
      tag: 'vs bg',
      title: 'WCAG 1.4.11 non-text contrast against surface-neutral (3:1)',
    };
  }
  if (role === 'disabled') {
    return {
      ratio: contrastRatio(fill, theme.surfaceNeutral),
      mode: 'exempt',
      tag: 'disabled',
      title: 'Disabled-state token — exempt from WCAG contrast (1.4.3 / 1.4.11). Ratio shown for reference.',
    };
  }
  return undefined;
};

const ColorSwatch = ({
  name,
  variable,
  description,
  size = 'md',
  usage = 'surface',
}: ColorSwatchProps): ReactElement => {
  const [blockRef, resolved] = useResolvedColor('backgroundColor');
  const theme = useThemeColors();
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

  // Translucent tokens (overlays) have no fixed contrast, so skip them entirely.
  const opaque = resolved != null && isOpaque(resolved);
  const badge = opaque && theme ? swatchContrast(usage, resolved.rgb, theme) : undefined;

  return (
    <button
      type='button'
      onClick={handleClick}
      className='group border-bdr-soft bg-surface-neutral hover:border-bdr-strong focus-visible:ring-ring focus-visible:ring-offset-ring-offset relative flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-offset-3 focus-visible:outline-none'
      title={`Click to copy: ${name}`}
    >
      <div
        ref={blockRef}
        className={`relative w-full ${sizeClasses[size]}`}
        style={{ backgroundColor: `var(${variable})` }}
      >
        {usage === 'surface' && badge && (
          <div
            data-a11y-demo
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 flex items-center justify-end gap-3 pe-3 text-lg font-semibold'
          >
            <span style={{ color: 'var(--color-main)' }}>Aa</span>
            <span style={{ color: 'var(--color-rev)' }}>Aa</span>
          </div>
        )}
      </div>
      <div className='flex flex-col gap-1 p-3'>
        <div className='text-main font-mono text-sm font-bold tracking-tight'>{name}</div>
        {description && <div className='text-subtle text-xs leading-tight'>{description}</div>}
        <div className='text-subtle font-mono text-[10px] tracking-wider uppercase'>{variable}</div>
        {badge && <ContrastBadge ratio={badge.ratio} mode={badge.mode} tag={badge.tag} title={badge.title} />}
      </div>
      {copied && (
        <div className='fade-in slide-in-from-top-1 animate-in bg-surface-success text-success absolute top-2 right-2 rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide shadow-lg'>
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
  colors: { name: string; variable: string; description?: string; usage?: SwatchRole }[];
  size?: 'sm' | 'md' | 'lg';
  usage?: SwatchRole;
};

const ColorGroup = ({
  title,
  description,
  badge,
  colors,
  size = 'md',
  usage = 'surface',
}: ColorGroupProps): ReactElement => {
  return (
    <section className='mb-12'>
      <div className='mb-5 flex items-start justify-between gap-4'>
        <div className='flex-1'>
          <div className='mb-2 flex items-center gap-3'>
            <h2 className='text-main text-2xl font-bold tracking-tight'>{title}</h2>
            {badge && (
              <span className='border-bdr-soft bg-surface-primary text-subtle rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wider uppercase'>
                {badge}
              </span>
            )}
          </div>
          {description && <p className='text-subtle max-w-2xl text-sm leading-relaxed'>{description}</p>}
        </div>
      </div>
      {/* Auto-fill keeps every swatch ≥ 240px so the contrast badge fits, and leaves
          empty tracks (lone swatches stay one column wide rather than stretching full width). */}
      <div className='grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4'>
        {colors.map(({ usage: colorUsage, ...color }) => (
          <ColorSwatch key={color.variable} {...color} size={size} usage={colorUsage ?? usage} />
        ))}
      </div>
    </section>
  );
};

//
// * Contrast Matrix
//

type Token = { name: string; variable: string };
type Pairing = { fg: Token; bg: Token; usage: string; large?: boolean };
type PairingGroup = { title: string; description: string; pairs: Pairing[] };

const pair = (fg: [string, string], bg: [string, string], usage: string, large = false): Pairing => ({
  fg: { name: fg[0], variable: fg[1] },
  bg: { name: bg[0], variable: bg[1] },
  usage,
  large,
});

// Pairings mirror how the tokens are actually combined in the components, not
// every theoretical mix — so the ratios reflect real, shipped UI.
const PAIRING_GROUPS: PairingGroup[] = [
  {
    title: 'Body Text on Surfaces',
    description: 'The everyday reading pairs — body copy and links over neutral and elevated backgrounds.',
    pairs: [
      pair(['main', '--color-main'], ['surface-neutral', '--color-surface-neutral'], 'Primary body text'),
      pair(['subtle', '--color-subtle'], ['surface-neutral', '--color-surface-neutral'], 'Secondary text'),
      pair(['main', '--color-main'], ['surface-primary', '--color-surface-primary'], 'Text on elevated panels'),
      pair(['main-hover', '--color-main-hover'], ['surface-neutral', '--color-surface-neutral'], 'Hovered / link text'),
      pair(['link-visited', '--color-link-visited'], ['surface-neutral', '--color-surface-neutral'], 'Visited links'),
    ],
  },
  {
    title: 'Inline Feedback Text',
    description: 'Status text and icons rendered directly on the page surface (the dominant feedback usage).',
    pairs: [
      pair(['info', '--color-info'], ['surface-neutral', '--color-surface-neutral'], 'Info text / icon'),
      pair(['warn', '--color-warn'], ['surface-neutral', '--color-surface-neutral'], 'Warning text / icon'),
      pair(['success', '--color-success'], ['surface-neutral', '--color-surface-neutral'], 'Success text / icon'),
      pair(['error', '--color-error'], ['surface-neutral', '--color-surface-neutral'], 'Error text / icon'),
    ],
  },
  {
    title: 'Feedback on Tinted Surfaces',
    description: 'Callouts and banners: feedback text over its matching subtle surface tint.',
    pairs: [
      pair(['info', '--color-info'], ['surface-info', '--color-surface-info'], 'Info callout'),
      pair(['warn', '--color-warn'], ['surface-warn', '--color-surface-warn'], 'Warning callout'),
      pair(['success', '--color-success'], ['surface-success', '--color-surface-success'], 'Success callout'),
      pair(['error', '--color-error'], ['surface-error', '--color-surface-error'], 'Error callout'),
    ],
  },
  {
    title: 'Inverse & Active States',
    description: 'White (alt) or reversed text over saturated fills and active highlights.',
    pairs: [
      pair(['alt', '--color-alt'], ['info', '--color-info'], 'Solid info fill'),
      pair(['alt', '--color-alt'], ['success', '--color-success'], 'Solid success fill'),
      pair(['alt', '--color-alt'], ['error', '--color-error'], 'Destructive button / tooltip'),
      pair(['alt', '--color-alt'], ['btn-active', '--color-btn-active'], 'Active menu / list item'),
      pair(['error-rev', '--color-error-rev'], ['btn-active', '--color-btn-active'], 'Active error item (light theme)'),
      pair(['rev', '--color-rev'], ['main', '--color-main'], 'Link focus state'),
    ],
  },
  {
    title: 'Component Pairings',
    description: 'Tokens that ship pre-paired inside a specific component.',
    pairs: [
      pair(['tooltip-foreground', '--color-tooltip-foreground'], ['tooltip', '--color-tooltip'], 'Tooltip text'),
      pair(['alt', '--color-alt'], ['avatar-fallback', '--color-avatar-fallback'], 'Avatar initials'),
    ],
  },
];

const ContrastRow = ({ entry }: { entry: Pairing }): ReactElement => {
  const [bgRef, bg] = useResolvedColor('backgroundColor');
  const [fgRef, fg] = useResolvedColor('color');
  const ratio = bg != null && fg != null ? contrastRatio(fg.rgb, bg.rgb) : undefined;

  return (
    <tr className='border-bdr-subtle border-b last:border-0'>
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <td className='py-3 pe-4'>
        <div
          ref={bgRef}
          data-a11y-demo
          className='border-bdr-soft flex h-12 w-28 items-center justify-center rounded-md border'
          style={{ backgroundColor: `var(${entry.bg.variable})` }}
        >
          <span ref={fgRef} className='text-sm font-semibold' style={{ color: `var(${entry.fg.variable})` }}>
            Aa Bb Cc
          </span>
        </div>
      </td>
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <td className='py-3 pe-4 align-middle'>
        <div className='flex flex-col gap-0.5 font-mono text-xs'>
          <span className='text-main'>{entry.fg.name}</span>
          <span className='text-subtle'>on {entry.bg.name}</span>
        </div>
      </td>
      <td className='text-subtle py-3 pe-4 align-middle text-xs'>{entry.usage}</td>
      <td className='text-main py-3 pe-4 text-right align-middle font-mono text-sm tabular-nums'>
        {ratio != null ? `${ratio.toFixed(2)}:1` : '—'}
      </td>
      <td className='py-3 align-middle'>
        {ratio != null && (
          <div className='flex items-center gap-1.5'>
            <ComplianceChip label={entry.large ? 'AA Lg' : 'AA'} pass={passesAA(ratio, entry.large)} />
            <ComplianceChip label='AAA' pass={passesAAA(ratio, entry.large)} />
          </div>
        )}
      </td>
    </tr>
  );
};
ContrastRow.displayName = 'ContrastRow';

const ContrastMatrix = ({ title, description, pairs }: PairingGroup): ReactElement => (
  <section className='mb-12'>
    <div className='mb-5'>
      <h2 className='text-main text-2xl font-bold tracking-tight'>{title}</h2>
      <p className='text-subtle mt-2 max-w-2xl text-sm leading-relaxed'>{description}</p>
    </div>
    <div className='border-bdr-soft bg-surface-neutral overflow-x-auto rounded-lg border'>
      <table className='w-full border-collapse px-4 text-left'>
        <thead>
          <tr className='border-bdr-soft text-subtle border-b text-xs tracking-wider uppercase'>
            <th scope='col' className='py-2 ps-4 pe-4 font-semibold'>
              Preview
            </th>
            <th scope='col' className='py-2 pe-4 font-semibold'>
              Pairing
            </th>
            <th scope='col' className='py-2 pe-4 font-semibold'>
              Usage
            </th>
            <th scope='col' className='py-2 pe-4 text-right font-semibold'>
              Ratio
            </th>
            <th scope='col' className='py-2 pe-4 font-semibold'>
              WCAG
            </th>
          </tr>
        </thead>
        <tbody className='[&_td:first-child]:ps-4 [&_td:last-child]:pe-4'>
          {pairs.map(entry => (
            <ContrastRow key={`${entry.fg.variable}-${entry.bg.variable}`} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
ContrastMatrix.displayName = 'ContrastMatrix';

//
// * Layout
//

const SectionDivider = (): ReactElement => (
  <div className='my-16 flex items-center gap-4'>
    <div className='via-bdr-soft h-px flex-1 bg-linear-to-r from-transparent to-transparent' />
  </div>
);

const PageHeader = ({ title, subtitle, note }: { title: string; subtitle: string; note?: string }): ReactElement => (
  <header className='border-bdr-soft mb-12 border-b pb-8'>
    <div className='mb-6 flex items-start justify-between gap-8'>
      <div className='flex-1'>
        <h1 className='text-main mb-3 text-5xl font-bold tracking-tight'>{title}</h1>
        <p className='text-subtle max-w-3xl text-lg leading-relaxed'>{subtitle}</p>
      </div>
      <div className='border-bdr-soft bg-surface-primary flex items-center gap-2 rounded-full border px-4 py-2'>
        <div className='bg-success size-2 animate-pulse rounded-full' />
        <span className='text-subtle text-xs font-semibold tracking-wider uppercase'>Interactive</span>
      </div>
    </div>
    {note && (
      <div className='bg-surface-primary relative overflow-hidden rounded-lg p-5'>
        <div className='bg-info/10 absolute top-0 right-0 size-32 translate-x-16 -translate-y-16 rounded-full' />
        <div className='relative flex gap-3'>
          <BadgeInfo className='text-info size-6 shrink-0' />
          <div>
            <div className='text-main mb-1 text-sm font-bold tracking-wider uppercase'>Important Note</div>
            <p className='text-subtle text-sm leading-relaxed'>{note}</p>
          </div>
        </div>
      </div>
    )}
  </header>
);

export const BasicPalette: Story = {
  render: () => (
    <div className='bg-surface-neutral min-h-screen p-8 md:p-12'>
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
    <div className='bg-surface-neutral min-h-screen p-8 md:p-12'>
      <div className='mx-auto max-w-7xl'>
        <PageHeader
          title='Semantic Tokens'
          subtitle='Theme-aware color tokens that intelligently adapt between light and dark modes. Use these for consistent, accessible theming across your application.'
          note='Each contrast badge reflects how the token is used: surface fills show the best contrast for main/rev text placed on them (“on fill”); text tokens show their contrast as text on surface-neutral (“as text”); borders and focus rings use WCAG 1.4.11 non-text contrast (“vs bg”, 3:1); disabled-state tokens show the ratio but are WCAG-exempt (“exempt”). Inverse text, paired text (e.g. tooltip), and translucent tokens carry no badge — audited in the Contrast & Accessibility story instead.'
        />

        <ColorGroup
          title='Text & Elements'
          description='Primary color tokens for text content and interactive elements'
          badge='Theme-aware'
          usage='foreground'
          colors={[
            { name: 'main', variable: '--color-main', description: 'Primary text' },
            { name: 'main-hover', variable: '--color-main-hover', description: 'Clickable text (links)' },
            { name: 'subtle', variable: '--color-subtle', description: 'Secondary text' },
            // Inverse tokens — meant for dark/inverse surfaces, audited in the Contrast matrix.
            { name: 'alt', variable: '--color-alt', description: 'Locked, never changes', usage: 'none' },
            { name: 'rev', variable: '--color-rev', description: 'Reversed version', usage: 'none' },
            { name: 'alt-rev', variable: '--color-alt-rev', description: 'Locked reversed', usage: 'none' },
            { name: 'muted', variable: '--color-muted', description: 'Non-interactive elements', usage: 'disabled' },
          ]}
        />

        <SectionDivider />

        <ColorGroup
          title='Feedback Tokens'
          description='Semantic feedback colors with automatic theme adaptation'
          badge='Theme-aware'
          usage='foreground'
          colors={[
            { name: 'info', variable: '--color-info', description: 'Info text/icons' },
            { name: 'info-rev', variable: '--color-info-rev', description: 'On info backgrounds', usage: 'none' },
            { name: 'warn', variable: '--color-warn', description: 'Warning text/icons' },
            { name: 'warn-rev', variable: '--color-warn-rev', description: 'On warn backgrounds', usage: 'none' },
            { name: 'success', variable: '--color-success', description: 'Success text/icons' },
            {
              name: 'success-rev',
              variable: '--color-success-rev',
              description: 'On success backgrounds',
              usage: 'none',
            },
            { name: 'error', variable: '--color-error', description: 'Error text/icons' },
            { name: 'error-rev', variable: '--color-error-rev', description: 'On error backgrounds', usage: 'none' },
          ]}
        />

        <SectionDivider />

        <ColorGroup
          title='Surface System'
          description='Layered background colors that create depth and visual hierarchy through elevation'
          badge='Elevation'
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
            usage='non-text'
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
            usage='non-text'
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
    <div className='bg-surface-neutral min-h-screen p-8 md:p-12'>
      <div className='mx-auto max-w-7xl'>
        <PageHeader
          title='Component Tokens'
          subtitle='Component-specific color tokens optimized for particular UI patterns and interactions.'
          note='Each contrast badge reflects how the token is used: surface fills show the best contrast for main/rev text placed on them (“on fill”); text tokens show their contrast as text on surface-neutral (“as text”); borders and focus rings use WCAG 1.4.11 non-text contrast (“vs bg”, 3:1); disabled-state tokens show the ratio but are WCAG-exempt (“exempt”). Inverse text, paired text (e.g. tooltip), and translucent tokens carry no badge — audited in the Contrast & Accessibility story instead.'
        />

        <ColorGroup
          title='Button System'
          description='Comprehensive button variant colors mapped to specific interaction states'
          badge='11 tokens'
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

        <ColorGroup
          title='Links'
          description='Hyperlink state colors'
          usage='foreground'
          colors={[{ name: 'link-visited', variable: '--color-link-visited', description: 'Visited state' }]}
        />

        <SectionDivider />

        <ColorGroup
          title='Tooltips'
          description='Tooltip color system'
          colors={[
            { name: 'tooltip', variable: '--color-tooltip', description: 'Background' },
            // Paired text — its real background is --color-tooltip, audited in the matrix.
            {
              name: 'tooltip-foreground',
              variable: '--color-tooltip-foreground',
              description: 'Text',
              usage: 'none',
            },
          ]}
        />

        <SectionDivider />

        <ColorGroup
          title='Avatars'
          description='Avatar color system'
          colors={[
            { name: 'avatar-fallback', variable: '--color-avatar-fallback', description: 'Fallback background' },
          ]}
        />

        <SectionDivider />

        <ColorGroup
          title='Overlay & Effects'
          description='Modal overlays and special visual effects'
          colors={[
            { name: 'overlay', variable: '--color-overlay', description: 'Modal backdrop' },
            { name: 'docs', variable: '--color-docs', description: 'Not used yet' },
          ]}
        />
      </div>
    </div>
  ),
};

export const ContrastAudit: Story = {
  name: 'Contrast & Accessibility',
  render: () => (
    <div className='bg-surface-neutral min-h-screen p-8 md:p-12'>
      <div className='mx-auto max-w-7xl'>
        <PageHeader
          title='Contrast & Accessibility'
          subtitle="Live WCAG 2.x contrast ratios for the design system's real foreground/background pairings, computed from the resolved token values. Toggle the theme toolbar to audit light and dark independently."
          note='Ratios use normal-size text thresholds (AA ≥ 4.5:1, AAA ≥ 7:1) unless marked “AA Lg” for large text or UI components (AA ≥ 3:1). The a11y panel (axe-core) audits the surrounding page; these preview cells are excluded because they intentionally demonstrate every pairing, including ones that fall short.'
        />

        {PAIRING_GROUPS.map(group => (
          <ContrastMatrix key={group.title} {...group} />
        ))}
      </div>
    </div>
  ),
};
