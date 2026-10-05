import Pattern from '../constants/patterns';
import type { MarkupOptions, TextLines, TextAlign } from '../types/markupTypes';

/**
 * Removes every style escape from text, leaving only the characters that show on screen.
 *
 * Example: `\u001B[1mbold\u001B[22m` → `bold`
 */
export const stripStyles = (text: string): string => text.replace(Pattern.StyleEscapes, '');

/**
 * Spreads the words of a line across a width, putting the spare columns between them. When the
 * spare columns do not divide evenly, the leftmost gaps take one more each. A line of one word is
 * aligned left instead.
 *
 * Example: `a bc def`, width `12` → `a   bc   def`
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
 * Sits one line within a width by an alignment, filling the columns left over with the fill
 * character. A line already as wide as the width, or wider, is returned as it is.
 *
 * Example: `abc`, width `7`, `'center'` → `  abc  `
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
 * Breaks one paragraph into lines no wider than a width, putting as many words on each line as fit.
 * A word wider than the width takes a line of its own, as it is. The first line takes
 * `firstLinePrefix` in place of `linePrefix` when given, and wraps within the width its own prefix
 * leaves.
 *
 * Example: `parse the input now`, width `10` → `parse the\ninput now`, or with `asArray`,
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
 * Cuts text wider than a width down to it, ending it with an ellipsis, counted inside the width.
 *
 * Example: `parse the input now`, width `12` → `parse the...`
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
