import { NUMBER_STYLES } from '../common/numberStyles';
import { ColumnContent, MakeBlockOptions, MakeColumnsOptions, MakeListOptions, TextLines } from '../types/markupTypes';
import { buildColumns, getColumnWidths, processContents } from './columnUtils';
import { alignLine, stripStyles, wrapText } from './stringUtils';

/**
 * Options for blank lines: whether they come back as an array.
 */
type MakeBlankOptions<AsArray extends boolean> = {
  /** Returns the blank lines as an array of empty lines instead of as line breaks. */
  asArray?: AsArray;
};

/**
 * Adds vertical spacing to formatted text.
 *
 * Supports:
 * - A requested number of blank lines.
 * - Returning them as newline characters or as an array of empty lines.
 *
 * @example `3` => `\n\n\n`, or with `asArray`, `['', '', '']`
 */
export const makeBlank = <AsArray extends boolean = false>(
  count: number = 1,
  { asArray }: MakeBlankOptions<AsArray> = {}
): TextLines<AsArray> => {
  if (count === 1) return (asArray ? [''] : '\n') as TextLines<AsArray>;
  return (asArray ? new Array<string>(count).fill('') : '\n'.repeat(count)) as TextLines<AsArray>;
};

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
  {
    width,
    align,
    indent,
    rightIndent,
    linePrefix,
    firstLinePrefix,
    lineSuffix,
    spaceBefore,
    spaceAfter,
    spaceBetween,
    asArray,
  }: MakeBlockOptions<AsArray> = {}
): TextLines<AsArray> => {
  const indentSpace = indent ? ' '.repeat(indent) : '';

  // The indent sits outermost, before the prefixes.
  if (width && indentSpace) {
    linePrefix = indentSpace + (linePrefix ?? '');

    if (typeof firstLinePrefix === 'function') {
      const prefixFunc = firstLinePrefix;
      firstLinePrefix = index => indentSpace + prefixFunc(index);
    } else if (firstLinePrefix !== undefined) {
      firstLinePrefix = indentSpace + firstLinePrefix;
    }
  }

  // The right indent pulls the right edge in from the width.
  const lineWidth = width && rightIndent ? width - rightIndent : width;

  const between = spaceBetween ? makeBlank(spaceBetween, { asArray: true }) : undefined;
  const lines: string[] = spaceBefore ? makeBlank(spaceBefore, { asArray: true }) : [];

  const paragraphs = typeof text === 'string' ? text.split('\n') : text;

  for (let index = 0; index < paragraphs.length; index++) {
    const paragraph = paragraphs[index]!;

    if (between && index > 0) lines.push(...between);

    if (lineWidth) {
      const firstPrefix = typeof firstLinePrefix === 'function' ? firstLinePrefix(index) : firstLinePrefix;

      lines.push(
        ...wrapText(paragraph, lineWidth, {
          align,
          linePrefix,
          firstLinePrefix: firstPrefix,
          lineSuffix,
          asArray: true,
        })
      );
    } else {
      lines.push(indentSpace + paragraph);
    }
  }

  if (spaceAfter) lines.push(...makeBlank(spaceAfter, { asArray: true }));

  return (asArray ? lines : lines.join('\n')) as TextLines<AsArray>;
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
  {
    width,
    indent,
    numbered,
    startNumber = 1,
    numberType,
    numberWidth,
    marker = numbered ? '.' : '•',
    align,
    rightIndent,
    spaceBefore,
    spaceAfter,
    asArray,
  }: MakeListOptions<AsArray> = {}
): TextLines<AsArray> => {
  const indentSpace = indent ? ' '.repeat(indent) : '';
  const markerLength = stripStyles(marker).length;

  // The marker leads each item's first line, and every later line is indented past it.
  let firstLinePrefix: MakeBlockOptions<AsArray>['firstLinePrefix'] = indentSpace + marker + ' ';
  let linePrefix = indentSpace + ' '.repeat(markerLength + 1);

  if (numbered) {
    if (numberType) {
      const numberStyle = NUMBER_STYLES[numberType];
      const numbers: string[] = [];
      numberWidth ??= 0;

      for (let index = 0; index < items.length; index++) {
        const number = numberStyle(startNumber + index);
        numbers.push(number);

        if (number.length > numberWidth) numberWidth = number.length;
      }

      firstLinePrefix = index => indentSpace + (numbers[index] ?? '').padStart(numberWidth!) + marker + ' ';
      linePrefix = indentSpace + ' '.repeat(numberWidth + markerLength + 1);
    } else {
      // Numbers are right-aligned to the widest, so every item's text starts in the same column.
      numberWidth ??= String(startNumber + items.length - 1).length;

      firstLinePrefix = index => indentSpace + String(startNumber + index).padStart(numberWidth!) + marker + ' ';
      linePrefix = indentSpace + ' '.repeat(numberWidth + markerLength + 1);
    }
  }

  // The items sit together, with no blank lines between them.
  const lines = makeBlock(items, {
    width,
    align,
    rightIndent,
    firstLinePrefix,
    linePrefix,
    spaceBefore,
    spaceAfter,
    asArray: true,
  });

  return (asArray ? lines : lines.join('\n')) as TextLines<AsArray>;
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
  {
    width,
    align,
    gap = 1,
    indent,
    linePrefix = '',
    lineSuffix = '',
    spaceBefore,
    spaceAfter,
    ellipsis,
    asArray,
  }: MakeColumnsOptions<AsArray> = {}
): TextLines<AsArray> => {
  const rows = (!Array.isArray(contents[0]) ? [contents] : contents) as ColumnContent[][];
  const columnCount = Math.max(0, ...rows.map(row => row.length));

  const columns = buildColumns(
    columnCount,
    { align, gap, width: getColumnWidths(rows, width) },
    { gap: (size: number) => ' '.repeat(size) }
  );

  // When `width` is a number, it is the total: the columns fit their content within what is left
  // after the indent, the line prefix and suffix, and every gap.
  if (typeof width === 'number') {
    let available = width - (indent ?? 0);

    if (linePrefix || lineSuffix) {
      available -= stripStyles((linePrefix ?? '') + (lineSuffix ?? '')).length;
    }

    for (let index = 0; index < columnCount - 1; index++) {
      available -= columns[index]?.gap?.length ?? 1;
    }

    const widths = getColumnWidths(rows, available);

    for (let index = 0; index < columnCount; index++) {
      columns[index] ??= {};
      columns[index]!.width = widths[index];
    }
  }

  const indentSpace = indent ? ' '.repeat(indent) : '';
  const lines: string[] = spaceBefore ? makeBlank(spaceBefore, { asArray: true }) : [];

  for (const rowContents of processContents(rows, columns, { ellipsis })) {
    // Each cell fills its column's width, or shows as it is without one.
    const line = rowContents.map((colContent, index) => {
      const colWidth = columns[index]?.width;
      const content =
        colWidth === undefined ? (colContent ?? '') : alignLine(colContent ?? '', colWidth, columns[index]?.align, ' ');

      return index < rowContents.length - 1 ? content + (columns[index]?.gap ?? ' ') : content;
    });

    lines.push(indentSpace + linePrefix + line.join('') + lineSuffix);
  }

  if (spaceAfter) lines.push(...makeBlank(spaceAfter, { asArray: true }));

  return (asArray ? lines : lines.join('\n')) as TextLines<AsArray>;
};
