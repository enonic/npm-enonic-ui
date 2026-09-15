import type { Phrases, PhraseValue } from '@/types';

/** Fills `{0}`-style placeholders by position. One with no value stays as written. */
export const formatPhrase = (template: string, values: readonly PhraseValue[]): string =>
  template.replace(/\{(\d+)\}/g, (placeholder, index: string) => {
    const value = values[Number(index)];
    return value === undefined ? placeholder : String(value);
  });

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

/** One map from the components' fragments. A key two fragments both declare is an error, not the last spread. */
export const mergePhrases = <const T extends readonly Phrases[]>(
  fragments: T,
): Readonly<UnionToIntersection<T[number]>> => {
  const merged: Record<string, string> = {};
  for (const fragment of fragments) {
    for (const [key, text] of Object.entries(fragment)) {
      if (key in merged) throw new Error(`Phrase key declared twice: ${key}`);
      merged[key] = text;
    }
  }
  return merged as Readonly<UnionToIntersection<T[number]>>;
};
