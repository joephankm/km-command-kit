import { markup } from '../../shellStyle';
import type { DividerOptions, DocLogSettings } from '../types/docLogTypes';
import type { DocLogFuncs } from './docLog';

/**
 * Create the divider-printing method for a document log.
 */
export default ({ width, dividerFill }: DocLogSettings, { styleFuncOf, startLines, endPrintLines }: DocLogFuncs) => {
  // Use the divider style when defined, otherwise fall back to the default text style.
  const dividerStyleFunc = styleFuncOf('divider') ?? styleFuncOf('default');

  /**
   * Print a divider across the document width.
   */
  return ({ style, spaceBefore, spaceAfter, fill }: DividerOptions = {}) => {
    const styleFunc = style ? styleFuncOf(style) : dividerStyleFunc;
    const lines = startLines(spaceBefore);

    // TODO: Use `drawBox.line` once it returns the rendered line instead of printing it.
    const dividerLine = markup.displayLine('', { width, fill: fill ?? dividerFill });
    lines.push(styleFunc ? styleFunc(dividerLine) : dividerLine);

    endPrintLines(lines, spaceAfter);
  };
};
