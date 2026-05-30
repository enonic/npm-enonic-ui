import { createRequire } from 'node:module';
import path from 'node:path';

import type { StorybookConfig } from '@storybook/preact-vite';

const localRequire = createRequire(import.meta.url);

// ! @storybook/react-dom-shim/preset misreads Preact's "preact/compat" as
// ! legacy React and aliases the shim to its react-16 entry as a bare
// ! specifier, which Vite can't resolve from this project (the shim is
// ! transitive, not directly installed). Override with the absolute path
// ! of the React-18 entry — Preact 10's compat layer supports createRoot.
const reactDomShimAbsPath = createRequire(localRequire.resolve('@storybook/preact-vite/package.json')).resolve(
  '@storybook/react-dom-shim',
);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/preact-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: config => {
    config.resolve ??= {};

    type AliasEntry = { find: string | RegExp; replacement: string };
    const existing = config.resolve.alias;
    const srcAbs = path.resolve(process.cwd(), 'src');

    if (Array.isArray(existing)) {
      const filtered = (existing as AliasEntry[]).filter(
        entry =>
          entry.find !== '@storybook/react-dom-shim' &&
          !(entry.find instanceof RegExp && entry.find.test('@storybook/react-dom-shim')),
      );
      config.resolve.alias = [
        ...filtered,
        { find: '@storybook/react-dom-shim', replacement: reactDomShimAbsPath },
        { find: '@', replacement: srcAbs },
      ];
    } else {
      const { '@storybook/react-dom-shim': _shim, ...rest } = (existing ?? {}) as Record<string, string>;
      config.resolve.alias = {
        ...rest,
        '@storybook/react-dom-shim': reactDomShimAbsPath,
        '@': srcAbs,
      };
    }

    return config;
  },
};

export default config;
