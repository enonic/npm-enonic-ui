import type { StorybookConfig } from '@storybook/preact-vite';
import path from 'path';

export default {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    // '@storybook/addon-docs',
    // '@storybook/addon-a11y',
    '@storybook/addon-essentials',
  ],
  framework: {
    name: '@storybook/preact-vite',
    options: {},
  },
  viteFinal: config => {
    // Mirror the library build aliases
    config.resolve ??= {};
    config.resolve.alias = {
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'src'),
    };
    return config;
  },
} satisfies StorybookConfig;
