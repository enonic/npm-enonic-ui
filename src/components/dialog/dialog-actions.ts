import { createContext } from 'react';

import { isShadowRoot } from '@/utils/dom';

export type DialogShortcutType = 'primary' | 'secondary';

export type DialogActionRegistration = {
  element: HTMLButtonElement | null;
  pending: boolean;
};

export type DialogActionScope = {
  parent: DialogActionScope | undefined;
  actions: Record<DialogShortcutType, DialogActionRegistration[]>;
  onEscape: (event: KeyboardEvent) => void;
  containsShortcutEvent: (event: KeyboardEvent) => boolean;
  getActionBoundaries: () => Element[];
  focusContent: () => void;
};

export const DialogActionContext = createContext<DialogActionScope | undefined>(undefined);

type DialogStack = { scopes: DialogActionScope[]; onKeyDown: (event: KeyboardEvent) => void };

// Share the stack across separately bundled copies of @enonic/ui in the same window.
// Bump this protocol version if scope shape or dispatch changes incompatibly: the first copy owns the listener.
const dialogStacksKey = Symbol.for('@enonic/ui/dialog-action-stacks/v1');
const sharedGlobal = globalThis as typeof globalThis & Record<symbol, WeakMap<Document, DialogStack> | undefined>;
const dialogStacks = (sharedGlobal[dialogStacksKey] ??= new WeakMap<Document, DialogStack>());

const isMac = (document: Document): boolean => /Mac|iPhone|iPad/i.test(document.defaultView?.navigator.platform ?? '');

export const getDialogShortcutKeys = (
  shortcut: DialogShortcutType,
  targetDocument: Document | undefined = typeof document === 'undefined' ? undefined : document,
): string => {
  const modifier = targetDocument != null && isMac(targetDocument) ? 'Meta' : 'Control';
  return `${modifier}+${shortcut === 'secondary' ? 'Shift+' : ''}Enter`;
};

const canActivate = (scope: DialogActionScope, { element, pending }: DialogActionRegistration): boolean => {
  if (element == null || pending || !element.isConnected || element.tagName !== 'BUTTON') return false;
  if (element.matches(':disabled') || element.getClientRects().length === 0) return false;

  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  if (style?.visibility === 'hidden' || style?.visibility === 'collapse') return false;

  // Stop at this dialog (or a registered portal), not at the host page's body.
  const boundaries = scope.getActionBoundaries();
  let ancestor: Element | null = element;
  while (ancestor != null) {
    if (
      ancestor.hasAttribute('hidden') ||
      ancestor.hasAttribute('inert') ||
      ancestor.getAttribute('aria-hidden') === 'true' ||
      ancestor.getAttribute('aria-disabled') === 'true' ||
      ancestor.getAttribute('aria-busy') === 'true' ||
      (boundaries.includes(ancestor) && ancestor.getAttribute('data-state') === 'closed')
    ) {
      return false;
    }
    if (boundaries.includes(ancestor)) return true;
    const root = ancestor.getRootNode();
    ancestor = ancestor.parentElement ?? (isShadowRoot(root) ? root.host : null);
  }
  return false;
};

const dispatchKeyDown = (document: Document, event: KeyboardEvent): void => {
  const scope = dialogStacks.get(document)?.scopes.at(-1);
  if (scope == null) return;

  if (event.key === 'Escape') {
    scope.onEscape(event);
    return;
  }

  if (event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229) return;
  if (event.key !== 'Enter' || event.altKey || event.getModifierState?.('AltGraph')) return;
  const hasModifier = isMac(document) ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
  if (!hasModifier || !scope.containsShortcutEvent(event)) return;

  // A disabled winner does not fall through to a duplicate or an underlying dialog.
  const action = scope.actions[event.shiftKey ? 'secondary' : 'primary'][0];
  if (action == null || !canActivate(scope, action)) return;
  event.preventDefault();
  const eventElements = event.composedPath().filter((target): target is Element => (target as Node).nodeType === 1);
  const originalTarget = eventElements[0];
  action.element?.click();
  // A hidden step can retain focus until after this frame. Move it before Chromium drops it to body.
  document.defaultView?.requestAnimationFrame(() => {
    if (dialogStacks.get(document)?.scopes.at(-1) !== scope) return;
    if (
      event.target !== document.body &&
      event.target !== document &&
      originalTarget?.isConnected &&
      !eventElements.some(element => element.matches('[hidden], [inert]'))
    ) {
      return;
    }
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement != null) active = active.shadowRoot.activeElement;
    if (active === originalTarget || active === document.body) {
      scope.focusContent();
    }
  });
};

const isDescendantScope = (scope: DialogActionScope, ancestor: DialogActionScope): boolean => {
  let parent = scope.parent;
  while (parent != null) {
    if (parent === ancestor) return true;
    parent = parent.parent;
  }
  return false;
};

/** One bubbling listener per document, shared by all open dialog content scopes. */
export const activateDialogScope = (document: Document, scope: DialogActionScope): (() => void) => {
  let stack = dialogStacks.get(document);
  if (stack == null) {
    stack = { scopes: [], onKeyDown: event => dispatchKeyDown(document, event) };
    dialogStacks.set(document, stack);
    document.addEventListener('keydown', stack.onKeyDown);
  }
  // Layout effects can register an initially open child before its parent.
  const { scopes } = stack;
  const childIndex = scopes.findIndex(candidate => isDescendantScope(candidate, scope));
  scopes.splice(childIndex < 0 ? scopes.length : childIndex, 0, scope);

  return () => {
    const index = scopes.indexOf(scope);
    if (index >= 0) scopes.splice(index, 1);
    if (scopes.length === 0) {
      document.removeEventListener('keydown', stack.onKeyDown);
      dialogStacks.delete(document);
    }
  };
};

export const registerDialogAction = (
  scope: DialogActionScope,
  shortcut: DialogShortcutType,
  action: DialogActionRegistration,
): (() => void) => {
  const actions = scope.actions[shortcut];
  if (actions.length > 0 && import.meta.env.DEV) {
    // oxlint-disable-next-line no-console -- Duplicate shortcuts are a consumer configuration error.
    console.warn(
      `Dialog.Shortcut: duplicate ${shortcut} action. The first registered action wins until it unregisters.`,
    );
  }
  actions.push(action);
  return () => {
    const index = actions.indexOf(action);
    if (index >= 0) actions.splice(index, 1);
  };
};
