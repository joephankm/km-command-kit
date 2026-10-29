import { markup } from '../../shellStyle';
import type { ValueOrIndexed } from '../../shellStyle/types/commonTypes';
import type { ColumnContent } from '../../shellStyle/types/markupTypes';
import type { ShellStyleFunc } from '../../shellStyle/types/styleTypes';
import type { ColumnsOptions, DocLogSettings, DocLogStyle } from '../types/docLogTypes';
import type { DocLogFuncs } from './docLog';

/**
 * Create the columns-printing method for a document log.
 */
export default ({ width, columnGap }: DocLogSettings, { styleFuncOf, startLines, endPrintLines }: DocLogFuncs) => {
  /**
   * Resolve the style function of every column, or of each column by its position, filling the
   * columns without a style of their own with the default style.
   */
  const columnStyle = (
    contents: ColumnContent[] | ColumnContent[][],
    style: ValueOrIndexed<DocLogStyle | undefined>
  ): ValueOrIndexed<ShellStyleFunc> | undefined => {
    const defaultStyle = styleFuncOf('default');
    if (!style) return defaultStyle;

    if (typeof style === 'string' || Array.isArray(style)) return styleFuncOf(style as DocLogStyle);

    const columnCount = Array.isArray(contents[0])
      ? Math.max(0, ...(contents as ColumnContent[][]).map(row => row.length))
      : contents.length;
    const styleFuncs: Record<number, ShellStyleFunc> = {};

    for (let index = 0; index < columnCount; index++) {
      if (style[index]) {
        styleFuncs[index] = styleFuncOf(style[index]!)!;
      } else if (defaultStyle) {
        styleFuncs[index] = defaultStyle;
      }
    }

    return styleFuncs;
  };

  /**
   * Print rows of content in columns.
   */
  return (
    contents: ColumnContent[] | ColumnContent[][],
    { width: columnWidth, indent, align, gap, ellipsis, style, spaceBefore, spaceAfter }: ColumnsOptions = {}
  ) => {
    const lines = startLines(spaceBefore);

    // Share the document width among the columns unless the call sets its own widths.
    const columnsBlock = markup.makeColumns(contents, {
      width: columnWidth ?? width,
      indent,
      align,
      gap: gap ?? columnGap,
      ellipsis,
      style: columnStyle(contents, style),
    });
    lines.push(columnsBlock);

    endPrintLines(lines, spaceAfter);
  };
};
