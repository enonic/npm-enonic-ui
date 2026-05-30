---
paths:
  - "**/*.{ts,tsx}"
---

# TypeScript Coding Standards

## Code Style

```typescript
// ✅ Check for both null and undefined with != null
if (response != null) { /* safe to use */ }

// ❌ No nested ternaries — use if/else or switch/case
const status = isLoading ? 'loading' : isError ? 'error' : 'idle'; // Bad

// ✅ Single-line guard clauses (no braces)
if (element == null) return;
if (!isSupported) return false;
```

## Naming

```typescript
// ✅ Stores use $ prefix
export const $counter = atom(0);

// ✅ Standalone booleans: is/has/can/should/will prefix
const isEnabled = true;
const hasFocus = false;

// ✅ Object/React props: drop the prefix
const state = { enabled: true };
interface ButtonProps {
  disabled?: boolean;  // Not 'isDisabled'
  loading?: boolean;   // Not 'isLoading'
  onClick?: () => void;
  onChange?: (value: string) => void;
}

// ✅ Internal handlers: handle prefix; event props: on prefix
const handleClick = () => { onClick?.(); };

// ✅ Standard prop names
interface InputProps {
  value?: string;         // Not 'text' or 'content'
  defaultValue?: string;  // Not 'initialText'
  onChange?: (value: string) => void; // Not 'onUpdate'
}

// ✅ Constants: UPPERCASE_WITH_UNDERSCORES
const TIMEOUT_MS = 30_000;
```

## Type Definitions

```typescript
// ✅ Prefer type over interface for object shapes
type User = { id: string; name: string };

// ✅ T[] not Array<T>
type Users = User[];

// ❌ Avoid any — use unknown + type guards
const data: unknown = fetchData();
if (isUser(data)) { /* TypeScript knows data is User */ }

// ❌ Avoid type assertions with 'as'
const user = {} as User; // Bad
// ✅ Use Partial<T> or type guards instead
const user: Partial<User> = {};

// ❌ Avoid non-null assertion '!'
const value = getUserInput()!; // Bad
// ✅ Use optional chaining or guard clauses
const value = getUserInput() ?? defaultValue;

// ✅ Use satisfies for precise literal types
const options = { retry: 3, timeout: 5000 } satisfies RequestOptions;

// ✅ Define Maybe<T> for nullish values
type Maybe<T> = T | null | undefined;

// ✅ Prefer undefined over null for unset values
const [activeId, setActiveId] = useState<string | undefined>(undefined);
const context = createContext<MenuContextValue | undefined>(undefined);

// ✅ Exception: refs use null (React convention)
const ref = useRef<HTMLDivElement | null>(null);
```

## Type Composition

```typescript
// ✅ Use regular imports for types — avoid inline dynamic imports
import { MenuContextOperations } from '../primitives/menu-primitive';

// ✅ Compose: define base "own" types, then extend
type MenuItemOwnProps = {
  id?: string;
  disabled?: boolean;
} & ComponentPropsWithoutRef<'div'>;

type MenuPrimitiveItemProps = MenuItemOwnProps & MenuContextOperations;
export type MenuItemProps = MenuItemOwnProps; // Consumer-facing type is clean

// ❌ Avoid Omit gymnastics — especially nested Omit
export type RadioItemProps = Omit<
  PrimitiveRadioItemProps,
  keyof Omit<MenuContextOperations, 'setOpen'>
>; // Bad — restructure the types instead
```

## Function Signatures

- Explicit return types for exported functions
- Prefer arrow functions for one-line helpers

## Imports & Exports

- Named exports preferred; no default exports in component files
- Import from component folder (`@/components/icon-button`), not from barrel (`@/components`); enforced by `import/no-cycle`
- Use `@/` alias for cross-directory imports; relative paths only within the same directory
