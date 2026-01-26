const subscribeMediaQuery = (query: MediaQueryList, listener: () => void): (() => void) => {
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};

export const getIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;

  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };

  if (typeof nav.userAgentData?.mobile === 'boolean') {
    return nav.userAgentData.mobile;
  }

  return window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 640px)').matches;
};

export const subscribeToMobileChanges = (listener: (isMobile: boolean) => void): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;

  const pointerQuery = window.matchMedia('(pointer: coarse)');
  const widthQuery = window.matchMedia('(max-width: 640px)');
  const update = (): void => {
    listener(pointerQuery.matches || widthQuery.matches);
  };

  update();

  const unsubscribePointer = subscribeMediaQuery(pointerQuery, update);
  const unsubscribeWidth = subscribeMediaQuery(widthQuery, update);

  return () => {
    unsubscribePointer();
    unsubscribeWidth();
  };
};
