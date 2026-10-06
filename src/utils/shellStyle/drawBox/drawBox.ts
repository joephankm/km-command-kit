import config from '../configs/drawBoxConfig';
import markup from '../markupText/markupText';
import style from '../styleText/presetStyles';
import type { LineOptions } from '../types/boxTypes';
import buildBox from './buildBox';

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

    if (title) {
      // Suspend the border style for the title, then restore it afterward.
      const styledTitle = (titleStyle ?? style.reset)(title, lineStyle());

      // Preserve the requested inset when the title is aligned against either end.
      const prefix = align === 'left' ? fill.repeat(inset) : '';
      const suffix = align === 'right' ? fill.repeat(inset) : '';

      // The spaces sit between the title and the rule, so they go on the text, not past the fill.
      const titleLine = markup.displayLine(` ${styledTitle} `, {
        width: width - prefix.length - suffix.length,
        align,
        fill,
      });

      console.log(lineStyle(prefix + titleLine + suffix));
    } else {
      console.log(lineStyle(fill.repeat(width)));
    }
  },
};
