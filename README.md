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

Inside a shadow root the document's theme does not reach in, even though custom properties cross the boundary: the adopted sheet declares the light tokens on `:host`, and a declaration on the host beats a value inherited into it. Mount through `AppRoot` and let it switch — `<AppRoot theme='dark' stylesheets={sheets}>`. `theme='light'` emits nothing, being the state a root is already in. A `dark` class on the host works too, since `:host(.dark)` outranks `:host`, but it leaves your own `dark:` utilities unmatched because `.dark *` cannot see an ancestor in the outer tree; the class `AppRoot` places sits inside the root, and it mirrors it onto the portal layer so overlays follow. `stylesheets` expects constructed sheets: on Tailwind v4 your own compiled CSS, which already carries the package's tokens and utilities via `preset.css` and `@source`; without Tailwind the prebuilt sheet from `@enonic/ui/style` (`getStyleSheet()`, or `styleText` for the raw text). Not both, and never `tokens.css`/`utilities.css`, which are Tailwind source entries.

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

| Package          | Needed for                                        |
| ---------------- | ------------------------------------------------- |
| `react-virtuoso` | `VirtualizedTreeList` and other virtualized lists |
| `tw-animate-css` | Component animations on the `preset.css` path     |

## Localization

Every label a component renders on its own — the close button of a `Dialog`, the placeholder of a
`SearchField`, the month navigation of a `DatePicker` — is English by default and keyed
`enonic.ui.<component>.<name>`. To render them in the application's words, hand `I18nProvider` one
function at the root. It receives the key and the library's English for it, and answers the
application's text or the English it was given:

```tsx
import { I18nProvider, type Translate } from '@enonic/ui';

const translate: Translate = (key, { defaultValue, values = [] }) => {
  const phrase = phrases[key];
  if (phrase === undefined) return defaultValue;

  return phrase.replace(/\{(\d+)\}/g, (placeholder, i) => String(values[Number(i)] ?? placeholder));
};

<I18nProvider translate={translate}>
  <App />
</I18nProvider>;
```

A phrase the application supplies still carries the library's `{0}` placeholders, so fill them with
`values` — returning `phrases[key]` unformatted renders `Go to step {0}` verbatim. On a miss, return
`defaultValue`: never an empty string and never the key, or the `aria-label`s go blank.

`translate`'s identity is the only thing that re-renders the labels. Hoisting it out of the render is
right for a phrase bundle fixed at load; where the locale switches or the bundle arrives later, put
it in a `useMemo` keyed on that instead, or the labels keep their first wording.

`uiPhrases` lists every key with its English, for the application to add to its own phrase files
and check its bundle against. Texts the application supplies through props — a dialog title, an
item name — never pass through the provider.

## Dialog action shortcuts

Shortcuts are opt-in. Use `Dialog.Shortcut` inside `Dialog.Content` to register a primary action,
or set `shortcut='secondary'` for the secondary action. On macOS, Cmd+Enter activates primary and
Cmd+Shift+Enter activates secondary; on Windows and Linux, use Ctrl instead of Cmd. By default,
`Dialog.Shortcut` renders a native button. Set `asChild` to wrap `Button`, `Dialog.Close asChild`,
or `Stepper.Next/Previous asChild`; the child must forward its ref and props to a native button:

```tsx
<Dialog.Shortcut asChild shortcut='secondary'>
  <Dialog.Close asChild>
    <Button label='Cancel' />
  </Dialog.Close>
</Dialog.Shortcut>
<Dialog.Shortcut asChild pending={saving}>
  <Button label='Save' disabled={saving} onClick={save} />
</Dialog.Shortcut>
```

The shortcut calls the registered button's click path, preserving its click handler and close or
step behavior. `pending` blocks shortcut activation and sets `aria-busy`; it does not block an
ordinary click, so also disable the button while saving if clicks must be blocked. Disabled,
hidden, and unmounted actions do not respond to shortcuts. Only the topmost open dialog handles
shortcuts and Escape. Shortcut keys can come from its content or a registered portal. Modal dialogs
also accept keys from `<body>` or `document`, preserving shortcuts if a focused field loses
focus. Non-modal dialogs reject keys from outside their content and registered portals.
When a shortcut hides the focused step panel, focus moves to the dialog content.
If two actions use the same shortcut, the first registered action wins until it unregisters;
development builds warn.
Buttons keep their ordinary focus, Enter, and Space behavior.

Built-in widgets yield Cmd/Ctrl+Enter and Cmd/Ctrl+Shift+Enter to the topmost dialog when it owns
the event. Open selectors, date and time pickers, menus, context menus, menubar menus, and staged comboboxes keep Enter
local to select or apply values. Their closed controls yield to the dialog. Other widgets yield
before changing selection, opening popups, or activating items.
The dialog reserves these chords even when its action is missing, disabled, or pending. Outside
the dialog's content and registered portals, widget keyboard behavior stays unchanged. Plain
Enter, Shift+Enter, and modifier combinations the dialog does not own retain their existing behavior.

Use `shortcutEnabled={false}` to unregister a mounted action without disabling its button; set
it on inactive views when they share a shortcut. A disabled `Dialog.Shortcut` can render outside
`Dialog.Content`; enabled registration requires content. For platform-specific hints,
`getDialogShortcutKeys` returns
`Meta+Enter` / `Meta+Shift+Enter` on macOS and `Control+Enter` / `Control+Shift+Enter` elsewhere.
Separately bundled copies share a dialog stack when they use the same shortcut protocol; incompatible
protocol versions cannot coordinate their topmost scopes.

For a multi-step dialog, use `Dialog.StepIndicator keyboardShortcuts`. Previous is secondary;
Next is primary until the last step, where the final action becomes primary. Its `disabled` and
`pending` props suppress the corresponding shortcuts. Add visible shortcut hints where people
need to discover them.

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
