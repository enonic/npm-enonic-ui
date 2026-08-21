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
 */
export const getActiveElement = (): Element | null => {
  if (typeof document === 'undefined') return null;

  let active = document.activeElement;
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
