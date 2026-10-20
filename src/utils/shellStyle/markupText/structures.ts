import { MakeBlockOptions, MakeListOptions, TextLines } from '../types/markupTypes';
import { initLineCollector, makeBlank } from './spacings';
import { getListPrefixes } from './listUtils';
import { wrapText } from '../common/textUtils';
import { initLineWrapper } from './stringUtils';

/**
 * Formats text blocks for presentation.
 *
 * Supports:
 * - Multiple paragraphs, wrapping, and alignment.
 * - Line prefixes and suffixes, left and right indents, and surrounding blank lines.
 * - Returning a string or an array of lines.
 *
 * @example `parse the input now`, `{ width: 12, align: 'right' }` =>
 * `   parse the\n   input now`, or with `asArray`, `['   parse the', '   input now']`
 */
export const makeBlock = <AsArray extends boolean = false>(
  text: string | string[],
  options: MakeBlockOptions<AsArray> = {}
): TextLines<AsArray> => {
  const wrapper = initLineWrapper(options);
  const lines = initLineCollector(options, wrapper.line);
  const between = options.spaceBetween ? makeBlank(options.spaceBetween, { asArray: true }) : undefined;

  const paragraphs = typeof text === 'string' ? text.split('\n') : text;

  // The text wraps within what the prefixes and suffix leave.
  const contentWidth = options.width ? options.width - wrapper.width() : 0;

  for (let index = 0; index < paragraphs.length; index++) {
    const paragraph = paragraphs[index]!;

    if (between && index > 0) lines.push(between, true);

    if (options.width) {
      lines.push(wrapText(paragraph, { width: contentWidth, align: options.align, formatLine: wrapper.line }), true);
    } else {
      lines.push(paragraph);
    }
  }

  return lines.result();
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

  const wrapper = initLineWrapper({ ...options, contentPrefix, firstContentPrefix });
  const lines = initLineCollector(options);

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
