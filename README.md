# @enonic/ui

A modern UI component library built with Preact/React, TypeScript, and Tailwind CSS.

## Installation

#### With React

```bash
pnpm add @enonic/ui react react-dom @radix-ui/react-slot
```

#### With Preact

```bash
pnpm add @enonic/ui preact @radix-ui/react-slot
```

<details>
<summary><b>npm</b></summary>

#### With React

```bash
npm install @enonic/ui react react-dom @radix-ui/react-slot
```

#### With Preact

```bash
npm install @enonic/ui preact @radix-ui/react-slot
```

</details>

> Some components and styling paths need extra packages — `focus-trap-react` (dialogs and overlays), `react-virtuoso` (virtualized lists), and `tw-animate-css` (the Tailwind styling path). See [Peer Dependencies](#peer-dependencies).

## Usage

### Styles

> **Important**: Components are styled with Tailwind CSS utility classes and render unstyled until you load the CSS. Pick one of the two paths below.

#### Option A — No Tailwind (prebuilt stylesheet)

Import the fully compiled stylesheet. It bundles Tailwind's output, the design tokens, and component animations — nothing else to configure:

```css
@import '@enonic/ui/style.css';
```

#### Option B — Your own Tailwind CSS (recommended)

If your project already runs **Tailwind CSS v4**, integrate the design tokens through `preset.css` so components share your Tailwind build — one set of utilities, your theme overrides apply, and a smaller bundle. A working setup needs all of the following:

```css
/* Declare layer order first so your own overrides win over component styles */
@layer theme, base, components, utilities, overrides;

@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import '@enonic/ui/preset.css'; /* design tokens, dark variant, base + custom utilities */
@import 'tw-animate-css'; /* component enter/exit animations (required — see below) */
@import 'tailwindcss/utilities.css' layer(utilities);

/* Let Tailwind scan @enonic/ui's compiled files for the classes its components use.
   The path is relative to THIS file — adjust the number of ../ to reach node_modules. */
@source '../node_modules/@enonic/ui';
```

> **`@source` is mandatory.** Tailwind v4 only generates the utilities it finds in scanned sources, and it ignores `node_modules` by default. The classes used inside `@enonic/ui` components live in its compiled output, so without `@source` pointing at the package those utilities are never generated and components render unstyled.

> **`tw-animate-css` is required on this path.** Components such as `Dialog`, `Toast`, and `Tooltip` emit `animate-in` / `fade-*` / `zoom-*` classes from [`tw-animate-css`](https://www.npmjs.com/package/tw-animate-css), which `preset.css` does not include. Install it (`pnpm add tw-animate-css`) and import it as shown. The prebuilt `style.css` already inlines these, so Option A doesn't need it.

If you don't need explicit layer control, the shorthand also works:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import '@enonic/ui/preset.css';
@source '../node_modules/@enonic/ui';
```

#### CSS exports

| Export                     | Contents                                                              | Use when                          |
| -------------------------- | --------------------------------------------------------------------- | --------------------------------- |
| `@enonic/ui/style.css`     | Fully compiled — Tailwind output + tokens + animations                | You don't run Tailwind (Option A) |
| `@enonic/ui/preset.css`    | Design tokens (`@theme`), dark variant, base styles, custom utilities | You run Tailwind (Option B)       |
| `@enonic/ui/tokens.css`    | Design tokens + dark variant only                                     | Tokens without base/utilities     |
| `@enonic/ui/base.css`      | Root font size + base text color                                      | Granular composition              |
| `@enonic/ui/utilities.css` | Custom `@utility` definitions (shimmer, `scrollbar-none`, …)          | Granular composition              |

### Import Components

```tsx
import { Button, Input } from '@enonic/ui';

function App() {
  return (
    <div>
      <Button variant='primary' size='md'>
        Click Me
      </Button>
      <Input placeholder='Enter text...' />
    </div>
  );
}
```

### Dark Mode

The library ships light and dark themes as CSS variables, switched by a class. Add `dark` to a root element (or a shadow-DOM host) and every token updates:

```html
<html class="dark">
  <!-- ... -->
</html>
```

```ts
// Toggle at runtime
document.documentElement.classList.toggle('dark', isDark);
```

The variant is defined as `@custom-variant dark (&:where(.dark, .dark *))` and also matches `:host(.dark)` for web-component hosts. Use the `dark:` variant in your own markup as usual.

### Icons

Icons used internally by components are bundled — no icon library install is required for components to render.

You only need a Lucide package when you pass a custom icon to a component that accepts one (e.g. `Tab`, `Link`, and `VirtualizedTreeList` expose an `icon` prop):

```tsx
import { Tab } from '@enonic/ui';
import { Star } from 'lucide-react'; // React
// import { Star } from 'lucide-preact'; // Preact

<Tab icon={Star} label='Favorites' />;
```

Use `lucide-react` in React projects and `lucide-preact` in Preact projects — the `icon` prop accepts either.

## Peer Dependencies

Installing `@enonic/ui` surfaces any unmet peers with the exact ranges it needs (defined in `package.json` — the source of truth).

**Required**

- `@radix-ui/react-slot` — backs the `asChild` prop used across components

…plus one framework:

| React                       | Preact          |
| --------------------------- | --------------- |
| `react` + `react-dom` (v19) | `preact` (v10+) |

**Optional** — add only if you use the related feature:

- `focus-trap-react` — focus management for `Dialog` and other overlay components
- `react-virtuoso` — required by `VirtualizedTreeList` and other virtualized lists
- `tw-animate-css` — component animations when integrating through `preset.css` (see [Styles](#styles))

## License

MIT
