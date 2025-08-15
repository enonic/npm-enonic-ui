import { Children, type ComponentType, type ReactElement, type ReactNode } from 'react';

import { isOfType } from './is';

export function findComponentByType<P>(children: ReactNode, Comp: ComponentType<P>): ReactElement<P> | undefined {
  return Children.toArray(children).find(child => isOfType(child, Comp));
}
