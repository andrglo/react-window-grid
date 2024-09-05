module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  globals: {
    connect: true
  },
  plugins: ['react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'generator-star-spacing': [
      'error',
      {
        before: false,
        after: true
      }
    ],
    'comma-dangle': 0,
    'no-multi-assign': 0,
    'require-jsdoc': 0,
    'react/jsx-no-bind': 0,
    'react/jsx-uses-react': 2,
    'react/jsx-uses-vars': 2,
    'react/react-in-jsx-scope': 2,
    'react/prefer-stateless-function': 0,
    'react/no-multi-comp': 0,
    'block-scoped-var': 0,
    'padded-blocks': 0,
    'no-console': 0,
    'no-param-reassign': 0,
    'vars-on-top': 0,
    'no-loop-func': 1,
    'no-case-declarations': 1,
    'no-underscore-dangle': 0,
    'import/no-unresolved': 0,
    'no-nested-ternary': 0,
    'new-cap': 1,
    'no-confusing-arrow': 0,
    'prefer-template': 0,
    'prefer-const': ['error', {destructuring: 'all'}],
    'consistent-return': 0,
    'id-length': 0,
    'space-before-function-paren': [
      2,
      {
        anonymous: 'never',
        named: 'never'
      }
    ],
    'no-shadow': 0,
    semi: ['error', 'never'],
    'no-unused-expressions': 0,
    'no-unused-vars': [
      'error',
      {ignoreRestSiblings: true, varsIgnorePattern: '^_'}
    ],
    'import/no-extraneous-dependencies': 0,
    'object-curly-spacing': ['error', 'never'],
    'no-extra-parens': 0,
    'arrow-parens': ['error', 'as-needed'],
    'yield-star-spacing': ['error', {before: true, after: false}],
    'max-len': [
      'error',
      {
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    'no-var': 0,
    'import/extensions': 0,
    'react/jsx-indent': 0,
    'react/display-name': 0,
    'react/jsx-space-before-closing': 0,
    'react/jsx-wrap-multilines': 0,
    'react/prop-types': 1,
    'react/forbid-prop-types': 0,
    'react/require-default-props': 0,
    'react/jsx-tag-spacing': [
      2,
      {
        closingSlash: 'never',
        beforeSelfClosing: 'always',
        afterOpening: 'never'
      }
    ],
    'react/no-unused-prop-types': 1,
    'default-case': 0,
    'no-mixed-operators': 0,
    'no-restricted-syntax': 0,
    'no-extra-boolean-cast': 0,
    'no-plusplus': 0,
    'func-names': 0,
    'no-unreachable': 2,
    indent: 0,
    'no-multi-spaces': 2,
    'no-invalid-this': 0,
    'no-undef': 2,
    eqeqeq: 2,
    'import/order': [
      2,
      {
        groups: [
          'builtin',
          ['external', 'internal'],
          'parent',
          'sibling',
          'index'
        ]
      }
    ]
  }
}
