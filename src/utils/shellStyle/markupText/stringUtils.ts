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
 * Options for wrapping a line: the indents and the text set before and after it.
 */
export type LineWrapperOptions<Value = unknown> = Pick<
  MarkupOptions,
  'width' | 'indent' | 'rightIndent' | 'linePrefix' | 'lineSuffix'
> & {
  /** Text set after the indent, right before the content. */
  contentPrefix?: string;
  /**
   * Text set in place of `contentPrefix` on the first line, or a function that makes it from a
   * value.
   */
  firstContentPrefix?: string | ((value: Value) => string);
};

/**
 * Functions that set content within the indents, prefixes, and suffix of a line wrapper.
 */
type LineWrapper<Value = unknown> = {
  /** Set a line, already fitted to the width, within the prefixes and suffix. */
  line: (text: string) => string;
  /**
   * Set the first line, already fitted to the width, within the first-line prefixes and suffix. The
   * value is passed to `firstContentPrefix` when it is a function.
   */
  firstLine: (text: string, value?: Value) => string;
  /**
   * Width of the prefixes and suffix set around a line, or around the first line. The value is
   * passed to `firstContentPrefix` when it is a function.
   */
  width: (target?: 'line' | 'firstLine', value?: Value) => number;
};

/**
 * Make the functions that set content within its indents, prefixes, and suffix.
 *
 * @example `{ linePrefix: '│', indent: 2, contentPrefix: '> ' }`, then `line('parse')` => `│  > parse`
 */
export const initLineWrapper = <Value = unknown>({
  width,
  indent,
  rightIndent,
  linePrefix,
  contentPrefix,
  firstContentPrefix,
  lineSuffix,
}: LineWrapperOptions<Value> = {}): LineWrapper<Value> => {
  // The line prefix sits outermost, then the indent, then the content prefix.
  const commonPrefix = (linePrefix ?? '') + (indent ? ' '.repeat(indent) : '');
  const prefix = commonPrefix + (contentPrefix ?? '');
  const firstPrefix =
    typeof firstContentPrefix === 'function'
      ? (value: Value) => commonPrefix + firstContentPrefix(value)
      : firstContentPrefix !== undefined
        ? commonPrefix + firstContentPrefix
        : undefined;

  // The suffix is set only when there is a width: the right indent, then the line suffix outermost.
  const suffix = width ? (rightIndent ? ' '.repeat(rightIndent) : '') + (lineSuffix ?? '') : '';

  const lineWidth = stripStyles(prefix + suffix).length;

  const line: LineWrapper<Value>['line'] = prefix || suffix ? text => prefix + text + suffix : text => text;

  // A first prefix made by a function is made again from the value on each call.
  if (typeof firstPrefix === 'function') {
    return {
      line,
      firstLine: (text, value) => firstPrefix(value as Value) + text + suffix,
      width: (target = 'line', value) =>
        target === 'firstLine' ? stripStyles(firstPrefix(value as Value) + suffix).length : lineWidth,
    };
  }

  const firstLineWidth = typeof firstPrefix === 'string' ? stripStyles(firstPrefix + suffix).length : lineWidth;

  return {
    line,
    firstLine: firstPrefix ? text => firstPrefix + text + suffix : line,
    width: (target = 'line') => (target === 'firstLine' ? firstLineWidth : lineWidth),
  };
};

/**
 * Options for wrapping text: how each wrapped line is aligned within the width, the line wrapper
 * that sets each line within its prefixes and suffix, and whether the lines come back as an array.
 */
type WrapTextOptions<AsArray extends boolean, Value = unknown> = Pick<MarkupOptions<AsArray>, 'align' | 'asArray'> & {
  /** Line wrapper that sets each line, the first line with its own prefix. */
  lineWrapper?: LineWrapper<Value>;
  /** Value passed to the line wrapper's first line, to make its prefix. */
  firstLineValue?: Value;
  /** Width the first line's content wraps within, in place of what its prefix leaves. */
  firstLineWidth?: number;
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
export const wrapText = <AsArray extends boolean = false, Value = unknown>(
  paragraph: string,
  width: number,
  { align, lineWrapper, firstLineValue, firstLineWidth, asArray }: WrapTextOptions<AsArray, Value> = {}
): TextLines<AsArray> => {
  const contentWidth = lineWrapper ? width - lineWrapper.width('line') : width;
  const lines: string[] = [];

  // The first line wraps within `firstLineWidth`, or what its own prefix leaves, then every later
  // line within what the line prefix leaves.
  let lineWidth = firstLineWidth ?? (lineWrapper ? width - lineWrapper.width('firstLine') : width);

  const pushLine = (line: string) => {
    const alignedLine = align ? alignLine(line, lineWidth, align) : line;
    if (lineWrapper) {
      lines.push(
        lines.length === 0 ? lineWrapper.firstLine(alignedLine, firstLineValue) : lineWrapper.line(alignedLine)
      );
    } else {
      lines.push(alignedLine);
    }
  };

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
      pushLine(line);
      line = word;
      lineLength = wordLength;
      if (lineWidth !== contentWidth) lineWidth = contentWidth;
    }
  }

  // A line is aligned and wrapped when the next word pushes it out, and the last line once every
  // word is placed
  pushLine(line);

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
