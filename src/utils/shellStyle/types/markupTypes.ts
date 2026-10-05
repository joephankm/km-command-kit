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
 * Every option the markup formatters share, each formatter picking the ones it takes.
 */
export type MarkupOptions = {
  /** The columns content is given to align and wrap within; unset, nothing wraps. */
  width?: number;
  /** Text set where content cut down to the width ends, inside the width, default is `...`. */
  ellipsis?: string;
  /** Text repeated to fill the columns left over when aligning content, default is a space. */
  fill?: string;
  /** Where content sits within its width, default is `'left'`. */
  align?: TextAlign;
  /** How many columns the content is pushed right from the left edge. */
  indent?: number;
  /** Which side of the content its padding sits on. */
  padding?: PaddingSide;
  /** How many blank columns the padding is, default is `1`. */
  paddingSize?: number;
  /** Text set before every line, such as an indent, inside the width. */
  linePrefix?: string;
  /**
   * Text set before each paragraph's first line in place of `linePrefix`, or a function of the
   * paragraph's index returning it, such as a list number.
   */
  firstLinePrefix?: string | ((index: number) => string);
  /** Text set after every line, inside the width. */
  lineSuffix?: string;
  /**
   * The mark set ahead of every list item, or after its number in a numbered list, default is
   * `•`, or `.` when numbered.
   */
  marker?: string;
  /** Numbers the list items, in order. */
  numbered?: boolean;
  /** The number the first list item takes when numbered, default is `1`. */
  startNumber?: number;
  /**
   * The columns every number is right-aligned within when numbered, default is the width of the
   * largest number in the list.
   */
  numberWidth?: number;
  /** How many blank lines come before the first block. */
  spaceBefore?: number;
  /** How many blank lines follow each block, default is `1`. */
  spaceAfter?: number;
};

/**
 * Lines as one text joined by line breaks, or as an array of lines when `AsArray` is `true`.
 */
export type TextLines<AsArray extends boolean> = AsArray extends true ? string[] : string;

/**
 * Options for formatting a single line of text.
 */
export type FormatLineOptions = Pick<
  MarkupOptions,
  'width' | 'align' | 'ellipsis' | 'fill' | 'padding' | 'paddingSize'
>;

/**
 * Options for formatting a list of items.
 */
export type FormatListOptions<AsArray extends boolean = false> = Pick<
  MarkupOptions,
  | 'width'
  | 'indent'
  | 'marker'
  | 'numbered'
  | 'startNumber'
  | 'numberWidth'
  | 'align'
  | 'padding'
  | 'paddingSize'
  | 'spaceBefore'
  | 'spaceAfter'
> & {
  /** Returns the lines as an array, one per line, instead of joined by line breaks. */
  asArray?: AsArray;
};

/**
 * Options for formatting a block of text.
 */
export type FormatBlockOptions<AsArray extends boolean = false> = Pick<
  MarkupOptions,
  | 'width'
  | 'align'
  | 'indent'
  | 'padding'
  | 'paddingSize'
  | 'linePrefix'
  | 'firstLinePrefix'
  | 'lineSuffix'
  | 'spaceBefore'
  | 'spaceAfter'
> & {
  /** Returns the lines as an array, one per line, instead of joined by line breaks. */
  asArray?: AsArray;
};

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
