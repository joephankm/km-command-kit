import type { ValueOrIndexed } from '../types/commonTypes';
import type { ColumnContent, MakeColumnsOptions } from '../types/markupTypes';
import { stripStyles, truncateText, wrapText } from './stringUtils';

/**
 * The values of a column: each one as its mapper returns it, or as given when it has no mapper.
 */
type ColumnValues<Values, Mappers> = {
  [Key in keyof Values]?: Key extends keyof Mappers
    ? Mappers[Key] extends (value: never) => infer Mapped
      ? Mapped
      : Values[Key]
    : Values[Key];
};

/**
 * Build the values of each column by position, from values given for every column or indexed by
 * position, each passed through its mapper when it has one. A column with no value of its own is
 * left empty.
 */
export const buildColumns = <
  Values extends Record<string, unknown>,
  Mappers extends { [Key in keyof Values]?: (value: Values[Key]) => unknown } = Record<never, never>,
>(
  count: number,
  values: { [Key in keyof Values]?: ValueOrIndexed<Values[Key]> },
  mappers?: Mappers
): (ColumnValues<Values, Mappers> | undefined)[] => {
  const columns: (ColumnValues<Values, Mappers> | undefined)[] = [];

  for (let index = 0; index < count; index++) {
    const column: Record<string, unknown> = {};

    for (const key in values) {
      const value = values[key];
      if (value === undefined) continue;

      const columnValue = typeof value !== 'object' ? value : (value as Record<number, unknown>)[index];
      if (columnValue === undefined) continue;

      const mapper = mappers?.[key] as ((value: unknown) => unknown) | undefined;
      column[key] = mapper ? mapper(columnValue) : columnValue;
    }

    columns.push(column as ColumnValues<Values, Mappers>);
  }

  return columns;
};

/**
 * Fit each row's cells to their columns' widths, wrapping a cell wider than its column's width. A
 * row whose cell wraps becomes several rows, one per line, with an empty cell where another column
 * has no line left.
 *
 * @example `[['-o', 'write the output']]`, `[{ width: 2 }, { width: 9 }]` =>
 * `[['-o', 'write the'], ['', 'output']]`
 */
export const processContents = (
  rows: ColumnContent[][],
  columns: ({ width?: number } | undefined)[],
  { ellipsis }: Pick<MakeColumnsOptions, 'ellipsis'> = {}
): ColumnContent[][] => {
  // Check whether a cell passes its column's width.
  const exceeds = (content: ColumnContent, index: number): content is string => {
    const width = columns[index]?.width;
    return width !== undefined && content !== null && stripStyles(content).length > width;
  };

  // Without a cell past its width, there is nothing to fit.
  if (!rows.some(row => row.some(exceeds))) return rows;

  const returnRows: ColumnContent[][] = [];

  for (const row of rows) {
    let isExceed = false;

    const cellLines = row.map((content, index) => {
      if (exceeds(content, index)) {
        isExceed = true;
        const width = columns[index]!.width!;

        return ellipsis
          ? [truncateText(content, width, { ellipsis: ellipsis === true ? undefined : ellipsis })]
          : wrapText(content, width, { asArray: true });
      } else {
        return [content];
      }
    });

    if (!isExceed) {
      returnRows.push(row);
      continue;
    }

    const lineCount = Math.max(1, ...cellLines.map(lines => lines.length));

    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      returnRows.push(cellLines.map(lines => lines[lineIndex] ?? ''));
    }
  }

  return returnRows;
};

/**
 * Get each column's final width by position. A column with an exact width takes it, and any other
 * column but the last takes the width of its widest content, held within its `min` and `max`. With
 * a total width, the last column takes the width that remains; without one, the last column has no
 * width.
 *
 * @example `[['-o', 'output'], ['--verbose', 'more detail']]`, `20` => `{ 0: 9, 1: 11 }`
 */
export const getColumnWidths = (
  contents: ColumnContent[][],
  width?: MakeColumnsOptions['width']
): Record<number, number> => {
  const columnCount = Math.max(0, ...contents.map(row => row.length));
  const widths: Record<number, number> = {};
  let usedWidth = 0;

  for (let index = 0; index < columnCount; index++) {
    const columnWidth = typeof width === 'object' ? width[index] : undefined;

    if (typeof columnWidth === 'number') {
      widths[index] = columnWidth;
    } else if (index < columnCount - 1) {
      // An auto column is as wide as its widest content, held within its bounds.
      let autoWidth = Math.max(0, ...contents.map(row => stripStyles(row[index] ?? '').length));

      if (columnWidth?.min !== undefined) autoWidth = Math.max(autoWidth, columnWidth.min);
      if (columnWidth?.max !== undefined) autoWidth = Math.min(autoWidth, columnWidth.max);

      widths[index] = autoWidth;
    } else {
      continue;
    }

    if (index < columnCount - 1) usedWidth += widths[index]!;
  }

  // With a total width, the last column takes what remains unless it has an exact width.
  if (typeof width === 'number' && columnCount > 0 && widths[columnCount - 1] === undefined) {
    widths[columnCount - 1] = width - usedWidth;
  }

  return widths;
};
