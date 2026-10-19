import { NUMBER_STYLES } from '../common/numberStyles';
import type { MakeListOptions } from '../types/markupTypes';
import { stripStyles } from './stringUtils';

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
  count: number,
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

    for (let index = 0; index < count; index++) {
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
  numberWidth ??= String(startNumber + count - 1).length;

  return {
    firstContentPrefix: index => String(startNumber + index).padStart(numberWidth) + marker + ' ',
    contentPrefix: ' '.repeat(numberWidth + markerLength + 1),
  };
};
