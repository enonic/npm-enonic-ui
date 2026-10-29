# Components

## Folder Layout

```
src/components/button/
├── button.stories.tsx
├── button.tsx
└── index.ts
```

Compound components keep their parts in the same folder. Shared context lives in `src/providers/`.

## Index Exports

A component's `index.ts` exports the component and its `{Name}Props` type:

```typescript
export { Button, type ButtonProps } from './button';
```

`src/components/index.ts` re-exports every component folder. Add new components there.

## Import Patterns

Import components from their folder, **not** from the barrel `@/components` (enforced by `import/no-cycle`). The barrel is
for external consumers only.

```typescript
// ✅
import { IconButton } from '@/components/icon-button';

// ❌
import { IconButton } from '@/components';
```

Use the `@/` alias for cross-directory imports, relative paths only within the same directory.

## Component Shape

```typescript
export type MyComponentProps = {
  title: string;
  active?: boolean;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

export const MyComponent = ({ title, active = false, className, children, ...props }: MyComponentProps): ReactElement => {
  const classNames = cn('rounded p-4', active && 'bg-surface-selected', className);

  return (
    <div className={classNames} {...props}>
      <h1>{title}</h1>
      {children}
    </div>
  );
};

MyComponent.displayName = 'MyComponent';
```

- Named exports only, no default exports
- Define and export the props type from the component file, named `{ComponentName}Props`
- `className?` and `children?` go last in the props type
- Arrow functions, `memo()` and `forwardRef()` set `displayName`; function declarations do not need it
- Extend native props with `ComponentPropsWithoutRef<'tag'>`, or `ComponentPropsWithRef<'tag'>` when forwarding a ref.
  Avoid plain `ComponentProps`, which does not say how the ref is handled
- Return `null` early instead of wrapping conditional content in a fragment

## Prop Naming

- Boolean props drop the `is`/`has` prefix: `disabled`, `loading`, `active`, not `isDisabled`. Local boolean variables
  keep it: `const isOpen = ...`
- Event props use `on*`, internal handlers use `handle*`
- Standard names: `value`, `defaultValue`, `onChange`, not `text`, `initialText`, `onUpdate`
- Unset values are `undefined`, not `null`. Refs are the exception and start at `null`

## Context Providers

Extract to `src/providers/` with the pattern type → context → provider → hook, and add the provider to
`src/providers/index.ts`.

```typescript
// src/providers/menu-provider.tsx
export type MenuContextValue = { open: boolean; setOpen: (open: boolean) => void };

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export const MenuProvider = ({ value, children }: { value: MenuContextValue; children?: ReactNode }) => (
  <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
);

export const useMenu = (): MenuContextValue => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within a MenuProvider');
  return context;
};
```

The default context value is `undefined`, and the hook throws outside the provider. Two exceptions:

- A context whose absence is a valid state defaults to `null`, and its hook returns `null` instead of throwing
  (`FocusContainerContext`, `DialogFocusContext`)
- `I18nContext` defaults to `passthrough`, so a component renders English outside any provider

## Labels

Every string a component renders on its own (an `aria-label`, a `title`, a placeholder default) lives in a fragment
beside the component and reaches the JSX through `usePhrases`:

```typescript
// src/components/dialog/dialog.phrases.ts
export const dialogPhrases = {
  'enonic.ui.dialog.close': 'Close',
} as const;

// src/components/dialog/dialog.tsx
const t = usePhrases(dialogPhrases);
<IconButton aria-label={t('enonic.ui.dialog.close')} />
```

- Keys are `enonic.ui.<component>.<name>`, the component in camelCase
- Register the fragment in `src/i18n/phrases.ts`; `mergePhrases` throws on a key declared twice
- A text the consumer supplies through a prop wins: `placeholder ?? t('enonic.ui.searchField.placeholder')`
- No plural forms: a phrase that varies with a count is two keys, `.single` and `.multiple`
