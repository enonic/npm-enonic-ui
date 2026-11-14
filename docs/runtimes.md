# Runtimes: Preact 10 and React 19

The library is built against React: the bundle and its types import `react`, `react/jsx-runtime` and `react-dom`, and
none of them is inlined. React 19 apps consume it as is. Preact apps alias those specifiers to `preact/compat` and
`preact/jsx-runtime`, so their own Preact creates every vnode and the two copies can never disagree.

Storybook and the `interactions-smoke` tests run on Preact 10: `.storybook/main.ts` adds `@preact/preset-vite`, which
brings those aliases. The only React and latest-Preact coverage is the package smoke check (`pnpm check:package`), which
installs the packed tarball into a React 19, a Preact 10 and a latest-Preact fixture and server-renders a component. It
does not exercise focus, effects or portals.

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

### Event types

Handlers receive React's synthetic events under React and native DOM events under Preact. Type them with React's event
types (`React.KeyboardEvent<HTMLDivElement>`), which `preact/compat` maps onto the native ones, and read only what both
share. Where a prop takes a native `Event`, as `onSelect` on menu items does, omit the same-named DOM prop from the
`ComponentPropsWithoutRef` it is intersected with, or the two signatures collapse into one no caller can satisfy.
