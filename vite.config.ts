import preactPreset from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';
import dts from 'vite-plugin-dts';
import EnvironmentPlugin from 'vite-plugin-environment';
import { defineConfig } from 'vite-plus';

// `vp` (oxc) loads this config as native ESM where `__dirname` is undefined.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Shared excludes for both oxlint (`lint.ignorePatterns`) and oxfmt (`fmt.ignorePatterns`).
// ! oxfmt only honors the local .gitignore, so agent/scratch dirs and the lockfile must be
// listed here explicitly — otherwise `vp check` walks into .claude/, .playwright-mcp/, etc.
const IGNORE_PATTERNS = [
  'node_modules/',
  'build/',
  'public/',
  'dist/',
  'coverage/',
  'reports/',
  'storybook-static/',
  'examples/',
  '.claude/',
  '.playwright-mcp/',
  '.tmp/',
  '.vite-hooks/',
  'pnpm-lock.yaml',
  '**/*.d.ts',
];

export default defineConfig({
  base: './',
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    plugins: ['oxc', 'typescript', 'unicorn', 'react', 'import', 'jsx-a11y'],
    categories: {
      correctness: 'error',
    },
    options: {
      typeAware: true,
    },
    env: {
      builtin: true,
      es2024: true,
    },
    ignorePatterns: IGNORE_PATTERNS,
    rules: {
      'no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'typescript/restrict-template-expressions': ['error', { allowNumber: true }],
      'react/exhaustive-deps': 'error',
      'jsx-a11y/prefer-tag-over-role': 'warn',

      'no-console': 'warn',
      'no-empty': 'error',
      'no-empty-function': 'error',
      'no-regex-spaces': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true }],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      // Preact uses non-standard DOM properties (e.g. onDblClick); disabled to avoid false positives.
      'react/no-unknown-property': 'off',
      'typescript/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowConciseArrowFunctionExpressionsStartingWithVoid: true },
      ],
      'typescript/no-empty-object-type': 'error',
      'typescript/no-explicit-any': 'error',
      'typescript/no-invalid-void-type': 'error',
      'typescript/no-namespace': 'error',
      'typescript/no-non-null-asserted-nullish-coalescing': 'error',
      'typescript/no-require-imports': 'error',
      'typescript/prefer-literal-enum-member': 'error',
      'typescript/use-unknown-in-catch-callback-variable': 'error',

      'no-unexpected-multiline': 'error',
      'no-useless-constructor': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'react/jsx-no-comment-textnodes': 'error',
      'typescript/no-confusing-non-null-assertion': 'error',
      'typescript/no-extraneous-class': 'error',
      'typescript/no-unnecessary-boolean-literal-compare': 'error',
      'typescript/no-unnecessary-template-expression': 'error',
      'typescript/no-unnecessary-type-arguments': 'warn',
      'typescript/no-unnecessary-type-constraint': 'error',
      'typescript/no-unsafe-enum-comparison': 'error',

      'no-array-constructor': 'error',
      'no-case-declarations': 'error',
      'no-fallthrough': 'error',
      'no-prototype-builtins': 'error',
      'no-redeclare': 'error',
      'react/display-name': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-unescaped-entities': 'error',
      'react/rules-of-hooks': 'error',
      'typescript/ban-ts-comment': ['error', { minimumDescriptionLength: 10 }],
      'typescript/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true, ignoreVoidOperator: true }],
      'typescript/no-mixed-enums': 'error',

      // `react` and `react-dom` both alias to `preact/compat` (tsconfig paths), so the resolver
      // treats them as one module and false-flags every file importing both. Off for Preact compat.
      'import/no-duplicates': 'off',
      'typescript/adjacent-overload-signatures': 'error',
      'typescript/ban-tslint-comment': 'error',
      'typescript/class-literal-property-style': 'error',
      'typescript/consistent-generic-constructors': 'error',
      'typescript/consistent-indexed-object-style': 'error',
      'typescript/consistent-type-assertions': 'error',
      'typescript/no-inferrable-types': 'error',
      'typescript/prefer-find': 'error',
      'typescript/prefer-for-of': 'error',
      'typescript/prefer-function-type': 'error',
      'typescript/prefer-regexp-exec': 'error',
      'typescript/prefer-return-this-type': 'error',
      'typescript/prefer-string-starts-ends-with': 'error',
      'typescript/unified-signatures': 'error',
    },
    overrides: [
      {
        files: ['**/*.stories.tsx', '.storybook/**/*.{ts,tsx}'],
        rules: {
          'react/display-name': 'off',
          'typescript/explicit-function-return-type': 'off',
          // Storybook `render`/`play` arrows call hooks but aren't statically recognized as components.
          'react-hooks/rules-of-hooks': 'off',
        },
      },
      {
        files: ['*.config.ts', '*.config.*.ts'],
        rules: {
          'typescript/explicit-function-return-type': 'off',
        },
      },
    ],
  },
  fmt: {
    ignorePatterns: IGNORE_PATTERNS,
    printWidth: 120,
    semi: true,
    trailingComma: 'all',
    singleQuote: true,
    arrowParens: 'avoid',
    bracketSpacing: true,
    jsxSingleQuote: true,
    sortImports: {
      newlinesBetween: true,
      customGroups: [{ groupName: 'css', elementNamePattern: ['*.css', '*.scss', '*.sass'] }],
      groups: [
        ['value-builtin', 'value-external'],
        'value-internal',
        'type-import',
        ['value-parent', 'value-sibling', 'value-index'],
        'css',
        'unknown',
      ],
    },
    sortPackageJson: false,
    sortTailwindcss: {
      functions: ['cn', 'clsx', 'cva', 'twMerge', 'twJoin'],
    },
  },
  plugins: [
    // Library build is always production: drop prefresh HMR, and strip the devtools/
    // hook-name plugins the preset always wires in — they inject nothing without an HTML
    // entry but still run resolveId/transform on every module. Filtered by name; if the
    // preset renames them this degrades to the old (working) overhead, not a breakage.
    ...preactPreset({ prefreshEnabled: false, devToolsEnabled: false }).filter(
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
