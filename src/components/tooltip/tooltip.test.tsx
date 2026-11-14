import { act } from 'react';
import { describe, expect, it } from 'vite-plus/test';

import { Dialog } from '@/components/dialog';
import { byId, keyDown, render, settle } from '@/testing/render';

import { Tooltip } from './tooltip';

const tooltipContent = (): HTMLElement | null => document.querySelector("[data-component='Tooltip.Content']");

const wait = async (ms: number): Promise<void> => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, ms));
  });
};

const focus = async (element: HTMLElement): Promise<void> => {
  await act(async () => {
    element.focus();
  });
};

describe('Tooltip', () => {
  it('opens after focusDelay on focus', async () => {
    await render(
      <Tooltip value='Details' focusDelay={100}>
        <button id='trigger'>Trigger</button>
      </Tooltip>,
    );

    await focus(byId('trigger'));
    expect(tooltipContent()).toBeNull();
    await wait(150);
    expect(tooltipContent()?.textContent).toBe('Details');
  });

  it('cancels a pending focus opening on Escape without preventing it', async () => {
    await render(
      <Tooltip value='Details' focusDelay={100}>
        <button id='trigger'>Trigger</button>
      </Tooltip>,
    );

    await focus(byId('trigger'));
    expect(await keyDown(byId('trigger'), 'Escape')).toBe(false);
    await wait(150);
    expect(tooltipContent()).toBeNull();
  });

  it('ignores focus moving inside a dialog portaled from its trigger', async () => {
    await render(
      <Tooltip value='Details'>
        <div id='trigger' role='button' tabIndex={0}>
          Trigger
          <Dialog defaultOpen>
            <Dialog.Portal>
              <Dialog.Overlay />
              <Dialog.Content>
                <Dialog.Title>Dialog</Dialog.Title>
                <input id='dialog-input' />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog>
        </div>
      </Tooltip>,
    );

    await focus(byId('dialog-input'));
    await settle();
    expect(tooltipContent()).toBeNull();
  });
});
