import { describe, expect, it } from 'vite-plus/test';

import { isPortaledEvent } from './dom';

describe('isPortaledEvent', () => {
  it('is false for events from inside the handler element', () => {
    const container = document.createElement('div');
    const child = container.appendChild(document.createElement('button'));

    expect(isPortaledEvent({ currentTarget: container, target: child })).toBe(false);
    expect(isPortaledEvent({ currentTarget: container, target: container })).toBe(false);
  });

  it('is true for events from outside the handler element', () => {
    const container = document.createElement('div');
    const portaled = document.createElement('input');

    expect(isPortaledEvent({ currentTarget: container, target: portaled })).toBe(true);
  });

  it('treats a target in a shadow root under the handler element as inside', () => {
    const container = document.createElement('div');
    const host = container.appendChild(document.createElement('div'));
    const inner = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('input'));

    expect(isPortaledEvent({ currentTarget: container, target: inner })).toBe(false);
  });

  it('is false when either side is not a node', () => {
    const container = document.createElement('div');

    expect(isPortaledEvent({ currentTarget: container, target: null })).toBe(false);
    expect(isPortaledEvent({ currentTarget: window, target: container })).toBe(false);
  });
});
