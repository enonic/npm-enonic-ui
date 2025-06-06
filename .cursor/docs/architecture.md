# Component Library Architecture

## Overview

Design-token-driven component system that ships **layered assets**—pure styles, Preact-authored components, or React-compatible re-exports—targeted at Enonic XP front-end applications of varying vintages. The library maintains a strict "stateless-by-default" philosophy and exposes behavioural hooks only for local UI concerns, delegating cross-component coordination to nanostores.

## Core Layers

- **Design-Token Layer**
  Source of truth for color, spacing, typography, motion. Exposed as CSS variables and TypeScript enums for compile-time safety.
  _Constraint_: No hard-coded values in components; every visual primitive maps to a token.

- **Style Layer**
  Generated CSS bundle comprising utility-first classes (`tw-*`) and shallow BEM component classes (`c-button`, `c-modal__header`). Published as standalone package entry (`dist/styles.css`).
  _Constraint_: Organized via CSS `@layer` so product teams can inject overrides after library styles.

- **Component Layer**
  Functional, hook-based units written in TSX, compiled to both Preact and React-compatible ES modules. Minimal internal state (open/close, focus, hover).
  _Constraint_: No data fetching or global side-effects. Emits events / callbacks for state changes.

- **Integration Layer**
  Type-safe helpers for Enonic XP (e.g., XP portal fragment wrappers), plus roll-up typings for peer-frameworks.
  _Constraint_: Integration code resides in an isolated sub-package (`/xp`).

## Architecture Decision Records (ADR)

1. **Dual-Entry Distribution (`style-only` vs `components`)**
   Allows legacy XP apps to consume the theme without bundle bloat while enabling modern apps to import ready-made UI pieces.

2. **Preact as Runtime, React as Dev Peer**
   Preact renders production bundles (≈3 kB gzipped) yet exposes a `compat` bridge so components surface as `React.ComponentType`, enabling seamless use inside existing React codebases and ESLint React rules.

3. **Framework-Agnostic Orchestration via Nanostores**
   Tiny (<1 kB), tree-shakable stores coordinate cross-component state without imposing a global provider or tying to React context.

4. **Utility-First + BEM Hybrid Styling**
   Utility classes handle layout/spacing variants for rapid composition; BEM scopes core, low-specificity rules, preventing cascade leaks.

5. **Strict Statelessness Contract**
   Library owns only ephemeral UI state; business or session state flows in via props or external store. This guarantees predictability and SSR friendliness.

6. **Accessibility First, ARIA Second**
   Components default to semantic elements (`<button>`, `<dialog>`, `<nav>`) and enrich with ARIA roles/states only where semantics fall short, following WAI-ARIA Authoring Practices.

## Technology Stack

- **Authoring**: TypeScript 5, JSX/TSX
- **Runtime**: Preact 11 (`preact/compat` fallback for React)
- **State**: Nanostores (`atom`, `map`)
- **Styling**: PostCSS + Tailwind-like plugin, CSS `@layer`, Design Tokens pipeline (Style Dictionary)
- **Bundling**: Vite (ESM + type declarations) with separate outputs:
  - `dist/styles.css` (plain CSS)
  - `dist/preact/*.mjs` (peer dep: `preact`)
  - `dist/react/*.mjs` (peer dep: `react`, internally aliased to `preact/compat`)
- **Linting**: ESLint 9, `eslint-config-react` presets (JSX rules)
- **Testing**: Jest+SWC + @testing-library/react (run under `preact/compat`)
- **CI**: GitHub Actions — type check ➔ lint ➔ test ➔ build ➔ publish

## Distribution Strategy

1. **Style-only Consumers**

```html
<link rel="stylesheet" href="https://cdn.example.com/ui/1.0.0/styles.css" />
```

Components are authored separately within the host XP app but rely on shared variables and utility classes.

2. **Preact Consumers**

```ts
import {Button} from '@org/ui/preact';
import '@org/ui/styles.css';
```

3. **React Consumers**

```ts
import {Button} from '@org/ui/react';
```

Alias layer maps React runtime calls to Preact internals transparently, so existing React apps adopt the library without additional peer deps.

## Contribution Workflow

1. **Design Token Change** -> Regenerate CSS vars & TS enums

2. **Component Scaffold (pnpm new component)** -> Generates TSX, SCSS module, test setup with accessibility checklist

3. **PR Checks:**

- TypeScript strict mode
- ESLint + Prettier
- a11y snapshot via Axe-Core
- Bundle size guard (size-limit)

## Future Enhancements

- **Theming Runtime Helper:** small JS helper to swap CSS variable sets at run-time for dark/light or brand skins
- **Code-gen CLI:** extract Figma tokens -> Style Dictionary -> library tokens automatically
