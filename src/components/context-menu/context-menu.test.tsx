import { describe, expect, it } from 'vite-plus/test';

import { Dialog } from '@/components/dialog';
import { byId, contextMenu, render, settle } from '@/testing/render';

import { ContextMenu } from './context-menu';

const isMenuOpen = (): boolean => document.querySelector('[data-component="ContextMenu.Content"]') != null;

const renderTriggerWithDialog = (): Promise<HTMLElement> =>
  render(
    <ContextMenu>
      <ContextMenu.Trigger>
        <div id='area'>Area</div>
        <Dialog defaultOpen>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Title>Dialog</Dialog.Title>
              <input id='dialog-input' />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content>
          <ContextMenu.Item>Copy</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu>,
  );

describe('ContextMenu.Trigger', () => {
  it('ignores a right-click inside a portaled dialog', async () => {
    await renderTriggerWithDialog();

    expect(await contextMenu(byId('dialog-input'))).toBe(false);
    await settle();
    expect(isMenuOpen()).toBe(false);
  });

  it('still opens on a right-click on its own content', async () => {
    await renderTriggerWithDialog();

    expect(await contextMenu(byId('area'))).toBe(true);
    await settle();
    expect(isMenuOpen()).toBe(true);
  });
});
