import { capitalize, sentenceCase, titleCase } from '../common/textCases';
import style from '../styleText/presetStyles';
import { styleFuncByCode } from '../styleText/styleFuncByCode';
import type {
  FormatBlockOptions,
  FormatLineOptions,
  FormatListOptions,
  FormatTextOptions,
  TextLines,
  TextCase,
} from '../types/markupTypes';
import { alignLine, stripStyles, truncateText, wrapText } from './stringUtils';

/**
 * Each text case mapped to the function that sets text in it.
 */
const CASE_FUNC_MAP: Record<TextCase, (text: string) => string> = {
  upper: text => text.toUpperCase(),
  lower: text => text.toLowerCase(),
  title: titleCase,
  sentence: sentenceCase,
  capitalize,
};

/**
 * Formats a piece of text: sets its letters in the given case, then wraps it in the given style.
 */
const formatText = (text: string, { style: textStyle, textCase }: FormatTextOptions = {}): string => {
  const casedText = textCase ? CASE_FUNC_MAP[textCase](text) : text;

  if (!textStyle?.length) return casedText;

  const styleText = typeof textStyle === 'string' ? style[textStyle] : styleFuncByCode(textStyle);

  return styleText(casedText);
};

/**
 * Formats a single line of text.
 *
 * @example `parse the input now`, `{ width: 12 }` => `parse the...`
 */
const formatLine = (
  text: string,
  { width, align, ellipsis, fill, padding, paddingSize = 1 }: FormatLineOptions = {}
): string => {
  if (!width) return text;

  const contentWidth = padding ? width - paddingSize * (padding === true ? 2 : 1) : width;
  let line = truncateText(text, contentWidth, { ellipsis });

  if (align || fill) line = alignLine(line, contentWidth, align, fill);

  if (padding) {
    const space = ' '.repeat(paddingSize);

    if (padding === 'left' || padding === true) line = space + line;
    if (padding === 'right' || padding === true) line += space;
  }

  return line;
};

/**
 * Options for blank lines: whether they come back as an array.
 */
type BlankLinesOptions<AsArray extends boolean> = {
  /** Returns the blank lines as an array of empty lines instead of as line breaks. */
  asArray?: AsArray;
};

/**
 * Makes a number of blank lines: that many line breaks, or with `asArray`, that many empty lines.
 *
 * Example: `3` → `\n\n\n`, or with `asArray`, `['', '', '']`
 */
const blankLines = <AsArray extends boolean = false>(
  count: number = 1,
  { asArray }: BlankLinesOptions<AsArray> = {}
): TextLines<AsArray> => {
  if (count === 1) return (asArray ? [''] : '\n') as TextLines<AsArray>;
  return (asArray ? new Array<string>(count).fill('') : '\n'.repeat(count)) as TextLines<AsArray>;
};

/**
 * Formats a block of text, paragraph by paragraph.
 *
 * Example: `parse the input now`, `{ width: 12, align: 'right' }` →
 * `   parse the\n   input now\n`, or with `asArray`, `['   parse the', '   input now', '']`
 */
const formatBlock = <AsArray extends boolean = false>(
  text: string | string[],
  {
    width,
    align,
    padding,
    paddingSize = 1,
    linePrefix,
    firstLinePrefix,
    lineSuffix,
    spaceBefore,
    spaceAfter = 1,
    asArray,
  }: FormatBlockOptions<AsArray> = {}
): TextLines<AsArray> => {
  // Padding sits outermost: before the prefixes, and after the suffix.
  if (padding) {
    const space = ' '.repeat(paddingSize);

    if (padding === 'left' || padding === true) {
      linePrefix = space + (linePrefix ?? '');

      if (typeof firstLinePrefix === 'function') {
        const prefixFunc = firstLinePrefix;
        firstLinePrefix = index => space + prefixFunc(index);
      } else if (firstLinePrefix !== undefined) {
        firstLinePrefix = space + firstLinePrefix;
      }
    }

    if (padding === 'right' || padding === true) lineSuffix = (lineSuffix ?? '') + space;
  }

  const after = spaceAfter ? blankLines(spaceAfter, { asArray: true }) : undefined;
  const lines: string[] = spaceBefore ? blankLines(spaceBefore, { asArray: true }) : [];

  const paragraphs = typeof text === 'string' ? text.split('\n') : text;

  for (let index = 0; index < paragraphs.length; index++) {
    const paragraph = paragraphs[index]!;
    if (width) {
      const firstPrefix = typeof firstLinePrefix === 'function' ? firstLinePrefix(index) : firstLinePrefix;

      lines.push(
        ...wrapText(paragraph, width, { align, linePrefix, firstLinePrefix: firstPrefix, lineSuffix, asArray: true })
      );
    } else {
      lines.push(paragraph);
    }

    if (after) lines.push(...after);
  }

  return (asArray ? lines : lines.join('\n')) as TextLines<AsArray>;
};

/**
 * Formats a list of items, built on `formatBlock` with each item as one of its paragraphs.
 *
 * @example `['parse', 'validate']`, `{ indent: 2, width: 20 }` => `  • parse\n\n  • validate\n`
 */
const formatList = <AsArray extends boolean = false>(
  items: string[],
  {
    width,
    indent,
    numbered,
    startNumber = 1,
    numberWidth,
    marker = numbered ? '.' : '•',
    align,
    padding,
    paddingSize = 1,
    spaceBefore,
    spaceAfter = 1,
    asArray,
  }: FormatListOptions<AsArray> = {}
): TextLines<AsArray> => {
  const indentSpace = indent ? ' '.repeat(indent) : '';
  const markerLength = stripStyles(marker).length;

  // The marker leads each item's first line, and every later line is indented past it.
  let firstLinePrefix: FormatBlockOptions<AsArray>['firstLinePrefix'] = indentSpace + marker + ' ';
  let linePrefix = indentSpace + ' '.repeat(markerLength + 1);

  if (numbered) {
    // Numbers are right-aligned to the widest, so every item's text starts in the same column.
    numberWidth ??= String(startNumber + items.length - 1).length;

    firstLinePrefix = index => indentSpace + String(startNumber + index).padStart(numberWidth!) + marker + ' ';
    linePrefix = indentSpace + ' '.repeat(numberWidth + markerLength + 1);
  }

  return formatBlock(items, {
    width,
    align,
    padding,
    paddingSize,
    firstLinePrefix,
    linePrefix,
    spaceBefore,
    spaceAfter,
    asArray,
  });
};

export default {
  formatText,
  formatLine,
  blankLines,
  formatBlock,
  formatList,
};
