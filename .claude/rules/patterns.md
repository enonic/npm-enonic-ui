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

useLayoutEffect(() => {
  if (!open || !contentRef.current) return;
  setIsPortalMode(contentRef.current.parentElement === document.body);
}, [open]);

usePortalFocusContainer(contentRef, isPortalMode);
```

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
