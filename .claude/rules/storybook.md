---
paths:
  - "**/*.stories.tsx"
  - ".storybook/**/*.{ts,tsx}"
---

# Storybook Stories Standards

## Story Grouping

Use hierarchical grouping with `/` separator. Standard groups in order:

1. **Examples** — Basic usage patterns
2. **States** — Visual states (disabled, read-only, loading)
3. **Features** — Specific capabilities and configurations
4. **Behavior** — Interaction patterns and accessibility
5. **Specialized** — Component-specific variants (Radio, Checkbox, Select)

```typescript
export const Basic: Story = { name: 'Examples / Basic', render: () => <Component /> };
export const Disabled: Story = { name: 'States / Disabled', render: () => <Component disabled /> };
export const AlignEnd: Story = { name: 'Features / Align End', render: () => <Component align='end' /> };
export const FocusNavigation: Story = { name: 'Behavior / Focus Navigation', render: () => <Component /> };

// ❌ DON'T: Flat structure without grouping
export const BasicExample: Story = { name: 'Basic Example' };
```

## Interactive Playground

Create an "Interactive" story (under Features) for components with 2+ variant props with multiple options. Skip for components with only a single boolean prop.

## Story Wrappers

```typescript
// Standard wrapper with description
render: () => (
  <div className='flex flex-col gap-y-3 p-4 items-center'>
    <div className='max-w-120 text-sm text-subtle'>
      Brief description, especially useful for keyboard/interaction testing.
    </div>
    <Component />
  </div>
)

// Minimal when self-contained
render: () => <Component />
```

## State Management

- Use local `useState` for interactive stories
- Never use external state (nanostores) in stories

## Vite Config Constraints (`viteFinal`)

Three config blocks are required and interdependent — **do not remove any**:

1. `resolve.alias` — maps `react`/`react-dom` → `preact/compat`
2. `resolve.dedupe` — prevents duplicate preact instances
3. `optimizeDeps.include` — pre-bundles `@enonic/ui` so aliases apply and CJS deps (`focus-trap-react`) convert to ESM

Use `include`, not `exclude` in `optimizeDeps` — `exclude` breaks `focus-trap-react` named exports.

Do NOT replace `@import "tailwindcss"` with granular layer imports in `storybook.css`.

## File Structure

```typescript
import { Component } from './component';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useState } from 'react';
import { Icon1, Icon2 } from 'lucide-react'; // Icons last

type Story = StoryObj<typeof Component>;

export default {
  title: 'Components/Component',
  component: Component,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Component>;

export const Basic: Story = { name: 'Examples / Basic', ... };
export const Interactive: Story = { name: 'Features / Interactive', ... };
export const FocusNavigation: Story = { name: 'Behavior / Focus Navigation', ... };
```
