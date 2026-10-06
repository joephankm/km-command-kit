import Pattern from '../constants/patterns';
import type { MarkupOptions, TextLines, TextAlign } from '../types/markupTypes';

/**
 * Provides plain text for layout calculations.
 *
 * Removes ANSI style escape sequences while preserving the visible text.
 *
 * @example `\u001B[1mbold\u001B[22m` => `bold`
 */
export const stripStyles = (text: string): string => text.replace(Pattern.StyleEscapes, '');

/**
 * Supports:
 * - Distributing extra space between words.
 * - Padding a single-word line on the right.
 *
 * Distributes available space between words, giving any remainder to the leftmost gaps. A
 * single-word line is padded on the right.
 *
 * @example `a bc def`, width `12` => `a   bc   def`
 */
const justifyLine = (line: string, width: number): string => {
  const words = line.split(' ').filter(Boolean);
  const wordsLength = words.reduce((total, word) => total + stripStyles(word).length, 0);

  if (words.length < 2) return words.join('') + ' '.repeat(Math.max(width - wordsLength, 0));

  const gaps = words.length - 1;
  const spare = width - wordsLength;
  const gapSize = Math.floor(spare / gaps);
  const widerGaps = spare % gaps;

  return words.reduce((result, word, index) =>
    index === 0 ? word : result + ' '.repeat(gapSize + (index <= widerGaps ? 1 : 0)) + word
  );
};

/**
 * Places text within an available width.
 *
 * Supports:
 * - Left, center, right, and justified alignment.
 * - Fill characters.
 * - Returning text unchanged when it already meets or exceeds the width.
 *
 * @example `abc`, width `7`, `'center'` => `  abc  `
 */
export const alignLine = (line: string, width: number, align: TextAlign = 'left', fill?: string): string => {
  if (align === 'left' && !fill) return line;

  const spaceLength = width - stripStyles(line).length;
  if (spaceLength <= 0) return line;

  fill ??= ' ';

  switch (align) {
    case 'right':
      return fill.repeat(spaceLength) + line;
    case 'center': {
      const before = Math.floor(spaceLength / 2);
      return fill.repeat(before) + line + fill.repeat(spaceLength - before);
    }
    case 'justify':
      return justifyLine(line, width);
    default:
      return line + fill.repeat(spaceLength);
  }
};

/**
 * Options for wrapping text: how each wrapped line is aligned within the width, the text set before
 * and after each line, and whether the lines come back as an array.
 */
type WrapTextOptions<AsArray extends boolean> = Pick<MarkupOptions, 'align' | 'linePrefix' | 'lineSuffix'> & {
  /** Text set before the first line in place of `linePrefix`, such as a list marker. */
  firstLinePrefix?: string;
  /** Returns the lines as an array instead of joined by line breaks. */
  asArray?: AsArray;
};

/**
 * Arranges a paragraph into lines for display.
 *
 * Supports:
 * - A target width and alignment.
 * - Per-line prefixes and suffixes, with a separate prefix for the first line.
 * - Returning joined text or an array of lines.
 * - Keeping words intact when they do not fit on a line.
 *
 * @example `parse the input now`, width `10` => `parse the\ninput now`, or with `asArray`,
 * `['parse the', 'input now']`
 */
export const wrapText = <AsArray extends boolean = false>(
  paragraph: string,
  width: number,
  { align, linePrefix = '', firstLinePrefix, lineSuffix = '', asArray }: WrapTextOptions<AsArray> = {}
): TextLines<AsArray> => {
  const contentWidth = linePrefix || lineSuffix ? width - stripStyles(linePrefix + lineSuffix).length : width;
  const lines: string[] = [];

  // The first line wraps within what its own prefix leaves, then every later line within what
  // `linePrefix` leaves.
  let lineWidth =
    firstLinePrefix === undefined ? contentWidth : width - stripStyles(firstLinePrefix + lineSuffix).length;

  let line = '';
  let lineLength = 0;

  for (const word of paragraph.split(' ')) {
    if (!word) continue;

    const wordLength = stripStyles(word).length;

    // The first count
    if (!line) {
      line = word;
      lineLength = wordLength;
    }
    // In a line
    else if (lineLength + 1 + wordLength <= lineWidth) {
      line += ' ' + word;
      lineLength += 1 + wordLength;
    }
    // In a line break
    else {
      lines.push(align ? alignLine(line, lineWidth, align) : line);
      line = word;
      lineLength = wordLength;
      if (lineWidth !== contentWidth) lineWidth = contentWidth;
    }
  }

  // A line is aligned when the next word pushes it out, and the last line once every word is
  // placed, so no line needs a second pass.
  lines.push(align ? alignLine(line, lineWidth, align) : line);

  if (firstLinePrefix !== undefined || linePrefix || lineSuffix) {
    for (let index = 0; index < lines.length; index++) {
      lines[index] = (firstLinePrefix && index === 0 ? firstLinePrefix : linePrefix) + lines[index] + lineSuffix;
    }
  }

  return (asArray ? lines : lines.join('\n')) as TextLines<AsArray>;
};

/**
 * Options for truncating text: the symbol that ends text cut short.
 */
type TruncateTextOptions = {
  /** Text set where the cut text ends, inside the width, default is `...`. */
  ellipsis?: string;
};

/**
 * Shortens text for a constrained display area.
 *
 * Supports:
 * - A custom ending marker (default `...`).
 * - Keeping the marker within the requested width when it fits.
 *
 * @example `parse the input now`, width `12` => `parse the...`
 */
export const truncateText = (text: string, width: number, { ellipsis = '...' }: TruncateTextOptions = {}): string => {
  if (stripStyles(text).length <= width) return text;

  let remaining = Math.max(width - stripStyles(ellipsis).length, 0);
  let result = '';
  let isStyleCode = false;
  let isCut = false;

  for (const part of text.split(Pattern.StyleEscapeSplit)) {
    if (isStyleCode) {
      result += part;
    } else if (!isCut) {
      if (part.length <= remaining) {
        result += part;
        remaining -= part.length;
      } else {
        result += part.slice(0, remaining) + ellipsis;
        isCut = true;
      }
    }

    isStyleCode = !isStyleCode;
  }

  return result;
};
