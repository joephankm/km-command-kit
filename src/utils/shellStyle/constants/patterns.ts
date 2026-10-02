/**
 * Pattern source matching one style escape — an ANSI SGR sequence, such as `\u001B[1;94m`.
 */
const STYLE_ESCAPE = '\\u001B\\[[0-9;]*m';

export default {
  /**
   * Every style escape in a text.
   */
  StyleEscapes: new RegExp(STYLE_ESCAPE, 'gu'),

  /**
   * The first letter of every word, along with the space before the word and anything in the word
   * ahead of that letter: punctuation, and style escapes.
   */
  WordStart: new RegExp(`(^|\\s)((?:${STYLE_ESCAPE}|[^\\s\\p{L}])*)(\\p{L})`, 'gu'),

  /**
   * The first letter of the text, along with everything ahead of it: spaces, punctuation, and style
   * escapes.
   */
  TextStart: new RegExp(`^((?:${STYLE_ESCAPE}|[^\\p{L}])*)(\\p{L})`, 'u'),
};
