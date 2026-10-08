import type { NumberStyleName } from '../../shellStyle/common/numberStyles';

/**
 * The bulleted list marker for each of the 10 list levels, from the first.
 */
export const BULLET_LIST_MARKERS = ['•', '◦', '▪', '▫', '•', '◦', '▪', '▫', '•', '◦'] as const;

/**
 * The marker after each number of a numbered list, for each of the 10 list levels, from the first.
 */
export const NUMBERED_LIST_MARKERS = ['.', '.', '.', '.', '.', ')', ')', ')', ')', ')'] as const;

/**
 * The number type of a numbered list, for each of the 10 list levels, from the first.
 */
export const NUMBERED_LIST_NUMBER_TYPES = [
  'decimal',
  'lowerAlpha',
  'lowerRoman',
  'upperAlpha',
  'upperRoman',
  'decimal',
  'lowerAlpha',
  'lowerRoman',
  'upperAlpha',
  'upperRoman',
] as const satisfies readonly NumberStyleName[];
