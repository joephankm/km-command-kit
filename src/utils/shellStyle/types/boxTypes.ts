import type { BoxStyleName } from '../configs/drawBoxConfig';
import type { ShellStyleFunc } from './styleTypes';

/**
 * The stroke weight used for a box line.
 */
export type BoxWeight = 'regular' | 'thick';

/**
 * Horizontal alignment of content inside a cell.
 */
export type BoxAlign = 'left' | 'center' | 'right';

/**
 * The positions occupied by a straight horizontal or vertical line.
 */
export type BoxLinePosition = 'horizontal' | 'vertical';

/**
 * The four corner positions where the box outline changes direction.
 */
export type BoxCornerPosition = 'topLeft' | 'topRight' | 'botLeft' | 'botRight';

/**
 * The positions where border lines join at an edge or inside the box.
 */
export type BoxJunctionPosition = 'leftJoin' | 'rightJoin' | 'topJoin' | 'botJoin' | 'midJoin';

/**
 * Glyphs for every line, corner, and junction needed to draw and divide a box.
 */
export type BoxCharset = Record<BoxLinePosition | BoxCornerPosition | BoxJunctionPosition, string>;

/**
 * Glyphs for junctions where lines of different weights meet.
 */
export type BoxMixedCharset = Record<BoxJunctionPosition, string>;

/**
 * The character-set roles a box style can provide.
 */
export type BoxSlot = 'regular' | 'thick' | 'mixed';
// TODO: declared for completeness; nothing draws with it yet.
// | 'regularThick';

/**
 * Character sets used to draw regular and thick lines, plus optional mixed-weight junctions.
 */
export type BoxStyle = {
  regular: BoxCharset;
  thick: BoxCharset;
  /** Used where regular and thick lines meet; omit when those weights are not mixed. */
  mixed?: BoxMixedCharset;
  // TODO: declared for completeness; nothing draws with it yet.
  // regularThick?: BoxMixedCharset;
};

/**
 * A lookup of box styles indexed by the names supported by the collection.
 */
export type BoxStyles<Name extends string> = Record<Name, BoxStyle>;

/**
 * Optional styling, alignment, and span settings for a cell.
 */
export type CellOptions = {
  /** Applies a text style to the cell content. */
  style?: ShellStyleFunc;
  /** Aligns the content within the cell. */
  align?: BoxAlign;
  /** Extends this cell across the next column, removing their divider. */
  span?: boolean;
  /** Indicates that the cell above spans across this column. */
  spanAbove?: boolean;
  /** Continues the cell above through this border and into the current row. */
  rowSpan?: boolean;
};

/**
 * Settings for the box glyphs, border styling, and outline weight.
 */
export type BoxOptions = {
  /** Selects the character set used to draw the box. */
  boxStyle?: BoxStyleName;
  /** Applies a text style to border glyphs. */
  borderStyle?: ShellStyleFunc;
  /** Uses thick glyphs for the outer border and regular glyphs inside. */
  thickOutline?: boolean;
};

/**
 * Options applied across the entire box drawing.
 */
export type BuildBoxOptions = BoxOptions & Pick<CellOptions, 'style' | 'align'>;

/**
 * Options that can override cell styling for one row.
 */
export type RowOptions = Omit<BuildBoxOptions, 'boxStyle' | 'borderStyle' | 'thickOutline'>;

/**
 * Options for drawing a standalone rule.
 */
export type LineOptions = Pick<BoxOptions, 'boxStyle' | 'borderStyle'> &
  Pick<CellOptions, 'style' | 'align'> & {
    /** Text placed within the rule. */
    title?: string;
    /** Minimum number of rule characters beside the title on its aligned side. */
    inset?: number;
    /** Draws the rule with thick glyphs when enabled. */
    thickLine?: boolean;
  };

/**
 * Content and optional formatting for a cell.
 */
export type CellParams = Pick<CellOptions, 'style' | 'align' | 'span'> & {
  /** Text displayed in the cell. */
  content?: string;
};

/**
 * Span information used to shape one border segment.
 */
export type BorderParams = Pick<CellOptions, 'span'>;

/**
 * Parameters for an interior border, including cells that continue through it.
 */
export type MidParams = Pick<CellOptions, 'style' | 'span' | 'spanAbove' | 'rowSpan'> & {
  /** Content shown in the continuing cell when `rowSpan` is enabled. */
  content?: string;
};

/**
 * Default box drawing settings from `configs/drawBoxConfig.ts`.
 */
export type DrawBoxSettings = {
  /** Box glyph set used unless a drawing call selects another. */
  boxStyle: BoxStyleName;
  /** Text style applied to borders unless a call overrides it. */
  borderStyle: ShellStyleFunc;
  /** Minimum title-side rule length unless a call provides another inset. */
  lineInset: number;
};
