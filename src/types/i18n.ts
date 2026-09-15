export type PhraseValue = string | number;

/** A flat map of phrase key to text with `{0}`-style positional placeholders. */
export type Phrases = Readonly<Record<string, string>>;

export type TranslateOptions = {
  /** The library's own English for the key, placeholders already filled. A miss returns it untouched. */
  defaultValue: string;
  /** The raw values, for the application's own template. A hit formats once, with these. */
  values?: readonly PhraseValue[];
};

/**
 * What an application hands `I18nProvider` to render the library's labels in its own words.
 * Answers the application's text for `key`, or `defaultValue` when it has none.
 */
export type Translate = (key: string, options: TranslateOptions) => string;
