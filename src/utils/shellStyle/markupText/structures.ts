import { ColumnContent, MakeBlockOptions, MakeColumnsOptions, MakeListOptions, TextLines } from '../types/markupTypes';
import { buildColumns, getColumnWidths, processContents } from './columnUtils';
import { initLineCollector, makeBlank } from './spacings';
import { getListPrefixes } from './listUtils';
import { alignLine, initLineWrapper, wrapText } from './stringUtils';

/**
 * Formats text blocks for presentation.
 *
 * Supports:
 * - Multiple paragraphs, wrapping, and alignment.
 * - Line prefixes and suffixes, left and right indents, and surrounding blank lines.
 * - Returning a string or an array of lines.
 *
 * @example `parse the input now`, `{ width: 12, align: 'right' }` =>
 * `   parse the\n   input now`, or with `asArray`, `['   parse the', '   input now']`
 */
export const makeBlock = <AsArray extends boolean = false>(
  text: string | string[],
  options: MakeBlockOptions<AsArray> = {}
): TextLines<AsArray> => {
  const lines = initLineCollector(options);
  const between = options.spaceBetween ? makeBlank(options.spaceBetween, { asArray: true }) : undefined;

  const paragraphs = typeof text === 'string' ? text.split('\n') : text;

  const wrapper = initLineWrapper(options);

  for (let index = 0; index < paragraphs.length; index++) {
    const paragraph = paragraphs[index]!;

    if (between && index > 0) lines.push(between);

    if (options.width) {
      lines.push(wrapText(paragraph, options.width, { align: options.align, lineWrapper: wrapper, asArray: true }));
    } else {
      lines.push(wrapper.line(paragraph));
    }
  }

  return lines.result();
};

/**
 * Formats a collection of items as a list.
 *
 * Supports:
 * - Indentation, custom markers, and numbered or bulleted items.
 * - Wrapping, alignment, right indent, and spacing.
 * - Returning a string or an array of lines.
 *
 * @example `['parse', 'validate']`, `{ indent: 2, width: 20 }` => `  • parse\n  • validate`
 */
export const makeList = <AsArray extends boolean = false>(
  items: string[],
  options: MakeListOptions<AsArray> = {}
): TextLines<AsArray> => {
  const { contentPrefix, firstContentPrefix } = getListPrefixes(items.length, options);

  const wrapper = initLineWrapper({ ...options, contentPrefix, firstContentPrefix });
  const lines = initLineCollector(options);

  // The first-line prefix is as wide as the line prefix, so every first line wraps within the same
  // width as the lines after it.
  const firstLineWidth = options.width ? options.width - wrapper.width() : undefined;

  // The items sit together, with no blank lines between them.
  for (let index = 0; index < items.length; index++) {
    const item = items[index]!;

    if (options.width) {
      lines.push(
        wrapText(item, options.width, {
          align: options.align,
          lineWrapper: wrapper,
          firstLineValue: index,
          firstLineWidth,
          asArray: true,
        })
      );
    } else {
      lines.push(wrapper.firstLine(item, index));
    }
  }

  return lines.result();
};

/**
 * Formats content in columns, without borders.
 *
 * Supports:
 * - One inline row, given as `string[]`, or a block of rows, given as `string[][]`.
 * - A total width shared equally among the columns, or a width for each column by position.
 * - Columns without a width, showing their content as it is.
 * - Returning a string or an array of lines.
 *
 * @example `[['name', 'value'], ['indent', '2']]`, `{ width: [6, 5] }` =>
 * `name   value\nindent 2    `
 */
export const makeColumns = <AsArray extends boolean = false>(
  contents: ColumnContent[] | ColumnContent[][],
  { width, gap = 1, align, ...restOptions }: MakeColumnsOptions<AsArray> = {}
): TextLines<AsArray> => {
  const rows = (!Array.isArray(contents[0]) ? [contents] : contents) as ColumnContent[][];
  const columnCount = Math.max(0, ...rows.map(row => row.length));

  const wrapper = initLineWrapper({ width: typeof width === 'number' ? width : undefined, ...restOptions });

  const columns = buildColumns(
    columnCount,
    { align, gap, width: getColumnWidths(rows, typeof width === 'number' ? width - wrapper.width() : width, { gap }) },
    { gap: (size: number) => ' '.repeat(size) }
  );

  const lines = initLineCollector(restOptions);

  for (const rowContents of processContents(rows, columns, restOptions)) {
    // Each cell fills its column's width, or shows as it is without one.
    const line = rowContents.map((colContent, index) => {
      const colWidth = columns[index]?.width;
      const content =
        colWidth === undefined ? (colContent ?? '') : alignLine(colContent ?? '', colWidth, columns[index]?.align, ' ');

      return index < rowContents.length - 1 ? content + (columns[index]?.gap ?? ' ') : content;
    });

    lines.push(wrapper.line(line.join('')));
  }

  return lines.result();
};
