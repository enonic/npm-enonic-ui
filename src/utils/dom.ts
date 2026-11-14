const DOCUMENT_FRAGMENT_NODE = 11;

/**
 * Whether a node is a shadow root. Checked by shape rather than `instanceof`, which only recognises
 * the realm the library was loaded in — a root owned by an iframe document would not match.
 */
export const isShadowRoot = (node: Node | null | undefined): node is ShadowRoot =>
  node?.nodeType === DOCUMENT_FRAGMENT_NODE && 'host' in node;

const isDomRoot = (node: Node): node is Document | ShadowRoot =>
  typeof (node as Partial<Document>).getElementById === 'function';

/**
 * The document or shadow root a node lives in — the scope id and selector lookups must go through,
 * since `document.getElementById` stops at a shadow boundary.
 *
 * `null` when there is nothing to resolve against: no node, and no document either, as on a server.
 */
export const getRoot = (node: Node | null | undefined): Document | ShadowRoot | null => {
  const root = node?.getRootNode();
  if (root != null && isDomRoot(root)) {
    return root;
  }
  return typeof document === 'undefined' ? null : document;
};

/**
 * The deeply focused element. From outside a shadow root `document.activeElement` reports the host
 * rather than the focused element inside it. Stops at a closed root, whose `shadowRoot` is hidden.
 *
 * Reads from `root` when given instead of the global document: a held reference to a closed root
 * still sees inside it, and another frame's document has its own focus.
 */
export const getActiveElement = (root?: Document | ShadowRoot | null): Element | null => {
  const scope = root ?? (typeof document === 'undefined' ? null : document);
  if (scope == null) return null;

  let active = scope.activeElement;
  while (active?.shadowRoot?.activeElement != null) {
    active = active.shadowRoot.activeElement;
  }
  return active;
};

/**
 * Whether a container holds a node, crossing shadow boundaries. `Node.contains` stops at them, so a
 * node focused inside a nested root reads as outside the host that holds it.
 */
export const containsDeep = (container: Node | null | undefined, node: Node | null | undefined): boolean => {
  if (container == null) return false;

  let current: Node | null | undefined = node;
  while (current != null) {
    if (container.contains(current)) return true;
    const root = current.getRootNode();
    current = isShadowRoot(root) ? root.host : null;
  }
  return false;
};

type BubbledEvent = { currentTarget: EventTarget | null; target: EventTarget | null };

const isNode = (target: EventTarget | null): target is Node => target != null && 'nodeType' in target;

/**
 * Whether an event reached its handler from a portal rendered inside it rather than from the
 * handler's own DOM. React bubbles events along the component tree, through portals, while Preact
 * bubbles along the DOM. Container handlers return early on these so both runtimes behave alike.
 */
export const isPortaledEvent = ({ currentTarget, target }: BubbledEvent): boolean =>
  isNode(currentTarget) && isNode(target) && !containsDeep(currentTarget, target);

const AUTOFOCUS_SELECTOR = '[data-autofocus]:not([data-autofocus="false"]):not([disabled])';

/**
 * The element a container asks to receive focus: the first `[data-autofocus]` that is not under a
 * `[hidden]` ancestor. The consumer marks the target; the caller decides when focus moves.
 *
 * `data-autofocus="false"` is skipped, since Preact writes a `false` boolean to a `data-*`
 * attribute as a string — toggle the marker with `data-autofocus={condition || undefined}`.
 */
export const getAutofocusTarget = (container: Element | null | undefined): HTMLElement | null => {
  if (container == null) return null;

  for (const candidate of container.querySelectorAll<HTMLElement>(AUTOFOCUS_SELECTOR)) {
    if (candidate.closest('[hidden]') == null) return candidate;
  }
  return null;
};
