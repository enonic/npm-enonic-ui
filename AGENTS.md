# @enonic/ui

UI component library for Preact 10 and React 19. TypeScript, Vite+ (oxc), Tailwind CSS v4, Storybook.

## Commands

```bash
pnpm check:fix  # vp check --fix (oxc format + lint), then typecheck. Run after making changes.
pnpm typecheck  # TypeScript only
pnpm test       # unit tests (vp test run, `src/**/*.test.ts`)
pnpm lint:fix   # oxlint with fixes (vp lint --fix)
pnpm format     # oxfmt write (vp fmt)
```

Linting and formatting run through Vite+ (`vp`); config lives in `vite.config.ts` (`lint`/`fmt`/`staged`/`test`).

`pnpm test` covers utilities only. Component behavior is covered by Storybook `play` functions: `pnpm test:storybook`
runs the stories tagged `interactions-smoke`.

## Read Before You Edit

| Area                                                             | Doc                                      |
| ---------------------------------------------------------------- | ---------------------------------------- |
| Component files, props, exports, providers, labels               | [docs/components.md](docs/components.md) |
| Focus traps, portals, click-outside, autofocus, dialog shortcuts | [docs/patterns.md](docs/patterns.md)     |
| Focus, effect timing, portals or events on either runtime        | [docs/runtimes.md](docs/runtimes.md)     |
| Classes, `cn`/`cv`, color tokens                                 | [docs/styling.md](docs/styling.md)       |
| Stories and `.storybook/`                                        | [docs/storybook.md](docs/storybook.md)   |

## Rules That Break Silently

- The package ships for both Preact 10 and React 19, but Storybook and CI run on Preact only. Consider any change to
  focus, effect timing, portals or click-outside on both runtimes. See [docs/runtimes.md](docs/runtimes.md)
- Import from `react`, never from `preact`. Use `ReactNode`, never `ComponentChildren`
- Import components from their folder (`@/components/button`), never from the `@/components` barrel
- Portaled overlays compare against `usePortalContainer()`, never `document.body`, or shadow-root consumers break
- Comment prefixes: `// !` marks a critical issue, `// ?` a question or unusual rationale, `// *` a section divider.
  Preserve them in code you touch

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
