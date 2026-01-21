import { useCallback, useMemo } from 'react';

export type RadioNavigationConfig = {
  baseId: string;
  getItems: () => string[];
  getItemId?: (baseId: string, itemId: string) => string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  isItemDisabled: (id: string) => boolean;
  loop?: boolean;
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
    value,
    onValueChange,
    isItemDisabled,
    loop = false,
    registryVersion: _registryVersion,
  } = config;

  // biome-ignore lint/correctness/useExhaustiveDependencies: registryVersion triggers revalidation;
  const items = useMemo(() => getItems(), [getItems, _registryVersion]);

  const onValueChangeAndFocus = useCallback(
    (newValue: string): void => {
      onValueChange(newValue);

      if (!getItemId) return;

      requestAnimationFrame(() => {
        const itemElement = document.getElementById(getItemId(baseId, newValue));
        itemElement?.focus();
      });
    },
    [baseId, onValueChange, getItemId],
  );

  const currentIndex = value != null ? items.indexOf(value) : -1;

  const goToFirst = useCallback((): void => {
    const firstEnabled = items.find(id => !isItemDisabled(id));
    if (firstEnabled) {
      onValueChangeAndFocus(firstEnabled);
    }
  }, [items, isItemDisabled, onValueChangeAndFocus]);

  const goToLast = useCallback((): void => {
    const lastEnabled = [...items].reverse().find(id => !isItemDisabled(id));
    if (lastEnabled) {
      onValueChangeAndFocus(lastEnabled);
    }
  }, [items, isItemDisabled, onValueChangeAndFocus]);

  const goToNext = useCallback((): void => {
    let nextValue = items.filter((item, idx) => idx > currentIndex && !isItemDisabled(item))[0];

    if (loop) {
      nextValue = nextValue || items.filter((item, idx) => idx < currentIndex && !isItemDisabled(item))[0];
    }

    if (!nextValue) return;

    onValueChangeAndFocus(nextValue);
  }, [currentIndex, items, isItemDisabled, onValueChangeAndFocus, loop]);

  const goToPrevious = useCallback((): void => {
    let prevValue = items.filter((item, idx) => idx < currentIndex && !isItemDisabled(item)).reverse()[0];

    if (loop) {
      prevValue = prevValue || items.filter((item, idx) => idx > currentIndex && !isItemDisabled(item)).reverse()[0];
    }
    if (!prevValue) return;

    onValueChangeAndFocus(prevValue);
  }, [currentIndex, items, isItemDisabled, onValueChangeAndFocus, loop]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      switch (e.key) {
        case 'Home': {
          e.preventDefault();
          goToFirst();
          break;
        }
        case 'End': {
          e.preventDefault();
          goToLast();
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          goToPrevious();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          goToPrevious();
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          goToNext();
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          goToNext();
          break;
        }
      }
    },
    [goToNext, goToPrevious, goToFirst, goToLast],
  );

  return {
    handleKeyDown,
  };
}
