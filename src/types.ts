import type { LucideIcon as LucideIconPreact } from 'lucide-preact';
import type { LucideIcon as LucideIconReact } from 'lucide-react';

/**
 * Unified LucideIcon type that accepts icons from both lucide-react and lucide-preact.
 * This allows the UI library to work seamlessly with both React and Preact projects.
 */
export type LucideIcon = LucideIconPreact | LucideIconReact;