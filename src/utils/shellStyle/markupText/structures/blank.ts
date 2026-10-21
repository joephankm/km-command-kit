import type { MarkupOptions, TextLines } from '../../types/markupTypes';

/**
 * Options for blank lines: whether they come back as an array.
 */
type MakeBlankOptions<AsArray extends boolean> = Pick<MarkupOptions<AsArray>, 'asArray'>;

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
 * Options for collecting lines: the blank lines around them, and whether they come back as an
 * array.
 */
type LineCollectorOptions<AsArray extends boolean> = Pick<
  MarkupOptions<AsArray>,
  'spaceBefore' | 'spaceAfter' | 'asArray'
>;

/**
 * Functions that collect formatted lines and return them.
 */
type LineCollector<AsArray extends boolean> = {
  /** Add a line, or several, after the ones collected so far. */
  push: (lines: string | string[], noWrap?: boolean) => void;
  /** Return the collected lines, with the blank lines after them, as a string or an array. */
  result: () => TextLines<AsArray>;
};

/**
 * [UTIL] Make the functions that collect formatted lines between their blank lines before and after.
 *
 * @example `{ spaceBefore: 1 }`, then `push('parse')` and `result()` => `\nparse`
 */
export const genLineCollector = <AsArray extends boolean = false>(
  { spaceBefore, spaceAfter, asArray }: LineCollectorOptions<AsArray>,
  wrapFunc?: (line: string) => string
): LineCollector<AsArray> => {
  const lines: string[] = spaceBefore ? makeBlank(spaceBefore, { asArray: true }) : [];

  return {
    push: (newLines, noWrap) => {
      if (Array.isArray(newLines)) {
        lines.push(...(wrapFunc && !noWrap ? newLines.map(wrapFunc) : newLines));
      } else {
        lines.push(wrapFunc && !noWrap ? wrapFunc(newLines) : newLines);
      }
    },
    result: () => {
      if (spaceAfter) lines.push(...makeBlank(spaceAfter, { asArray: true }));

      return (asArray ? lines : lines.join('\n')) as TextLines<AsArray>;
    },
  };
};
