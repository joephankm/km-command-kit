import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig(
  {
    files: ['**/*.{js,ts}'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked, eslintConfigPrettier],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.script.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
