---
description: Create production-ready components with deep research and planning
---

Create a new component: $ARGUMENTS

---

## Phase 1: Context & Research

### Step 1: Read Project Rules

Read all relevant rules files to understand project conventions:

```
.cursor/rules/react.mdc      - Component patterns, hooks, props
.cursor/rules/typescript.mdc - Type definitions, naming
.cursor/rules/tailwind.mdc   - Styling with cn(), cva()
.cursor/rules/structure.mdc  - File organization, exports
.cursor/rules/storybook.mdc  - Story organization
.cursor/rules/preact.mdc     - Preact/React compatibility
.cursor/rules/comments.mdc   - Documentation style
```

### Step 2: Fetch External Documentation

**Use Context7 MCP** to fetch current documentation:

```
1. resolve-library-id for "radix-ui"
2. get-library-docs with topic: "{ComponentName}"

Repeat for:
- "base-ui" (headless primitives)
- "shadcn-ui" (styled patterns)
```

**Fallback: docs-finder skill**

If Context7 unavailable, use the `docs-finder` skill:

```
Find documentation for Radix UI {ComponentName} component
```

**Manual fallback links:**

- Radix UI: https://www.radix-ui.com/primitives/docs/components
- Base UI: https://base-ui.com/react/components
- Shadcn UI: https://ui.shadcn.com/docs/components

### Step 3: Search Existing Components

Search the codebase for similar patterns:

```bash
# Find similar components
ls src/components/

# Search for similar hooks or utilities
grep -r "useControlledState\|useKeyboardNavigation\|useItemRegistry" src/hooks/

# Find provider patterns if compound component
ls src/providers/
```

Identify:

- Existing components with similar interaction patterns
- Hooks that can be reused
- Provider patterns for compound components

---

## Phase 2: Analysis & Planning

### Step 1: Summarize Research

Create a brief summary:

```
RESEARCH SUMMARY: {ComponentName}

External Libraries:
- Radix API: [key props, compound parts, accessibility features]
- Base UI: [alternative patterns, differences]
- Shadcn: [styled implementation notes]

Existing Codebase:
- Similar to: [existing component names]
- Reusable hooks: [hook names]
- Provider pattern needed: [yes/no]
```

### Step 2: Determine Component Type

Classify the component:

**Simple Component** (single file):

- Self-contained with no subcomponents
- Examples: Button, Input, Toggle, Badge

**Compound Component** (multiple parts + provider):

- Has Root/Trigger/Content or similar parts
- Shares state via context
- Examples: Dialog, Menu, Combobox, Tabs

### Step 3: Ask User Questions

Use AskUserQuestion tool to clarify design decisions:

**Questions to ask:**

1. **Component type confirmation**

   - Simple component
   - Compound component (with parts like Root, Trigger, Content)

2. **State management** (if applicable)

   - Controlled only (value + onChange required)
   - Uncontrolled only (internal state)
   - Both (useControlledState pattern)

3. **Variants** (if applicable)

   - Single variant dimension (use cn())
   - Multiple variant dimensions (use cva())
   - No variants

4. **Special features** (multiselect)
   - Keyboard navigation (arrows, enter, escape)
   - Focus management (roving tabindex)
   - Type-ahead search
   - None needed

### Step 4: Create Implementation Plan

Document the plan before coding:

```
IMPLEMENTATION PLAN: {ComponentName}

Files to create:
- src/components/{name}/{name}.tsx
- src/components/{name}/index.ts
- [if compound] src/providers/{name}-provider.tsx

Props interface:
- [list key props with types]

Hooks to use:
- [existing hooks to import]
- [new hooks if needed]

Accessibility:
- [ARIA attributes]
- [keyboard interactions]
```

---

## Phase 3: Implementation

### Step 1: Create Component File

Follow these patterns from the rules:

**File structure:**

```
src/components/{component-name}/
├── {component-name}.tsx    # Main implementation
└── index.ts                # Re-exports
```

**Component template:**

```typescript
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type {ComponentName}Props = {
  // Required props first
  // Optional props
  // className and children last
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

export const {ComponentName} = forwardRef<HTML{Element}Element, {ComponentName}Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('base-classes', className)} {...props}>
        {children}
      </div>
    );
  },
);

{ComponentName}.displayName = '{ComponentName}';
```

**For compound components, add provider:**

```typescript
// src/providers/{name}-provider.tsx
import { createContext, useContext, type ReactElement, type ReactNode } from 'react';

export type {ComponentName}ContextValue = {
  // Shared state and setters
};

const {ComponentName}Context = createContext<{ComponentName}ContextValue | undefined>(undefined);

export type {ComponentName}ProviderProps = {
  value: {ComponentName}ContextValue;
  children?: ReactNode;
};

export const {ComponentName}Provider = ({ value, children }: {ComponentName}ProviderProps): ReactElement => {
  return <{ComponentName}Context.Provider value={value}>{children}</{ComponentName}Context.Provider>;
};

{ComponentName}Provider.displayName = '{ComponentName}Provider';

export const use{ComponentName}Context = (): {ComponentName}ContextValue => {
  const ctx = useContext({ComponentName}Context);
  if (!ctx) {
    throw new Error('use{ComponentName}Context must be used within {ComponentName}Provider');
  }
  return ctx;
};
```

### Step 2: Create Index Exports

```typescript
// src/components/{component-name}/index.ts
export { {ComponentName} } from './{component-name}';
export type { {ComponentName}Props } from './{component-name}';
```

### Step 3: Update Main Barrel

Add to `src/components/index.ts`:

```typescript
export * from "./{component-name}";
```

### Step 4: Verify Implementation

Run checks:

```bash
pnpm check:fix
```

---

## Phase 4: Storybook (Last)

### Create Stories File

```typescript
// src/components/{component-name}/{component-name}.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { {ComponentName} } from './{component-name}';

export default {
  title: 'Components/{ComponentName}',
  component: {ComponentName},
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    // Define controls for props
  },
} satisfies Meta<typeof {ComponentName}>;

type Story = StoryObj<typeof {ComponentName}>;

// * Examples
export const Basic: Story = {
  name: 'Examples / Basic',
  args: {
    children: 'Content',
  },
};

// * States (if applicable)
export const Disabled: Story = {
  name: 'States / Disabled',
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

// * Features (if applicable)

// * Behavior (if applicable)
```

### Story Organization

Follow hierarchical grouping:

1. **Examples/** - Basic usage patterns
2. **States/** - Visual states (disabled, error, loading)
3. **Features/** - Specific capabilities (icons, sizes)
4. **Behavior/** - Interaction patterns, keyboard navigation

---

## Rules Summary

**Critical patterns:**

- Use `forwardRef` for all interactive components
- Set `displayName` for debugging
- Use `cn()` for class composition (cva() only for 2+ variant dimensions)
- Props: required first, className/children last
- Import from `'react'`, not `'preact'`
- Use `useControlledState` for controlled/uncontrolled support

**File organization:**

- One component per folder
- Providers in `src/providers/`
- Direct imports between components (not barrel)

**Accessibility:**

- Include ARIA attributes
- Support keyboard navigation
- Follow Radix UI patterns

---

## Checklist

Before completing:

- [ ] Research complete (external docs + existing components)
- [ ] User questions answered
- [ ] Component file created with proper types
- [ ] Provider created (if compound)
- [ ] Index exports added
- [ ] Main barrel updated
- [ ] `pnpm check:fix` passes
- [ ] Stories created with Examples group
- [ ] All variants demonstrated in stories
