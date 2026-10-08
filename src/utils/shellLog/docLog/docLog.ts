import { NUMBER_STYLES } from '../../shellStyle/common/numberStyles';
import { markup } from '../../shellStyle';
import type { FormatTextOptions, TextAlign } from '../../shellStyle/types/markupTypes';
import { makeToParams } from '../common/paramUtils';
import config from '../configs/docLogConfig';
import type {
  BodyOptions,
  DocLogSettings,
  TitleOptions,
  TitleVariantName,
  TitleVariantOrOptions,
} from '../types/docLogTypes';

/**
 * Convert a title's variant argument into title options; a bare name is treated as the variant.
 */
const titleOptions = makeToParams<TitleOptions, 'variant'>('variant');

/**
 * Create a doc log instance, with the given options laid over the configured settings for every
 * method it carries.
 */
const docLog = (options: DocLogSettings = {}) => {
  const {
    width,
    padding,
    paddingSize,
    justifyContent,
    spacing = 0,
    style,
    titles,
  } = { ...config.settings, ...options };

  // How many titles of each variant have been numbered so far.
  const titleCounts: Partial<Record<TitleVariantName, number>> = {};

  type AlignInput = TextAlign | undefined;
  const defaultAlign = justifyContent ? (align: AlignInput) => align ?? 'justify' : (align: AlignInput) => align;

  const pushSpace = (lines: string[], type: 'before' | 'after', addingSpacing: number | undefined) => {
    if (addingSpacing !== undefined && (type === 'before' ? addingSpacing > spacing : addingSpacing < spacing)) {
      lines.push(markup.makeBlank(addingSpacing - spacing - 1));
    }
  };

  /**
   * Make a line across the full width, in the given style.
   */
  const makeLine = (lineStyle: FormatTextOptions) =>
    markup.formatText(markup.displayLine('', { width, fill: '─' }), lineStyle);

  return {
    /**
     * Print a title.
     */
    title: (text: string, variantOrOptions: TitleVariantOrOptions) => {
      const { numbered, dividerBefore, lineBelow, spaceBefore, align, variant } = titleOptions(variantOrOptions);
      const { style: titleStyle, numberMarker } = titles?.[variant] ?? {};

      const lines: string[] = [];

      // The blank lines `spacing` left after the block before count toward `spaceBefore`.
      pushSpace(lines, 'before', spaceBefore);

      // The divider is a block of its own, so `spacing` keeps it apart from the title.
      if (dividerBefore && width) {
        lines.push(makeLine({ style: 'border' }));
        if (spacing) lines.push(markup.makeBlank(spacing - 1));
      }

      if (numbered && numberMarker) {
        const [numberType, marker] = numberMarker;
        const count = (titleCounts[variant] ?? 0) + 1;

        titleCounts[variant] = count;
        text = NUMBER_STYLES[numberType](count) + marker + ' ' + text;
      }

      const block = markup.makeBlock(text, { width, padding, paddingSize, align: defaultAlign(align), spaceAfter: 0 });

      lines.push(titleStyle ? markup.formatText(block, { style: titleStyle }) : block);

      // The line is part of the title, so it sits right under it.
      if (lineBelow && width) lines.push(makeLine({ style: titleStyle }));

      console.log(lines.join('\n'));
    },

    /**
     * Print body text.
     */
    body: (text: string, { align, spaceBefore, spaceAfter }: BodyOptions = {}) => {
      const lines: string[] = [];

      // The blank lines `spacing` left after the block before count toward `spaceBefore`.
      pushSpace(lines, 'before', spaceBefore);

      // The paragraphs are kept apart by `spacing`, which the block also sets after its last one.
      const block = markup.makeBlock(text, {
        width,
        padding,
        paddingSize,
        align: defaultAlign(align),
        spaceAfter: spacing,
      });
      lines.push(style ? markup.formatText(block, { style }) : block);

      pushSpace(lines, 'after', spaceAfter);

      console.log(lines.join('\n'));
    },
  };
};

export default docLog;
