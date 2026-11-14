import { describe, expect, it } from 'vite-plus/test';

import { Dialog } from '@/components/dialog';
import { byId, keyDown, render } from '@/testing/render';

import { Toolbar } from './toolbar';

const renderToolbarWithDialog = (): Promise<HTMLElement> =>
  render(
    <Toolbar>
      <Toolbar.Container aria-label='Tools'>
        <Toolbar.Item asChild>
          <button id='first'>First</button>
        </Toolbar.Item>
        <Toolbar.Item asChild>
          <button id='second'>Second</button>
        </Toolbar.Item>
        <Dialog defaultOpen>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Title>Dialog</Dialog.Title>
              <input id='dialog-input' />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </Toolbar.Container>
    </Toolbar>,
  );

describe('Toolbar.Container', () => {
  it('leaves keys typed in a portaled dialog alone', async () => {
    await renderToolbarWithDialog();
    const input = byId('dialog-input');

    for (const key of [' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']) {
      expect(await keyDown(input, key), key).toBe(false);
    }
  });

  it('still navigates its own items', async () => {
    await renderToolbarWithDialog();

    expect(await keyDown(byId('first'), 'ArrowRight')).toBe(true);
  });
});
