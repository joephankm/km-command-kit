import { capitalize, sentenceCase, titleCase } from '../common/textCases';
import style from '../styleText/presetStyles';
import { styleFuncByCode } from '../styleText/styleFuncByCode';
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

  if (!textStyle?.length) return casedText;

  const styleText = typeof textStyle === 'string' ? style[textStyle] : styleFuncByCode(textStyle);

  return styleText(casedText);
};
