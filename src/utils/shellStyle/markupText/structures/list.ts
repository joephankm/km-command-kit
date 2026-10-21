import { NUMBER_STYLES } from '../../common/numberStyles';
import { stripStyles } from '../../common/styleExcapeUtils';
import { wrapText } from '../../common/textUtils';
import type { MakeListOptions, TextLines } from '../../types/markupTypes';
import { genLineWrapper } from './block';
import { genLineCollector } from './blank';

/**
 * Options for list prefixes: the marker, and how the items are numbered.
 */
type ListPrefixOptions = Pick<MakeListOptions, 'marker' | 'numbered' | 'startNumber' | 'numberType' | 'numberWidth'>;

/**
 * Prefixes of a list item: the one on its first line, made from the item index when numbered, and
 * the one on every later line.
 */
type ListPrefixes = {
  /** Text set before an item's first line, or a function that makes it from the item index. */
  firstContentPrefix: string | ((index: number) => string);
  /** Text set before every later line of an item, as wide as the first-line prefix. */
  contentPrefix: string;
};

/**
 * Get the prefixes of a list's items: a marker, or a number followed by a marker, on each first
 * line, and spaces as wide on every later line.
 *
 * @example `3`, `{ numbered: true }` => `{ firstContentPrefix: index => '1. ', contentPrefix: '   ' }`
 */
export const getListPrefixes = (
  itemCount: number,
  { numbered, startNumber = 1, numberType, numberWidth, marker = numbered ? '.' : '•' }: ListPrefixOptions = {}
): ListPrefixes => {
  const markerLength = stripStyles(marker).length;

  // The marker leads each item's first line, and every later line is indented past it.
  if (!numbered) {
    return { firstContentPrefix: marker + ' ', contentPrefix: ' '.repeat(markerLength + 1) };
  }

  if (numberType) {
    const numberStyle = NUMBER_STYLES[numberType];
    const numbers: string[] = [];
    numberWidth ??= 0;

    for (let index = 0; index < itemCount; index++) {
      const number = numberStyle(startNumber + index);
      numbers.push(number);

      if (number.length > numberWidth) numberWidth = number.length;
    }

    return {
      firstContentPrefix: index => (numbers[index] ?? '').padStart(numberWidth!) + marker + ' ',
      contentPrefix: ' '.repeat(numberWidth + markerLength + 1),
    };
  }

  // Numbers are right-aligned to the widest, so every item's text starts in the same column.
  numberWidth ??= String(startNumber + itemCount - 1).length;

  return {
    firstContentPrefix: index => String(startNumber + index).padStart(numberWidth) + marker + ' ',
    contentPrefix: ' '.repeat(numberWidth + markerLength + 1),
  };
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

  const wrapper = genLineWrapper({ ...options, contentPrefix, firstContentPrefix });
  const lines = genLineCollector(options);

  // The first-line prefix is as wide as the line prefix, so every line of an item wraps within the
  // same width.
  const contentWidth = options.width ? options.width - wrapper.width() : 0;

  // The items sit together, with no blank lines between them.
  for (let index = 0; index < items.length; index++) {
    const item = items[index]!;

    if (options.width) {
      lines.push(
        wrapText(item, {
          width: contentWidth,
          align: options.align,
          formatLine: (line, lineIndex) => (lineIndex === 0 ? wrapper.firstLine(line, index) : wrapper.line(line)),
        })
      );
    } else {
      lines.push(wrapper.firstLine(item, index));
    }
  }

  return lines.result();
};
