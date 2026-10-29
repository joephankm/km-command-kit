import type { NumberStyleName } from '../../shellStyle/common/numberStyles';
import type { ValueOrIndexed, ValueOrParams } from '../../shellStyle/types/commonTypes';
import type {
  AlignedDefinitionOptions,
  DefinitionLayout,
  InlineDefinitionOptions,
  MakeColumnsOptions,
  MakeDefinitionsOptions,
  MarkupOptions,
  ShellTextStyle,
  StackedDefinitionOptions,
} from '../../shellStyle/types/markupTypes';
import type { BulletListType, NumberedListType } from '../configs/docLogConfig';

/**
 * Names of the title variants used in a document log.
 */
export type TitleVariantName = 'docTitle' | 'title' | 'subTitle' | 'heading';

/**
 * Number format and marker pair for a numbered title.
 *
 * @example `['upperRoman', '.']` => `I.`
 */
export type NumberMarker = [numberType: NumberStyleName, marker: string];

/**
 * Presentation settings for one title variant.
 */
export type TitleVariant = {
  /**
   * Text style for the title variant.
   */
  style: ShellTextStyle;
  /**
   * Number format and marker for titles in this variant.
   *
   * @default No numbering.
   */
  numberMarker?: NumberMarker;
  /**
   * Whether titles in this variant have an underline.
   */
  underline?: boolean;
  /**
   * Character repeated across the underline.
   *
   * @default '─'
   */
  lineFill?: string;
};

/**
 * Named text styles available to document log methods.
 */
export type DocLogStyles = Partial<Record<'default' | 'divider' | (string & {}), ShellTextStyle>>;

/**
 * Style reference accepted by document log methods.
 */
export type DocLogStyle = ShellTextStyle | (string & {});

/**
 * Options of a definition list layout, with its label style given as a text style rather than a
 * style function.
 */
type TextLabelStyle<Options> = Omit<Options, 'labelStyle'> & {
  /** Style each label is set in: a preset name, or a list of style code names. */
  labelStyle?: ShellTextStyle;
};

/**
 * The default definition list layout, and every option of each layout.
 */
export type DefinitionLayouts = {
  /** Layout used when a call gives none. */
  default: DefinitionLayout;
  /** Options of the `'stacked'` layout. */
  stacked: TextLabelStyle<StackedDefinitionOptions>;
  /** Options of the `'aligned'` layout. */
  aligned: TextLabelStyle<AlignedDefinitionOptions>;
  /** Options of the `'inline'` layout. */
  inline: TextLabelStyle<InlineDefinitionOptions>;
};

/**
 * Configuration options for a document log and its methods.
 */
export type DocLogOptions = Pick<MarkupOptions, 'width' | 'indent' | 'align'> & {
  /**
   * Named styles available to document log methods.
   */
  styles?: DocLogStyles;
  /**
   * Per-call style that overrides the method's usual text style.
   */
  style?: DocLogStyle;
  /**
   * Presentation settings for each title variant.
   *
   * @default Title variants from `docLogConfig`.
   */
  titles?: Record<TitleVariantName, TitleVariant>;
  /**
   * Whether block content uses justified alignment.
   *
   * @default `false`
   */
  justifyContent?: boolean;
  /**
   * Blank lines between blocks and between body paragraphs.
   *
   * @default `1`
   */
  spacing?: number;
  /**
   * Marker pattern for bulleted lists.
   *
   * @default `'geometric'`
   */
  bulletListType?: BulletListType;
  /**
   * Number format and marker pattern for numbered lists.
   *
   * @default `'decimal'`
   */
  numberedListType?: NumberedListType;
  /**
   * Indentation, in columns, for each list level. Deeper levels reuse the last entry.
   *
   * @default `[0, 2, 6, 10]`
   */
  listIndents?: number[];
  /**
   * Character repeated across a divider.
   *
   * @default `'─'`
   */
  dividerFill?: string;
  /**
   * Blank columns between every two columns, unless a call gives its own `gap`.
   *
   * @default 1
   */
  columnGap?: number;
  /**
   * Every option of each definition list layout, taken by a call for every option it does not give.
   */
  definitionLayouts?: DefinitionLayouts;
  /**
   * Variant used to format a title.
   */
  variant?: TitleVariantName;
  /**
   * Whether the title is numbered, overriding its variant's numbering setting.
   *
   * @default `false`
   */
  numbered?: boolean;
  /**
   * Whether to print a divider before the title.
   *
   * @default `false`
   */
  dividerBefore?: boolean;
  /**
   * Whether to print an underline directly below the title.
   */
  underline?: boolean;
  /**
   * Blank lines before the block, overriding `spacing`.
   */
  spaceBefore?: number;
  /**
   * Blank lines after the block, overriding `spacing`.
   */
  spaceAfter?: number;
  /**
   * Character used for this divider, overriding `dividerFill`.
   */
  fill?: string;
};

/**
 * Settings shared by every method of a document log instance.
 */
export type DocLogSettings = Pick<
  DocLogOptions,
  'width' | 'styles' | 'titles' | 'justifyContent' | 'spacing' | 'listIndents' | 'dividerFill'
> &
  Required<Pick<DocLogOptions, 'bulletListType' | 'numberedListType' | 'columnGap' | 'definitionLayouts'>>;

/**
 * Per-title formatting options.
 */
export type TitleOptions = Pick<
  DocLogOptions,
  'numbered' | 'dividerBefore' | 'underline' | 'indent' | 'align' | 'spaceBefore'
> &
  Required<Pick<DocLogOptions, 'variant'>>;

/**
 * Title variant identifier or complete per-title options.
 */
export type TitleVariantOrOptions = ValueOrParams<TitleOptions, 'variant'>;

/**
 * Per-call formatting options for body text.
 */
export type BodyOptions = Pick<DocLogOptions, 'indent' | 'align' | 'style' | 'spaceBefore' | 'spaceAfter'>;

/**
 * Per-call formatting options for a single line.
 */
export type LineOptions = Pick<DocLogOptions, 'indent' | 'style' | 'spaceBefore' | 'spaceAfter'>;

/**
 * Per-call formatting options for a divider.
 */
export type DividerOptions = Pick<DocLogOptions, 'style' | 'spaceBefore' | 'spaceAfter' | 'fill'>;

/**
 * Structured content for one list item.
 */
export type ListItemParams = {
  /**
   * Text displayed for the item.
   */
  text?: string;
  /**
   * Child items displayed one level deeper.
   */
  items?: ListItem[];
  /**
   * Whether this item's child list is numbered, overriding the list setting.
   */
  numbered?: boolean;
};

/**
 * Text or structured content for a list item.
 */
export type ListItem = string | ListItemParams;

/**
 * A list item that may specify its nesting level.
 */
export type TopListItem =
  | string
  | (ListItemParams & {
      /**
       * Display level for the item, starting at `1`.
       */
      level?: number;
    });

/**
 * Per-list formatting options.
 */
export type ListOptions = Pick<DocLogOptions, 'numbered' | 'indent' | 'align' | 'spaceBefore' | 'spaceAfter'>;

/**
 * Per-call column layout and formatting options.
 */
export type ColumnsOptions = Pick<MakeColumnsOptions, 'width' | 'align' | 'gap' | 'ellipsis'> &
  Pick<DocLogOptions, 'indent' | 'spaceBefore' | 'spaceAfter'> & {
    /**
     * Style of every column, or of each column keyed by its position. A column without a style of
     * its own takes the `default` style.
     */
    style?: ValueOrIndexed<DocLogStyle | undefined>;
  };

/**
 * Per-call definition list layout and formatting options.
 */
export type DefinitionsOptions = Pick<MakeDefinitionsOptions, 'layout' | 'marker' | 'align'> & {
  /** Options of the `'aligned'` layout, laid over the configured ones. */
  alignedOptions?: DefinitionLayouts['aligned'];
  /** Options of the `'stacked'` layout, laid over the configured ones. */
  stackedOptions?: DefinitionLayouts['stacked'];
  /** Options of the `'inline'` layout, laid over the configured ones. */
  inlineOptions?: DefinitionLayouts['inline'];
} & Pick<DocLogOptions, 'indent' | 'style' | 'spaceBefore' | 'spaceAfter'>;
