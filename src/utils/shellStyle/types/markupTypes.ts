import type { BoxAlign } from './boxTypes';
import type { ShellStyleFunc, ShellStyleName, ShellStyleStartCodeName } from './styleTypes';
import type { NumberStyleName } from '../common/numberStyles';

/**
 * A style given as a style name, or as a list of start code names to build one from.
 */
export type ShellTextStyle = ShellStyleName | readonly ShellStyleStartCodeName[];

/**
 * Text alignment modes for markup formatting.
 */
export type TextAlign = BoxAlign | 'justify';

/**
 * Side or sides where text padding appears.
 */
export type PaddingSide = 'left' | 'right' | true;

/**
 * Shared formatting settings for markup text.
 */
export type MarkupOptions = {
  /**
   * Target width for formatted content.
   */
  width?: number;
  /**
   * Marker appended to shortened content.
   *
   * @default '...'
   */
  ellipsis?: string;
  /**
   * Character used to fill unused width.
   *
   * @default ' '
   */
  fill?: string;
  /**
   * Content alignment.
   *
   * @default 'left'
   */
  align?: TextAlign;
  /**
   * Indentation before content.
   */
  indent?: number;
  /**
   * Side or sides where padding appears around content.
   */
  padding?: PaddingSide;
  /**
   * Number of padding characters.
   *
   * @default 1
   */
  paddingSize?: number;
  /**
   * Text placed before each line.
   */
  linePrefix?: string;
  /**
   * Prefix used on each paragraph's first line instead of `linePrefix`.
   *
   * Accepts a fixed string or a function that returns a prefix for the paragraph index.
   */
  firstLinePrefix?: string | ((index: number) => string);
  /**
   * Text placed after each line.
   */
  lineSuffix?: string;
  /**
   * Marker used for list items.
   *
   * @default '•' (Bulleted List) or '.' (Numbered List)
   */
  marker?: string;
  /**
   * Whether list items are numbered.
   */
  numbered?: boolean;
  /**
   * Format for list numbers, such as Roman numerals.
   *
   * @default 'decimal'
   */
  numberType?: NumberStyleName;
  /**
   * Width reserved for each list number.
   *
   * @default Width of the widest formatted number.
   */
  numberWidth?: number;
  /**
   * Starting number for a numbered list.
   *
   * @default 1
   */
  startNumber?: number;
  /**
   * Blank lines before formatted content.
   */
  spaceBefore?: number;
  /**
   * Blank lines after formatted content.
   */
  spaceAfter?: number;
  /**
   * Blank lines between the paragraphs of formatted content.
   */
  spaceBetween?: number;
};

/**
 * Result shape for formatted text: a string or an array of lines.
 */
export type TextLines<AsArray extends boolean> = AsArray extends true ? string[] : string;

/**
 * Formatting settings for a single line of text.
 */
export type DisplayLineOptions = Pick<
  MarkupOptions,
  'width' | 'align' | 'ellipsis' | 'fill' | 'padding' | 'paddingSize'
>;

/**
 * Content and layout settings for formatted list items.
 */
export type MakeListOptions<AsArray extends boolean = false> = Pick<
  MarkupOptions,
  | 'width'
  | 'indent'
  | 'marker'
  | 'numbered'
  | 'startNumber'
  | 'numberType'
  | 'numberWidth'
  | 'align'
  | 'padding'
  | 'paddingSize'
  | 'spaceBefore'
  | 'spaceAfter'
> & {
  /**
   * Whether to return formatted lines as an array.
   */
  asArray?: AsArray;
};

/**
 * Paragraph layout and spacing settings for text blocks.
 */
export type MakeBlockOptions<AsArray extends boolean = false> = Pick<
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
  | 'spaceBetween'
> & {
  /**
   * Whether to return formatted lines as an array.
   */
  asArray?: AsArray;
};

/**
 * Letter-case transformations available to text formatting.
 */
export type TextCase = 'upper' | 'lower' | 'title' | 'sentence' | 'capitalize';

/**
 * Visual style and letter-case settings for formatted text.
 */
export type FormatTextOptions = {
  /**
   * Style function, named style, or list of ANSI style codes.
   */
  style?: ShellTextStyle | ShellStyleFunc;
  /**
   * Letter-case transformation.
   */
  textCase?: TextCase;
};
