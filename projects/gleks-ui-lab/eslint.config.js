// @ts-check
const { defineConfig } = require('eslint/config');
const rootConfig = require('../../eslint.config.js');

module.exports = defineConfig([
  ...rootConfig,
  {
    files: ['**/*.ts'],
    rules: {
      // The lab is a consumer of the library, not part of it, so the `gog` prefix that guards the
      // published package's namespace does not apply here.
      //
      // Its example files lean on this hardest: every one of them is `app-example`, on purpose.
      // The StackBlitz project an example opens in mounts `<app-example />` as its root, so the
      // selector is part of the contract with the generated project rather than a free choice —
      // see `docs/lab-examples-refactor.md`.
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
]);
