import { NUMBER_STYLES } from '../common/numberStyles';
import type { MakeBlockOptions, MakeListOptions, TextLines } from '../types/markupTypes';
import { stripStyles, wrapText } from './stringUtils';

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
 * - Line prefixes and suffixes, padding, and surrounding blank lines.
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
    padding,
    paddingSize = 1,
    linePrefix,
    firstLinePrefix,
    lineSuffix,
    spaceBefore,
    spaceAfter,
    spaceBetween,
    asArray,
  }: MakeBlockOptions<AsArray> = {}
): TextLines<AsArray> => {
  // Padding sits outermost: before the prefixes, and after the suffix.
  if (padding) {
    const space = ' '.repeat(paddingSize);

    if (padding === 'left' || padding === true) {
      linePrefix = space + (linePrefix ?? '');

      if (typeof firstLinePrefix === 'function') {
        const prefixFunc = firstLinePrefix;
        firstLinePrefix = index => space + prefixFunc(index);
      } else if (firstLinePrefix !== undefined) {
        firstLinePrefix = space + firstLinePrefix;
      }
    }

    if (padding === 'right' || padding === true) lineSuffix = (lineSuffix ?? '') + space;
  }

  const between = spaceBetween ? makeBlank(spaceBetween, { asArray: true }) : undefined;
  const lines: string[] = spaceBefore ? makeBlank(spaceBefore, { asArray: true }) : [];

  const paragraphs = typeof text === 'string' ? text.split('\n') : text;

  for (let index = 0; index < paragraphs.length; index++) {
    const paragraph = paragraphs[index]!;

    if (between && index > 0) lines.push(...between);

    if (width) {
      const firstPrefix = typeof firstLinePrefix === 'function' ? firstLinePrefix(index) : firstLinePrefix;

      lines.push(
        ...wrapText(paragraph, width, { align, linePrefix, firstLinePrefix: firstPrefix, lineSuffix, asArray: true })
      );
    } else {
      lines.push(paragraph);
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
 * - Wrapping, alignment, padding, and spacing.
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
    padding,
    paddingSize = 1,
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
    padding,
    paddingSize,
    firstLinePrefix,
    linePrefix,
    spaceBefore,
    spaceAfter,
    asArray: true,
  });

  return (asArray ? lines : lines.join('\n')) as TextLines<AsArray>;
};
