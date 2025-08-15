import { type ComponentType, isValidElement, type ReactElement, type ReactNode } from 'react';

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isOfType<P>(node: ReactNode, Comp: ComponentType<P>): node is ReactElement<P> {
  return isValidElement(node) && (node as ReactElement<P>).type === Comp;
}
