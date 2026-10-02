import Pattern from '../constants/patterns';
import type { MarkupOptions, TextAlign } from '../types/markupTypes';

/**
 * Removes every style escape from text, leaving only the characters that show on screen.
 *
 * Example: `\u001B[1mbold\u001B[22m` → `bold`
 */
export const stripStyles = (text: string): string => text.replace(Pattern.StyleEscapes, '');

/**
 * Options for blank lines: whether they come back as an array.
 */
type BlankLinesOptions<AsArray extends boolean> = {
  /** Returns the blank lines as an array of empty lines instead of as line breaks. */
  asArray?: AsArray;
};

type StringOrArray<AsArray extends boolean> = AsArray extends true ? string[] : string;

/**
 * Makes a number of blank lines: that many line breaks, or with `asArray`, that many empty lines.
 *
 * Example: `3` → `\n\n\n`, or with `asArray`, `['', '', '']`
 */
export const blankLines = <AsArray extends boolean = false>(
  count: number = 1,
  { asArray }: BlankLinesOptions<AsArray> = {}
): StringOrArray<AsArray> => {
  if (count === 1) return (asArray ? [''] : '\n') as StringOrArray<AsArray>;
  return (asArray ? new Array<string>(count).fill('') : '\n'.repeat(count)) as StringOrArray<AsArray>;
};

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
export const alignLine = (line: string, width: number, align: TextAlign = 'left', fill = ' '): string => {
  const spaceLength = width - stripStyles(line).length;

  if (spaceLength <= 0) return line;

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
 * and after each line, the blank lines kept above and below the paragraph, and whether the lines
 * come back as an array.
 */
type WrapTextOptions<AsArray extends boolean> = Pick<MarkupOptions, 'align' | 'margin' | 'marginSize'> & {
  /** Text set before every line, such as an indent, inside the width. */
  linePrefix?: string;
  /** Text set after every line, inside the width. */
  lineSuffix?: string;
  /** Returns the lines as an array instead of joined by line breaks. */
  asArray?: AsArray;
};

/**
 * Breaks one paragraph into lines no wider than a width, putting as many words on each line as fit.
 * A word wider than the width takes a line of its own, as it is. Given an alignment, every line is
 * aligned within the width, except the last line when justifying, which is left as it is. Given a
 * line prefix or suffix, it is set before or after every line, inside the width. Given a margin,
 * that many blank lines are added above, below, or both.
 *
 * Example: `parse the input now`, width `10` → `parse the\ninput now`, or with `asArray`,
 * `['parse the', 'input now']`
 */
export const wrapText = <AsArray extends boolean = false>(
  paragraph: string,
  width: number,
  { align, linePrefix = '', lineSuffix = '', margin, marginSize = 1, asArray }: WrapTextOptions<AsArray> = {}
): StringOrArray<AsArray> => {
  const contentWidth = linePrefix || lineSuffix ? width - stripStyles(linePrefix + lineSuffix).length : width;
  const lines = margin === 'top' || margin === true ? blankLines(marginSize, { asArray: true }) : [];
  const firstLine = lines.length;

  let line = '';
  let lineLength = 0;

  for (const word of paragraph.split(' ')) {
    if (!word) continue;

    const wordLength = stripStyles(word).length;

    if (!line) {
      line = word;
      lineLength = wordLength;
    } else if (lineLength + 1 + wordLength <= contentWidth) {
      line += ' ' + word;
      lineLength += 1 + wordLength;
    } else {
      lines.push(align ? alignLine(line, contentWidth, align) : line);
      line = word;
      lineLength = wordLength;
    }
  }

  // A line is aligned when the next word pushes it out, and the last line once every word is
  // placed, so no line needs a second pass.
  lines.push(align && ['center', 'right'].includes(align) ? alignLine(line, contentWidth, align) : line);

  if (linePrefix || lineSuffix) {
    for (let index = firstLine; index < lines.length; index++) {
      lines[index] = linePrefix + lines[index] + lineSuffix;
    }
  }

  if (margin === 'bottom' || margin === true) lines.push(...blankLines(marginSize, { asArray: true }));

  return (asArray ? lines : lines.join('\n')) as StringOrArray<AsArray>;
};
