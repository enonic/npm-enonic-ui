import eslint from '@eslint/js';
import type { Linter } from 'eslint';
import { flatConfigs } from 'eslint-plugin-import';
// @ts-expect-error - No types available for eslint-plugin-jsx-a11y
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import path from 'path';
import { configs as tsConfigs } from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  flatConfigs.recommended,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  jsxA11yPlugin.flatConfigs.strict,
  ...tsConfigs.strictTypeChecked,
  ...tsConfigs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json'],
        tsconfigRootDir: path.resolve(__dirname),
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true }],
      '@typescript-eslint/member-ordering': ['error'],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true, ignoreVoidOperator: true },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-dynamic-delete': 'off',
      'import/named': 'off',
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
      '@typescript-eslint/no-unused-vars': [
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
      '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
      '@typescript-eslint/no-deprecated': [
        'error',
        {
          allow: [
            { from: 'package', name: 'ChangeEvent', package: 'react' },
            { from: 'package', name: 'FocusEvent', package: 'react' },
            { from: 'package', name: 'KeyboardEvent', package: 'react' },
            { from: 'package', name: 'MouseEvent', package: 'react' },
          ],
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
        pragma: 'h',
        createClass: 'Component',
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.app.json'],
        },
      },
    },
  },
  {
    files: ['**/*.tsx'],
    ...reactPlugin.configs.flat.recommended,
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['*.config.ts', '*.config.*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.node.json',
        tsconfigRootDir: path.resolve(__dirname),
      },
    },
  },
  {
    ignores: ['node_modules/', 'build/', 'public/', 'dist/', 'storybook-static/', '**/*.d.ts'],
  },
] satisfies Linter.Config[];
