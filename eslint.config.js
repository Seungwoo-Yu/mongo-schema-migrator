const stylisticJs = require('@stylistic/eslint-plugin-js');
const stylisticTs = require('@stylistic/eslint-plugin-ts');
const im = require('eslint-plugin-import');
const node = require('eslint-plugin-n');
const promise = require('eslint-plugin-promise');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat();

// noinspection JSUnusedGlobalSymbols
/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
module.exports = [
  {
    ignores: ['dist/**/*.js'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    plugins: {
      import: im,
      node: node.configs['flat/recommended-script'],
      promise: promise.configs.recommended,
      stylisticJs: stylisticJs,
    },
    rules: {
      'stylisticJs/indent': ['error', 2],
      'stylisticJs/quotes': ['error', 'single'],
      'stylisticJs/semi': 'error',
      'stylisticJs/arrow-parens': 'error',
      'stylisticJs/brace-style': ['error', '1tbs'],
      'stylisticJs/quote-props': ['error', 'as-needed'],
      'stylisticJs/comma-dangle': ['error', 'always-multiline'],
      'stylisticJs/max-len': ['error', { code: 120 }],
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      stylisticTs: stylisticTs,
    },
    rules: {
      'stylisticTs/indent': ['error', 2],
      'stylisticTs/quotes': ['error', 'single'],
      'stylisticTs/semi': 'error',
      'stylisticTs/brace-style': ['error', '1tbs'],
      'stylisticTs/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'comma',
            requireLast: true,
          },
          singleline: {
            delimiter: 'comma',
            requireLast: false,
          },
        },
      ],
      'stylisticTs/quote-props': ['error', 'as-needed'],
      'stylisticTs/comma-dangle': ['error', 'always-multiline'],
      'stylisticJs/max-len': ['error', { code: 120 }],
    },
  },
  ...compat.config({
    extends: ['plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
      }],
      '@typescript-eslint/explicit-member-accessibility': ['error', {
        accessibility: 'explicit',
        overrides: {constructors: 'no-public'},
      }],
    },
  }).map((config) => ({
    files: ['**/*.ts'],
    ...config,
  })),
];
