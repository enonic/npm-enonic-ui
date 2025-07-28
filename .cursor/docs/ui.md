# UI Component Library

## Overview

A collection of reusable UI components built with Preact, TypeScript, and Tailwind CSS. Components follow a consistent design system with theming support for light and dark modes.

### Key Principles

- **Theme-based Design**: All colors and sizes reference the Tailwind theme defined in `style.css`
- **Consistent API**: Components share common patterns for props, variants, and sizes
- **Accessibility**: Focus management, ARIA attributes, and keyboard navigation
- **Class Composition**: Use `cn()` utility from `@/lib/utils` for combining class names

### File Structure

```
src/ui/
├── component-name/
│   ├── index.ts                   # Exports component and types
│   ├── component-name.tsx         # Component implementation
│   └── component-name.stories.tsx # Storybook stories
```

All components are re-exported from `src/index.ts`.

## Design System

### Typography

- **Base Font Size**: 16px (Tailwind default)
- **Font Weights**:
  - Regular text: `font-normal` (400)
  - Semi-bold text: `font-medium` (500)

### Colors

Color system is defined across multiple CSS files:

- `src/styles/color.css` - Base color palette
- `src/styles/light.css` - Light theme mappings
- `src/styles/dark.css` - Dark theme mappings

**Key Color Categories:**

- **Main**: main, subtle, alt, rev, surface-primary
- **Feedback**: info, warn, success, danger (with subtle and surface variants)
- **Borders**: subtle, soft, strong, danger
- **Buttons**: primary, secondary, tertiary (with hover variants)

### Disabled States

All disabled components apply:

- `opacity-30`
- `pointer-events-none`

## Components

### Button

Interactive button component supporting icons, multiple variants, and sizes.

#### Structure

```
┌─ startIcon? ─┬── label ──┬─ endIcon? ─┐
```

**Elements:**

- `startIcon` - Optional left icon (Lucide React)
- `label` - Button text content (required)
- `endIcon` - Optional right icon (Lucide React)

#### Sizes & Dimensions

| Size | Height | Padding | Gap  | Font Size | Icon Size |
| ---- | ------ | ------- | ---- | --------- | --------- |
| `sm` | 36px   | 0 14px  | 8px  | 14px      | 16px      |
| `md` | 40px   | 0 14px  | 10px | 16px      | 18px      |
| `lg` | 46px   | 0 16px  | 12px | 18px      | 20px      |

#### Variants

| Variant          | Description              | Theme Reference         |
| ---------------- | ------------------------ | ----------------------- |
| `text` (default) | Minimal styling          | Primary button          |
| `filled`         | Light background         | Secondary button        |
| `solid`          | Strong background        | Tertiary button         |
| `outline`        | Text variant with border | Primary + strong border |

#### States

- **Default**: Base appearance
- **Hover**: Background color shifts one tier
- **Active**: Active background, reversed text color
- **Disabled**: 30% opacity, no pointer events

#### Props

- **variant** - Visual style: text (minimal), filled (light background), solid (strong background), outline (with border)
- **size** - Button dimensions: sm, md, lg
- **startIcon** - Optional icon on the left side
- **label** - Required button text content
- **endIcon** - Optional icon on the right side
- **title** - Tooltip text for accessibility
- **disabled** - Prevents interaction and applies disabled styling
- **onClick** - Click handler function
- **className** - Additional CSS classes

### IconButton

Square or round button containing only an icon. Extends Button component functionality.

#### Structure

```
┌─ icon ─┐
```

**Elements:**

- `icon` - Lucide React icon (required)

#### Dimensions

Maintains same height/width for each size:

| Size | Dimensions |
| ---- | ---------- |
| `sm` | 36×36px    |
| `md` | 40×40px    |
| `lg` | 46×46px    |

#### Shape Options

- `square` (default) - `rounded-sm` (4px radius)
- `round` - `rounded-full` (50% radius)

#### Implementation Note

IconButton wraps the Button component with:

- `startIcon` set to the provided icon
- `label` set to empty string
- Custom padding (`p-0`) and dimensions

#### Props

- **variant** - Visual style: same options as Button component
- **size** - Button dimensions: sm, md, lg
- **shape** - Button form: square (default) or round
- **icon** - Required Lucide React icon
- **title** - Tooltip text for accessibility
- **disabled** - Prevents interaction and applies disabled styling
- **onClick** - Click handler function
- **className** - Additional CSS classes

### Input

Comprehensive text input component with label, description, addons, and validation.

#### Structure

```
[🔒] Label?
Description?
┌─ startAddon? ─┬────── value ──────┬─ endAddon? ─┐
└──────────── error message? ─────────────────────┘
```

**Elements:**

- `label` - Optional field label with lock icon when readonly
- `description` - Optional helper text below label
- `input` - Native input element
- `startAddon`/`endAddon` - Optional prefix/suffix content
- `error` - Validation message with alert icon

#### Styling

- **Border Radius**: 4px (`rounded-sm`)
- **Icon Spacing**: 4px gap between icons and text
- **Addon Separation**: Visual border between addons and input

#### States

| State        | Border        | Background          | Text      |
| ------------ | ------------- | ------------------- | --------- |
| Default      | Subtle border | Standard background | Main text |
| Active/Focus | Strong border | Standard background | Main text |
| Error        | Danger border | Standard background | Main text |
| Disabled     | -             | Disabled background | -         |
| Readonly     | -             | Primary surface     | -         |

#### Props

- **label** - Optional field label text
- **description** - Optional helper text displayed below label
- **placeholder** - Input placeholder text
- **error** - Validation message that triggers error state when present
- **startAddon** - Optional prefix content (string or component)
- **endAddon** - Optional suffix content (string or component)
- **disabled** - Prevents interaction and applies disabled styling
- **readonly** - Makes field non-editable with readonly styling
- **className** - Additional CSS classes
- Plus standard HTML input attributes (value, onChange, etc.)

**Addon Behavior:**

- String addons render with primary surface background
- Component addons render as-is with no additional styling

### Tooltip

Tooltip component with customizable position and content.

#### Structure

```
┌─ trigger ─┐
└─ content ─┘
```

**Elements:**

- `trigger` - is a child component, that works like Slot in Radix UI with a `asChild` behavior by default. It accepts any component as a child and smarlty attaches logic to it, using it as a component to trigger the tooltip on.
- `content` - is a component that will be rendered as a tooltip. It can be a string or a component.

#### Styling

- **Border Radius**: 4px (`rounded-sm`)
- **Arrow**: a small triangle that points to the trigger element.
- **Animation**: smooth transition when the tooltip is shown, shadcn/ui style.

#### Props

- **position** - tooltip position: top, bottom
- **children** - trigger and content components.
