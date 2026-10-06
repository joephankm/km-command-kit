/**
 * Pattern source for ANSI SGR style sequences.
 *
 * @example `\u001B[1;94mhi` => `\u001B[1;94m`
 */
const STYLE_ESCAPE = '\\u001B\\[[0-9;]*m';

/**
 * Patterns used to locate letters for text-case conversion.
 */
const ShellPattern = {
  /**
   * Locates the first letter of each word while preserving leading punctuation and style codes.
   *
   * @example `(see) the \u001B[1mrest` => `(s`, ` t`, ` \u001B[1mr` => `s`, `t`, `r`
   */
  WordStart: new RegExp(`(^|\\s)((?:${STYLE_ESCAPE}|[^\\s\\p{L}])*)(\\p{L})`, 'gu'),

  /**
   * Locates the first letter of text while preserving leading spaces, punctuation, and style codes.
   *
   * @example `  "\u001B[1mquote` => `  "\u001B[1mq` => `q`
   */
  TextStart: new RegExp(`^((?:${STYLE_ESCAPE}|[^\\p{L}])*)(\\p{L})`, 'u'),
};

/**
 * Capitalizes text.
 *
 * @example `pArSe the inPUT` => `PArSe the inPUT`
 */
export const capitalize = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

/**
 * Lowercases the initial character of text.
 *
 * @example `PArSe the inPUT` => `pArSe the inPUT`
 */
export const unCapitalize = (text: string): string => `${text.charAt(0).toLowerCase()}${text.slice(1)}`;

/**
 * Converts text to title case.
 *
 * Behavior:
 * - Capitalizing the first letter of each word.
 * - Lowercasing the remaining letters.
 *
 * @example `pArSe the inPUT` => `Parse The Input`
 */
export const titleCase = (text: string): string =>
  text
    .toLowerCase()
    .replace(
      ShellPattern.WordStart,
      (_match, space: string, lead: string, letter: string) => space + lead + letter.toUpperCase()
    );

/**
 * Converts text to sentence case.
 *
 * Behavior:
 * - Capitalizing the first letter of the text.
 * - Lowercasing the remaining letters.
 *
 * @example `pArSe the inPUT` => `Parse the input`
 */
export const sentenceCase = (text: string): string =>
  text
    .toLowerCase()
    .replace(ShellPattern.TextStart, (_match, lead: string, letter: string) => lead + letter.toUpperCase());
