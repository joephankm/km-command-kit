import config from '../configs/drawBoxConfig';
import style from '../styleText/simpleStyle';
import type { LineOptions } from '../types/boxTypes';
import buildBox from './buildBox';
import { formatContent } from './formatters';

export default {
  buildBox,

  /**
   * Prints a horizontal rule of the requested width, optionally placing a title within it.
   */
  line: (width: number, options: LineOptions = {}) => {
    const {
      boxStyle,
      borderStyle,
      thickLine,
      title,
      align = 'center',
      inset = config.settings.lineInset,
      style: titleStyle,
    } = options;

    const box = config.boxStyles[boxStyle ?? config.settings.boxStyle];
    const fill = (thickLine ? box.thick : box.regular).horizontal;
    const lineStyle = borderStyle ?? config.settings.borderStyle;

    // Include the formatter's side padding around the title.
    if (title) {
      // Suspend the border style for the title, then restore it afterward.
      const styledTitle = (titleStyle ?? style.reset)(title, lineStyle());

      // Preserve the requested inset when the title is aligned against either end.
      const lead = align === 'left' ? fill.repeat(inset) : '';
      const tail = align === 'right' ? fill.repeat(inset) : '';

      // Account for escape-code characters because the formatter measures string length directly.
      const finalWidth = width - lead.length - tail.length + styledTitle.length - title.length;

      console.log(lineStyle(lead + formatContent(styledTitle, finalWidth, { align, fill }) + tail));
    } else {
      console.log(lineStyle(fill.repeat(width)));
    }
  },
};
