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

  /**
   * The first letter of every word, along with the space before the word and anything in the word
   * ahead of that letter: punctuation, and style escapes. Captures the space, what comes ahead of
   * the letter, and the letter.
   *
   * @example `(see) the \u001B[1mrest` => `(s`, ` t`, ` \u001B[1mr` => `s`, `t`, `r`
   */
  WordStart: new RegExp(`(^|\\s)((?:${STYLE_ESCAPE}|[^\\s\\p{L}])*)(\\p{L})`, 'gu'),

  /**
   * The first letter of the text, along with everything ahead of it: spaces, punctuation, and style
   * escapes. Captures what comes ahead of the letter, and the letter.
   *
   * @example `  "\u001B[1mquote` => `  "\u001B[1mq` => `q`
   */
  TextStart: new RegExp(`^((?:${STYLE_ESCAPE}|[^\\p{L}])*)(\\p{L})`, 'u'),
};
