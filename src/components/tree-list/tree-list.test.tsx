import { describe, expect, it, vi } from 'vite-plus/test';

import { Dialog } from '@/components/dialog';
import { byId, keyDown, render, settle } from '@/testing/render';

import { TreeList } from './tree-list';

const renderTreeWithDialog = (onSelectionChange: (selection: ReadonlySet<string>) => void): Promise<HTMLElement> =>
  render(
    <TreeList selectionMode='multiple' defaultSelection={new Set(['first'])} onSelectionChange={onSelectionChange}>
      <TreeList.Container>
        <TreeList.Row id='first'>
          <TreeList.RowContent>
            First
            <Dialog defaultOpen>
              <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content>
                  <Dialog.Title>Dialog</Dialog.Title>
                  <input id='dialog-input' />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog>
          </TreeList.RowContent>
        </TreeList.Row>
        <TreeList.Row id='second'>
          <TreeList.RowContent>Second</TreeList.RowContent>
        </TreeList.Row>
      </TreeList.Container>
    </TreeList>,
  );

describe('TreeList', () => {
  it('leaves Space typed in a portaled dialog alone', async () => {
    const onSelectionChange = vi.fn();
    await renderTreeWithDialog(onSelectionChange);

    expect(await keyDown(byId('dialog-input'), ' ')).toBe(false);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('lets Escape in a portaled dialog close the dialog, not clear the selection', async () => {
    const onSelectionChange = vi.fn();
    await renderTreeWithDialog(onSelectionChange);

    await keyDown(byId('dialog-input'), 'Escape');
    await settle();

    expect(document.getElementById('dialog-input')).toBeNull();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
