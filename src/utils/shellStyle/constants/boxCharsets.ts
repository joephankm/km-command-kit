import type { BoxCharset, BoxMixedCharset } from '../types/boxTypes';

/**
 * Box drawing character sets, mapping each of the eleven line, corner, and junction positions to
 * its glyph.
 */
export const BOX_CHARSETS = {
  single: {
    horizontal: '─',
    vertical: '│',
    topLeft: '┌',
    topRight: '┐',
    botLeft: '└',
    botRight: '┘',
    leftJoin: '├',
    rightJoin: '┤',
    topJoin: '┬',
    botJoin: '┴',
    midJoin: '┼',
  },
  heavy: {
    horizontal: '━',
    vertical: '┃',
    topLeft: '┏',
    topRight: '┓',
    botLeft: '┗',
    botRight: '┛',
    leftJoin: '┣',
    rightJoin: '┫',
    topJoin: '┳',
    botJoin: '┻',
    midJoin: '╋',
  },
  double: {
    horizontal: '═',
    vertical: '║',
    topLeft: '╔',
    topRight: '╗',
    botLeft: '╚',
    botRight: '╝',
    leftJoin: '╠',
    rightJoin: '╣',
    topJoin: '╦',
    botJoin: '╩',
    midJoin: '╬',
  },
  round: {
    horizontal: '─',
    vertical: '│',
    topLeft: '╭',
    topRight: '╮',
    botLeft: '╰',
    botRight: '╯',
    leftJoin: '├',
    rightJoin: '┤',
    topJoin: '┬',
    botJoin: '┴',
    midJoin: '┼',
  },
} satisfies Record<string, BoxCharset>;

/**
 * Character sets for junctions where a horizontal run of one weight meets a vertical branch of
 * another. Each name lists the run weight first and the branch weight second.
 */
export const BOX_MIXED_CHARSETS = {
  heavySingle: {
    leftJoin: '┠',
    rightJoin: '┨',
    topJoin: '┯',
    botJoin: '┷',
    midJoin: '┿',
  },
  singleHeavy: {
    leftJoin: '┝',
    rightJoin: '┥',
    topJoin: '┰',
    botJoin: '┸',
    midJoin: '╂',
  },
  doubleSingle: {
    leftJoin: '╟',
    rightJoin: '╢',
    topJoin: '╤',
    botJoin: '╧',
    midJoin: '╪',
  },
  singleDouble: {
    leftJoin: '╞',
    rightJoin: '╡',
    topJoin: '╥',
    botJoin: '╨',
    midJoin: '╫',
  },
} satisfies Record<string, BoxMixedCharset>;
