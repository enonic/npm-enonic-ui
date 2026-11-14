import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const mounted: { root: Root; container: HTMLElement }[] = [];

export const settle = async (): Promise<void> => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 20));
  });
};

export const render = async (ui: ReactNode): Promise<HTMLElement> => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  await act(async () => root.render(ui));
  // Portals mount from an effect, and focus moves in a frame after that.
  await settle();
  return container;
};

export const cleanup = (): void => {
  for (const { root, container } of mounted.splice(0)) {
    act(() => root.unmount());
    container.remove();
  }
  document.body.innerHTML = '';
};

export const byId = (id: string): HTMLElement => {
  const element = document.getElementById(id);
  if (element == null) throw new Error(`No element with id "${id}"`);
  return element;
};

/** Dispatches a cancelable keydown and reports whether a handler prevented it. */
export const keyDown = async (target: Element, key: string): Promise<boolean> => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  await act(async () => {
    target.dispatchEvent(event);
  });
  return event.defaultPrevented;
};

/** Dispatches a cancelable contextmenu and reports whether a handler prevented it. */
export const contextMenu = async (target: Element): Promise<boolean> => {
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 });
  await act(async () => {
    target.dispatchEvent(event);
  });
  return event.defaultPrevented;
};
