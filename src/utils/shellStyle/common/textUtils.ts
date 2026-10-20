import { stripStyles, splitStyledText } from './styleExcapeUtils';

type TextAlign = 'left' | 'center' | 'right' | 'justify';

type AlignTextParams = {
  width: number;
  align?: TextAlign;
  fill?: string;
};

/**
 * Align text within an available width.
 */
export const alignText = (text: string, { width, align = 'left', fill }: AlignTextParams): string => {
  if (align === 'left' && !fill) return text;

  const spaceLength = width - stripStyles(text).length;
  if (spaceLength <= 0) return text;

  fill ??= ' ';

  switch (align) {
    case 'right':
      return fill.repeat(spaceLength) + text;

    case 'center': {
      const before = Math.floor(spaceLength / 2);
      return fill.repeat(before) + text + fill.repeat(spaceLength - before);
    }

    case 'justify': {
      const words = text.split(' ').filter(Boolean);
      const wordsLength = words.reduce((total, word) => total + stripStyles(word).length, 0);

      if (words.length < 2) return words.join('') + ' '.repeat(Math.max(width - wordsLength, 0));

      const gaps = words.length - 1;
      const spare = width - wordsLength;
      const gapSize = Math.floor(spare / gaps);
      const widerGaps = spare % gaps;

      return words.reduce((result, word, index) =>
        index === 0 ? word : result + ' '.repeat(gapSize + (index <= widerGaps ? 1 : 0)) + word
      );
    }

    default:
      return text + fill.repeat(spaceLength);
  }
};

type WrapTextParams = {
  width: number;
  align?: TextAlign;
  formatLine?: (line: string, index: number) => string;
};

export const wrapText = (text: string, { width, align, formatLine }: WrapTextParams): string[] => {
  const lines: string[] = [];

  const pushLine = (line: string) => {
    if (align) line = alignText(line, { width, align });
    lines.push(formatLine ? formatLine(line, lines.length) : line);
  };

  let line = '';
  let lineLength = 0;

  for (const word of text.split(' ')) {
    if (!word) continue;

    const wordLength = stripStyles(word).length;

    // The first count
    if (!line) {
      line = word;
      lineLength = wordLength;
    }
    // In a line
    else if (lineLength + 1 + wordLength <= width) {
      line += ' ' + word;
      lineLength += 1 + wordLength;
    }
    // In a line break
    else {
      pushLine(line);
      line = word;
      lineLength = wordLength;
    }
  }

  // Push the last line
  pushLine(line);

  return lines;
};

type TruncateTextParams = {
  width: number;
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
export const truncateText = (text: string, { width, ellipsis = '...' }: TruncateTextParams): string => {
  if (stripStyles(text).length <= width) return text;

  let remaining = Math.max(width - stripStyles(ellipsis).length, 0);
  let result = '';
  let isCut = false;

  splitStyledText(text, (part, isStyleCode) => {
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
  });

  return result;
};
