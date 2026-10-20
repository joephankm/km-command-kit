import { stripStyles } from '../common/styleExcapeUtils';
import type { MarkupOptions } from '../types/markupTypes';

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
export type LineWrapper<Value = unknown> = {
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
  lineSuffix,
  contentPrefix,
  firstContentPrefix,
}: LineWrapperOptions<Value> = {}): LineWrapper<Value> => {
  // The line prefix sits outermost, then the indent, then the content prefix.
  const commonPrefix = (linePrefix ?? '') + (indent ? ' '.repeat(indent) : '');
  const prefix = commonPrefix + (contentPrefix ?? '');
  let firstPrefix: string | ((value: Value) => string) | undefined;
  if (firstContentPrefix !== undefined) {
    firstPrefix =
      typeof firstContentPrefix === 'function'
        ? value => commonPrefix + firstContentPrefix(value)
        : commonPrefix + firstContentPrefix;
  }

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
