import { useLayoutEffect, useRef, useState } from 'react';

import { PortalProvider, usePortalContainer } from '@/providers';
import { cn, isShadowRoot } from '@/utils';

import type { ReactElement, ReactNode } from 'react';

export type AppRootProps = {
  /**
   * Theme for the subtree. `'dark'` adds the class to the wrapper and mirrors it onto the portal
   * layer. `'light'` emits nothing: the adopted sheet declares the light tokens on `:host`, so a
   * shadow root is already light until something inside it says otherwise.
   */
  theme?: 'light' | 'dark';
  /**
   * Constructed stylesheets to adopt into the surrounding shadow root. On Tailwind v4 that is your
   * own compiled CSS, which already carries this package's tokens and utilities through
   * `preset.css` and the mandatory `@source`; without Tailwind it is the prebuilt
   * `@enonic/ui/style.css`. Not both — the prebuilt sheet comes from a separate scan and would
   * duplicate preflight and tokens. Ignored outside a shadow root.
   *
   * Not `@enonic/ui/tokens.css` or `@enonic/ui/utilities.css` either: those are Tailwind source
   * entries carrying `@theme`, `@custom-variant` and `@utility`, which a constructed stylesheet
   * cannot act on. Build the sheets once at module level — adopting is cheap, parsing is not.
   */
  stylesheets?: CSSStyleSheet[];
  className?: string;
  children?: ReactNode;
};

/**
 * The mount wrapper for rendering this library inside a shadow root: adopts the given stylesheets
 * into the root, applies the theme class, and attaches the portal layer every overlay in the
 * subtree portals into. One per shadow root.
 *
 * Outside a shadow root it is a plain themed wrapper — no portal layer is created and overlays keep
 * going to `document.body`.
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
    if (!isShadowRoot(root) || sheets.length === 0) return;

    const added = sheets.filter(sheet => !root.adoptedStyleSheets.includes(sheet));
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
