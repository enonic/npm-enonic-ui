import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  build: {
    emptyOutDir: false,
    cssMinify: false,
    rollupOptions: {
      input: {
        'styles/preset': path.resolve(__dirname, 'src/styles/preset.css'),
        'styles/tokens': path.resolve(__dirname, 'src/styles/tokens.css'),
        'styles/base': path.resolve(__dirname, 'src/styles/base.css'),
        'styles/utilities': path.resolve(__dirname, 'src/styles/utilities.css'),
      },
      output: {
        assetFileNames: '[name][extname]',
      },
    },
  },
});
