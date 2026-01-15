import type { Linter } from 'eslint';
// @ts-expect-error - No types available for eslint-plugin-jsx-a11y
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['node_modules/', 'build/', 'public/', 'dist/', 'coverage/', 'reports/', 'storybook-static/', '**/*.d.ts'],
  },
  // NOTE: eslint.configs.recommended removed - Biome handles base JS rules
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  jsxA11yPlugin.flatConfigs.strict,
  // NOTE: stylisticTypeChecked removed - overlaps with Biome (useForOf, useOptionalChain, etc.)
  ...tseslint.configs.strictTypeChecked,

  // TypeScript parser settings
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // TSX files: React + a11y
  {
    files: ['**/*.tsx'],
    ...reactPlugin.configs.flat.recommended,
    settings: { react: { version: 'detect', pragma: 'h' } },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': [
        'error',
        {
          ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
          ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
          li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
          fieldset: ['radiogroup'],
          table: ['grid'],
          td: ['gridcell'],
        },
      ],
      // Disable React rules that Biome handles
      'react/jsx-key': 'off',
      'react/jsx-no-comment-textnodes': 'off',
      'react/jsx-no-duplicate-props': 'off',
      'react/jsx-no-target-blank': 'off',
      'react/no-children-prop': 'off',
      'react/no-danger-with-children': 'off',
      'react/prop-types': 'off',
      // Preact uses onDblClick, React uses onDoubleClick
      'react/no-unknown-property': [
        'error',
        {
          ignore: ['onDblClick'],
          requireDataLowercase: true,
        },
      ],
    },
  },

  // TypeScript strict rules (non-conflicting with Biome)
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      // UI library: Components handle events synchronously.
      // Async operations are the responsibility of the consuming application.
      // These rules add significant lint time with no benefit for UI components.
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      // Deprecation warnings are shown in IDE via TypeScript language service.
      // This rule adds ~2s to lint time. Run `tsc` to catch deprecations if needed.
      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true, ignoreVoidOperator: true },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true }],
      '@typescript-eslint/no-dynamic-delete': 'off',
      // Disable rules that Biome handles
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-misused-new': 'off',
      'prefer-const': 'off',
      'no-var': 'off',
    },
  },

  // Config files: relax explicit return types
  {
    files: ['*.config.ts', '*.config.*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
] satisfies Linter.Config[];
