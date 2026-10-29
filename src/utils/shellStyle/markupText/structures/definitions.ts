import type {
  ColumnContent,
  DefinitionItem,
  DefinitionMarker,
  MakeDefinitionsOptions,
  TextLines,
} from '../../types/markupTypes';
import { makeColumns } from './columns';
import { getListPrefixes } from './list';
import { genLineCollector, makeBlank } from './blank';
import { wrapText } from '../../common/textUtils';
import { genLineWrapper, LineWrapper } from './block';

const lineCollector = <AsArray extends boolean = false>(
  items: DefinitionItem[],
  options: MakeDefinitionsOptions<AsArray>
) => {
  const lines = genLineCollector(options);

  const genMarkerPrefixes = (count: number, marker: DefinitionMarker) =>
    getListPrefixes(
      count,
      typeof marker === 'string' ? { marker } : { numbered: true, numberType: marker[0], marker: marker[1] }
    );

  const lineWrapper = genLineWrapper({
    ...options,
    ...(options.marker && genMarkerPrefixes(items.length, options.marker)),
  });

  let contentLineWrapper: LineWrapper<number> | undefined;
  if (options.layout === 'stacked') {
    const { contentIndent, contentMarker } = options.stackedOptions ?? {};
    contentLineWrapper = genLineWrapper({
      ...options,
      indent: (contentIndent ?? 0) + lineWrapper.width(),
      ...(contentMarker &&
        genMarkerPrefixes(
          Math.max(1, ...items.map(({ content }) => (typeof content === 'string' ? 1 : content.length))),
          contentMarker
        )),
    });
  }

  const blankMap: Record<number, string[]> = {};

  return {
    pushLine: (line: string, index: number, isContentLevel = false) => {
      const wrapper = isContentLevel && contentLineWrapper ? contentLineWrapper : lineWrapper;
      if (options.width) {
        lines.push(
          wrapText(line, {
            width: options.width - wrapper.width(),
            align: options.align,
            formatLine: (text, lineIndex) => (lineIndex === 0 ? wrapper.firstLine(text, index) : wrapper.line(text)),
          })
        );
      } else {
        lines.push(wrapper.firstLine(line, index));
      }
    },
    pushBlank: (count: number) => {
      if (!blankMap[count]) blankMap[count] = makeBlank(count, { asArray: true });
      lines.push(blankMap[count]);
    },
    push: lines.push,
    wrapperWidth: lineWrapper.width,
    result: lines.result,
  };
};

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

  const lines = lineCollector(items, options);

  switch (options.layout) {
    // Each label sits in a column, with its content beside it.
    // TODO: Apply the marker, indent, prefixes, and width to the aligned layout.
    case 'aligned': {
      const { labelAlign, labelWidth, separator, labelStyle } = options.alignedOptions ?? {};

      // Each paragraph of the content is a row, with the label only on the first one.
      const rows: ColumnContent[][] = [];
      for (const { label, content } of items) {
        const contents = typeof content === 'string' ? [content] : content;

        for (let index = 0; index < contents.length; index++) {
          rows.push(
            separator
              ? [index === 0 ? label : null, separator, contents[index]!]
              : [index === 0 ? label : null, contents[index]!]
          );
        }
      }

      // The label column takes its own width and alignment, the separator sits right beside it, and
      // the content column shows as it is.
      lines.push(
        makeColumns(rows, {
          width: labelWidth ? { 0: labelWidth } : undefined,
          align: labelAlign ? { 0: labelAlign } : undefined,
          style: labelStyle ? { 0: labelStyle } : undefined,
          gap: separator ? 0 : undefined,
          asArray: true,
        })
      );
      break;
    }

    // Each label and its content sit on one line, joined by the separator.
    case 'inline': {
      const { separator = '—', gap = 1, labelStyle } = options.inlineOptions ?? {};
      // A colon sits right after the label, any other separator one space past it; the content
      // follows the separator after `gap` spaces.
      const joiner = (separator === ':' ? ':' : ' ' + separator) + ' '.repeat(gap);

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const { label, content } = items[itemIndex]!;
        const text = typeof content === 'string' ? content : content.join(' ');

        lines.pushLine((labelStyle ? labelStyle(label) : label) + joiner + text, itemIndex);
      }
      break;
    }

    // Each label sits on its own line, with its content below.
    default: {
      const { itemSpacing = 1, contentSpacing, labelSuffix = '', labelStyle } = options.stackedOptions ?? {};

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const { label, content } = items[itemIndex]!;

        if (itemSpacing && itemIndex > 0) lines.pushBlank(itemSpacing);

        lines.pushLine((labelStyle ? labelStyle(label) : label) + labelSuffix, itemIndex);

        if (typeof content === 'string') {
          lines.pushLine(content, 0, true);
        } else {
          for (let index = 0; index < content.length; index++) {
            if (contentSpacing && index > 0) lines.pushBlank(contentSpacing);

            lines.pushLine(content[index]!, index, true);
          }
        }
      }
    }
  }

  return lines.result();
};
