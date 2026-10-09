import { NUMBER_STYLES } from '../../shellStyle/common/numberStyles';
import { markup } from '../../shellStyle';
import { makeToParams } from '../common/paramUtils';
import type { TextAlign } from '../../shellStyle/types/markupTypes';
import config from '../configs/docLogConfig';
import type { DocLogSettings, ListItem, ListItemParams, ListOptions, TopListItem } from '../types/docLogTypes';
import type { DocLogFuncs } from './docLog';

/**
 * Normalize a list item for processing.
 */
const toItemParams = makeToParams<ListItemParams, 'text'>('text');

/**
 * Create the list-printing method for a document log.
 */
export default (
  { width, padding, paddingSize, bulletListType, numberedListType, listIndents }: DocLogSettings,
  { defaultAlign, startLines, endPrintLines }: DocLogFuncs
) => {
  // Shared width and padding for list items.
  const blockOptions = { width, padding, paddingSize };

  // Marker styles by level; reuse the configured sequence for deeper levels.
  const bullets = config.bulletListStyles[bulletListType];
  const numberMarkers = config.numberedListStyles[numberedListType];

  /**
   * Add the formatted items at a given list level.
   */
  const traverseItemsAndPush = (
    lines: string[],
    items: ListItem[],
    level: number,
    numbered: boolean,
    align: TextAlign | undefined
  ) => {
    // Reuse the final configured indent for deeper levels; default all levels to zero.
    const indent = listIndents?.length ? listIndents[Math.min(level, listIndents.length) - 1] : 0;
    let textBag: string[] = [];

    // Keep numbering continuous within this level and align numbers to a shared width.
    let numberCount = 0;

    // Group sibling items together, ending a group before printing nested items.
    const finishLevel = () => {
      if (!textBag.length) return;

      if (numbered) {
        const [numberType, numberMarker] = numberMarkers[(level - 1) % numberMarkers.length]!;
        let numberWidth = 0;
        let textCount = 0;

        for (const item of items) {
          if (toItemParams(item).text !== undefined) textCount++;
        }

        for (let number = 1; number <= textCount; number++) {
          numberWidth = Math.max(numberWidth, NUMBER_STYLES[numberType](number).length);
        }

        lines.push(
          ...markup.makeList(textBag, {
            ...blockOptions,
            indent,
            align,
            numbered,
            startNumber: numberCount + 1,
            numberType,
            numberWidth,
            marker: numberMarker,
            asArray: true,
          })
        );

        numberCount += textBag.length;
      } else {
        lines.push(
          ...markup.makeList(textBag, {
            ...blockOptions,
            indent,
            align,
            marker: bullets[(level - 1) % bullets.length],
            asArray: true,
          })
        );
      }

      textBag = [];
    };

    for (const item of items) {
      const { text, items: nestedItems } = toItemParams(item);

      // Print text when present; items without text can still contain nested items.
      if (text !== undefined) textBag.push(text);

      if (nestedItems?.length) {
        finishLevel();
        traverseItemsAndPush(lines, nestedItems, level + 1, numbered, align);
      }
    }

    finishLevel();
  };

  /**
   * Print a formatted list.
   */
  return (items: TopListItem[], { numbered = false, align, spaceBefore, spaceAfter }: ListOptions = {}) => {
    const lines = startLines(spaceBefore);
    const listAlign = defaultAlign(align);

    const hasLevel = items.some(item => typeof item === 'object' && item.level !== undefined);

    if (hasLevel) {
      // Group adjacent top-level items and start a new group when their levels change.
      let itemsBag: ListItem[] = [];
      let currLevel = 1;

      for (const item of items) {
        const level = (typeof item === 'object' ? item.level : undefined) ?? 1;

        if (level !== currLevel) {
          if (itemsBag.length) {
            traverseItemsAndPush(lines, itemsBag, currLevel, numbered, listAlign);
            itemsBag = [];
          }

          currLevel = level;
        }

        itemsBag.push(item);
      }

      traverseItemsAndPush(lines, itemsBag, currLevel, numbered, listAlign);
    } else {
      traverseItemsAndPush(lines, items, 1, numbered, defaultAlign(align));
    }

    endPrintLines(lines, spaceAfter);
  };
};
