# UI

## Overview

The UI library is a collection of components that are used to build the UI of the application.

Always refer to styles defined in Tailwind theme (usually in `style.css` file) for the most up-to-date information. Use theme colors, sizes, etc. when possible.

HTML font size is set to `16px` and follows the Tailwind theme.

## Components

### Button

The button component is a simple button that can be used to trigger an action.

- Border radius is `4px` (`.rounded-sm`).
- Box sizing is `border-box`.
- Display is `inline-flex`.
- Content is always centered.

#### Sizes

Button sizes are defined in the `size` property.

- `sm` – Small button
  - Height is fixed to `36px`.
  - Padding is `0 14px`.
  - Gap is `8px`.
  - Font size is `14px`.
- `md` (default) – Medium button
  - Height is fixed to `40px`.
  - Padding is `0 14px`.
  - Gap is `10px`.
  - Font size is `16px` (default).
- `lg` – Large button
  - Height is fixed to `46px`.
  - Padding is `0 16px`.
  - Gap is `12px`.
  - Font size is `18px`.

#### States

States are NOT defined in a property, but rather reflect CSS pseudo-classes.

- `default` – Default state.
- `:hover` – Hover state. For b&w color buttons, this will change the background color 1 tier higher. For example, `grey-50` will become `grey-100` for light theme, and `grey-900` will become `grey-800` for dark theme.
- `:active` – Active state. Same background color for all variants, always reversed text color (opposite of `default`).
- `:disabled` – Disabled state. Set's the button opacity to `0.3`.

#### Variants

Button variants are defined in the `variant` property.

- `text` (default) – References in theme as `primary`.
- `filled` – References in theme as `secondary`.
- `solid` – References in theme as `tertiary`.x
- `outline` – Same as `text` variant, but with a border.

#### Structure

Button can contain:

- icon – An icon, that's always on the left. Can be any icon from `lucide-react` library, or component. Usually accepts either `string` lucide icon name, icon from `lucide-react`, or `JSX.Element`.
- label – always in the center. Can be a string, or a component.
- dropdown – always on the right. Right now we only render a dropdown icon, but in the future we might render a spinner or other icons there. Not customizable for now, can be displayed or not.

#### Props

- `icon` – An icon, that's always on the left. Can be any icon from `lucide-react` library, or component. Usually accepts either `string` lucide icon name, component from `lucide-react`, or `Element`.
- `label` – always in the center. Can be a string, or a component.
- `dropdown` – always on the right. Can be a component, or a string.
