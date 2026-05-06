// Detect whether `scrollIntoView` honors `container: 'nearest'` (CSSOM-View
// Module). Browsers that read the key off the options bag understand the
// option and will scope scrolling to the nearest scroll container only.
const SUPPORTS_CONTAINER_OPTION = ((): boolean => {
  if (typeof document === 'undefined') return false;
  let supported = false;
  const opts: ScrollIntoViewOptions = {};
  Object.defineProperty(opts, 'container', {
    get() {
      supported = true;
      return 'nearest';
    },
  });
  try {
    document.documentElement.scrollIntoView(opts);
  } catch {
    /* noop */
  }
  return supported;
})();

/**
 * Scrolls an element to the center of its nearest scrollable ancestor without
 * disturbing outer scroll containers (page, dialog, etc.).
 *
 * - Chromium 134+ uses `scrollIntoView({ block: 'center', container: 'nearest' })`
 *   and centers the element within the closest scroll container only.
 * - Other browsers fall back to `scrollIntoView({ block: 'nearest' })` — the
 *   element lands at the closest edge instead of the center, but ancestors
 *   that already show it stay put.
 *
 * Useful for dropdowns: bring the selected option into view on open without
 * scrolling the page underneath.
 */
export function scrollIntoCenter(element: HTMLElement): void {
  if (SUPPORTS_CONTAINER_OPTION) {
    element.scrollIntoView({ block: 'center', container: 'nearest' } as ScrollIntoViewOptions);
  } else {
    element.scrollIntoView({ block: 'nearest' });
  }
}
