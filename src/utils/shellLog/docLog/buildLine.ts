import { markup } from '../../shellStyle';
import type { DocLogSettings, LineOptions } from '../types/docLogTypes';
import type { DocLogFuncs } from './docLog';

/**
 * Create the line-printing method for a document log.
 */
export default ({ width }: DocLogSettings, { styleFuncOf, startLines, endPrintLines }: DocLogFuncs) => {
  /**
   * Print a single line of text.
   */
  return (text: string, { indent, style, spaceBefore = 0, spaceAfter }: LineOptions = {}) => {
    const lineStyleFunc = styleFuncOf(style ?? 'default');
    // Ignore the document's spacing: only this call's own spacing applies.
    const lines = startLines(spaceBefore);

    const line = markup.displayLine(text, { width, indent });
    lines.push(lineStyleFunc ? lineStyleFunc(line) : line);

    endPrintLines(lines, spaceAfter);
  };
};
