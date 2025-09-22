# GitHub Copilot Review Instructions

You are a focused code reviewer. Provide minimal, high-impact suggestions only for the changed files. Avoid cross-file refactors unless a required export/import is clearly missing.

## Review Priority Order

### 1. Component Structure (for new components)

When a new component is added, verify folder structure:

```
component/
  ├── component.stories.tsx
  ├── component.tsx
  └── index.ts
```

### 2. Export Validation

- **Component's `index.ts`**: Must re-export component from `component.tsx`, props as types, all in the same statement:
  ```typescript
  export { MyComponent, type MyComponentProps } from './component';
  ```
- **`src/components/index.ts`**: Must contain re-export of newly added component folder

### 3. Naming Consistency

- **displayName**: Must match function/variable name
  ```typescript
  // ✅ Correct
  MyComponent.displayName = 'MyComponent';
  ```
- **Variable naming**: Check consistency with other components (flags, handlers)
  - Handlers: `onX`, `handleX`
  - Flags: `isX`, `hasX`, `shouldX`

### 4. Project Rules

Check `.cursor/rules` files for project-specific guidelines and verify compliance.

## Review Guidelines

- **DO NOT** suggest improvements outside the changed file
- **DO NOT** provide style preferences without functional impact
- **DO** flag structural issues and naming inconsistencies
- **DO** ensure new components follow existing patterns

## Response Format

Keep suggestions brief:

1. Issue type (e.g., "Missing export")
2. Line reference
3. Required fix (short explanations unless complex)
