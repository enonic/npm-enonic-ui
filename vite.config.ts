import path from 'node:path';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  base: './',
  plugins: [
    // Library build is always production: drop prefresh HMR, and strip the devtools/
    // hook-name plugins the preset always wires in — they inject nothing without an HTML
    // entry but still run resolveId/transform on every module. Filtered by name; if the
    // preset renames them this degrades to the old (working) overhead, not a breakage.
    ...preact({ prefreshEnabled: false, devToolsEnabled: false }).filter(
      p => p.name !== 'preact:devtools' && p.name !== 'preact:transform-hook-names',
    ),
    tailwindcss(),
    EnvironmentPlugin('all'),
    dts({
      tsconfigPath: './tsconfig.app.json',
      outDirs: 'dist/types',
      entryRoot: 'src',
      aliasesExclude: ['react', 'react-dom', 'react-dom/test-utils'],
      exclude: ['**/*.stories.tsx', '.storybook/**/*'],
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'EnonicUI',
      fileName: format => (format === 'cjs' ? `enonic-ui.cjs` : `enonic-ui.${format}.js`),
      formats: ['es', 'cjs'],
    },
    emptyOutDir: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      external: [
        'preact',
        'preact-render-to-string',
        'preact/hooks',
        'preact/compat',
        'react',
        'react-dom',
        '@radix-ui/react-slot',
        'focus-trap-react',
        //? Possible external dependencies
        // 'lucide-react',
        // 'lucide-preact',
        // /^lucide-react\/.*/,
        // /^lucide-preact\/.*/,
      ],
      output: {
        globals: {
          preact: 'Preact',
          'preact/hooks': 'PreactHooks',
          'preact/compat': 'PreactCompat',
          react: 'React',
          'react-dom': 'ReactDOM',
          // 'lucide-react': 'LucideReact',
          // 'lucide-preact': 'LucidePreact',
        },
        assetFileNames: 'styles/style[extname]',
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
