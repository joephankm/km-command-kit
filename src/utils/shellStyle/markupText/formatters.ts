import { capitalize, sentenceCase, titleCase } from '../common/textCases';
import { textStyleFunc } from '../styleText/styleFuncByCode';
import type { FormatTextOptions, TextCase } from '../types/markupTypes';

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
 * Prepares text for display.
 *
 * Supports:
 * - Letter-case conversion.
 * - Preset or custom ANSI styling.
 */
export const formatText = (text: string, { style: textStyle, textCase }: FormatTextOptions = {}): string => {
  const casedText = textCase ? CASE_FUNC_MAP[textCase](text) : text;

  if (!textStyle) return casedText;

  // A style function is used as given; a named style was created once, and code names are created here.
  return typeof textStyle === 'function' ? textStyle(casedText) : textStyleFunc(textStyle)(casedText);
};
