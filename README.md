# @enonic/ui

[![npm](https://img.shields.io/npm/v/@enonic/ui.svg)](https://www.npmjs.com/package/@enonic/ui)
[![CI](https://github.com/enonic/npm-enonic-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/enonic/npm-enonic-ui/actions/workflows/ci.yml)
[![License](https://img.shields.io/npm/l/@enonic/ui.svg)](LICENSE)

UI components for Preact and React, styled with Tailwind CSS v4. Components ship with keyboard navigation, focus management, and ARIA wiring; theming runs on CSS custom properties with a light and a dark palette.

**[Browse the components →](https://enonic.github.io/npm-enonic-ui/)** Every component and variant, live, with props tables and accessibility checks.

## Quick start

**1. Install** — with React:

```bash
pnpm add @enonic/ui react react-dom @radix-ui/react-slot
```

…or with Preact:

```bash
pnpm add @enonic/ui preact @radix-ui/react-slot
```

<details>
<summary><b>npm</b></summary>

```bash
npm install @enonic/ui react react-dom @radix-ui/react-slot  # React
npm install @enonic/ui preact @radix-ui/react-slot            # Preact
```

</details>

**2. Load the styles.** Components use Tailwind utility classes and render unstyled until a stylesheet is present. The prebuilt one needs no configuration:

```css
/* your app's entry CSS */
@import '@enonic/ui/style.css';
```

Already running Tailwind v4? Use the [Tailwind setup](#tailwind-v4-setup) instead — it shares one utility build with your app and lets your theme overrides through.

**3. Render something.**

```tsx
import { Button, Input } from '@enonic/ui';

function App() {
  return (
    <>
      <Input label='Project' placeholder='Search projects' />
      <Button variant='filled' size='md'>
        Search
      </Button>
    </>
  );
}
```

## Styles

Two paths. Pick by whether your app already runs Tailwind:

| Your app                      | Import                  | Trade-off                                                         |
| ----------------------------- | ----------------------- | ----------------------------------------------------------------- |
| No Tailwind                   | `@enonic/ui/style.css`  | Zero config, ships Tailwind's output for the components           |
| Tailwind CSS v4 (recommended) | `@enonic/ui/preset.css` | One shared utility build, your theme overrides apply, smaller CSS |

### Tailwind v4 setup

Import the tokens through `preset.css` and point Tailwind at the package. All four pieces are needed:

```css
/* Declare layer order first so your own overrides win over component styles */
@layer theme, base, components, utilities, overrides;

@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import '@enonic/ui/preset.css'; /* design tokens, dark variant, base + custom utilities */
@import 'tw-animate-css'; /* component enter/exit animations */
@import 'tailwindcss/utilities.css' layer(utilities);

/* Relative to THIS file — adjust the ../ depth to reach node_modules */
@source '../node_modules/@enonic/ui';
```

> [!IMPORTANT]
> `@source` is mandatory. Tailwind v4 generates only the utilities it finds in scanned sources, and it skips `node_modules` by default. Without this line the component classes are never generated and everything renders unstyled.

`tw-animate-css` is also required on this path: `Dialog`, `Toast`, and `Tooltip` emit `animate-in` / `fade-*` / `zoom-*` classes that `preset.css` does not include. Install it with `pnpm add tw-animate-css`. The prebuilt `style.css` already inlines them.

Without explicit layer control, the shorthand works too:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import '@enonic/ui/preset.css';
@source '../node_modules/@enonic/ui';
```

### CSS exports

| Export                     | Contents                                                              | Use when                      |
| -------------------------- | --------------------------------------------------------------------- | ----------------------------- |
| `@enonic/ui/style.css`     | Fully compiled — Tailwind output + tokens + animations                | You don't run Tailwind        |
| `@enonic/ui/preset.css`    | Design tokens (`@theme`), dark variant, base styles, custom utilities | You run Tailwind v4           |
| `@enonic/ui/tokens.css`    | Design tokens + dark variant only                                     | Tokens without base/utilities |
| `@enonic/ui/base.css`      | Root font size + base text color                                      | Granular composition          |
| `@enonic/ui/utilities.css` | Custom `@utility` definitions (shimmer, `scrollbar-none`, …)          | Granular composition          |

## Dark mode

Both themes ship as CSS variables, switched by a class. Add `dark` to a root element and every token updates:

```html
<html class="dark">
  <!-- ... -->
</html>
```

```ts
document.documentElement.classList.toggle('dark', isDark);
```

The variant is `@custom-variant dark (&:where(.dark, .dark *))`, so `dark:` matches `.dark` and anything inside it. Use it in your own markup as usual.

Shadow DOM is handled by the token stylesheets rather than the variant: they select `:host(.dark)` alongside `.dark`, so putting `dark` on a shadow host remaps every token inside that root. Components reference tokens only and use no `dark:` utilities, so they follow the host. Your own `dark:` utilities inside a shadow root will not — that selector cannot cross the boundary.

## Icons

Icons used inside components are bundled — no icon package is needed for components to render.

A Lucide package is needed only when you pass your own icon to a component that takes one, such as the `icon` prop on `Tab`, `Link`, or `VirtualizedTreeList`:

```tsx
import { Tab } from '@enonic/ui';
import { Star } from 'lucide-react'; // lucide-preact in Preact projects

<Tab icon={Star} label='Favorites' />;
```

The `icon` prop accepts either package.

## Requirements

`package.json` holds the exact ranges — installing surfaces any unmet peer.

| Requirement                                     | Notes                               |
| ----------------------------------------------- | ----------------------------------- |
| `@radix-ui/react-slot`                          | Required — backs the `asChild` prop |
| `react` + `react-dom` v19, **or** `preact` v10+ | Pick one framework                  |
| Tailwind CSS v4                                 | Only for the `preset.css` path      |

Optional peers, needed per feature:

| Package            | Needed for                                        |
| ------------------ | ------------------------------------------------- |
| `focus-trap-react` | Focus management in `Dialog` and other overlays   |
| `react-virtuoso`   | `VirtualizedTreeList` and other virtualized lists |
| `tw-animate-css`   | Component animations on the `preset.css` path     |

## What's exported

Beyond the components, the package entry re-exports the hooks that drive them (roving tabindex, type-ahead, floating position, scroll lock, and more), the bundled icon set, context providers, shared types, and the `cn` class-merge helper.

```tsx
import { Button, cn, useControlledState } from '@enonic/ui';
```

## Development

```bash
pnpm dev         # Storybook on :6006
pnpm check:fix   # format + lint, then typecheck
pnpm build       # library + CSS into dist/
```

## License

Apache-2.0 — see [LICENSE](LICENSE).
