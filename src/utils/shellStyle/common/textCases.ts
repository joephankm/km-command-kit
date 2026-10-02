import Pattern from '../constants/patterns';

/**
 * Uppercases the first character of text, leaving the rest as it is.
 *
 * Example: `pArSe the inPUT` → `PArSe the inPUT`
 */
export const capitalize = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

/**
 * Lowercases the first character of text, leaving the rest as it is.
 *
 * Example: `PArSe the inPUT` → `pArSe the inPUT`
 */
export const unCapitalize = (text: string): string => `${text.charAt(0).toLowerCase()}${text.slice(1)}`;

/**
 * Sets text in title case: the first letter of every word a capital, every other letter small.
 *
 * Example: `pArSe the inPUT` → `Parse The Input`
 */
export const titleCase = (text: string): string =>
  text
    .toLowerCase()
    .replace(
      Pattern.WordStart,
      (_match, space: string, lead: string, letter: string) => space + lead + letter.toUpperCase()
    );

/**
 * Sets text in sentence case: the first letter of the text a capital, every other letter small.
 *
 * Example: `pArSe the inPUT` → `Parse the input`
 */
export const sentenceCase = (text: string): string =>
  text.toLowerCase().replace(Pattern.TextStart, (_match, lead: string, letter: string) => lead + letter.toUpperCase());
