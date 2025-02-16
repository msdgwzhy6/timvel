module.exports = {
  env: {
    node: true,
    es6: true,
  },
  parser: 'babel-eslint',
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    ecmaVersion: 9,
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  rules: {
    indent: [0, 2],
    'linebreak-style': [1, 'unix'],
    quotes: [1, 'single'],
    semi: [1, 'always'],
    'no-unused-vars': 1,
    'no-console': 0,
    'no-extra-boolean-cast': 0,
    'max-len': [1, { code: 80 }],
    'react/prop-types': 0,
    'react/no-deprecated': 1,
    'react/display-name': 0,
    'no-useless-escape': 0,
    'no-empty-pattern': 0,
    'no-empty': 0,
    'no-undef':0
  },
};
