import type { DisplayLineOptions } from '../types/markupTypes';
import { alignText, truncateText } from '../common/textUtils';

/**
 * Formats one line for display.
 *
 * Supports:
 * - A target width and text alignment.
 * - Fill characters and truncation markers.
 * - Left and right indents.
 *
 * @example `parse the input now`, `{ width: 12 }` => `parse the...`
 */
export const displayLine = (
  text: string,
  { width, align, ellipsis, fill, indent, rightIndent }: DisplayLineOptions = {}
): string => {
  const indentSpace = indent ? ' '.repeat(indent) : '';

  if (!width) return indentSpace + text;

  const contentWidth = width - (indent ?? 0) - (rightIndent ?? 0);
  let line = truncateText(text, { width: contentWidth, ellipsis });

  // A filled line keeps its right indent as spaces, so it spans the full width.
  if (align || fill) line = alignText(line, { width: contentWidth, align, fill }) + ' '.repeat(rightIndent ?? 0);

  return indentSpace + line;
};
