# @enonic/ui

UI Component Library. Preact 10, TypeScript, Vite, Tailwind CSS v4, Storybook.

## Commands

```bash
pnpm check:fix    # Verify changes: typecheck + lint + format (with auto-fix)
pnpm build        # Build library
pnpm dev          # Run Storybook dev server (port 6006)
pnpm release:dry  # Validate release (dry run)
```

Individual checks:
```bash
pnpm typecheck    # TypeScript only
pnpm lint:fix     # Biome + ESLint with fixes
pnpm format       # Biome format
```

Tests not implemented: `pnpm test` and `pnpm test:ci` are no-op.

## Critical Constraints

- Preact with React compat layer (preact/compat). Radix UI ref type mismatches expected.
- Target: ECMAScript 2022
- TypeScript required for all code
- Tailwind CSS v4 with `data-theme` attribute for dark mode

## Code Standards

Detailed rules in `.cursor/rules/`:
- `npm-scripts.mdc` - Available scripts reference
- `preact.mdc` - Preact/React compatibility
- `react.mdc` - Component patterns
- `typescript.mdc` - Type definitions
- `tailwind.mdc` - Styling conventions
- `storybook.mdc` - Story organization
- `structure.mdc` - File structure
- `comments.mdc` - Documentation style

## Skills

- `npm-release` - Release to npm
- `issue-writer` - Create or modify GitHub issues

## Release

Package: `@enonic/ui`. Published via GitHub Actions on `v*` tags.

## External Docs

Use Context7 MCP for Preact, Tailwind CSS v4, Vite, Storybook documentation.
Request specific topics, not full manuals.

For large R&D tasks, use `docs-finder` skill to search documentation effectively.
