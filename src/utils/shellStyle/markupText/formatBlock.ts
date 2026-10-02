import type { FormatBlockOptions } from '../types/markupTypes';
import { blankLines, wrapText } from './stringUtils';

/**
 * Formats a block of text, paragraph by paragraph. Given a width, it wraps each paragraph so no
 * line passes the width, aligns every line within it, and sets padding beside every line when
 * given; without one, each paragraph is kept as it is. Every paragraph takes a margin of blank
 * lines, below it unless told otherwise.
 *
 * Example: `parse the input now`, `{ width: 12, align: 'right' }` →
 * `   parse the\n   input now\n`
 */
export const formatBlock = (
  text: string,
  { width, align, padding, paddingSize = 1, margin = 'bottom', marginSize = 1 }: FormatBlockOptions = {}
): string => {
  const space = padding ? ' '.repeat(paddingSize) : '';
  const linePrefix = padding === 'left' || padding === true ? space : '';
  const lineSuffix = padding === 'right' || padding === true ? space : '';
  const blocks: string[] = [];

  for (const paragraph of text.split('\n')) {
    if (width) {
      blocks.push(wrapText(paragraph, width, { align, linePrefix, lineSuffix, margin, marginSize }));
    } else if (margin) {
      const top = margin === 'top' || margin === true ? blankLines(marginSize) : '';
      const bottom = margin === 'bottom' || margin === true ? blankLines(marginSize) : '';
      blocks.push(top + paragraph + bottom);
    } else {
      blocks.push(paragraph);
    }
  }

  return blocks.join('\n');
};
