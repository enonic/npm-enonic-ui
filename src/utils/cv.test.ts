import { cva, type VariantProps } from 'class-variance-authority';
import { describe, expect, expectTypeOf, it, vi } from 'vite-plus/test';

import type { ButtonVariantsProps } from '@/components/button';

import { cv, type CvProps } from './cv';

type LooseVariants = (props?: Record<string, unknown>) => string;
type LooseFactory = (base?: unknown, config?: unknown) => LooseVariants;

const recorded = vi.hoisted(() => [] as { base: unknown; config: unknown }[]);

// Records every definition the components create at module load, for the parity run below.
vi.mock('./cv', async importOriginal => {
  const actual = await importOriginal<typeof import('./cv')>();
  const recordingCv = (base?: unknown, config?: unknown): LooseVariants => {
    recorded.push({ base, config });
    return (actual.cv as LooseFactory)(base, config);
  };
  return { ...actual, cv: recordingCv };
});

const realCv = (await vi.importActual<typeof import('./cv')>('./cv')).cv as LooseFactory;
const realCva = cva as LooseFactory;

const CALL_CLASSES: Record<string, unknown>[] = [
  {},
  { class: 'px-9 text-red-500' },
  { className: 'h-1 bg-black' },
  { class: ['p-0', { 'rounded-none': true, hidden: false }] },
  { className: ['m-1', ['m-2', null, undefined, false, 0]] },
];

const expectParity = (base: unknown, config: unknown, calls: (Record<string, unknown> | undefined)[]): void => {
  const fromCv = realCv(base, config);
  const fromCva = realCva(base, config);
  for (const props of calls) {
    expect(fromCv(props), JSON.stringify(props)).toBe(fromCva(props));
  }
};

const OMITTED = Symbol('omitted');

// Explicit `undefined` differs from an omitted key: components forward destructured props.
const selections = (config: unknown): Record<string, unknown>[] => {
  const variants = (config as { variants?: Record<string, Record<string, unknown>> } | undefined)?.variants ?? {};
  let result: Record<string, unknown>[] = [{}];
  for (const [name, options] of Object.entries(variants)) {
    const values = [
      OMITTED,
      undefined,
      null,
      ...Object.keys(options).map(key => (key === 'true' ? true : key === 'false' ? false : key)),
    ];
    result = result.flatMap(selection =>
      values.map(value => (value === OMITTED ? selection : { ...selection, [name]: value })),
    );
  }
  return result;
};

// A `cv(` that only runs lazily (inside a hook or function) still counts: it would escape the
// parity run, so the count check is meant to fail on it.
const stripComments = (source: string): string => source.replace(/\/\*[\s\S]*?\*\/|(^|[^:])\/\/.*$/gm, '$1');

const withCallClasses = (config: unknown): Record<string, unknown>[] =>
  selections(config).flatMap(selection => CALL_CLASSES.map(call => ({ ...selection, ...call })));

describe('cv matches cva 0.7.1', () => {
  it('joins the base without a config', () => {
    expectParity('a b', undefined, [undefined, {}, { class: 'c' }, { className: ['d', { e: true }] }]);
    expectParity(['a', ['b', null]], undefined, [undefined, { className: 'c' }]);
    expectParity(undefined, undefined, [undefined, { class: 'c' }]);
  });

  it('ignores compound variants when there are no variants', () => {
    expectParity('a', { compoundVariants: [{ class: 'never' }] }, [undefined, { className: 'b' }]);
  });

  it('resolves variants, defaults and null', () => {
    const config = {
      variants: { size: { sm: 'h-8', md: ['h-10', 'px-4'] }, tone: { main: 'text-main', alt: 'text-alt' } },
      defaultVariants: { size: 'md' },
    };
    expectParity('base', config, [
      undefined,
      {},
      { size: 'sm' },
      { size: null },
      { size: undefined },
      { tone: 'alt' },
      { size: 'sm', tone: null },
      { size: '' },
    ]);
  });

  it('resolves boolean and numeric variant keys', () => {
    const variants = { disabled: { true: 'opacity-30', false: 'cursor-pointer' }, level: { 0: 'z-0', 1: 'z-10' } };
    const calls = [undefined, { disabled: true }, { disabled: false }, { disabled: null }, { level: 0 }, { level: 1 }];
    expectParity('base', { variants, defaultVariants: { disabled: false } }, calls);
    expectParity('base', { variants, defaultVariants: { disabled: true } }, calls);
  });

  it('applies compound variants with class and className as strings or arrays', () => {
    const config = {
      variants: { shape: { circle: 'rounded-full', rect: 'rounded-sm' }, size: { sm: 'size-4', lg: 'size-8' } },
      defaultVariants: { shape: 'rect', size: 'sm' },
      compoundVariants: [
        { shape: 'circle', size: 'sm', class: 'p-1' },
        { shape: 'rect', size: 'lg', className: ['p-2', 'gap-2'] },
        { shape: 'rect', class: 'border', className: 'border-dashed' },
        { size: null, class: 'size-auto' },
      ],
    };
    expectParity('base', config, withCallClasses(config));
  });

  it('resolves variants named class or className from the call props', () => {
    const config = { variants: { className: { compact: 'p-1' }, class: { wide: 'w-full' } } };
    expectParity('base', config, [{ className: 'compact' }, { class: 'wide' }, { className: 'other' }]);
  });

  it('applies compound variants with array matchers', () => {
    const config = {
      variants: { intent: { primary: 'a', secondary: 'b', danger: 'c' }, size: { sm: 'd', lg: 'e' } },
      defaultVariants: { intent: 'primary' },
      compoundVariants: [{ intent: ['primary', 'danger'], size: 'lg', class: 'uppercase' }],
    };
    expectParity('base', config, selections(config));
  });
});

describe('cv matches cva 0.7.1 for every definition in the library', async () => {
  const sources = import.meta.glob<string>(
    ['../**/*.{ts,tsx}', '!../**/*.stories.tsx', '!../**/*.test.ts', '!../**/*.d.ts', '!./cv.ts'],
    { query: '?raw', import: 'default', eager: true },
  );
  const modules = import.meta.glob([
    '../**/*.{ts,tsx}',
    '!../**/*.stories.tsx',
    '!../**/*.test.ts',
    '!../**/*.d.ts',
    '!./cv.ts',
  ]);

  const definitionFiles = Object.entries(sources)
    .map(([path, source]) => ({ path, count: stripComments(source).match(/\bcv\(/g)?.length ?? 0 }))
    .filter(({ count }) => count > 0);
  const definitionCount = definitionFiles.reduce((total, { count }) => total + count, 0);

  const definitions: { label: string; base: unknown; config: unknown }[] = [];
  for (const { path } of definitionFiles) {
    const start = recorded.length;
    await modules[path]?.();
    recorded
      .slice(start)
      .forEach((definition, index) => definitions.push({ label: `${path} #${index + 1}`, ...definition }));
  }

  it('records every cv() call found in the source', () => {
    expect(definitionCount).toBeGreaterThan(0);
    expect(definitions).toHaveLength(definitionCount);
  });

  it.each(definitions)('$label emits identical classes for every variant combination', ({ base, config }) => {
    expectParity(base, config, withCallClasses(config));
  });
});

describe('cv types match cva 0.7.1', () => {
  const viaCv = cv('base', {
    variants: {
      size: { sm: 'h-8', md: 'h-10' },
      disabled: { true: 'opacity-30', false: '' },
      level: { 0: 'z-0', 1: 'z-10' },
    },
    defaultVariants: { size: 'md', disabled: false },
    compoundVariants: [
      { size: 'sm', disabled: true, class: 'p-0' },
      { size: ['sm', 'md'], className: ['gap-1'] },
    ],
  });
  const viaCva = cva('base', {
    variants: {
      size: { sm: 'h-8', md: 'h-10' },
      disabled: { true: 'opacity-30', false: '' },
      level: { 0: 'z-0', 1: 'z-10' },
    },
    defaultVariants: { size: 'md', disabled: false },
    compoundVariants: [
      { size: 'sm', disabled: true, class: 'p-0' },
      { size: ['sm', 'md'], className: ['gap-1'] },
    ],
  });

  it('derives the same props type', () => {
    expectTypeOf<CvProps<typeof viaCv>>().toEqualTypeOf<VariantProps<typeof viaCva>>();
  });

  it('accepts the same call props, including class xor className', () => {
    expectTypeOf<Parameters<typeof viaCv>>().toEqualTypeOf<Parameters<typeof viaCva>>();
  });

  it('keeps the published ButtonVariantsProps unchanged', () => {
    expectTypeOf<ButtonVariantsProps>().toEqualTypeOf<{
      variant?: 'text' | 'filled' | 'solid' | 'outline' | null | undefined;
      size?: 'sm' | 'md' | 'lg' | null | undefined;
    }>();
  });
});
