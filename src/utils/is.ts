import { type ComponentType, isValidElement, type ReactElement, type ReactNode } from 'react';

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * Whether an element can receive keyboard focus — false when missing, not
 * rendered (`display:none`, detached), or inside an `aria-hidden`/`hidden` subtree.
 */
export function isElementVisible(element: HTMLElement | null): boolean {
  if (element == null) return false;
  if (element.closest('[aria-hidden="true"], [hidden]') != null) return false;
  // ? checkVisibility() is the precise modern check; offsetParent is the fallback.
  if (typeof element.checkVisibility === 'function') return element.checkVisibility();
  return element.offsetParent != null || element.getClientRects().length > 0;
}

export function isOfType<P>(node: ReactNode, Comp: ComponentType<P>): node is ReactElement<P> {
  return isValidElement(node) && (node as ReactElement<P>).type === Comp;
}
