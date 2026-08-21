// ⚙️ Prettier Formatting Rules. <Last updated: 2025-07-04>
// Docs:  https://prettier.io/docs/configuration  -- Prettier Configuration

/**
 * @see {@link https://prettier.io/docs/options Prettier Options}
 * @type {import('prettier').Config}
 */
const config = {
  /** ════════════════ Common ════════════════ **/
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  tabWidth: 2,
  useTabs: false,
  printWidth: 120,
  arrowParens: 'avoid',
  endOfLine: 'auto',

  /** ═══════════════ FrontEnd ═══════════════ **/
  jsxSingleQuote: false,
  bracketSameLine: false,
};

export default config;
