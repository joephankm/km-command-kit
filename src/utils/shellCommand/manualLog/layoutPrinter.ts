import { docLog } from '../../shellLog';
import type { DocLogStyle } from '../../shellLog/types/docLogTypes';
import type { DefinitionItem, ShellTextStyle } from '../../shellStyle/types/markupTypes';
import type {
  CmdManualLayoutName,
  CmdManualLayouts,
  CmdManualSectionName,
  CmdManualSectionOptions,
  CmdManualSections,
  CmdManualSettings,
} from '../types/manualLogTypes';

/**
 * The params of the layout printers: the settings, each section's options, and each layout's.
 */
type LayoutPrinterParams = {
  /** The core settings, the defaults every section starts from. */
  settings: CmdManualSettings;
  /** The options of each section, overriding the layout's and the settings of the same name. */
  sections: CmdManualSections;
  /** The default options of each layout, overriding the settings of the same name. */
  layouts: CmdManualLayouts;
};

/**
 * The styles a section is printed in: its own, its title's, and its labels'.
 */
type SectionStyles = Pick<CmdManualSectionOptions, 'style' | 'titleStyle' | 'labelStyle'>;

/**
 * The options of a layout, apart from its styles.
 */
type LayoutOptions<L extends keyof CmdManualLayouts> = Omit<NonNullable<CmdManualLayouts[L]>, keyof SectionStyles>;

/**
 * The names of the style options, which a layout's options leave out.
 */
const STYLE_OPTION_NAMES = new Set<string>(['style', 'titleStyle', 'labelStyle'] satisfies (keyof SectionStyles)[]);

/**
 * One item printed in a single-item layout: its title, and its content.
 */
type ManualItem = { title: string; content: string | undefined };

/**
 * The options of printing one item: the section it belongs to, and its layout.
 */
type PrintItemOptions = {
  /** The section the item belongs to, whose styles it is printed in. */
  section: Exclude<CmdManualSectionName, 'error'>;
  /** The layout the item is printed in. */
  layout?: 'plainText' | 'descriptionBlock' | 'descriptionInline';
};

/**
 * A list printed in a multi-item layout: its title, and its items.
 */
type ManualList = { title: string; items: Record<string, unknown>[] };

/**
 * The options of printing a list: the fields each item's label and content are read from.
 */
type PrintListOptions = {
  /** The section the item belongs to, whose styles it is printed in. */
  section: Exclude<CmdManualSectionName, 'error'>;
  /** The layout the list is printed in. */
  layout?: 'columnList' | 'definitionList';
  /** The field of each item's label, or the fields of its label columns. Defaults to `label`. */
  labelField?: string | string[];
  /** The field each item's content is read from. Defaults to `content`. */
  contentField?: string;
};

/**
 * A list of plain items, with no structure: its title, and its items.
 */
type ManualPlainList = { title: string; items: string[] };

/**
 * The options of printing a plain list: the section it belongs to.
 */
type PrintPlainListOptions = Pick<PrintListOptions, 'section'>;

/**
 * Create the layout printers of a manual log: one printing a single item, one a list, and one
 * a plain list.
 */
const layoutPrinter = ({ settings, sections, layouts }: LayoutPrinterParams) => {
  const doc = docLog({ spacing: settings.spacing });

  /**
   * Get the styles of a section displayed in a layout.
   */
  const getSectionStyles = (
    name: Exclude<CmdManualSectionName, 'error'>,
    layout: CmdManualLayoutName
  ): SectionStyles => {
    const sectionStyles: SectionStyles = sections[name] ?? {};
    // Plain Text has no layout options, so it reads none.
    const layoutStyles: SectionStyles = layouts[layout as keyof CmdManualLayouts] ?? {};

    return {
      style: sectionStyles.style ?? layoutStyles.style,
      titleStyle: sectionStyles.titleStyle ?? layoutStyles.titleStyle ?? settings.titleStyle,
      labelStyle: sectionStyles.labelStyle ?? layoutStyles.labelStyle ?? settings.labelStyle,
    };
  };

  /**
   * Get the options of a layout, apart from its styles: each the layout's own, or else the setting
   * of the same name.
   */
  const getLayoutOptions = <L extends keyof CmdManualLayouts>(layout: L): LayoutOptions<L> => {
    // Start from the settings a layout inherits, then lay each of its own options over them.
    const layoutOptions: Record<string, unknown> = { contentIndent: settings.contentIndent };
    const options: Record<string, unknown> | undefined = layouts[layout];

    if (options) {
      for (const key in options) {
        if (STYLE_OPTION_NAMES.has(key) || options[key] === undefined) continue;

        layoutOptions[key] = options[key];
      }
    }

    return layoutOptions as LayoutOptions<L>;
  };

  return {
    /**
     * Print one item in a single-item layout: its content alone, under its title, or after it.
     */
    printItem: ({ title, content }: ManualItem, { section, layout = 'plainText' }: PrintItemOptions) => {
      if (!content) return;

      const { titleStyle, style } = getSectionStyles(section, layout);

      switch (layout) {
        case 'descriptionBlock': {
          // With no content indent set anywhere, the content has none.
          const { contentIndent = 0 } = getLayoutOptions('descriptionBlock');

          doc.definitions([{ label: title, content }], {
            layout: 'stacked',
            stackedOptions: { labelStyle: titleStyle as ShellTextStyle | undefined, contentIndent },
            style,
          });
          break;
        }

        case 'descriptionInline': {
          const { separator, gap } = getLayoutOptions('descriptionInline');

          doc.definitions([{ label: title, content }], {
            layout: 'inline',
            inlineOptions: { labelStyle: titleStyle as ShellTextStyle | undefined, separator, gap },
            style,
          });
          break;
        }

        default:
          doc.body(content, { style });
      }
    },

    /**
     * Print a list in a multi-item layout: each item's label, with its content.
     */
    printList: (
      { title, items }: ManualList,
      { section, layout = 'columnList', labelField = 'label', contentField = 'content' }: PrintListOptions
    ) => {
      if (!items?.length) return;

      const { titleStyle, style, labelStyle } = getSectionStyles(section, layout);
      const labelFields = Array.isArray(labelField) ? labelField : [labelField];

      doc.line(title, { style: titleStyle, spaceBefore: settings.spacing });

      switch (layout) {
        case 'columnList': {
          // Every label column in the label style, then the content column in the section style.
          const columnStyles: Record<number, DocLogStyle | undefined> = { [labelFields.length]: style };

          for (let index = 0; index < labelFields.length; index++) {
            columnStyles[index] = labelStyle ?? style;
          }

          const { contentIndent } = getLayoutOptions('columnList');

          // Read the labels and content in place, with no remapping to `{ label, content }` first.
          doc.columns(
            items.map(item => [
              ...labelFields.map(field => (item[field] as string | undefined) ?? null),
              (item[contentField] as string | undefined) ?? null,
            ]),
            { indent: contentIndent, style: columnStyles, spaceBefore: 0 }
          );
          break;
        }

        case 'definitionList': {
          // Pass the items as they are when they already hold `label` and `content`; otherwise read
          // each item's label fields, joined into one label, and its content.
          let definitions: DefinitionItem[];
          if (labelField !== 'label' || contentField !== 'content') {
            definitions = items.map(item => ({
              label: labelFields
                .map(field => item[field] as string | undefined)
                .filter(Boolean)
                .join(', '),
              content: (item[contentField] as string | undefined) ?? [],
            }));
          } else {
            definitions = items as DefinitionItem[];
          }

          const { contentIndent, descriptionIndent } = getLayoutOptions('definitionList');

          // The labels sit at the content indent, and each description is pushed right past its
          // label.
          doc.definitions(definitions, {
            layout: 'stacked',
            indent: contentIndent,
            stackedOptions: { labelStyle: labelStyle as ShellTextStyle | undefined, contentIndent: descriptionIndent },
            style,
            spaceBefore: 0,
          });
          break;
        }
      }
    },

    /**
     * Print a list of plain items, with no structure: each item on its own line.
     */
    printPlainList: ({ title, items }: ManualPlainList, { section }: PrintPlainListOptions) => {
      if (!items?.length) return;

      const { titleStyle } = getSectionStyles(section, 'itemList');

      doc.line(title, { style: titleStyle, spaceBefore: settings.spacing });
      doc.list(items, { spaceBefore: 0 });
    },
  };
};

export default layoutPrinter;
