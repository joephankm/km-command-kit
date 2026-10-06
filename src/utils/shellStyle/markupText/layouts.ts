import type { DisplayLineOptions } from '../types/markupTypes';
import { alignLine, truncateText } from './stringUtils';

/**
 * Formats one line for display.
 *
 * Supports:
 * - A target width and text alignment.
 * - Fill characters and truncation markers.
 * - Padding.
 *
 * @example `parse the input now`, `{ width: 12 }` => `parse the...`
 */
export const displayLine = (
  text: string,
  { width, align, ellipsis, fill, padding, paddingSize = 1 }: DisplayLineOptions = {}
): string => {
  if (!width) return text;

  const contentWidth = padding ? width - paddingSize * (padding === true ? 2 : 1) : width;
  let line = truncateText(text, contentWidth, { ellipsis });

  if (align || fill) line = alignLine(line, contentWidth, align, fill);

  if (padding) {
    const space = ' '.repeat(paddingSize);

    if (padding === 'left' || padding === true) line = space + line;
    if (padding === 'right' || padding === true) line += space;
  }

  return line;
};
