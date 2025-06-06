import preact from '@preact/preset-vite';
import autoprefixer from 'autoprefixer';
import path from 'path';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  plugins: [preact(), EnvironmentPlugin('all')],
  css: {
    postcss: {
      plugins: [autoprefixer({})],
    },
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
