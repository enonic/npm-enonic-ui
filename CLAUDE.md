# @enonic/ui

UI Component Library. Preact 10, TypeScript, Vite, Tailwind CSS v4, Storybook.

## Commands

```bash
pnpm check:fix  # Typecheck + lint + format with auto-fix. Run after making changes.
pnpm typecheck  # TypeScript only
pnpm lint:fix   # Biome + ESLint with fixes
```

`pnpm test` is a no-op — tests not implemented.

## Constraints

- Preact with React compat layer (`preact/compat`). Radix UI ref type mismatches expected.
- Tailwind CSS v4. Dark mode via `.dark` class (`@custom-variant`).

## Docs

Use Context7 MCP for Preact, Tailwind CSS v4, Vite, Storybook. Request specific topics.

## Git & GitHub

No conventional commit prefixes. Plain descriptive language throughout.

### Issues

- **Title**: 80 chars or less. Component-specific: `Button: add disabled state`. General: `Add MyComponent`
- **Body**:
  ```
  <4–8 sentence description: what, what's affected, how to reproduce, impact>

  #### Rationale
  <why this needs to be fixed or implemented>

  #### References            ← optional
  #### Implementation Notes  ← optional

  <sub>*Drafted with AI assistance*</sub>
  ```

### Commits

- **With issue**: `<Issue Title> #<number>` — e.g. `Button: add disabled state #12`
- **Without issue**: capitalized plain English — e.g. `Fix Tooltip background color in dark mode`
- **Body** (optional): past tense, one change per paragraph, blank line between each, backticks for code refs. No `-` bullets.

### Pull Requests

- **Title**: `<Issue Title> #<number>` — matches the commit title
- **Body**:
  ```
  <summary of changes>

  Closes #<number>

  [Claude Code session](<link>)  ← optional

  <sub>*Drafted with AI assistance*</sub>
  ```
