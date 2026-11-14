import { describe, expect, it, vi } from 'vite-plus/test';

import { Dialog } from '@/components/dialog';
import { byId, contextMenu, render, settle } from '@/testing/render';

import { ContextMenu } from './context-menu';

const isMenuOpen = (): boolean => document.querySelector('[data-component="ContextMenu.Content"]') != null;

const renderTriggerWithDialog = (onContextMenu?: () => void): Promise<HTMLElement> =>
  render(
    <ContextMenu>
      <ContextMenu.Trigger onContextMenu={onContextMenu}>
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
  it('ignores a right-click inside a portaled dialog but still reports it to the consumer', async () => {
    const onContextMenu = vi.fn();
    await renderTriggerWithDialog(onContextMenu);

    expect(await contextMenu(byId('dialog-input'))).toBe(false);
    await settle();
    expect(isMenuOpen()).toBe(false);
    expect(onContextMenu).toHaveBeenCalledOnce();
  });

  it('still opens on a right-click on its own content', async () => {
    await renderTriggerWithDialog();

    expect(await contextMenu(byId('area'))).toBe(true);
    await settle();
    expect(isMenuOpen()).toBe(true);
  });
});
