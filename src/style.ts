import css from '@/styles/style.css?inline';

/**
 * The package's compiled stylesheet as text, for consumers without a Tailwind build rendering
 * inside a shadow root: construct a sheet from it once and pass that to `AppRoot`'s `stylesheets`.
 * With your own Tailwind v4 build, pass your compiled CSS instead — never both.
 */
export const styleText: string = css;

let sheet: CSSStyleSheet | undefined;

/** `styleText` as a constructed stylesheet, built once on first call. Browser-only. */
export const getStyleSheet = (): CSSStyleSheet => {
  if (sheet == null) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(styleText);
  }
  return sheet;
};
