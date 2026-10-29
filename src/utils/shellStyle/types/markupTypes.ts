import type { BoxAlign } from './boxTypes';
import type { ValueOrIndexed } from './commonTypes';
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
 * Shared formatting settings for markup text.
 */
export type MarkupOptions<AsArray extends boolean = false> = {
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
   * Indentation from the content's right. Read only when `width` is set.
   */
  rightIndent?: number;
  /**
   * Text placed before each line.
   */
  linePrefix?: string;
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
  /**
   * Whether to return formatted lines as an array.
   */
  asArray?: AsArray;
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
  'width' | 'align' | 'ellipsis' | 'fill' | 'indent' | 'rightIndent'
>;

/**
 * Content and layout settings for formatted list items.
 */
export type MakeListOptions<AsArray extends boolean = false> = Pick<
  MarkupOptions<AsArray>,
  | 'width'
  | 'indent'
  | 'marker'
  | 'numbered'
  | 'startNumber'
  | 'numberType'
  | 'numberWidth'
  | 'align'
  | 'rightIndent'
  | 'spaceBefore'
  | 'spaceAfter'
  | 'asArray'
>;

/**
 * Paragraph layout and spacing settings for text blocks.
 */
export type MakeBlockOptions<AsArray extends boolean = false> = Pick<
  MarkupOptions<AsArray>,
  | 'width'
  | 'align'
  | 'indent'
  | 'rightIndent'
  | 'linePrefix'
  | 'lineSuffix'
  | 'spaceBefore'
  | 'spaceAfter'
  | 'spaceBetween'
  | 'asArray'
>;

/**
 * Alignment of content within a column.
 */
export type ColumnAlign = BoxAlign;

/**
 * Content of a cell in a column, `null` for an empty cell.
 */
export type ColumnContent = string | null;

/**
 * Width of a column: its exact width, or bounds its auto width is held within.
 */
export type ColumnWidth =
  | number
  | {
      /** Narrowest the auto width may be. */
      min?: number;
      /** Widest the auto width may be. */
      max?: number;
    };

/**
 * Layout settings for content set in columns.
 */
export type MakeColumnsOptions<AsArray extends boolean = false> = Pick<
  MarkupOptions<AsArray>,
  'indent' | 'rightIndent' | 'linePrefix' | 'lineSuffix' | 'spaceBefore' | 'spaceAfter' | 'asArray'
> & {
  /**
   * Total width of a line, or the width of each column keyed by its position.
   *
   * A column without a width, except the last, takes the width of its widest content.
   */
  width?: number | Record<number, ColumnWidth>;
  /**
   * Alignment of every column, or of each column keyed by its position.
   *
   * @default 'left'
   */
  align?: ValueOrIndexed<ColumnAlign>;
  /**
   * Blank columns between every two columns, or after each column keyed by its position.
   *
   * @default 1
   */
  gap?: ValueOrIndexed<number>;
  /**
   * Mark a cell wider than its column ends with when cut, instead of wrapping it. `true` uses the
   * default mark.
   */
  ellipsis?: string | true;
  /**
   * Style function of every column, or of each column keyed by its position.
   */
  style?: ValueOrIndexed<ShellStyleFunc>;
};

/**
 * An item of a definition list: a label and its content, one paragraph or several.
 */
export type DefinitionItem = {
  /** Text the item is known by. */
  label: string;
  /** Text shown with the label, one paragraph or several. */
  content: string | string[];
};

/**
 * Arrangement of a definition list's labels and their content.
 */
export type DefinitionLayout = 'aligned' | 'stacked' | 'inline';

/**
 * Mark shown at the start of a definition list entry: the same mark every time, or a number in a
 * number style followed by a mark.
 */
export type DefinitionMarker = string | [numberType: NumberStyleName, marker: string];

/**
 * Options of the `'aligned'` layout of a definition list.
 */
export type AlignedDefinitionOptions = {
  /** Alignment of each label within its column. Default is `'left'`. */
  labelAlign?: ColumnAlign;
  /** Width of the label column, exact or held within bounds. */
  labelWidth?: ColumnWidth;
  /** Text set between the label column and the content. */
  separator?: string;
  /** Style function applied to each label. */
  labelStyle?: ShellStyleFunc;
};

/**
 * Options of the `'stacked'` layout of a definition list.
 */
export type StackedDefinitionOptions = {
  /** Columns the content is pushed right past its label. */
  contentIndent?: number;
  /** Blank lines between two items. Default is `1`. */
  itemSpacing?: number;
  /** Blank lines between the paragraphs of an item's content. */
  contentSpacing?: number;
  /** Text set right after each label. */
  labelSuffix?: string;
  /** Mark shown at the start of each paragraph of the content. */
  contentMarker?: DefinitionMarker;
  /** Style function applied to each label. */
  labelStyle?: ShellStyleFunc;
};

/**
 * Options of the `'inline'` layout of a definition list.
 */
export type InlineDefinitionOptions = {
  /** Text set between each label and its content. Default is `'—'`. */
  separator?: string;
  /** Blank columns between the separator and the content. Default is `1`. */
  gap?: number;
  /** Style function applied to each label. */
  labelStyle?: ShellStyleFunc;
};

/**
 * Layout settings for a definition list.
 */
export type MakeDefinitionsOptions<AsArray extends boolean = false> = Pick<
  MarkupOptions<AsArray>,
  'width' | 'align' | 'indent' | 'rightIndent' | 'linePrefix' | 'lineSuffix' | 'spaceBefore' | 'spaceAfter' | 'asArray'
> & {
  /**
   * Arrangement of each label and its content.
   *
   * @default 'stacked'
   */
  layout?: DefinitionLayout;
  /**
   * Mark shown at the start of each item, before its label.
   */
  marker?: DefinitionMarker;
  /**
   * Options of the `'aligned'` layout.
   */
  alignedOptions?: AlignedDefinitionOptions;
  /**
   * Options of the `'stacked'` layout.
   */
  stackedOptions?: StackedDefinitionOptions;
  /**
   * Options of the `'inline'` layout.
   */
  inlineOptions?: InlineDefinitionOptions;
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
