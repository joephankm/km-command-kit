import { markup } from '../../shellStyle';
import type { BodyOptions, DocLogSettings } from '../types/docLogTypes';
import type { DocLogFuncs } from './docLog';

/**
 * Create the body-printing method for a document log.
 */
export default (
  { width, spacing }: DocLogSettings,
  { styleFuncOf, defaultAlign, startLines, endPrintLines }: DocLogFuncs
) => {
  /**
   * Print formatted body text.
   */
  return (text: string, { indent, align, style, spaceBefore, spaceAfter }: BodyOptions = {}) => {
    const bodyStyleFunc = styleFuncOf(style ?? 'default');
    const lines = startLines(spaceBefore);

    // Apply the configured spacing between paragraphs.
    const block = markup.makeBlock(text, {
      width,
      indent,
      align: defaultAlign(align),
      spaceBetween: spacing,
    });
    lines.push(bodyStyleFunc ? bodyStyleFunc(block) : block);

    endPrintLines(lines, spaceAfter);
  };
};
