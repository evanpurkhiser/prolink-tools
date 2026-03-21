/* eslint-env node */
module.exports = {
  env: {browser: true},
  extends: ['@evanpurkhiser'],

  settings: {
    // Using preact, be explicit about the version
    react: {version: '16.0'},
  },

  rules: {
    // @evanpurkhiser enables prettier/prettier, but formatting now uses oxfmt
    'prettier/prettier': 'off',
    'simple-import-sort/imports': 'off',
    'simple-import-sort/exports': 'off',
    // Remove when I switch @evanpurkhiser to include this
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    // Allow decorators to be imported without being flagged as unused
    // Also allow variables and args starting with underscore (intentionally unused)
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern:
          '^(_|action|computed|observable|serializable|object|list|map|mapAsArray|primitive|date|rawJsSerialize|bufferSerialize|deviceToJs)',
        argsIgnorePattern: '^_',
      },
    ],
  },
};
