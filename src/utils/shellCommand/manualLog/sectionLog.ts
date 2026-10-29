import config from '../configs/manualLogConfig';
import type { CmdManualDefinition, CmdManualSectionName } from '../types/manualLogTypes';
import type { GroupedOrFlat } from '../types/parseCommandTypes';
import layoutPrinter from './layoutPrinter';

/**
 * A titled group of definitions, keyed by their name.
 */
type DefGroup<D> = { title: string; items: Record<string, D> };

type PrintGroupedListOptions<D, I extends Record<string, unknown>> = {
  /** The title the list is printed under when the definitions are given flat. */
  title: string;
  /** The section the definitions belong to, whose layout and styles they are printed in. */
  section: 'commands' | 'arguments' | 'options';
  /** Map one definition, with its name, to an item of the list. */
  mapItem: (name: string, def: D) => I;
  /** The field of each item's label, the fields of its label columns, or a picker of either. */
  labelField?: string | string[] | ((items: I[]) => string | string[]);
  /** The field each item's content is read from. */
  contentField?: string;
};

/**
 * The options of printing one item or a list of items: the title, the section they belong to, and
 * the fields labeled items are read from.
 */
type HandleItemsOptions = {
  /** The title of every form, or the titles of one item and of a list. */
  title: string | [single: string, plural: string];
  /** The section the items belong to, whose styles they are printed in. */
  section: Exclude<CmdManualSectionName, 'error'>;
  /** The field each labeled item's label is read from. */
  labelField?: string;
  /** The field each labeled item's content is read from. */
  contentField?: string;
};

/**
 * Create a section log, with a method to print each section of a command's manual.
 */
export default ({ description, usages, examples, definitions, options, arguments: args }: CmdManualDefinition) => {
  const { sections } = config;
  const { printItem, printList, printPlainList } = layoutPrinter(config);

  /**
   * Print one item, a list of plain items, or a list of labeled items.
   */
  const handleItemList = (
    data: string | readonly string[] | readonly Record<string, unknown>[] | undefined,
    { title, section, labelField, contentField }: HandleItemsOptions
  ) => {
    if (!data?.length) return;

    const [singleTitle, pluralTitle] = typeof title === 'string' ? [title, title] : title;

    // A single item sits on the title's line.
    if (typeof data === 'string') {
      printItem({ title: singleTitle, content: data }, { section, layout: 'descriptionInline' });
      return;
    }

    // Plain items have no label, so they are printed as a plain list.
    if (typeof data[0] === 'string') {
      printPlainList({ title: pluralTitle, items: data as string[] }, { section });
      return;
    }

    printList(
      { title: pluralTitle, items: data as Record<string, unknown>[] },
      { section, layout: 'definitionList', labelField, contentField }
    );
  };

  /**
   * Print definitions given flat or in groups.
   */
  const handleColumnList = <D, I extends Record<string, unknown>>(
    data: GroupedOrFlat<D> | undefined,
    { title, section, mapItem, labelField = 'name', contentField = 'description' }: PrintGroupedListOptions<D, I>
  ) => {
    if (!data) return;

    const toItems = (defs: Record<string, D>) => Object.entries(defs).map(([name, def]) => mapItem(name, def));
    const groups = Array.isArray(data)
      ? (data as DefGroup<D>[]).map(group => ({ title: group.title, items: toItems(group.items) }))
      : [{ title, items: toItems(data as Record<string, D>) }];
    // A picker of the label fields is given every group's items at once, so all groups share them.
    if (typeof labelField === 'function') {
      labelField = labelField(groups.flatMap(group => group.items));
    }

    for (const group of groups) {
      printList(group, { section, layout: sections[section]?.layout, labelField, contentField });
    }
  };

  return {
    /**
     * Print the Description section: what the command does.
     */
    description: () =>
      printItem(
        { title: 'Description', content: description },
        { section: 'description', layout: sections.description?.layout }
      ),

    /**
     * Print the Usages section: the forms of a call to the command.
     */
    usages: () => handleItemList(usages, { title: ['Usage', 'Usages'], section: 'usages', contentField: 'usage' }),

    /**
     * Print the Examples section: sample calls to the command.
     */
    examples: () =>
      handleItemList(examples, { title: ['Example', 'Examples'], section: 'examples', contentField: 'example' }),

    /**
     * Print the Options section: each option, with its short name and description.
     */
    options: () =>
      handleColumnList(options, {
        title: 'Options',
        section: 'options',
        mapItem: (name, def) => ({
          short: def.short ? `-${def.short}` : undefined,
          name: `--${name}`,
          description: def.description,
        }),
        labelField: items => (items.some(item => item.short) ? ['short', 'name'] : 'name'),
      }),

    /**
     * Print the Arguments section: each argument, with its description.
     */
    arguments: () =>
      handleColumnList(args, {
        title: 'Arguments',
        section: 'arguments',
        mapItem: (name, def) => ({ name: `<${name}>`, description: def.description }),
      }),

    /**
     * Print the Definitions section: each block the command defines itself, under its label.
     */
    definitions: () => {
      // Every block is a definition block of its own.
      for (const { label, content } of definitions ?? []) {
        printItem({ title: label, content }, { section: 'definitions', layout: 'descriptionBlock' });
      }
    },
  };
};
