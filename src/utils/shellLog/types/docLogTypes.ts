import type { NumberStyleName } from '../../shellStyle/common/numberStyles';
import type { ValueOrParams } from '../../shellStyle/types/commonTypes';
import type { MarkupOptions, ShellTextStyle } from '../../shellStyle/types/markupTypes';
import type { BulletListType, NumberedListType } from '../configs/docLogConfig';

/**
 * Names of the title variants a doc's parts open with.
 */
export type TitleVariantName = 'docTitle' | 'title' | 'subTitle' | 'heading';

/**
 * A number type with the marker set after each number, such as `['upperRoman', '.']` for `I.`.
 */
export type NumberMarker = [numberType: NumberStyleName, marker: string];

/**
 * How one title variant is printed: its style, and the number its titles are numbered with.
 */
export type TitleVariant = {
  /**
   * Style of the title's text.
   */
  style: ShellTextStyle;
  /**
   * Number type and marker the variant's titles are numbered with; unset, they are not numbered.
   */
  numberMarker?: NumberMarker;
};

/**
 * Shared options for the doc log and its methods.
 */
export type DocLogOptions = Pick<MarkupOptions, 'width' | 'padding' | 'paddingSize' | 'align'> & {
  /**
   * Style of a body's text.
   */
  style?: ShellTextStyle;
  /**
   * How each title variant is printed.
   */
  titles?: Record<TitleVariantName, TitleVariant>;
  /**
   * Whether every block's content is justified instead of aligned left.
   */
  justifyContent?: boolean;
  /**
   * Default number of blank lines between blocks, and between the paragraphs of a body.
   */
  spacing?: number;
  /**
   * Bulleted list style a bulleted list is marked in.
   */
  bulletListType?: BulletListType;
  /**
   * Numbered list style a numbered list is numbered in.
   */
  numberedListType?: NumberedListType;
  /**
   * Title variant a title is printed in.
   */
  variant?: TitleVariantName;
  /**
   * Whether a title is numbered, overriding whether its variant has a number type.
   */
  numbered?: boolean;
  /**
   * Whether a divider is printed before a title, kept apart from it by `spacing`.
   */
  dividerBefore?: boolean;
  /**
   * Whether a line is drawn right under a title, with no blank line between.
   */
  lineBelow?: boolean;
  /**
   * Number of blank lines before a block, in place of `spacing`.
   */
  spaceBefore?: number;
  /**
   * Number of blank lines after a block, in place of `spacing`.
   */
  spaceAfter?: number;
};

/**
 * Options fixed for every method of a doc log instance.
 */
export type DocLogSettings = Pick<
  DocLogOptions,
  | 'width'
  | 'padding'
  | 'paddingSize'
  | 'style'
  | 'titles'
  | 'justifyContent'
  | 'spacing'
  | 'bulletListType'
  | 'numberedListType'
>;

/**
 * Options for printing a title.
 */
export type TitleOptions = Pick<DocLogOptions, 'numbered' | 'dividerBefore' | 'lineBelow' | 'align' | 'spaceBefore'> &
  Required<Pick<DocLogOptions, 'variant'>>;

/**
 * Title variant name, or the full options for printing a title.
 */
export type TitleVariantOrOptions = ValueOrParams<TitleOptions, 'variant'>;

/**
 * Options for printing a body.
 */
export type BodyOptions = Pick<DocLogOptions, 'align' | 'spaceBefore' | 'spaceAfter'>;
