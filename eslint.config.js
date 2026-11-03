// eslint.config.js
import { fileURLToPath } from 'url';
import path from 'path';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import reactNative from 'eslint-plugin-react-native';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import js from '@eslint/js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: path.join(__dirname, 'tsconfig.json'),
      },
      globals: {
        console: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        __dirname: true,
        NodeJS: true,
        fetch: 'readonly',
        process: 'readonly',
        __DEV__: 'readonly',
        Buffer: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': a11y,
      import: importPlugin,
      'react-native': reactNative,
      prettier: prettierPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          project: path.join(__dirname, 'tsconfig.json'),
        },
      },
    },
    rules: {
      'prettier/prettier': 'error',

      'no-unused-vars': 'off',

      // TS
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',

      // React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',

      // Import
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  prettierConfig,

  {
    files: ['*.config.ts', '*.config.js', '*.config.cjs'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        __filename: true,
      },
    },
  },

  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.spec.tsx', '**/*.test.tsx'],
    languageOptions: {
      globals: {
        describe: true,
        test: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        vi: true,
      },
    },
  },
];
