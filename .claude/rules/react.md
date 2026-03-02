---
paths:
  - "**/*.tsx"
---

# React Component Standards

## Component Structure

```typescript
export type MyComponentProps = {
  title: string;
  active?: boolean;     // Drop is/has prefix for boolean props
  className?: string;   // className and children go last
  children?: ReactNode;
};

export const MyComponent = ({
  title,
  active = false,
  className,
  children,
}: MyComponentProps): ReactElement => {
  // 1. Store/ref hooks first
  const containerRef = useRef<HTMLDivElement>(null);

  // 2. State, memo, other hooks
  const [count, setCount] = useState(0);

  // 3. Effects last among hooks
  useEffect(() => { /* side-effect */ }, []);

  // 4. Derived state / business logic
  const isActive = count > 0;

  // 5. Class variables right before return
  const classNames = cn('p-4 rounded shadow', active && 'bg-blue-500', className);

  // 6. Early return (after class preparation)
  if (!isActive) return null;

  return (
    <div className={classNames}>
      <h1>{title}</h1>
      {children}
    </div>
  );
};

MyComponent.displayName = 'MyComponent';
```

Rules:
- No default exports
- Always define and export Props from the same file, named `{ComponentName}Props`
- Put `className?` and `children?` last in Props definitions
- Arrow functions require an explicit `displayName`; function declarations do not

## Early Return

```typescript
// ❌ DON'T: Wrap conditional content in fragments
const MyContent = ({ isReady }: Props) => {
  return <>{isReady && <div>Content</div>}</>;
};

// ✅ DO: Return early with null
const MyContent = ({ isReady }: Props) => {
  if (!isReady) return null;
  return <div>Content</div>;
};
```

## displayName

Arrow functions, `memo()`, and `forwardRef()` must have `displayName` set. Function declarations do not need it.

```typescript
// ✅ Arrow function
export const Button = ({ children }: ButtonProps) => <button>{children}</button>;
Button.displayName = 'Button';

// ✅ memo()
export const List = React.memo(({ items }: Props) => <ul>...</ul>);
List.displayName = 'List';

// ✅ forwardRef()
export const Input = React.forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} />);
Input.displayName = 'Input';

// ✅ Function declaration — displayName not needed
export function UserCard({ name }: Props) { return <div>{name}</div>; }
```

## useEffect: Initialization vs Update Gotcha

```typescript
// ❌ DON'T: Early return that blocks re-execution
useEffect(() => {
  if (instanceRef.current) return; // Bug! When items changes, effect exits early
  instanceRef.current = createInstance();
  instanceRef.current.setItems(items); // Never called on items change!
}, [items]);

// ✅ DO: Separate initialization from updates
useEffect(() => {
  if (!instanceRef.current) {
    instanceRef.current = createInstance();
  }
  instanceRef.current.setItems(items); // Always runs when items changes
}, [items]);
```

## Refs in Dependency Arrays

```typescript
// ❌ DON'T: Put ref.current in dependency arrays
useEffect(() => {
  contentRef.current?.focus();
}, [contentRef.current]); // Wrong! .current changes don't trigger re-render

// ✅ DO: Omit from deps, check .current inside
useEffect(() => {
  contentRef.current?.focus();
}, []);

// ❌ DON'T: Wrap rest-param array in another array
function useComposedRefs<T>(...refs: Ref<T>[]) {
  return useCallback((node: T) => {
    refs.forEach(ref => setRef(ref, node));
  }, [refs]); // Wrong! [refs] !== [refs] on every render
}

// ✅ DO: Use the array directly as deps (with biome-ignore if needed)
function useComposedRefs<T>(...refs: Ref<T>[]) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: refs spread as deps
  return useCallback((node: T) => {
    refs.forEach(ref => setRef(ref, node));
  }, refs);
}
```

## Extending Component Props

```typescript
// ✅ ComponentPropsWithoutRef for standard components
type ButtonProps = {
  variant?: 'primary' | 'secondary';
} & ComponentPropsWithoutRef<'button'>;

// ✅ ComponentPropsWithRef when forwarding refs
type InputProps = {
  label?: string;
} & ComponentPropsWithRef<'input'>;

// ❌ Avoid ComponentProps — doesn't distinguish ref handling
type BadProps = { value: string } & ComponentProps<'input'>;
```
