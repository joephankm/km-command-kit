import config from '../configs/drawBoxConfig';
import style from '../styleText/presetStyles';
import type { BorderParams, BuildBoxOptions, CellOptions, CellParams, MidParams, RowOptions } from '../types/boxTypes';
import type { ArrayOrIndexed, ValueOrParams } from '../types/commonTypes';
import { formatContent } from './formatters';
import { makeToParams } from './paramFunctions';

/**
 * Converts a row entry into cell parameters; a bare string is treated as cell content.
 */
const toCellParams = makeToParams<CellParams, 'content'>('content');

/**
 * Glyphs used to draw a border line. `spanBelow` and `spanAbove` replace `mid` where a cell spans
 * below or above the border. Each falls back to `line`, which is also used when a cell spans both.
 */
type BorderChars = Record<'left' | 'right' | 'mid' | 'line', string> & {
  spanBelow?: string;
  spanAbove?: string;
};

/**
 * Parameters that may affect a border position. The shared border handler accepts the union of
 * fields used by each border type and ignores fields that do not apply.
 */
type BorderSpans = Pick<CellOptions, 'style' | 'span' | 'spanAbove' | 'rowSpan'> & { content?: string };

/**
 * Creates drawing methods for a box with fixed column widths.
 */
export default (widths: number[], options: BuildBoxOptions = {}) => {
  const boxStyle = config.boxStyles[options.boxStyle ?? config.settings.boxStyle];
  const borderStyle = options.borderStyle ?? config.settings.borderStyle;

  const length = widths.length;
  const lastIndex = length - 1;

  // Choose glyph sets for the outline, interior dividers, and their junctions.
  const outerBorder = options.thickOutline ? boxStyle.thick : boxStyle.regular;
  const innerBorder = boxStyle.regular;
  const mixedBorder = options.thickOutline ? (boxStyle.mixed ?? boxStyle.thick) : boxStyle.regular;

  /**
   * Selects the glyph for one border position: an outer edge or a junction between columns.
   */
  const getBorderChar = (
    borderChars: BorderChars,
    params: BorderSpans | undefined,
    { index, nextRowSpan }: { index: number; nextRowSpan?: boolean }
  ): string => {
    // At the left edge, continue a spanning cell vertically or draw the regular corner/junction.
    if (index === -1) return nextRowSpan ? outerBorder.vertical : borderChars.left;
    if (index === lastIndex) return params?.rowSpan ? outerBorder.vertical : borderChars.right;

    const { span, spanAbove, rowSpan } = params ?? {};

    // A row-spanning cell interrupts the horizontal run; only the vertical and far-side lines meet.
    if (rowSpan) {
      if (nextRowSpan) return innerBorder.vertical;
      if (span) return innerBorder.botLeft;
      if (spanAbove) return innerBorder.topLeft;

      return innerBorder.leftJoin;
    }

    // The run ends at this column because the cell to its right spans the border.
    if (nextRowSpan) {
      if (span) return innerBorder.botRight;
      if (spanAbove) return innerBorder.topRight;

      return innerBorder.rightJoin;
    }

    // Use a span-specific junction when available, or the line glyph when one or both sides span.
    if (span) return spanAbove ? borderChars.line : (borderChars.spanBelow ?? borderChars.line);
    if (spanAbove) return borderChars.spanAbove ?? borderChars.line;

    return borderChars.mid;
  };

  /**
   * Prints a border line, leaving a gap in the horizontal run wherever a cell spans across it.
   */
  const drawBorder = (borderChars: BorderChars, params: ArrayOrIndexed<BorderSpans> | undefined) => {
    let line = getBorderChar(borderChars, undefined, { index: -1, nextRowSpan: params?.[0]?.rowSpan });

    for (let index = 0; index < length; index++) {
      const borderParams = params?.[index];
      const width = widths[index] ?? 0;

      // Leave the spanned column open and show its continuing cell content in place of the border.
      if (borderParams?.rowSpan) {
        const contentStyle = borderParams.style ?? options.style ?? style.reset;
        const content = formatContent(borderParams.content, width);

        // Pause the border styling around the content, then apply it again after the cell.
        line += contentStyle() + content + borderStyle();
      } else {
        line += borderChars.line.repeat(width);
      }

      line += getBorderChar(borderChars, borderParams, { index, nextRowSpan: params?.[index + 1]?.rowSpan });
    }

    console.log(borderStyle(line));
  };

  return {
    /**
     * Prints the top border, optionally shaped by cells that span through it.
     */
    top: (params?: ArrayOrIndexed<BorderParams>) =>
      drawBorder(
        // prettier-ignore
        { left: outerBorder.topLeft, right: outerBorder.topRight, mid: mixedBorder.topJoin, line: outerBorder.horizontal },
        params
      ),

    /**
     * Prints the bottom border, optionally shaped by cells that span through it.
     */
    bot: (params?: ArrayOrIndexed<BorderParams>) =>
      drawBorder(
        // prettier-ignore
        { left: outerBorder.botLeft, right: outerBorder.botRight, mid: mixedBorder.botJoin, line: outerBorder.horizontal },
        params
      ),

    /**
     * Prints an interior divider, accounting for cells that span across or through it.
     */
    mid: (params?: ArrayOrIndexed<MidParams>) =>
      drawBorder(
        // prettier-ignore
        {
          left: mixedBorder.leftJoin, right: mixedBorder.rightJoin, mid: innerBorder.midJoin, line: innerBorder.horizontal,
          spanBelow: innerBorder.botJoin, spanAbove: innerBorder.topJoin,
        },
        params
      ),

    /**
     * Prints a content row, enclosed by the outer border and divided into cells.
     */
    row: (cells: ArrayOrIndexed<ValueOrParams<CellParams, 'content'>>, rowOptions?: RowOptions) => {
      let line = borderStyle(outerBorder.vertical);
      let index = 0;

      while (index < length) {
        const { content, align, style } = toCellParams(cells[index]);

        let width = widths[index] ?? 0;

        // Extend this cell across each spanned column and include the removed divider in its width.
        while (index < lastIndex && toCellParams(cells[index]).span) {
          index += 1;
          width += (widths[index] ?? 0) + 1;
        }

        const closing = index === lastIndex ? outerBorder.vertical : innerBorder.vertical;

        // Prefer cell styling, then row styling, then the box-wide default.
        const formattedContent = formatContent(content, width, { align });
        const cellStyle = style ?? rowOptions?.style ?? options.style;

        line += (cellStyle ? cellStyle(formattedContent) : formattedContent) + borderStyle(closing);
        index += 1;
      }

      console.log(line);
    },
  };
};
