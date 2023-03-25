module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 13,
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'import/no-unresolved': [
      'error',
      {
        ignore: ['amazon-cognito-identity-js']
      }
    ],
    'react/jsx-sort-props': [
      2,
      {
        callbacksLast: true,
        shorthandFirst: true,
        shorthandLast: false,
        ignoreCase: false,
        noSortAlphabetically: false,
        reservedFirst: true
      }
    ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'react/jsx-sort-default-props': ['error', { ignoreCase: false }],
    'import/no-named-as-default': 'off',
    'linebreak-style': 'off',
    'react/jsx-no-target-blank': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        singleQuote: true,
        jsxSingleQuote: true,
        trailingComma: 'none',
        arrowParens: 'avoid'
      }
    ]
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  }
};
