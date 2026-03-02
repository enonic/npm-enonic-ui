---
paths:
  - "**/*.tsx"
  - ".storybook/**/*.{ts,tsx}"
---

# Tailwind CSS & Styling Standards

## Class Name Utilities

Import `cn` from `@enonic/ui` (internal: from `@/utils`):

```typescript
// ✅ Use cn for dynamic class combinations; className always last
const buttonClasses = cn(
  'px-4 py-2 rounded font-medium',
  disabled && 'opacity-50 cursor-not-allowed',
  variant === 'primary' && 'bg-blue-500 text-white',
  className, // Last so parent can override
);

// ❌ Don't put className first — parent overrides won't work
const badClasses = cn(className, 'base-styles');
```

### `cva` — Only for Complex Variants

```typescript
// ✅ Use cva ONLY when you have 2+ variant dimensions with multiple options
const buttonVariants = cva('px-4 py-2 rounded font-medium transition-colors', {
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    },
    size: {
      sm: 'text-sm px-3 py-1',
      md: 'text-base px-4 py-2',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

// ❌ DON'T use cva for simple true/false states — use cn() instead
```

## Color System

```typescript
// ✅ Use semantic color tokens
<div className="bg-primary text-primary-foreground" />
<div className="bg-overlay backdrop-blur-xs" />

// ❌ Avoid arbitrary CSS variable syntax
<div className="bg-[var(--color-overlay)]" /> // Use bg-overlay instead

// ❌ Avoid arbitrary values when design tokens exist
<div className="bg-[#3B82F6]" /> // Use bg-blue-500 instead
```

## Spacing & Layout

```typescript
// ✅ size-* for equal width and height
<Icon className="size-4" /> // Not h-4 w-4

// ✅ Logical properties
<div className="ps-4 me-2" /> // padding-start, margin-end

// ✅ gap in flex/grid (not space-x-*)
<div className="flex gap-4" />
```

## When to Extract Classes to Variables

Extract when:
- Multiple variant conditions or 2+ conditions
- More than 6 classes, 4+ lines, or 80+ characters total
- Reused in 2+ places in the same file

Keep inline when:
- Simple static classes (up to 5)
- Single simple condition: `cn('px-4 py-2', disabled && 'opacity-50')`

## State-Based Styling

```typescript
// ✅ Use data-* attributes for state-based styling
<li
  data-active={isActive}
  data-selected={isSelected}
  className="option data-[active=true]:bg-surface-neutral-hover data-[selected=true]:bg-surface-primary"
/>

// ❌ Avoid conditional class-based state selectors
```

## Anti-Patterns

```typescript
// ❌ String concatenation — breaks Tailwind's compiler
<div className={'text-' + size} />

// ❌ Template literals with Tailwind classes — use cn() instead
<div className={`${active ? 'bg-blue-500' : 'bg-gray-200'}`} />

// ❌ Mixing Tailwind with inline styles
<div className="p-4" style={{ margin: '10px' }} />

// ❌ @apply in component files — only in CSS files for base styles

// ❌ Important modifier as a crutch — fix specificity properly
<div className="!p-4 !m-2" />
```
