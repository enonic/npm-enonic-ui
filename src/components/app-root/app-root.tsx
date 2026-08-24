import { useLayoutEffect, useRef, useState } from 'react';

import { PortalProvider, usePortalContainer } from '@/providers';
import { cn } from '@/utils';
import { isShadowRoot } from '@/utils/dom';

import type { ReactElement, ReactNode } from 'react';

// ? Targets the wrapper and the portal layer rather than `:host`: a host-page rule matching the
// host element (`div { font-family: inherit }`) outranks any `:host` declaration and would pull
// the page's typography through the boundary, while an element inside the root is out of the
// page's reach. The `@layer` statement pins the canonical Tailwind layer order from the first
// adopted sheet, so a later sheet introducing `properties` cannot land it after `utilities`.
const BASE_RESET_CSS = `
@layer properties, theme, base, components, utilities;

@layer base {
  [data-component='AppRoot'],
  [data-component='AppRoot.PortalLayer'] {
    font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif);
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    color: var(--color-main);
  }
}
`;

let baseResetSheet: CSSStyleSheet | undefined;

const getBaseResetSheet = (): CSSStyleSheet => {
  if (baseResetSheet == null) {
    baseResetSheet = new CSSStyleSheet();
    baseResetSheet.replaceSync(BASE_RESET_CSS);
  }
  return baseResetSheet;
};

// Shape-checked like `isShadowRoot` — a rule from a sheet constructed in another realm would not
// match this realm's `CSSPropertyRule`.
const isPropertyRule = (rule: CSSRule): rule is CSSPropertyRule => 'initialValue' in rule && 'inherits' in rule;

// ! `initialValue` returns the raw token, not the registered computed value: Tailwind declares
// `--tw-ring-offset-width` as `initial-value: 0` under `syntax: "<length>"`, where registration
// reads 0px — but re-emitted into an unregistered custom property the unitless `0` breaks every
// `calc()` it lands in. Give the zero its unit back for length syntaxes.
const normalizeInitialValue = (rule: CSSPropertyRule): string => {
  const value = rule.initialValue;
  if (value == null || value === '') return 'initial';
  if (value === '0' && rule.syntax.includes('<length')) return '0px';
  return value;
};

const collectPropertyResets = (
  rules: CSSRuleList,
  initials: Map<string, string>,
  fallbacks: Map<string, string>,
  inPropertiesLayer: boolean,
): void => {
  for (const rule of rules) {
    if (isPropertyRule(rule)) {
      if (!rule.inherits) {
        initials.set(rule.name, normalizeInitialValue(rule));
      }
      continue;
    }

    if (inPropertiesLayer && 'selectorText' in rule) {
      const style = (rule as CSSStyleRule).style;
      for (const name of style) {
        if (name.startsWith('--')) {
          fallbacks.set(name, style.getPropertyValue(name));
        }
      }
    }

    if ('cssRules' in rule) {
      const enteredPropertiesLayer =
        inPropertiesLayer || ('name' in rule && (rule as CSSLayerBlockRule).name === 'properties');
      collectPropertyResets((rule as CSSGroupingRule).cssRules, initials, fallbacks, enteredPropertiesLayer);
    }
  }
};

/**
 * An `@property` rule inside a sheet adopted onto a shadow root parses but never registers, so
 * Tailwind's `--tw-*` internals lose their `inherits: false` initial values and every
 * `var(--tw-…)` composition (shadows, rings, gradients) collapses. Re-emit the initial values the
 * way Tailwind does for engines without `@property`: zero-priority declarations on every element
 * in the `properties` layer, which utilities override and inheritance cannot cross. Tailwind's own
 * such fallback already sits in the sheet behind an old-engines-only `@supports` gate, with the
 * values normalized — where present, its declarations win over the raw `initial-value` tokens.
 */
const buildPropertyResetSheet = (sheets: CSSStyleSheet[]): CSSStyleSheet | null => {
  const initials = new Map<string, string>();
  const fallbacks = new Map<string, string>();
  for (const sheet of sheets) {
    collectPropertyResets(sheet.cssRules, initials, fallbacks, false);
  }
  const resets = new Map([...initials, ...fallbacks]);
  if (resets.size === 0) return null;

  const declarations = Array.from(resets, ([name, value]) => `${name}: ${value};`).join(' ');
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`@layer properties { *, ::before, ::after, ::backdrop { ${declarations} } }`);
  return sheet;
};

export type AppRootProps = {
  /**
   * Theme for the subtree. `'dark'` adds the class to the wrapper and mirrors it onto the portal
   * layer. `'light'` emits nothing: the adopted sheet declares the light tokens on `:host`, so a
   * shadow root is already light until something inside it says otherwise. That also means
   * `'light'` cannot override a `dark` class an embedder set on the shadow host itself —
   * `:host(.dark)` outranks the `:host` defaults.
   */
  theme?: 'light' | 'dark';
  /**
   * Constructed stylesheets to adopt into the surrounding shadow root. On Tailwind v4 that is your
   * own compiled CSS, which already carries this package's tokens and utilities through
   * `preset.css` and the mandatory `@source`; without Tailwind, construct one from the
   * `@enonic/ui/style` entry (`getStyleSheet()`, or `styleText` for the raw text). Not both — the
   * prebuilt sheet comes from a separate scan and would duplicate preflight and tokens. Ignored
   * outside a shadow root.
   *
   * Not `@enonic/ui/tokens.css` or `@enonic/ui/utilities.css` either: those are Tailwind source
   * entries carrying `@theme`, `@custom-variant` and `@utility`, which a constructed stylesheet
   * cannot act on. Build the sheets once at module level — adopting is cheap, parsing is not.
   *
   * Sizes in the adopted CSS that are declared in `rem` resolve against the embedding document's
   * `html` font size, never against `:host` — a page with a `font-size: 62.5%` reset scales them
   * down. That is the embedding page's contract to keep, not this component's to patch.
   */
  stylesheets?: CSSStyleSheet[];
  className?: string;
  children?: ReactNode;
};

/**
 * The mount wrapper for rendering this library inside a shadow root: adopts the given stylesheets
 * into the root along with its own base reset (typography that host-page rules cannot leak
 * through) and an `@property` fallback synthesized from the adopted sheets, applies the theme
 * class, and attaches the portal layer every overlay in the subtree portals into. One per shadow
 * root.
 *
 * Outside a shadow root it is a plain themed wrapper — no portal layer is created and overlays
 * keep going to `document.body`.
 *
 * An ancestor of the shadow host that creates a fixed containing block (`transform`, `filter`,
 * `contain: paint`, …) confines every `position: fixed` overlay to that block. Popups compensate
 * for the offset; `Dialog.Overlay`'s full-viewport scrim cannot and will only cover the block —
 * keep such properties off the host's ancestor chain.
 */
export const AppRoot = ({ theme, stylesheets, className, children }: AppRootProps): ReactElement => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sheetsRef = useRef<CSSStyleSheet[]>([]);
  const [portalLayer, setPortalLayer] = useState<HTMLDivElement | null>(null);
  const inheritedContainer = usePortalContainer();

  // ? Keeps an inline `stylesheets={[...]}` literal from re-adopting on every render.
  const nextSheets = stylesheets ?? [];
  if (nextSheets.length !== sheetsRef.current.length || nextSheets.some((s, i) => s !== sheetsRef.current[i])) {
    sheetsRef.current = nextSheets;
  }
  const sheets = sheetsRef.current;

  useLayoutEffect(() => {
    const root = wrapperRef.current?.getRootNode();
    if (!isShadowRoot(root)) return;

    const layer = document.createElement('div');
    layer.dataset.component = 'AppRoot.PortalLayer';
    root.appendChild(layer);
    setPortalLayer(layer);

    return () => layer.remove();
  }, []);

  useLayoutEffect(() => {
    if (portalLayer == null) return;
    portalLayer.classList.toggle('dark', theme === 'dark');
  }, [portalLayer, theme]);

  useLayoutEffect(() => {
    const root = wrapperRef.current?.getRootNode();
    if (!isShadowRoot(root)) return;

    const propertyReset = buildPropertyResetSheet(sheets);
    const toAdopt = [getBaseResetSheet(), ...sheets, ...(propertyReset == null ? [] : [propertyReset])];
    const added = toAdopt.filter(sheet => !root.adoptedStyleSheets.includes(sheet));
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, ...added];

    return () => {
      root.adoptedStyleSheets = root.adoptedStyleSheets.filter(sheet => !added.includes(sheet));
    };
  }, [sheets]);

  // ! Provider stays mounted even before the layer exists — swapping the root element type would
  // remount the whole subtree and reset child state and focus.
  return (
    <PortalProvider container={portalLayer ?? inheritedContainer}>
      <div data-component='AppRoot' ref={wrapperRef} className={cn(theme === 'dark' && 'dark', className)}>
        {children}
      </div>
    </PortalProvider>
  );
};

AppRoot.displayName = 'AppRoot';
