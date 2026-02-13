import { useCallback, useMemo } from 'react';

export type StepNavigationConfig = {
  baseId: string;
  getItems: () => string[];
  getNextFocusable?: (baseId: string, itemId: string) => string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  isItemDisabled: (id: string) => boolean;
  registryVersion: number;
};

export type UseStepNavigationReturn = {
  goToNext: () => void;
  goToPrevious: () => void;
  goToFirst: () => void;
  goToLast: () => void;
  goTo: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  isFirst: boolean;
  isLast: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentIndex: number;
  items: string[];
};

export function useStepNavigation(config: StepNavigationConfig): UseStepNavigationReturn {
  const {
    baseId,
    getItems,
    getNextFocusable,
    value,
    onValueChange,
    isItemDisabled,
    registryVersion: _registryVersion,
  } = config;

  // biome-ignore lint/correctness/useExhaustiveDependencies: registryVersion triggers revalidation;
  const items = useMemo(() => getItems(), [getItems, _registryVersion]);

  const onValueChangeAndFocus = useCallback(
    (newValue: string): void => {
      onValueChange(newValue);

      if (!getNextFocusable) return;

      requestAnimationFrame(() => {
        document.getElementById(getNextFocusable(baseId, newValue))?.focus();
      });
    },
    [baseId, onValueChange, getNextFocusable],
  );

  const currentIndex = value != null ? items.indexOf(value) : -1;

  const isFirst = currentIndex === 0;

  const isLast = currentIndex === items.length - 1;

  const canGoNext = useMemo(() => {
    if (currentIndex === -1 || isLast) return false;

    const nextValue = items[currentIndex + 1];

    return nextValue != null && !isItemDisabled(nextValue);
  }, [currentIndex, isLast, items, isItemDisabled]);

  const canGoPrevious = useMemo(() => {
    if (currentIndex <= 0) return false;

    const prevValue = items[currentIndex - 1];

    return prevValue != null && !isItemDisabled(prevValue);
  }, [currentIndex, items, isItemDisabled]);

  const goTo = useCallback(
    (targetValue: string): void => {
      const targetIndex = items.indexOf(targetValue);

      if (targetIndex === -1) return;

      if (isItemDisabled(targetValue)) return;

      onValueChangeAndFocus(targetValue);
    },
    [items, isItemDisabled, onValueChangeAndFocus],
  );

  const goToNext = useCallback((): void => {
    if (currentIndex === -1 || isLast) return;

    const nextValue = items[currentIndex + 1];

    if (nextValue != null && !isItemDisabled(nextValue)) {
      onValueChangeAndFocus(nextValue);
    }
  }, [currentIndex, isLast, items, isItemDisabled, onValueChangeAndFocus]);

  const goToPrevious = useCallback((): void => {
    if (currentIndex <= 0) return;

    const prevValue = items[currentIndex - 1];

    if (prevValue != null && !isItemDisabled(prevValue)) {
      onValueChangeAndFocus(prevValue);
    }
  }, [currentIndex, items, isItemDisabled, onValueChangeAndFocus]);

  const goToFirst = useCallback((): void => {
    const firstEnabled = items.find(itemId => !isItemDisabled(itemId));
    if (firstEnabled != null) {
      onValueChangeAndFocus(firstEnabled);
    }
  }, [items, isItemDisabled, onValueChangeAndFocus]);

  const goToLast = useCallback((): void => {
    const lastEnabled = [...items].reverse().find(itemId => !isItemDisabled(itemId));
    if (lastEnabled != null) {
      onValueChangeAndFocus(lastEnabled);
    }
  }, [items, isItemDisabled, onValueChangeAndFocus]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): void => {
      switch (e.key) {
        case 'ArrowLeft': {
          e.preventDefault();
          goToPrevious();
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          goToNext();
          break;
        }
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
      }
    },
    [goToNext, goToPrevious, goToFirst, goToLast],
  );

  return {
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    goTo,
    handleKeyDown,
    isFirst,
    isLast,
    canGoNext,
    canGoPrevious,
    currentIndex,
    items,
  };
}
