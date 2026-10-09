import { markup } from '../../shellStyle';
import type { BodyOptions, DocLogSettings } from '../types/docLogTypes';
import type { DocLogFuncs } from './docLog';

/**
 * Create the body-printing method for a document log.
 */
export default (
  { width, padding, paddingSize, spacing }: DocLogSettings,
  { styleFuncOf, defaultAlign, startLines, endPrintLines }: DocLogFuncs
) => {
  // Shared width and padding for body text.
  const blockOptions = { width, padding, paddingSize };

  /**
   * Print formatted body text.
   */
  return (text: string, { align, style, spaceBefore, spaceAfter }: BodyOptions = {}) => {
    const bodyStyleFunc = styleFuncOf(style ?? 'default');
    const lines = startLines(spaceBefore);

    // Apply the configured spacing between paragraphs.
    const block = markup.makeBlock(text, {
      ...blockOptions,
      align: defaultAlign(align),
      spaceBetween: spacing,
    });
    lines.push(bodyStyleFunc ? bodyStyleFunc(block) : block);

    endPrintLines(lines, spaceAfter);
  };
};
