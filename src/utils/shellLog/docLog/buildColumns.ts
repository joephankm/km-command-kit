import { markup } from '../../shellStyle';
import type { ColumnContent } from '../../shellStyle/types/markupTypes';
import type { ColumnsOptions, DocLogSettings } from '../types/docLogTypes';
import type { DocLogFuncs } from './docLog';

/**
 * Create the columns-printing method for a document log.
 */
export default (
  { width, indent, rightIndent }: DocLogSettings,
  { styleFuncOf, startLines, endPrintLines }: DocLogFuncs
) => {
  /**
   * Print rows of content in columns.
   */
  return (
    contents: ColumnContent[] | ColumnContent[][],
    { width: columnWidth, align, gap, ellipsis, style, spaceBefore, spaceAfter }: ColumnsOptions = {}
  ) => {
    const columnsStyleFunc = styleFuncOf(style ?? 'default');
    const lines = startLines(spaceBefore);

    // Share the document width among the columns unless the call sets its own widths.
    const block = markup.makeColumns(contents, {
      width: columnWidth ?? width,
      indent,
      rightIndent,
      align,
      gap,
      ellipsis,
    });
    lines.push(columnsStyleFunc ? columnsStyleFunc(block) : block);

    endPrintLines(lines, spaceAfter);
  };
};
