import { describe, expect, it } from 'vite-plus/test';

import { cn } from './cn';

describe('cn', () => {
  it('joins conditional, nested and falsy inputs', () => {
    expect(cn('a', ['b', { c: true, d: false }], null, undefined, false, 0, '', { e: 1 })).toBe('a b c e');
  });

  it('lets later classes win Tailwind conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    expect(cn('px-2', 'p-4')).toBe('p-4');
    expect(cn('text-main text-sm', 'text-lg')).toBe('text-main text-lg');
  });

  it('merges within the same modifier only', () => {
    expect(cn('bg-white hover:bg-red-500', 'hover:bg-blue-500')).toBe('bg-white hover:bg-blue-500');
    expect(cn('data-[active=true]:bg-btn-active', 'data-[active=true]:bg-red-500')).toBe(
      'data-[active=true]:bg-red-500',
    );
  });

  it('lets consumer overrides replace the library theme tokens', () => {
    expect(cn('bg-btn-primary hover:bg-btn-primary-hover', 'bg-red-500')).toBe('hover:bg-btn-primary-hover bg-red-500');
    expect(cn('h-11.5 gap-x-1.25', 'h-10')).toBe('gap-x-1.25 h-10');
    expect(cn('text-alt', 'text-red-500')).toBe('text-red-500');
  });

  it('merges arbitrary values and important modifiers separately', () => {
    expect(cn('h-[13px]', 'h-4')).toBe('h-4');
    expect(cn('!bg-white', '!bg-red-500')).toBe('!bg-red-500');
    expect(cn('bg-white', '!bg-red-500')).toBe('bg-white !bg-red-500');
  });
});
