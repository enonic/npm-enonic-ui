---
paths:
  - "**/*.{ts,tsx}"
---

# Commenting Rules

## Special Single-Line Prefixes

- `// ! ` — critical issues: bugs, security risks, breaking changes
  ```ts
  // ! Potential race condition if fetch retries here
  ```

- `// ? ` — questions, uncertainties, or rationale for unusual patterns
  ```ts
  // ? May need to memoize this selector when call becomes too heavy
  ```

- `// * ` — logical block separator in large files; surround with blank comment lines
  ```ts
  //
  // * REST Utils
  //
  ```

  In composite components, use to separate each subcomponent:
  ```tsx
  //
  // * MenuRoot
  //

  export type MenuRootProps = { /* ... */ };
  const MenuRoot = ({ /* ... */ }) => { /* ... */ };

  //
  // * MenuTrigger
  //
  ```

- `// TODO: ` — actionable future work; start with imperative verb, reference issue if possible
  ```ts
  // TODO: [#123] Replace mock with live API
  ```

**Rules:**
- Never combine prefixes (e.g. `// ! TODO`) — pick the one that best conveys intent
- Use `// *` to separate subcomponents in composite components; avoid in simple components
- Section headers ≤ 4 words

## Comment Placement & Density

- Comment only non-obvious logic: algorithms, workarounds, edge cases
- Avoid commenting trivial code
- Prefer JSDoc/TSDoc for public APIs over inline prose
- Keep comment lines ≤ 80 characters

## Maintenance

- Update or delete comments when code changes — stale comments are worse than none
- Promote resolved `// TODO:` items to commits and remove the tag
- Convert answered `// ?` questions into docs once clarified
