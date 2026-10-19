import { DefinitionItem, DefinitionMarker, MakeDefinitionsOptions, TextLines } from '../types/markupTypes';
import { getColumnWidths } from './columnUtils';
import { getListPrefixes } from './listUtils';
import { initLineCollector, makeBlank } from './spacings';
import { alignLine, LineWrapperOptions, initLineWrapper, stripStyles, wrapText } from './stringUtils';

/**
 * Formats items as a definition list, every label shown with its content in one of three layouts.
 *
 * Supports:
 * - Returning a string or an array of lines.
 */
export const makeDefinitions = <AsArray extends boolean = false>(
  items: DefinitionItem[],
  options: MakeDefinitionsOptions<AsArray> = {}
): TextLines<AsArray> => {
  options.layout ??= 'stacked';

  // A marker is the same mark every time, or a number in a number style followed by a mark.
  const getMarkerPrefixes = (marker: DefinitionMarker | undefined, count: number) =>
    marker
      ? getListPrefixes(
          count,
          typeof marker === 'string' ? { marker } : { numbered: true, numberType: marker[0], marker: marker[1] }
        )
      : undefined;

  // The marker leads each item.
  const markerPrefixes = getMarkerPrefixes(options.marker, items.length);

  const wrapper = initLineWrapper({ ...options, ...markerPrefixes });
  const lines = initLineCollector(options);

  // A paragraph wraps within the width, or shows as one line without it. The value makes the
  // first-line prefix when it is a function.
  const pushLine = (line: string, lineWrapper = wrapper, firstLineValue?: number) => {
    if (options.width) {
      lines.push(
        wrapText(line, options.width, {
          align: options.align,
          lineWrapper,
          firstLineValue,
          firstLineWidth: options.width - lineWrapper.width(),
          asArray: true,
        })
      );
    } else {
      lines.push(lineWrapper.firstLine(line, firstLineValue));
    }
  };

  // Each label sits on its own line, with its content below.
  if (options.layout === 'stacked') {
    const {
      contentIndent,
      itemSpacing = 1,
      contentSpacing,
      labelSuffix = '',
      contentMarker,
    } = options.stackedOptions ?? {};

    let contentWrapper = wrapper;
    if (markerPrefixes || contentIndent || contentMarker) {
      // The content lines up past the item marker, then is pushed right by its own indent.
      const indentPrefix = (markerPrefixes?.contentPrefix ?? '') + (contentIndent ? ' '.repeat(contentIndent) : '');
      let contentPrefix = indentPrefix;
      let firstContentPrefix: LineWrapperOptions<number>['firstContentPrefix'];

      if (contentMarker) {
        const { contentPrefix: innerContentPrefix, firstContentPrefix: innerFirstContentPrefix } = getMarkerPrefixes(
          contentMarker,
          Math.max(1, ...items.map(({ content }) => (typeof content === 'string' ? 1 : content.length)))
        )!;

        if (typeof innerFirstContentPrefix === 'function') {
          firstContentPrefix = index => indentPrefix + innerFirstContentPrefix(index);
        } else {
          firstContentPrefix = indentPrefix + innerFirstContentPrefix;
        }

        contentPrefix += innerContentPrefix;
      }

      contentWrapper = initLineWrapper({ ...options, contentPrefix, firstContentPrefix });
    }

    const itemBlank = itemSpacing ? makeBlank(itemSpacing, { asArray: true }) : undefined;
    const contentBlank = contentSpacing ? makeBlank(contentSpacing, { asArray: true }) : undefined;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const { label, content } = items[itemIndex]!;

      if (itemBlank && itemIndex > 0) lines.push(itemBlank);

      pushLine(label + labelSuffix, wrapper, itemIndex);

      if (typeof content === 'string') {
        pushLine(content, contentWrapper, 0);
      } else {
        for (let index = 0; index < content.length; index++) {
          if (contentBlank && index > 0) lines.push(contentBlank);

          pushLine(content[index]!, contentWrapper, index);
        }
      }
    }
  }

  // Each label sits in a column as wide as the widest label, with its content beside it.
  if (options.layout === 'aligned') {
    const { labelAlign, labelWidth, separator = ' ' } = options.alignedOptions ?? {};

    const labelColumnWidth =
      getColumnWidths(
        items.map(({ label }) => [label, null]),
        labelWidth === undefined ? undefined : { 0: labelWidth }
      )[0] ?? 0;
    const labelSpace = ' '.repeat(labelColumnWidth);

    // The content wraps within what the label column and the separator leave.
    const contentWidth = options.width
      ? options.width - wrapper.width() - labelColumnWidth - stripStyles(separator).length
      : undefined;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const { label, content } = items[itemIndex]!;

      // A label wider than its column wraps within it.
      const labelLines =
        stripStyles(label).length > labelColumnWidth ? wrapText(label, labelColumnWidth, { asArray: true }) : [label];

      const contentLines: string[] = [];
      for (const paragraph of typeof content === 'string' ? [content] : content) {
        if (contentWidth) {
          contentLines.push(...wrapText(paragraph, contentWidth, { asArray: true }));
        } else {
          contentLines.push(paragraph);
        }
      }

      // The label and its content sit side by side, line by line, for as many lines as the longer one.
      const lineCount = Math.max(labelLines.length, contentLines.length);

      for (let index = 0; index < lineCount; index++) {
        const labelLine = labelLines[index];
        const line =
          (labelLine === undefined ? labelSpace : alignLine(labelLine, labelColumnWidth, labelAlign, ' ')) +
          separator +
          (contentLines[index] ?? '');

        lines.push(index === 0 ? wrapper.firstLine(line, itemIndex) : wrapper.line(line));
      }
    }
  }

  return lines.result();
};
