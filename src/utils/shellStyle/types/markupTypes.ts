import type { BoxAlign } from './boxTypes';
import type { ShellStyleName, ShellStyleStartCodeName } from './styleTypes';

/**
 * Where content sits within its width: one of the box alignments, or spread to touch both edges.
 */
export type TextAlign = BoxAlign | 'justify';

/**
 * Which side of the content its padding sits on: before it, after it, or both (`true`).
 */
export type PaddingSide = 'left' | 'right' | true;

/**
 * Which side of a block its margin sits on: above it, below it, both (`true`), or neither
 * (`false`).
 */
export type MarginSide = 'top' | 'bottom' | boolean;

/**
 * Every option the markup formatters share, each formatter picking the ones it takes.
 */
export type MarkupOptions = {
  /** The columns content is given to align and wrap within; unset, nothing wraps. */
  width?: number;
  /** Where content sits within its width, default is `'left'`. */
  align?: TextAlign;
  /** How many columns the content is pushed right from the left edge. */
  indent?: number;
  /** Which side of the content its padding sits on. */
  padding?: PaddingSide;
  /** How many blank columns the padding is, default is `1`. */
  paddingSize?: number;
  /** Which side of the block its margin sits on. */
  margin?: MarginSide;
  /** How many blank lines the margin is, default is `1`. */
  marginSize?: number;
};

/**
 * Options for formatting a block of text.
 */
export type FormatBlockOptions = Pick<
  MarkupOptions,
  'width' | 'align' | 'indent' | 'padding' | 'paddingSize' | 'margin' | 'marginSize'
>;

/**
 * A way to recase a text's letters: every letter a capital, every letter small, the first letter of
 * every word a capital, or the first letter of the text a capital.
 */
export type TextCase = 'upper' | 'lower' | 'title' | 'sentence' | 'capitalize';

/**
 * Options for formatting a piece of text: the style it takes, and the case its letters are set in.
 */
export type FormatTextOptions = {
  /** A predefined style by name, or a list of code names to build one from. */
  style?: ShellStyleName | readonly ShellStyleStartCodeName[];
  /** The case the text's letters are set in. */
  textCase?: TextCase;
};
