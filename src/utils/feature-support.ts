/**
 * Whether the browser supports CSS `field-sizing: content` for content-based form control sizing.
 * Evaluated once at module load. `false` in non-browser environments.
 * @see https://caniuse.com/mdn-css_properties_field-sizing
 */
export const SUPPORTS_FIELD_SIZING: boolean =
  typeof window !== 'undefined' &&
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('field-sizing', 'content');
