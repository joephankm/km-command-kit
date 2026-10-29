import { markup } from '../../shellStyle';
import type { DefinitionItem, MakeDefinitionsOptions } from '../../shellStyle/types/markupTypes';
import type { DefinitionsOptions, DocLogSettings, DocLogStyle } from '../types/docLogTypes';
import type { DocLogFuncs } from './docLog';

/**
 * The layout of a definition list, with the options of each layout, as a call gives them.
 */
type LayoutOptions = Pick<DefinitionsOptions, 'layout' | 'alignedOptions' | 'stackedOptions' | 'inlineOptions'>;

/**
 * The layout of a definition list, with the options of that layout, as `makeDefinitions` takes
 * them.
 */
type MarkupLayoutOptions = Pick<
  MakeDefinitionsOptions,
  'layout' | 'alignedOptions' | 'stackedOptions' | 'inlineOptions'
>;

/**
 * Create the definitions-printing method for a document log.
 */
export default (
  { width, definitionLayouts }: DocLogSettings,
  { styleFuncOf, defaultAlign, startLines, endPrintLines }: DocLogFuncs
) => {
  // Each layout's configured options, its label style created once as a style function.
  const layouts = {
    stacked: definitionLayouts.stacked?.labelStyle
      ? { ...definitionLayouts.stacked, labelStyle: styleFuncOf(definitionLayouts.stacked.labelStyle) }
      : definitionLayouts.stacked,
    aligned: definitionLayouts.aligned?.labelStyle
      ? { ...definitionLayouts.aligned, labelStyle: styleFuncOf(definitionLayouts.aligned.labelStyle) }
      : definitionLayouts.aligned,
    inline: definitionLayouts.inline?.labelStyle
      ? { ...definitionLayouts.inline, labelStyle: styleFuncOf(definitionLayouts.inline.labelStyle) }
      : definitionLayouts.inline,
  };

  /**
   * Get the layout to print in, the default one when none is given, with only that layout's
   * options: those given laid over the configured ones, option by option.
   */
  const layoutOptions = (options: LayoutOptions): MarkupLayoutOptions => {
    const layout = options.layout ?? definitionLayouts.default ?? 'stacked';
    const mergedOptions: Record<string, unknown> = { ...layouts[layout] };
    const callOptions: Record<string, unknown> | undefined = options[`${layout}Options`];

    if (callOptions) {
      for (const key in callOptions) {
        // An option the call leaves undefined keeps the configured one.
        if (callOptions[key] === undefined) continue;

        mergedOptions[key] = key === 'labelStyle' ? styleFuncOf(callOptions[key] as DocLogStyle) : callOptions[key];
      }
    }

    return { layout, [`${layout}Options`]: mergedOptions };
  };

  /**
   * Print a definition list, every label shown with its content.
   */
  return (
    items: DefinitionItem[],
    {
      layout,
      marker,
      indent,
      align,
      alignedOptions,
      stackedOptions,
      inlineOptions,
      style,
      spaceBefore,
      spaceAfter,
    }: DefinitionsOptions = {}
  ) => {
    const definitionsStyleFunc = styleFuncOf(style ?? 'default');
    const lines = startLines(spaceBefore);

    const block = markup.makeDefinitions(items, {
      width,
      indent,
      align: defaultAlign(align),
      marker,
      ...layoutOptions({ layout, alignedOptions, stackedOptions, inlineOptions }),
    });
    lines.push(definitionsStyleFunc ? definitionsStyleFunc(block) : block);

    endPrintLines(lines, spaceAfter);
  };
};
