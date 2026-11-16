import type { ReactNode } from 'react';

/**
 * An icon component as the library renders it. Structural rather than `lucide-react`'s own type, so icons from
 * both `lucide-react` and `lucide-preact` fit. A bare call signature, not `ComponentType`: when a consumer maps
 * `react` to `preact/compat`, `ComponentType` gains Preact's `defaultProps`, which lucide's `Signalish` props fail.
 */
export type LucideIcon = (props: {
  size?: string | number;
  strokeWidth?: string | number;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}) => ReactNode;
