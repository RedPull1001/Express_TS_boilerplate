module.exports = {
    env: {
      es6: true,
      node: true
    },
    extends: [
      'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      sourceType: 'module'
    },
    plugins: [
      '@typescript-eslint'
    ],
    "overrides": [
      {
        "files": ["*"],
        "rules": {
          "@typescript-eslint/no-var-requires": "off",
        }
      },
    ]
  };