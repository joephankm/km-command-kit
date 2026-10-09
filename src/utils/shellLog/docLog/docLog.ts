import { markup } from '../../shellStyle';
import { createStyleFuncMap, textStyleFunc } from '../../shellStyle/styleText/styleFuncByCode';
import type { ShellTextStyle, TextAlign } from '../../shellStyle/types/markupTypes';
import type { ShellStyleFunc } from '../../shellStyle/types/styleTypes';
import config from '../configs/docLogConfig';
import buildBody from './buildBody';
import buildDivider from './buildDivider';
import buildList from './buildList';
import buildTitle from './buildTitle';
import type { DocLogSettings, DocLogStyle } from '../types/docLogTypes';

/**
 * Alignment resolution for a document block.
 */
export type DefaultAlignFunc = (align: TextAlign | undefined) => TextAlign | undefined;

/**
 * Leading spacing for a document block.
 */
export type StartLinesFunc = (spaceBefore: number | undefined) => string[];

/**
 * Trailing spacing and output for a document block.
 */
export type EndPrintLinesFunc = (lines: string[], spaceAfter?: number) => void;

/**
 * Shared helpers used to create document log methods.
 */
export type DocLogFuncs = {
  /**
   * Style function for a named or custom style.
   */
  styleFuncOf: (style: DocLogStyle) => ShellStyleFunc | undefined;
  /**
   * Alignment resolved from block options and document settings.
   */
  defaultAlign: DefaultAlignFunc;
  /**
   * Leading lines prepared for a block.
   */
  startLines: StartLinesFunc;
  /**
   * Trailing spacing and printed output for a block.
   */
  endPrintLines: EndPrintLinesFunc;
};

/**
 * Create a document log with shared settings for its output methods.
 */
const docLog = (options: Partial<DocLogSettings> = {}) => {
  // Apply instance options over the configured settings.
  const settings = { ...config.settings, ...options };

  const { justifyContent, spacing = 0 } = settings;

  // Merge instance styles over configured styles and cache their formatter functions.
  const styleFuncMap = createStyleFuncMap({ ...config.settings.styles, ...options.styles } as Record<
    string,
    ShellTextStyle
  >);

  /**
   * Resolve a style for document text.
   */
  const styleFuncOf = (style: DocLogStyle): ShellStyleFunc | undefined =>
    typeof style === 'string' && style in styleFuncMap ? styleFuncMap[style] : textStyleFunc(style as ShellTextStyle);

  /**
   * Resolve the alignment for a document block.
   */
  const defaultAlign: DefaultAlignFunc = justifyContent ? align => align ?? 'justify' : align => align;

  // Track trailing spacing so it can be printed before the next block.
  let spaceAfterLast = false;

  /**
   * Prepare leading spacing for a block.
   *
   * Use block-specific spacing when provided; otherwise use the document's configured spacing.
   */
  const startLines: StartLinesFunc = spaceBefore => {
    if (spaceAfterLast) {
      spaceAfterLast = false;
      return [];
    }

    const count = spaceBefore ?? spacing;
    return count ? [markup.makeBlank(count - 1)] : [];
  };

  /**
   * Print a document block with its requested trailing spacing.
   */
  const endPrintLines: EndPrintLinesFunc = (lines, spaceAfter) => {
    if (spaceAfter) {
      spaceAfterLast = true;
      lines.push(markup.makeBlank(spaceAfter - 1));
    }

    console.log(lines.join('\n'));
  };

  // Helpers shared with each method builder.
  const docFunctions: DocLogFuncs = { styleFuncOf, defaultAlign, startLines, endPrintLines };

  const divider = buildDivider(settings, docFunctions);

  return {
    /**
     * Print a formatted title.
     */
    title: buildTitle(settings, docFunctions, divider),

    /**
     * Print formatted body text.
     */
    body: buildBody(settings, docFunctions),

    /**
     * Print a divider across the document width.
     */
    divider,

    /**
     * Print a formatted list.
     */
    list: buildList(settings, docFunctions),
  };
};

export default docLog;
