import { DocLogSettings, NumberMarker } from '../types/docLogTypes';

/**
 * Names of the bulleted list styles available in this configuration.
 */
export type BulletListType = 'disc' | 'geometric';

/**
 * Names of the numbered list styles available in this configuration.
 */
export type NumberedListType = 'decimal' | 'outline';

/**
 * The settings every doc log instance starts from, before the options given to `docLog` override
 * any of them.
 */
const docLogSettings: DocLogSettings = {
  width: 80,
  // `padding` is left unset, so content has no padding unless an instance asks for it.
  paddingSize: 1,
  justifyContent: false,
  spacing: 1,
  styles: {},
  titles: {
    docTitle: { style: 'title' },
    title: { style: 'heading', numberMarker: ['upperRoman', '.'], underline: true },
    subTitle: { style: 'emphasize', numberMarker: ['upperAlpha', '.'] },
    heading: { style: 'subtle', numberMarker: ['decimal', ')'] },
  },
  bulletListType: 'geometric',
  numberedListType: 'decimal',
  listIndents: [0, 2, 6, 10],
  dividerFill: '─',
};

/**
 * The markers of each bulleted list style, by level from the first, repeated from the first once
 * the levels run past the last.
 */
const docLogBulletListStyles: Record<BulletListType, string[]> = {
  disc: ['•'],
  geometric: ['•', '◦', '▪', '▫'],
};

/**
 * The number type and marker of each numbered list style, by level from the first, repeated from
 * the first once the levels run past the last.
 */
const docLogNumberedListStyles: Record<NumberedListType, NumberMarker[]> = {
  decimal: [['decimal', '.']],
  outline: [
    ['upperRoman', '.'],
    ['upperAlpha', '.'],
    ['decimal', '.'],
    ['lowerAlpha', '.'],
    ['lowerRoman', '.'],
  ],
};

export default {
  settings: docLogSettings,
  bulletListStyles: docLogBulletListStyles,
  numberedListStyles: docLogNumberedListStyles,
};
