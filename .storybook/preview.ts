import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/preact-vite';
import { themes } from 'storybook/theming';

import '../src/styles/style.css';
import './story.css';

const isDark = 'matchMedia' in globalThis && globalThis.matchMedia('(prefers-color-scheme: dark)').matches;

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: isDark ? themes.dark : themes.light,
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: isDark ? 'dark' : 'light',
    }),
  ],
};

export default preview;
