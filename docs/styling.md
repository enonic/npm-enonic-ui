# Styling

Tailwind CSS v4. Dark mode switches on the `.dark` class (`@custom-variant`).

## Class Names

Combine classes with `cn` (internal: `@/utils`), with `className` last so the parent can override:

```typescript
const classNames = cn('rounded px-4 py-2 font-medium', disabled && 'cursor-not-allowed opacity-50', className);
```

Use `cva` only for two or more variant dimensions with multiple options each. Simple true/false states go through `cn`.

```typescript
const buttonVariants = cva('rounded font-medium transition-colors', {
  variants: {
    variant: { primary: '...', secondary: '...' },
    size: { sm: '...', md: '...' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});
```

Extract classes into a variable when there are two or more conditions, more than about six classes, or the same set is
reused in the file. Keep short static sets and a single condition inline.

## Color Tokens

Use the semantic tokens, not arbitrary values or `var()` syntax:

```typescript
// ✅
<div className='bg-overlay text-subtle' />

// ❌
<div className='bg-[var(--color-overlay)]' />
```

## State

Style state through `data-*` attributes, not conditional class names:

```typescript
<li
  data-active={active}
  data-selected={selected}
  className='data-[active=true]:bg-surface-neutral-hover data-[selected=true]:bg-surface-primary'
/>
```

## Layout

- `size-*` for equal width and height, not `h-4 w-4`
- Logical properties (`ps-4`, `me-2`) over physical ones
- `gap-*` in flex and grid, not `space-x-*`
