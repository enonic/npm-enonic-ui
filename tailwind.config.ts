import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./src/ui/**/*.{ts,tsx}'],
  theme: {
    extend: {
      height: {
        '11.5': '46px',
      },
      transitionProperty: {
        highlight: 'color, box-shadow',
      },
    },
  },
  plugins: [],
} satisfies Config;
