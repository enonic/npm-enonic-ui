---
paths:
  - "src/**/*.tsx"
---

# UI Patterns

## Click Target Expansion via Pseudo-Element

Extend clickable area to fill gaps between list items using `::after` pseudo-element.

**Pattern:** `'after:inset-x-0 after:-inset-y-{n} after:-z-10 after:pointer-events-auto after:absolute after:rounded-sm after:content-[""]'`

**Formula:** `-inset-y-{n}` where `n = gap / 2`

| Container Gap | Item Inset |
|---------------|------------|
| `gap-y-1` | `after:-inset-y-0.5` |
| `gap-y-1.5` | `after:-inset-y-0.75` |
| `gap-y-2` | `after:-inset-y-1` |

### When NOT to Use

- **Virtualized lists**: Absolute positioning clips overflow
- **Adjacent items with no gaps**: Pattern not needed (e.g., Menu items)
- **Horizontal expansion**: Never use `-inset-x-*` (causes overflow)

### Current Usage

| Component | Container Gap | Item Pattern |
|-----------|---------------|--------------|
| TreeList.Row | `gap-y-1.5` | `after:-inset-y-0.75` |
| TreeListContent.Row | `gap-y-1` | `after:-inset-y-0.5` |
| Listbox Item | `gap-y-1` | `after:-inset-y-0.5` |
| Selector Item | `gap-y-1` | `after:-inset-y-0.5` |
| Checkbox (unlabeled) | N/A | `after:-inset-1` (standalone touch target) |
| Menu Items | No gap | Pattern removed |

## Focus Ring on Inverse Backgrounds

When a focusable element appears on an inverse/selected background (e.g., inside a menu item with `data-tone="inverse"`), override the focus ring colors to match:

```tsx
'group-data-[tone=inverse]:[--color-ring-offset:var(--color-surface-selected)]'
'group-data-[tone=inverse]:[--color-ring:var(--color-ring-alt)]'
```

**Why:** The focus ring has a 3px offset (`ring-offset-3`). Without this override it shows as a jarring light stripe on dark backgrounds.

| Component | Context |
|-----------|---------|
| Button | Inside tree list rows with `data-tone="inverse"` |
| Checkbox | Inside menu items with `data-tone="inverse"` |

## Focus Trap with Portaled Content

When using portaled components (e.g., `Combobox.Portal`) inside a `Dialog`, the focus trap must include the portaled content — otherwise focus cannot move to elements rendered outside the dialog DOM.

### Solution

Use `usePortalFocusContainer` hook — portaled components register themselves with the parent focus trap.

**How it works:**
1. `Dialog.Content` creates a `FocusContainerRegistry` via `FocusContainerContext`
2. Portaled popups call `usePortalFocusContainer` to register with the registry
3. `Dialog.Content` passes registered containers to `FocusTrap` via `containerElements`

### Implementation

When adding new portaled components inside dialogs:

```tsx
const contentRef = useRef<HTMLDivElement>(null);
const [isPortalMode, setIsPortalMode] = useState(false);
const portalContainer = usePortalContainer();

useLayoutEffect(() => {
  if (!open || !contentRef.current) return;
  setIsPortalMode(contentRef.current.parentElement === portalContainer);
}, [open, portalContainer]);

usePortalFocusContainer(contentRef, isPortalMode);
```

The comparison target is `usePortalContainer()` — `document.body` by default, or the layer a
`PortalProvider` (typically `AppRoot` inside a shadow root) supplies. Comparing against
`document.body` directly breaks every shadow-root consumer: the check silently turns false and
disables focus-trap registration, floating positioning and click-outside in one stroke.

Known limitation: `usePortalContainer()` in `*.Content` does not see a `container` prop passed to
the sibling `*.Portal`, so a consumer-supplied container still reads as not-portal-mode. This
predates the provider and applies equally to the old `document.body` check.

## Portal Containers

`usePortalContainer(container?)` resolves where an overlay portals to: explicit prop → nearest
`PortalProvider` → `document.body`. It returns `HTMLElement | null`, and `null` means there is no
document yet (server render). Guard it alongside the existing mount gate — never call `createPortal`
with it unchecked:

```tsx
const resolvedContainer = usePortalContainer(container);
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted || resolvedContainer == null || (!forceMount && !open)) {
  return null;
}

return createPortal(children, resolvedContainer);
```

Resolving during render is what makes the guard necessary: reading `document.body` unconditionally
is exactly what the mount gate exists to avoid.

| Portals through `usePortalContainer` |
|--------------------------------------|
| `Combobox.Portal`, `ContextMenu.Portal`, `DatePicker.Portal`, `Dialog.Portal`, `Menu.Portal`, `Menubar.Portal` |
| `Selector.Content` (portals inline, no `*.Portal` part) |
| `Tooltip` (portals its content directly) |

### Current Usage

| Component | Registers With Focus Trap |
|-----------|---------------------------|
| `Combobox.Popup` | ✅ Yes |
| `Menu.Content` | ✅ Yes |
| `ContextMenu.Content` | ✅ Yes |
| `DatePicker.Content` | ✅ Yes |
| `Selector.Content` | ✅ Yes |
| `Menubar.Content` | ✅ Yes |
| `Dialog.Content` | Has own trap (provider) |
| `Tooltip.Content` | No (non-interactive) |

Files: `src/hooks/use-portal-focus-container.ts`, `src/providers/focus-container-provider.tsx`

## Click Outside Ignore for Global Portaled Content

When a component renders via portal **outside** any dismissible UI's React tree (e.g., global notifications), add `data-click-outside-ignore` to prevent `useClickOutside` from firing:

```tsx
<div data-click-outside-ignore>
  {/* Content that should never dismiss other UI */}
</div>
```

| Use `data-click-outside-ignore` | Use `usePortalFocusContainer` instead |
|---------------------------------|---------------------------------------|
| Outside dismissible UI's React tree (global toasts) | Inside React tree but portaled (dropdowns) |
| No focus trap involvement | Must participate in parent's focus trap |

| Component | Attribute Location |
|-----------|--------------------|
| `Toast` | Root `<div>` in `ToastRoot` |
