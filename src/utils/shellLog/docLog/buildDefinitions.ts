import { markup } from '../../shellStyle';
import type { DefinitionItem } from '../../shellStyle/types/markupTypes';
import type { DefinitionsOptions, DocLogSettings } from '../types/docLogTypes';
import type { DocLogFuncs } from './docLog';

/**
 * Create the definitions-printing method for a document log.
 */
export default (
  { width, indent, rightIndent }: DocLogSettings,
  { styleFuncOf, defaultAlign, startLines, endPrintLines }: DocLogFuncs
) => {
  /**
   * Print a definition list, every label shown with its content.
   */
  return (
    items: DefinitionItem[],
    {
      layout,
      marker,
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
      rightIndent,
      align: defaultAlign(align),
      layout,
      marker,
      alignedOptions,
      stackedOptions,
      inlineOptions,
    });
    lines.push(definitionsStyleFunc ? definitionsStyleFunc(block) : block);

    endPrintLines(lines, spaceAfter);
  };
};
