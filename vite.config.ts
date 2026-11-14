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
      // Off: every hit is an intentional ARIA role on an unstyled widget, not a native-tag candidate.
      'jsx-a11y/prefer-tag-over-role': 'off',

      'no-console': 'warn',
      'no-empty': 'error',
      'no-empty-function': 'error',
      'no-regex-spaces': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true }],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'react/no-unknown-property': 'error',
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
      // Forbid barrel-import cycles that break Rollup chunking.
      'import/no-cycle': 'error',
      'react/jsx-no-comment-textnodes': 'error',
      'typescript/no-confusing-non-null-assertion': 'error',
      'typescript/no-extraneous-class': 'error',
      'typescript/no-unnecessary-boolean-literal-compare': 'error',
      'typescript/no-unnecessary-template-expression': 'error',
      'typescript/no-unnecessary-type-arguments': 'warn',
      'typescript/no-unnecessary-type-assertion': 'error',
      'typescript/no-unnecessary-type-constraint': 'error',
      'typescript/no-unsafe-enum-comparison': 'error',

      'no-array-constructor': 'error',
      'no-case-declarations': 'error',
      'no-fallthrough': 'error',
      'no-prototype-builtins': 'error',
      // Off: the JS rule has no type-namespace awareness, so a type and a value sharing a name
      // (`type TooltipTrigger` + `function TooltipTrigger`) reads as a redeclaration. tsc reports
      // the real ones as TS2451.
      'no-redeclare': 'off',
      'react/display-name': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-unescaped-entities': 'error',
      'react/rules-of-hooks': 'error',

      // Off: these React Compiler lints are dominated by the ref-sync-on-render idiom used to keep
      // callbacks current without re-subscribing effects. Turning them on requires reworking those
      // hooks rather than suppressing per line — tracked in #538.
      'react/refs': 'off',
      'react/set-state-in-effect': 'off',
      // Off: every hit is a deliberate read of the current date during render (today, default time).
      'react/purity': 'off',
      'typescript/ban-ts-comment': ['error', { minimumDescriptionLength: 10 }],
      'typescript/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true, ignoreVoidOperator: true }],
      'typescript/no-mixed-enums': 'error',

      'import/no-duplicates': 'error',
      'typescript/adjacent-overload-signatures': 'error',
      'typescript/ban-tslint-comment': 'error',
      'typescript/class-literal-property-style': 'off',
      'typescript/consistent-generic-constructors': 'error',
      'typescript/consistent-indexed-object-style': 'error',
      'typescript/consistent-type-assertions': 'error',
      'typescript/no-inferrable-types': 'off',
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
          'react/rules-of-hooks': 'off',
          // Demo handlers log freely; console is dropped from the library build.
          'no-console': 'off',
        },
      },
      {
        files: ['*.config.ts', '*.config.*.ts'],
        rules: {
          'typescript/explicit-function-return-type': 'off',
        },
      },
      {
        files: ['scripts/**'],
        rules: {
          // Reporting to stdout is what these scripts are for.
          'no-console': 'off',
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
  // The library is built against React; Preact consumers alias `react` to `preact/compat`.
  // Storybook adds the Preact preset on top of this config in `.storybook/main.ts`.
  oxc: {
    jsx: { runtime: 'automatic', importSource: 'react' },
  },
  plugins: [
    tailwindcss(),
    EnvironmentPlugin('all'),
    dts({
      tsconfigPath: './tsconfig.build.json',
      outDirs: 'dist/types',
      exclude: ['**/*.stories.tsx', '**/*.test.{ts,tsx}', 'src/testing/**', '.storybook/**/*'],
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
      entry: {
        'enonic-ui': path.resolve(__dirname, 'src/index.ts'),
        style: path.resolve(__dirname, 'src/style.ts'),
      },
      name: 'EnonicUI',
      fileName: (format, entryName) =>
        entryName === 'style'
          ? format === 'cjs'
            ? 'style.cjs'
            : `style.${format}.js`
          : format === 'cjs'
            ? 'enonic-ui.cjs'
            : `enonic-ui.${format}.js`,
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
        /^react(\/.*)?$/,
        /^react-dom(\/.*)?$/,
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
          react: 'React',
          'react-dom': 'ReactDOM',
          // 'lucide-react': 'LucideReact',
          // 'lucide-preact': 'LucidePreact',
        },
        assetFileNames: 'styles/style[extname]',
      },
    },
  },
  // Storybook runs on Preact only, so these tests are the one place the source runs on React.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/testing/setup.ts'],
  },
  resolve: {
    alias: {
      // Allow imports like `import { Button } from 'enonic-ui'`
      '@': path.resolve(__dirname, './src'),
    },
  },
});
