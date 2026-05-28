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
    a11y: {
      // Surface axe-core findings in the panel without failing anything. There is
      // no test runner wired up yet, so 'error' would have no effect today; 'todo'
      // documents the intent to fix without blocking the dev workflow.
      test: 'todo',
    },
  },
  initialGlobals: {
    // Run the accessibility checks automatically on every story.
    a11y: { manual: false },
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
