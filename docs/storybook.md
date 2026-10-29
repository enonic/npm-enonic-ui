# Storybook

Storybook runs on `@storybook/preact-vite`, so stories render under Preact only. See [runtimes.md](runtimes.md).

## Story Grouping

Name stories with a `Group / Name` prefix. Standard groups, in order:

1. **Examples**: basic usage patterns
2. **States**: visual states (disabled, read-only, loading)
3. **Features**: specific capabilities and configurations
4. **Behavior**: interaction patterns and accessibility
5. **Specialized**: component-specific variants (Radio, Checkbox, Select)

```typescript
export const Basic: Story = { name: 'Examples / Basic', render: () => <Component /> };
export const Disabled: Story = { name: 'States / Disabled', render: () => <Component disabled /> };
export const AlignEnd: Story = { name: 'Features / Align End', render: () => <Component align='end' /> };
export const FocusNavigation: Story = { name: 'Behavior / Focus Navigation', render: () => <Component /> };
```

Create an `Interactive` story under Features for components with two or more variant props with multiple options. Skip
it for components with a single boolean prop.

## Story Wrappers

```typescript
// Standard wrapper with a description, useful for keyboard and interaction checks
render: () => (
  <div className='flex flex-col items-center gap-y-3 p-4'>
    <div className='max-w-120 text-sm text-subtle'>Brief description of what to try.</div>
    <Component />
  </div>
);

// Minimal when self-contained
render: () => <Component />;
```

Interactive stories keep state in a local `useState`, never in an external store.

## Interaction Smoke Tests

Stories tagged `interactions-smoke` run their `play` functions in CI through `pnpm test:storybook`.

## Vite Config (`viteFinal`)

`.storybook/main.ts` adjusts the Vite config Storybook merges from the root `vite.config.ts`. Each step is load-bearing:

- Drops the library-only plugins (`unplugin-dts`, `visualizer`)
- Replaces the `@storybook/react-dom-shim` alias with the absolute path of its React 18 entry. The preset misreads
  `preact/compat` as legacy React and points the shim at a bare specifier Vite cannot resolve
- Adds the `@` alias for `src/`
