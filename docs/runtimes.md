# Runtimes: Preact 10 and React 19

The package ships for both React 19 and Preact 10 (see `peerDependencies` and the README). Development runs on Preact
only: the source imports from `react`, which the Vite preset aliases to `preact/compat`, and Storybook, the
`interactions-smoke` tests and CI all run on Preact. A green CI run therefore says nothing about React.

Any change that touches focus, effect timing, portals or click-outside has to be considered on both runtimes.

## Import Source

Always import from `react`, never from `preact` directly. Use `ReactNode` for children, never `ComponentChildren`. This
applies to component, story and test files.

```typescript
// ✅
import { forwardRef, useState, type ReactElement, type ReactNode } from 'react';

// ❌
import { forwardRef, useState } from 'preact';
import type { ComponentChildren } from 'preact';
```

## Known Differences

### Effect flush timing

Under React 19, passive effects flush synchronously after a click-triggered commit, before a `queueMicrotask` callback
runs. Under Preact they flush later. Code that defers work with a microtask and expects to run before the next render's
effects behaves differently: in #583 a deferred autofocus stole focus from a field focused in a mount `useEffect` under
React, while under Preact it did not.

### Event bubbling through portals

React bubbles synthetic events through portals along the component tree, so a click inside portaled content reaches
`onClick` handlers on its React ancestors. Preact bubbles along the DOM, so the same click never reaches them. Handlers
that rely on either behavior, such as click-outside detection or a parent stopping propagation, must work under both.

### Radix UI Slot ref types

With `@radix-ui/react-slot` and `forwardRef`, the ref types do not align under `preact/compat`. The ref works at
runtime; suppress the type error with an explanation instead of casting:

```typescript
<Comp
  // @ts-expect-error - Preact's ForwardedRef is incompatible with Radix UI Slot's expected ref type
  ref={ref}
  {...props}
/>
```

Use `@ts-expect-error`, not `as any` or `as React.Ref<HTMLElement>`. Other Radix UI primitives work through
`preact/compat` without this.
