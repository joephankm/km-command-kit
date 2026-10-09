import type { NumberStyleName } from '../../shellStyle/common/numberStyles';
import type { ValueOrParams } from '../../shellStyle/types/commonTypes';
import type { MarkupOptions, ShellTextStyle } from '../../shellStyle/types/markupTypes';
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
 * Configuration options for a document log and its methods.
 */
export type DocLogOptions = Pick<MarkupOptions, 'width' | 'padding' | 'paddingSize' | 'align'> & {
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
  | 'width'
  | 'padding'
  | 'paddingSize'
  | 'styles'
  | 'titles'
  | 'justifyContent'
  | 'spacing'
  | 'listIndents'
  | 'dividerFill'
> &
  Required<Pick<DocLogOptions, 'bulletListType' | 'numberedListType'>>;

/**
 * Per-title formatting options.
 */
export type TitleOptions = Pick<DocLogOptions, 'numbered' | 'dividerBefore' | 'underline' | 'align' | 'spaceBefore'> &
  Required<Pick<DocLogOptions, 'variant'>>;

/**
 * Title variant identifier or complete per-title options.
 */
export type TitleVariantOrOptions = ValueOrParams<TitleOptions, 'variant'>;

/**
 * Per-call formatting options for body text.
 */
export type BodyOptions = Pick<DocLogOptions, 'align' | 'style' | 'spaceBefore' | 'spaceAfter'>;

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
export type ListOptions = Pick<DocLogOptions, 'numbered' | 'align' | 'spaceBefore' | 'spaceAfter'>;
