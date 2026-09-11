import { Copy, Scissors, Trash2 } from 'lucide-react';
import { type CSSProperties, type ReactElement, type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { expect, userEvent, waitFor } from 'storybook/test';

import { Button } from '@/components/button';
import { ContextMenu } from '@/components/context-menu';
import { Dialog } from '@/components/dialog';
import { Menubar } from '@/components/menubar';
import { Selector } from '@/components/selector';
import { Tooltip } from '@/components/tooltip';
import { getStyleSheet } from '@/style';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { AppRoot } from './app-root';

type Story = StoryObj<typeof AppRoot>;

export default {
  title: 'Components/AppRoot',
  component: AppRoot,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    theme: { control: 'inline-radio', options: ['light', 'dark'] },
  },
} satisfies Meta<typeof AppRoot>;

// ? Storybook ships its CSS as <style>/<link>, so the story re-emits it as constructed sheets to
// ? drive the real `stylesheets` prop. A consumer imports its compiled CSS as text instead.
const constructStyleSheets = (): CSSStyleSheet[] => {
  const sheets: CSSStyleSheet[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let cssText: string;
    try {
      cssText = Array.from(sheet.cssRules)
        .map(rule => rule.cssText)
        .join('\n');
    } catch {
      continue;
    }

    const constructed = new CSSStyleSheet();
    constructed.replaceSync(cssText);
    sheets.push(constructed);
  }

  return sheets;
};

type ShadowHostState = {
  mount: HTMLDivElement;
  stylesheets: CSSStyleSheet[];
};

type ShadowHostProps = {
  testId?: string;
  /** Inline style for the host element itself — what a host-page rule matching it would set. */
  hostStyle?: CSSProperties;
  children: (stylesheets: CSSStyleSheet[]) => ReactNode;
};

const ShadowHost = ({ testId = 'shadow-host', hostStyle, children }: ShadowHostProps): ReactElement => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ShadowHostState | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.shadowRoot) return;

    const shadow = host.attachShadow({ mode: 'open' });
    const mount = document.createElement('div');
    shadow.appendChild(mount);
    setState({ mount, stylesheets: constructStyleSheets() });
  }, []);

  return (
    <div ref={hostRef} data-testid={testId} style={hostStyle}>
      {state != null && createPortal(children(state.stylesheets), state.mount)}
    </div>
  );
};
ShadowHost.displayName = 'ShadowHost';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'mango', label: 'Mango' },
];

type FruitSelectorProps = {
  value?: string;
  onValueChange: (value: string) => void;
};

const FruitSelector = ({ value, onValueChange }: FruitSelectorProps): ReactElement => (
  <Selector value={value} onValueChange={onValueChange}>
    <Selector.Trigger>
      <Selector.Value placeholder='Select a fruit'>
        {(selected: string) => fruits.find(f => f.value === selected)?.label}
      </Selector.Value>
    </Selector.Trigger>
    <Selector.Content>
      {fruits.map(({ value: itemValue, label }) => (
        <Selector.Item key={itemValue} value={itemValue} textValue={label}>
          {label}
        </Selector.Item>
      ))}
    </Selector.Content>
  </Selector>
);
FruitSelector.displayName = 'FruitSelector';

type ScreenProps = {
  theme?: 'light' | 'dark';
  stylesheets?: CSSStyleSheet[];
};

const Screen = ({ theme, stylesheets }: ScreenProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const [fruit, setFruit] = useState<string>();
  const [scrolledFruit, setScrolledFruit] = useState<string>();

  return (
    <AppRoot theme={theme} stylesheets={stylesheets} className='bg-surface-neutral flex flex-col items-start gap-4 p-6'>
      <div className='text-subtle max-w-140 text-sm'>
        Everything below renders inside an open shadow root through <code>AppRoot</code>, styled only by the constructed
        sheets passed to <code>stylesheets</code>. The Storybook theme toolbar cannot reach in here — the class it sets
        on <code>html</code> does not cross the boundary, so use the <code>theme</code> control instead.
      </div>

      <Menubar.Root>
        <Menubar.Nav
          aria-label='Shadow root menubar'
          className='border-bdr-subtle bg-surface-neutral rounded-xl border'
        >
          <Menubar.Menu>
            <Menubar.Trigger asChild>
              <Button variant='text' label='File' />
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content>
                <Menubar.Item>New File</Menubar.Item>
                <Menubar.Item>Open File</Menubar.Item>
                <Menubar.Separator />
                <Menubar.Item>Save</Menubar.Item>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        </Menubar.Nav>
      </Menubar.Root>

      <div className='flex items-center gap-3'>
        <Tooltip value='Tooltips portal into the AppRoot layer'>
          <Button variant='outline' label='Hover me' />
        </Tooltip>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open dialog' />
      </div>

      <ContextMenu>
        <ContextMenu.Trigger className='border-bdr-subtle bg-surface-neutral-hover flex h-24 w-80 items-center justify-center rounded-md border-2 border-dashed'>
          <span className='text-subtle cursor-default text-sm'>
            Right click here — retargeting must not break dismissal
          </span>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content>
            <ContextMenu.Item>
              <Scissors className='size-4' />
              <span>Cut</span>
            </ContextMenu.Item>
            <ContextMenu.Item>
              <Copy className='size-4' />
              <span>Copy</span>
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item className='text-error data-[active=true]:not-dark:text-error-rev'>
              <Trash2 className='size-4' />
              <span>Delete</span>
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu>

      <div className='border-bdr-subtle h-40 w-80 overflow-auto rounded-md border p-3'>
        <p className='text-subtle mb-3 text-sm'>
          Open the selector below, then scroll this box. The popup must stay glued to its trigger — `scroll` does not
          cross a shadow boundary, so the root has to be listened to directly.
        </p>
        <FruitSelector value={scrolledFruit} onValueChange={setScrolledFruit} />
        <div className='text-subtle mt-3 h-40 text-sm'>Scroll filler.</div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className='w-120'>
            <Dialog.DefaultHeader title='Shadow-root dialog' description='Focus trap and Escape must work' withClose />
            <Dialog.Body>
              <div className='flex flex-col gap-3'>
                <p className='text-sm'>The selector below portals its popup while the dialog holds the focus trap.</p>
                <FruitSelector value={fruit} onValueChange={setFruit} />
              </div>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </AppRoot>
  );
};
Screen.displayName = 'Screen';

const findShadowButton = (shadow: ShadowRoot, label: string): HTMLButtonElement => {
  const button = Array.from(shadow.querySelectorAll('button')).find(el => el.textContent?.includes(label));
  if (button == null) throw new Error(`No button labelled "${label}" in the shadow root`);
  return button;
};

export const InsideShadowRoot: Story = {
  name: 'Examples / Inside Shadow Root',
  tags: ['interactions-smoke'],
  args: { theme: 'light' },
  render: ({ theme }) => <ShadowHost>{stylesheets => <Screen theme={theme} stylesheets={stylesheets} />}</ShadowHost>,
  // The CI regression test #533 asks for: a dialog, a select and a tooltip opened inside the
  // shadow root, each asserted to land in the root's portal layer rather than document.body.
  play: async ({ canvasElement }) => {
    const shadow = await waitFor(() => {
      const root = canvasElement.querySelector("[data-testid='shadow-host']")?.shadowRoot;
      if (root?.querySelector("[data-component='AppRoot']") == null) {
        throw new Error('AppRoot has not mounted inside the shadow root yet');
      }
      return root;
    });

    const layer = shadow.querySelector("[data-component='AppRoot.PortalLayer']");
    await expect(layer).not.toBeNull();

    await userEvent.click(findShadowButton(shadow, 'Open dialog'));
    const dialog = await waitFor(() => {
      const el = layer?.querySelector<HTMLElement>("[data-component='Dialog.Content']");
      if (el == null) throw new Error('Dialog did not open into the portal layer');
      return el;
    });
    await expect(dialog.getRootNode()).toBe(shadow);

    // ! `@property` registration does not cross `adoptedStyleSheets` on a shadow root. The
    // document-level copies of these sheets register globally and mask that, so they are switched
    // off while asserting that the synthesized fallback keeps the `--tw-shadow` composition alive.
    const documentSheets = Array.from(document.styleSheets);
    for (const sheet of documentSheets) sheet.disabled = true;
    try {
      await expect(getComputedStyle(dialog).boxShadow).not.toBe('none');
    } finally {
      for (const sheet of documentSheets) sheet.disabled = false;
    }

    const trigger = dialog.querySelector<HTMLElement>("[role='combobox']");
    if (trigger == null) throw new Error('No selector trigger inside the dialog');
    await userEvent.click(trigger);
    const listbox = await waitFor(() => {
      const el = layer?.querySelector<HTMLElement>("[role='listbox']");
      if (el == null) throw new Error('Selector popup did not open into the portal layer');
      return el;
    });
    await expect(listbox.getRootNode()).toBe(shadow);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(layer?.querySelector("[role='listbox']")).toBeNull());

    // ? Escape on the closed selector trigger is swallowed by its nav handler (pre-existing,
    // shadow-unrelated), so the dialog is closed through its own close button instead.
    const close = dialog.querySelector<HTMLElement>("[aria-label='Close']");
    if (close == null) throw new Error('No close button in the dialog');
    await userEvent.click(close);
    await waitFor(() => expect(layer?.querySelector("[data-component='Dialog.Content']")).toBeNull());

    const hoverButton = findShadowButton(shadow, 'Hover me');
    await userEvent.hover(hoverButton);
    const tooltip = await waitFor(() => {
      const el = layer?.querySelector<HTMLElement>("[data-component='Tooltip.Content']");
      if (el == null) throw new Error('Tooltip did not open into the portal layer');
      return el;
    });
    await expect(tooltip.getRootNode()).toBe(shadow);
    await userEvent.unhover(hoverButton);
  },
};

const getShadowRootByTestId = async (canvasElement: HTMLElement, testId: string): Promise<ShadowRoot> =>
  await waitFor(() => {
    const root = canvasElement.querySelector(`[data-testid='${testId}']`)?.shadowRoot;
    if (root?.querySelector("[data-component='AppRoot']") == null) {
      throw new Error(`AppRoot has not mounted inside '${testId}' yet`);
    }
    return root;
  });

// Closes by selecting an option — a pure pointer path. Escape depends on where focus landed
// after the opening click, which headless CI does not guarantee outside a focus trap.
const closeFruitSelector = async (shadow: ShadowRoot): Promise<void> => {
  const option = shadow.querySelector<HTMLElement>("[role='option']");
  if (option == null) throw new Error('No option to select in the shadow root');
  await userEvent.click(option);
  await waitFor(() => expect(shadow.querySelector("[data-component='Selector.Content']")).toBeNull());
};

const openFruitSelector = async (shadow: ShadowRoot): Promise<HTMLElement> => {
  const trigger = shadow.querySelector<HTMLElement>("[data-component='Selector.Trigger']");
  if (trigger == null) throw new Error('No selector trigger in the shadow root');
  await userEvent.click(trigger);
  return await waitFor(() => {
    const el = shadow.querySelector<HTMLElement>("[data-component='Selector.Content']");
    if (el == null) throw new Error('Selector popup did not open');
    return el;
  });
};

const LabeledPanel = ({ label, children }: { label: string; children?: ReactNode }): ReactElement => (
  <div className='flex flex-col items-start gap-2'>
    <div className='text-subtle font-mono text-xs'>{label}</div>
    {children}
  </div>
);
LabeledPanel.displayName = 'LabeledPanel';

export const PrebuiltStylesheet: Story = {
  name: 'Examples / Prebuilt Stylesheet',
  tags: ['interactions-smoke'],
  parameters: { layout: 'padded' },
  render: () => {
    const [fruit, setFruit] = useState<string>();
    const screen = (stylesheets?: CSSStyleSheet[]) => (
      <AppRoot
        stylesheets={stylesheets}
        className='bg-surface-neutral flex w-80 flex-col items-start gap-4 rounded-md p-4'
      >
        <Button variant='solid' label='Save changes' />
        <FruitSelector value={fruit} onValueChange={setFruit} />
      </AppRoot>
    );

    return (
      <div className='flex flex-col gap-4 p-4'>
        <div className='text-subtle max-w-160 text-sm'>
          The install path without Tailwind. Both panels render <em>identical markup</em>, each inside its own shadow
          root; the only difference is the <code>stylesheets</code> prop. On the left it is omitted — no CSS reaches
          into a shadow root on its own, so the root is bare, and forgetting the prop fails this loudly on purpose. On
          the right, the package&apos;s prebuilt sheet from <code>@enonic/ui/style</code>: one
          <code> getStyleSheet()</code> call, no bundler-specific CSS-to-string work.
        </div>
        <div className='flex items-start gap-10'>
          <LabeledPanel label='stylesheets omitted'>
            <ShadowHost testId='bare-host'>{() => screen(undefined)}</ShadowHost>
          </LabeledPanel>
          <LabeledPanel label='stylesheets={[getStyleSheet()]}'>
            <ShadowHost testId='styled-host'>{() => screen([getStyleSheet()])}</ShadowHost>
          </LabeledPanel>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const bare = await getShadowRootByTestId(canvasElement, 'bare-host');
    const styled = await getShadowRootByTestId(canvasElement, 'styled-host');

    // The bare button keeps the native ButtonFace background; the styled one gets the token color.
    const bareButton = findShadowButton(bare, 'Save changes');
    const styledButton = findShadowButton(styled, 'Save changes');
    await expect(getComputedStyle(styledButton).backgroundColor).not.toBe(getComputedStyle(bareButton).backgroundColor);

    const popup = await openFruitSelector(styled);
    await expect(popup.getRootNode()).toBe(styled);
    await closeFruitSelector(styled);
  },
};

const UncompensatedGhost = (): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number }>();

  // Visible only while the selector popup is open: a popup-sized frame at the naive viewport
  // coordinates the popup would occupy without the containing-block compensation.
  useEffect(() => {
    const measure = (): void => {
      const root = ref.current?.getRootNode();
      const trigger = ref.current?.parentElement?.querySelector("[data-component='Selector.Trigger']");
      const popup =
        root instanceof ShadowRoot ? root.querySelector<HTMLElement>("[data-component='Selector.Content']") : null;
      if (trigger == null || popup == null) {
        setBox(undefined);
        return;
      }
      const rect = trigger.getBoundingClientRect();
      const next = { top: rect.bottom + 8, left: rect.left, width: popup.offsetWidth, height: popup.offsetHeight };
      setBox(prev =>
        prev?.top === next.top && prev.left === next.left && prev.width === next.width && prev.height === next.height
          ? prev
          : next,
      );
    };
    measure();
    const id = window.setInterval(measure, 150);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      ref={ref}
      data-testid='uncompensated-ghost'
      className='border-error text-error pointer-events-none fixed flex items-end justify-end rounded-md border-2 border-dashed p-2 text-xs'
      style={{ zIndex: 60, ...(box ?? { visibility: 'hidden' }) }}
    >
      without compensation the popup would be here
    </div>
  );
};
UncompensatedGhost.displayName = 'UncompensatedGhost';

export const TransformedAncestor: Story = {
  name: 'Behavior / Transformed Ancestor',
  tags: ['interactions-smoke'],
  parameters: { layout: 'padded' },
  render: () => {
    const [fruit, setFruit] = useState<string>();
    return (
      <div className='flex items-start gap-24 p-4'>
        <div style={{ transform: 'translate(48px, 24px)' }}>
          <ShadowHost>
            {stylesheets => (
              <AppRoot
                stylesheets={stylesheets}
                className='border-bdr-subtle bg-surface-neutral flex w-80 flex-col items-start gap-4 rounded-md border border-dashed p-4'
              >
                <FruitSelector value={fruit} onValueChange={setFruit} />
                <UncompensatedGhost />
              </AppRoot>
            )}
          </ShadowHost>
        </div>
        <div className='text-subtle max-w-120 text-sm'>
          The dashed panel sits under an ancestor with a <code>transform</code>, so that ancestor — not the viewport —
          is the containing block of every <code>position: fixed</code> overlay inside it. Open the selector: the popup
          stays glued to its trigger, because <code>useFloatingPosition</code> re-expresses its coordinates against the
          block, while the red dashed frame shows where the same popup would land without that — displaced by the
          containing block&apos;s offset. (<code>Dialog.Overlay</code>
          &apos;s full-viewport scrim cannot be compensated — that stays a documented caveat.)
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const shadow = await getShadowRootByTestId(canvasElement, 'shadow-host');

    const trigger = shadow.querySelector<HTMLElement>("[data-component='Selector.Trigger']");
    if (trigger == null) throw new Error('No selector trigger in the shadow root');

    const popup = await openFruitSelector(shadow);
    const ghost = await waitFor(() => {
      const el = shadow.querySelector<HTMLElement>("[data-testid='uncompensated-ghost']");
      if (el == null || el.style.visibility === 'hidden') throw new Error('Ghost not measured yet');
      return el;
    });
    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const ghostRect = ghost.getBoundingClientRect();

    // The ghost drifts by the containing block's offset; the real popup must not.
    await expect(Math.abs(ghostRect.left - triggerRect.left)).toBeGreaterThan(40);
    await expect(Math.abs(popupRect.left - triggerRect.left)).toBeLessThan(30);
    await expect(Math.abs(popupRect.top - triggerRect.bottom)).toBeLessThan(30);
    await closeFruitSelector(shadow);
  },
};

export const HostPageInterference: Story = {
  name: 'Behavior / Host Page Interference',
  tags: ['interactions-smoke'],
  parameters: { layout: 'padded' },
  render: () => (
    <div className='flex flex-col gap-4 p-4'>
      <div className='text-subtle max-w-160 text-sm'>
        The embedding page styles the shadow host <em>element itself</em> with a cursive red 20px font — and a
        declaration on the host outranks any <code>:host</code> rule in the adopted sheets, so it inherits straight
        through the boundary. The first line below lives inside the shadow root but <em>outside</em>{' '}
        <code>AppRoot</code>, and shows the leak. The panel under it is inside <code>AppRoot</code>, whose
        always-adopted base reset pins typography on elements inside the root — out of the page&apos;s reach.
      </div>
      <div>
        <ShadowHost hostStyle={{ fontFamily: 'cursive', color: 'rgb(255, 0, 0)', fontSize: '20px' }}>
          {stylesheets => (
            <>
              <div data-testid='leak-probe' style={{ marginBottom: '12px' }}>
                Outside AppRoot: the page&apos;s cursive red font inherits into this line.
              </div>
              <AppRoot
                stylesheets={stylesheets}
                className='border-bdr-subtle bg-surface-neutral flex w-100 flex-col items-start gap-3 rounded-md border p-4'
              >
                <div className='text-sm'>Inside AppRoot: same root, typography pinned by the base reset.</div>
                <Button variant='solid' label='Unaffected button' />
              </AppRoot>
            </>
          )}
        </ShadowHost>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const shadow = await getShadowRootByTestId(canvasElement, 'shadow-host');

    const probe = shadow.querySelector<HTMLElement>("[data-testid='leak-probe']");
    if (probe == null) throw new Error('No leak probe in the shadow root');
    await expect(getComputedStyle(probe).fontFamily).toContain('cursive');
    await expect(getComputedStyle(probe).color).toBe('rgb(255, 0, 0)');

    const wrapper = shadow.querySelector<HTMLElement>("[data-component='AppRoot']");
    if (wrapper == null) throw new Error('No AppRoot wrapper in the shadow root');
    const style = getComputedStyle(wrapper);
    await expect(style.fontFamily).not.toContain('cursive');
    await expect(style.color).not.toBe('rgb(255, 0, 0)');
    await expect(style.fontSize).toBe('16px');
  },
};
