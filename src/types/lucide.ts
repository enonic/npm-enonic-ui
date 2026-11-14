import type { ComponentType } from 'react';

/**
 * An icon component as the library renders it. Structural rather than `lucide-react`'s own type, so icons from
 * both `lucide-react` and `lucide-preact` fit.
 */
export type LucideIcon = ComponentType<{
  size?: string | number;
  strokeWidth?: string | number;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}>;
