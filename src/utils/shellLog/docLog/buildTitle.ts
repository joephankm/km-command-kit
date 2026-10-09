import { NUMBER_STYLES } from '../../shellStyle/common/numberStyles';
import { markup } from '../../shellStyle';
import { makeToParams } from '../common/paramUtils';
import type {
  DividerOptions,
  DocLogSettings,
  TitleOptions,
  TitleVariantName,
  TitleVariantOrOptions,
} from '../types/docLogTypes';
import type { DocLogFuncs } from './docLog';

/**
 * Normalize the input used to choose title options.
 */
const titleOptions = makeToParams<TitleOptions, 'variant'>('variant');

/**
 * Create the title-printing method for a document log.
 */
export default (
  { width, padding, paddingSize, titles }: DocLogSettings,
  { defaultAlign, startLines, endPrintLines }: DocLogFuncs,
  divider: (options?: DividerOptions) => void
) => {
  // Shared width and padding for title blocks.
  const blockOptions = { width, padding, paddingSize };

  // Track numbering independently for each title variant.
  const titleCounts: Partial<Record<TitleVariantName, number>> = {};

  /**
   * Print a formatted title.
   */
  return (text: string, variantOrOptions: TitleVariantOrOptions) => {
    const { numbered, dividerBefore, underline, spaceBefore, align, variant } = titleOptions(variantOrOptions);
    const { style: titleStyle, numberMarker, underline: variantUnderline, lineFill } = titles?.[variant] ?? {};

    // Print a requested divider as a separate block before the title.
    if (dividerBefore) divider();

    const lines = startLines(spaceBefore);

    if (numbered && numberMarker) {
      const [numberType, marker] = numberMarker;
      const count = (titleCounts[variant] ?? 0) + 1;

      titleCounts[variant] = count;
      text = NUMBER_STYLES[numberType](count) + marker + ' ' + text;
    }

    const block = markup.makeBlock(text, { ...blockOptions, align: defaultAlign(align) });

    lines.push(titleStyle ? markup.formatText(block, { style: titleStyle }) : block);

    // Keep a requested underline directly beneath the title text.
    if ((underline ?? variantUnderline) && width) {
      // TODO: draw with `drawBox`'s `line` once Split Draw Box makes it return the line.
      lines.push(markup.formatText(markup.displayLine('', { width, fill: lineFill ?? '─' }), { style: titleStyle }));
    }

    endPrintLines(lines);
  };
};
