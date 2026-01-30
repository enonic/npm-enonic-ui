export type * from './lucide';

/**
 * Controls how users can interact with a list/tree item.
 *
 * - `'full'`: Item can be navigated to and selected (default)
 * - `'navigate-only'`: Item can receive focus but cannot be selected
 * - `'none'`: Item is completely non-interactive (skipped in navigation, cannot be selected)
 */
export type ItemInteraction = 'full' | 'navigate-only' | 'none';

/**
 * Augment the global `FocusOptions` interface with the `focusVisible` property.
 *
 * This property allows controlling whether `:focus-visible` styles are applied
 * when programmatically focusing an element via `element.focus({ focusVisible: true })`.
 *
 * Browser support: Chrome 145+, Firefox 104+, Safari 18.4+.
 *
 * TypeScript's `lib.dom.d.ts` does not yet include this property. The issue was closed
 * as "Working as Intended" because it lacked cross-browser support at the time.
 * Now that 3 major engines support it, this may be reconsidered.
 *
 * @see https://github.com/microsoft/TypeScript/issues/61458
 * @see https://caniuse.com/mdn-api_htmlelement_focus_options_focusvisible_parameter
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface FocusOptions {
    /**
     * Whether to show focus-visible styling when programmatically focusing.
     * @default false
     */
    focusVisible?: boolean;
  }
}
