import { type RefObject, useCallback } from 'react';

import { getRoot } from '@/utils';

import { useKeyboardNavigation } from './use-keyboard-navigation';

export type RadioNavigationConfig = {
  baseId: string;
  getItems: () => string[];
  getItemId?: (baseId: string, itemId: string) => string;
  rootRef?: RefObject<HTMLElement>;
  value: string | undefined;
  onValueChange: (value: string) => void;
  isItemDisabled: (id: string) => boolean;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical';
  registryVersion: number;
};

export type UseRadioNavigationReturn = {
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
};

export function useRadioNavigation(config: RadioNavigationConfig): UseRadioNavigationReturn {
  const {
    baseId,
    getItems,
    getItemId,
    rootRef,
    value,
    onValueChange,
    isItemDisabled,
    loop = false,
    orientation = 'vertical',
  } = config;

  const setActiveWithFocus = useCallback(
    (newValue: string | undefined): void => {
      if (!newValue) return;
      onValueChange(newValue);

      if (!getItemId) return;

      requestAnimationFrame(() => {
        getRoot(rootRef?.current)?.getElementById(getItemId(baseId, newValue))?.focus();
      });
    },
    [baseId, onValueChange, getItemId, rootRef],
  );

  const { handleKeyDown } = useKeyboardNavigation({
    getItems,
    isItemDisabled,
    active: value,
    setActive: setActiveWithFocus,
    loop,
    orientation,
  });

  return { handleKeyDown };
}
