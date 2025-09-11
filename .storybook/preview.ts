import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/preact-vite';

import '../src/styles/style.css';
import './story.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview;
