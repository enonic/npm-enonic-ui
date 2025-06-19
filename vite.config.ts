import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  base: './',
  plugins: [preact(), tailwindcss(), EnvironmentPlugin('all')],
  server: {
    port: 4001,
    open: true,
  },
  preview: {
    port: 4001,
    open: true,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'EnonicUI',
      fileName: format => `enonic-ui.${format}.js`,
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      external: ['preact', 'preact-render-to-string'],
      output: {
        globals: {
          preact: 'Preact',
        },
      },
    },
  },
  resolve: {
    alias: {
      // Allow imports like `import { Button } from 'enonic-ui'`
      '@': path.resolve(__dirname, './src'),
      // Aim for React, but use Preact during migration
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      react: 'preact/compat',
    },
  },
});
