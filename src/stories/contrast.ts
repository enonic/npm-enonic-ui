// Story-local WCAG contrast helpers. Not part of the published package — used
// only by Colors.stories.tsx to dogfood the design tokens against WCAG 2.x.

export type Rgb = readonly [number, number, number];

export type ResolvedColor = { rgb: Rgb; alpha: number };

const SENTINEL = '#ff00ff';

let sharedCtx: CanvasRenderingContext2D | null | undefined;

const getCtx = (): CanvasRenderingContext2D | null => {
  if (sharedCtx !== undefined) return sharedCtx;
  if (typeof document === 'undefined') {
    sharedCtx = null;
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  sharedCtx = canvas.getContext('2d', { willReadFrequently: true });
  return sharedCtx;
};

/**
 * Resolve any CSS color string the browser understands (`rgb()`, hex, `oklch()`,
 * `color-mix()`, …) to sRGB bytes by painting it onto a 1×1 canvas. WCAG 2.x
 * contrast is defined in sRGB, so gamut-clamping wide-gamut colors here is correct.
 */
export const parseColor = (color: string): ResolvedColor | undefined => {
  const ctx = getCtx();
  if (!ctx) return undefined;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = SENTINEL; // invalid input leaves this in place
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return { rgb: [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0], alpha: (data[3] ?? 0) / 255 };
};

const toLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export const luminance = ([r, g, b]: Rgb): number => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

export const contrastRatio = (a: Rgb, b: Rgb): number => {
  const la = luminance(a) + 0.05;
  const lb = luminance(b) + 0.05;
  return Math.max(la, lb) / Math.min(la, lb);
};

// WCAG 2.x thresholds.
export const AA_NORMAL = 4.5; // 1.4.3 normal text
export const AAA_NORMAL = 7; // 1.4.6 normal text
export const AA_LARGE = 3; // 1.4.3 large text
export const NON_TEXT = 3; // 1.4.11 UI components & graphical objects

export const passesAA = (ratio: number, large = false): boolean => ratio >= (large ? AA_LARGE : AA_NORMAL);
export const passesAAA = (ratio: number, large = false): boolean => ratio >= (large ? AA_NORMAL : AAA_NORMAL);
export const passesNonText = (ratio: number): boolean => ratio >= NON_TEXT;

/** Color a translucent token is composited toward when read in isolation is unreliable. */
export const isOpaque = ({ alpha }: ResolvedColor): boolean => alpha >= 0.99;
