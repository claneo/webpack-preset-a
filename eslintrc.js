module.exports = {
  overrides: [
    {
      files: ['src/**/*'],
      parserOptions: { project: './tsconfig.json' },
      extends: [
        'airbnb-base',
        'airbnb/rules/react',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended',
        'prettier/react',
        'prettier/@typescript-eslint',
        'plugin:import/typescript',
      ],
      plugins: ['react-hooks'],
      env: {
        browser: true,
      },
      rules: {
        'no-param-reassign': [
          'error',
          {
            props: false,
          },
        ],
        'prefer-destructuring': 0,
        'no-template-curly-in-string': 0,
        'global-require': 0,

        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/camelcase': 0,
        '@typescript-eslint/no-inferrable-types': 0,
        '@typescript-eslint/ban-ts-ignore': 0,
        '@typescript-eslint/unbound-method': 0,

        'react/sort-comp': 0,
        'react/jsx-filename-extension': ['error', { extensions: ['.js', '.tsx'] }],
        'react/destructuring-assignment': 0,
        'react/prop-types': 0,
        'react/jsx-props-no-spreading': 0,

        'react-hooks/rules-of-hooks': 'error',

        'import/prefer-default-export': 0,
        'import/no-cycle': 0,
        'import/named': 0,
      },
    },
    {
      files: ['*'],
      excludedFiles: ['src/**/*'],
      extends: ['eslint:recommended', 'plugin:prettier/recommended'],
      parserOptions: { ecmaVersion: 11, sourceType: 'module' },
      env: {
        node: true,
        es6: true,
      },
    },
  ],
  rules: {},
};
