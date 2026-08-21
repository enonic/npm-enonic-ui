import { Copy, Scissors, Trash2 } from 'lucide-react';
import { type ReactElement, type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/button';
import { ContextMenu } from '@/components/context-menu';
import { Dialog } from '@/components/dialog';
import { Menubar } from '@/components/menubar';
import { Selector } from '@/components/selector';
import { Tooltip } from '@/components/tooltip';

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
  children: (stylesheets: CSSStyleSheet[]) => ReactNode;
};

const ShadowHost = ({ children }: ShadowHostProps): ReactElement => {
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

  return <div ref={hostRef}>{state != null && createPortal(children(state.stylesheets), state.mount)}</div>;
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
    <AppRoot theme={theme} stylesheets={stylesheets} className='bg-surface flex flex-col items-start gap-4 p-6'>
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

export const InsideShadowRoot: Story = {
  name: 'Examples / Inside Shadow Root',
  args: { theme: 'light' },
  render: ({ theme }) => <ShadowHost>{stylesheets => <Screen theme={theme} stylesheets={stylesheets} />}</ShadowHost>,
};
