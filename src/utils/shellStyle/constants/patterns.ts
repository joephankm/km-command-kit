/**
 * Pattern source matching one style escape — an ANSI SGR sequence: the escape character, `[`, any
 * digits and semicolons, then `m`.
 *
 * @example `\u001B[1;94mhi` => `\u001B[1;94m`
 */
const STYLE_ESCAPE = '\\u001B\\[[0-9;]*m';

export default {
  /**
   * Every style escape in a text.
   *
   * @example `\u001B[1mhi\u001B[22m` => `\u001B[1m`, `\u001B[22m`
   */
  StyleEscapes: new RegExp(STYLE_ESCAPE, 'gu'),

  /**
   * Every style escape in a text, captured so that splitting on it keeps each escape as a part, at
   * every odd index.
   *
   * @example `say \u001B[1mhi\u001B[22m` => `['say ', '\u001B[1m', 'hi', '\u001B[22m', '']`
   */
  StyleEscapeSplit: new RegExp(`(${STYLE_ESCAPE})`, 'u'),
};
