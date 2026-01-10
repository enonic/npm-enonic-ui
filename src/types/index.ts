export type * from './lucide';

/**
 * Controls how users can interact with a list/tree item.
 *
 * - `'full'`: Item can be navigated to and selected (default)
 * - `'navigate-only'`: Item can receive focus but cannot be selected
 * - `'none'`: Item is completely non-interactive (skipped in navigation, cannot be selected)
 */
export type ItemInteraction = 'full' | 'navigate-only' | 'none';
