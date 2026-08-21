// ⚙️ Lint-Staged tasks for staged files. <Last updated: 2025-12-25>
// Docs:  https://github.com/lint-staged/lint-staged?tab=readme-ov-file#configuration
// Guide: docs/js-foundation/code-quality-workflow/tools/lint-staged.md

/**
 * @type {import('lint-staged').Configuration}
 */
const config = {
  '*.ts?(x)': [
    // Run full project type check (not per-file)
    () => 'tsc --noEmit',
  ],
  '*.{ts,tsx,js,mjs}': [
    // Lint TypeScript and JavaScript files for code quality and best practices
    'eslint --no-warn-ignored',
    // Ensure consistent formatting using Prettier
    'prettier --write',
  ],
  '*.json': [
    // Normalize formatting for machine-readable files
    'prettier --write',
  ],
};

export default config;
