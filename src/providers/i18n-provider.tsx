import { createContext, useContext, useMemo } from 'react';

import { formatPhrase } from '@/utils/phrase';

import type { PhraseValue, Translate } from '@/types';
import type { ReactElement, ReactNode } from 'react';

/** The `Translate` of a consumer that translates nothing: every label stays the library's English. */
export const passthrough: Translate = (_key, { defaultValue }) => defaultValue;

// ? Defaulted to `passthrough` rather than `undefined`, unlike the other providers: every component
// ? reads it for its own labels, and one rendered without a provider must speak English, not throw.
const I18nContext = createContext<Translate>(passthrough);

export type I18nProviderProps = {
  /**
   * Answers the application's text for a key, or the `defaultValue` it is handed. Keep its identity
   * stable — hoist it out of the render — since every label re-renders when it changes.
   */
  translate: Translate;
  children?: ReactNode;
};

/** Puts the application's words in the library's mouth. One per React root, above every component. */
export const I18nProvider = ({ translate, children }: I18nProviderProps): ReactElement => {
  return <I18nContext.Provider value={translate}>{children}</I18nContext.Provider>;
};

I18nProvider.displayName = 'I18nProvider';

/** The nearest provider's `Translate`, or `passthrough` outside any. */
export const useTranslate = (): Translate => useContext(I18nContext);

/**
 * The labels of one component, resolved through the application's `Translate` where it has a word.
 * `phrases` is the component's own fragment, a module constant: a key it never declared does not
 * compile, and an inline literal would recreate `t` on every render.
 */
export const usePhrases = <K extends string>(
  phrases: Readonly<Record<K, string>>,
): ((key: K, ...values: PhraseValue[]) => string) => {
  const translate = useTranslate();
  return useMemo(
    () =>
      (key: K, ...values: PhraseValue[]): string =>
        translate(key, { defaultValue: formatPhrase(phrases[key], values), values }),
    [translate, phrases],
  );
};
