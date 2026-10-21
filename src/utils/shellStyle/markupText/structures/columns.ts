import type { ValueOrIndexed } from '../../types/commonTypes';
import type { ColumnContent, MakeColumnsOptions, TextLines } from '../../types/markupTypes';
import { alignText, wrapText, truncateText } from '../../common/textUtils';
import { stripStyles } from '../../common/styleExcapeUtils';
import { genLineCollector } from './blank';
import { genLineWrapper } from './block';

/**
 * The values of a column: each one as its mapper returns it, or as given when it has no mapper.
 */
type ColumnProps<Props, Mappers> = {
  [Key in keyof Props]?: Key extends keyof Mappers
    ? Mappers[Key] extends (value: never) => infer Mapped
      ? Mapped
      : Props[Key]
    : Props[Key];
};

type NormalizeColumnsParams<
  Props extends Record<string, unknown>,
  Mappers extends { [Key in keyof Props]?: (value: Props[Key]) => unknown } = Record<never, never>,
> = {
  columns: { [Key in keyof Props]?: ValueOrIndexed<Props[Key]> };
  mappers?: Mappers;
};

/**
 * Generate the values of each column by position.
 */
const normalizeColumns = <
  Values extends Record<string, unknown>,
  Mappers extends { [Key in keyof Values]?: (value: Values[Key]) => unknown } = Record<never, never>,
>(
  columnCount: number,
  { columns, mappers }: NormalizeColumnsParams<Values, Mappers>
) => {
  const finalColumns: (ColumnProps<Values, Mappers> | undefined)[] = [];

  for (let index = 0; index < columnCount; index++) {
    const columnProps: Record<string, unknown> = {};

    for (const key in columns) {
      const value = columns[key];
      if (value === undefined) continue;

      const columnValue = typeof value !== 'object' ? value : (value as Record<number, unknown>)[index];
      if (columnValue === undefined) continue;

      const mapper = mappers?.[key] as ((value: unknown) => unknown) | undefined;
      columnProps[key] = mapper ? mapper(columnValue) : columnValue;
    }

    finalColumns.push(columnProps as ColumnProps<Values, Mappers>);
  }

  return finalColumns;
};

/**
 * Calculate each column's final width by position.
 *
 * @example `[['-o', 'output'], ['--verbose', 'more detail']]`, `20` => `{ 0: 9, 1: 10 }`
 */
export const calcColumnWidths = (
  contents: ColumnContent[][],
  { width, gap = 1 }: Pick<MakeColumnsOptions, 'gap' | 'width'>
) => {
  const columnCount = Math.max(0, ...contents.map(row => row.length));
  const widths: Record<number, number> = {};
  let usedWidth = 0;

  for (let index = 0; index < columnCount; index++) {
    const columnWidth = typeof width === 'object' ? width[index] : undefined;

    // [CASE]: Fixed width
    if (typeof columnWidth === 'number') {
      widths[index] = columnWidth;
    }
    // [CASE]: Auto calculate width, still make sure it is between the min and max
    else if (index < columnCount - 1) {
      let autoWidth = Math.max(0, ...contents.map(row => stripStyles(row[index] ?? '').length));

      if (columnWidth?.min !== undefined) autoWidth = Math.max(autoWidth, columnWidth.min);
      if (columnWidth?.max !== undefined) autoWidth = Math.min(autoWidth, columnWidth.max);

      widths[index] = autoWidth;
    } else {
      continue;
    }

    // Every column but the last is followed by its gap.
    if (index < columnCount - 1) {
      usedWidth += widths[index]! + (typeof gap === 'number' ? gap : (gap[index] ?? 1));
    }
  }

  // With a total width, the last column takes what remains unless it has an exact width.
  if (typeof width === 'number' && columnCount > 0 && widths[columnCount - 1] === undefined) {
    widths[columnCount - 1] = width - usedWidth;
  }

  return widths;
};

type ProcessContentsParams = {
  columns: ({ width?: number } | undefined)[];
  truncate?: boolean;
  ellipsis?: string;
};

const processContents = (contentRows: ColumnContent[][], { columns, truncate, ellipsis }: ProcessContentsParams) => {
  // Check whether a cell passes its column's width.
  const isExceeded = (content: ColumnContent, index: number): content is string => {
    const width = columns[index]?.width;
    return width !== undefined && content !== null && stripStyles(content).length > width;
  };

  // If no row exceed the width, don't need to do anything
  if (!contentRows.some(row => row.some(isExceeded))) return contentRows;

  const finalRows: ColumnContent[][] = [];

  for (const contents of contentRows) {
    let currRowExceeded = false;

    const contentLines = contents.map((content, index) => {
      if (isExceeded(content, index)) {
        currRowExceeded = true;
        const width = columns[index]!.width!;

        return truncate ? [truncateText(content, { width, ellipsis })] : wrapText(content, { width });
      } else {
        return [content];
      }
    });

    if (!currRowExceeded) {
      finalRows.push(contents);
      continue;
    }

    const lineMaxCount = Math.max(1, ...contentLines.map(lines => lines.length));

    for (let lineIndex = 0; lineIndex < lineMaxCount; lineIndex++) {
      finalRows.push(contentLines.map(lines => lines[lineIndex] ?? ''));
    }
  }

  return finalRows;
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
  { width, gap = 1, align, ellipsis, style, ...restOptions }: MakeColumnsOptions<AsArray> = {}
): TextLines<AsArray> => {
  const inputRows = (!Array.isArray(contents[0]) ? [contents] : contents) as ColumnContent[][];
  const columnCount = Math.max(0, ...inputRows.map(row => row.length));

  const wrapper = genLineWrapper({ width: typeof width === 'number' ? width : undefined, ...restOptions });

  const columns = normalizeColumns(columnCount, {
    columns: {
      align,
      gap,
      style,
      width: calcColumnWidths(inputRows, { width: typeof width === 'number' ? width - wrapper.width() : width, gap }),
    },
    mappers: { gap: (size: number) => ' '.repeat(size) },
  });

  const lines = genLineCollector(restOptions, wrapper.line);

  const contentRows = processContents(inputRows, {
    columns,
    truncate: ellipsis !== undefined,
    ellipsis: ellipsis === true ? undefined : ellipsis,
  });

  for (const rowContents of contentRows) {
    // Each cell fills its column's width, or shows as it is without one.
    const contentLines = rowContents.map((colContent, index) => {
      const column = columns[index];
      const text = colContent && column?.style ? column.style(colContent) : (colContent ?? '');
      const content =
        column?.width === undefined ? text : alignText(text, { width: column.width, align: column.align, fill: ' ' });

      return index < rowContents.length - 1 ? content + (column?.gap ?? ' ') : content;
    });

    lines.push(contentLines.join(''));
  }

  return lines.result();
};
