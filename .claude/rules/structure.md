---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Component Structure

## Folder Layout

```
src/components/button/
├── button.stories.tsx
├── button.tsx
└── index.ts
```

## Index Exports

Component's `index.ts`: export values first, types second on a separate line:

```typescript
// ✅
export { Button } from './button';
export type { ButtonProps } from './button';

// ❌ Avoid missing type export
export { Button } from './button';
```

`src/components/index.ts` barrel must re-export all component folders:

```typescript
export * from './button';
export * from './modal';
// Don't forget newly added components
```

## Context Providers

Extract to `src/providers/` with pattern: type → context (default `undefined`) → provider → hook.

```typescript
// src/providers/menu-provider.tsx
export type MenuContextValue = { open: boolean; setOpen: (open: boolean) => void };

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export const MenuProvider = ({ value, children }: { value: MenuContextValue; children?: ReactNode }) =>
  <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;

export const useMenu = (): MenuContextValue => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within a MenuProvider');
  return context;
};
```

- Default context value is `undefined`, never `null`
- Add new providers to `src/providers/index.ts`

## Import Patterns

Import components from their folder, **not** from the barrel `@/components` (enforced by `import/no-cycle`).

```typescript
// ✅ Import from component folder
import { IconButton } from '@/components/icon-button';

// ❌ DON'T: Barrel import
import { IconButton } from '@/components';
```

The barrel `@/components` is for external consumers only.
