import { BOX_CHARSETS, BOX_MIXED_CHARSETS } from '../constants/boxCharsets';
import style from '../styleText/simpleStyle';
import type { BoxStyles, DrawBoxSettings } from '../types/boxTypes';

/**
 * Names of the box styles available in this configuration.
 */
export type BoxStyleName = 'single' | 'heavy' | 'double' | 'round' | 'thickHeavy' | 'thickDouble';

/**
 * Default settings used when a drawing call does not provide an override.
 */
const drawBoxSettings: DrawBoxSettings = {
  boxStyle: 'thickHeavy',
  borderStyle: style.border,
  lineInset: 2,
};

/**
 * Character sets used by each box style for regular, thick, and mixed-weight borders.
 */
const drawBoxStyles: BoxStyles<BoxStyleName> = {
  single: { regular: BOX_CHARSETS.single, thick: BOX_CHARSETS.single },
  heavy: { regular: BOX_CHARSETS.heavy, thick: BOX_CHARSETS.heavy },
  double: { regular: BOX_CHARSETS.double, thick: BOX_CHARSETS.double },
  round: { regular: BOX_CHARSETS.round, thick: BOX_CHARSETS.round },
  thickHeavy: {
    regular: BOX_CHARSETS.single,
    thick: BOX_CHARSETS.heavy,
    mixed: BOX_MIXED_CHARSETS.heavySingle,
  },
  thickDouble: {
    regular: BOX_CHARSETS.single,
    thick: BOX_CHARSETS.double,
    mixed: BOX_MIXED_CHARSETS.doubleSingle,
  },
};

export default {
  settings: drawBoxSettings,
  boxStyles: drawBoxStyles,
};
