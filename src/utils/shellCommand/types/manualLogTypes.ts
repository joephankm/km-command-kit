import type { DocLogStyle } from '../../shellLog/types/docLogTypes';
import type {
  InlineDefinitionOptions,
  MakeListOptions,
  StackedDefinitionOptions,
} from '../../shellStyle/types/markupTypes';
import type { CmdArgumentDef, CmdOptionDef, GroupedOrFlat } from './parseCommandTypes';

/**
 * One form of a call to a command, with a label shown with it.
 */
export type CmdManualUsage = { label: string; usage: string };

/**
 * One sample call to a command, with a label shown with it.
 */
export type CmdManualExample = { label: string; example: string };

/**
 * One block of the manual's Definitions section.
 */
export type CmdManualBlockDef = {
  /** The label the block is shown under. */
  label: string;
  /** What the block shows. */
  content: string;
};

/**
 * The full definition of a command's manual.
 */
export type CmdManualDefinition = {
  /** What the command does, for the Description section. */
  description?: string;
  /** Forms of calling the command, for the Usages section: one alone, all alone, or all labeled. */
  usages?: string | readonly string[] | readonly CmdManualUsage[];
  /** Sample calls to the command, for the Examples section: one alone, all alone, or all labeled. */
  examples?: string | readonly string[] | readonly CmdManualExample[];
  /** The Definitions section's blocks, in the order given. */
  definitions?: readonly CmdManualBlockDef[];
  /** The command's options, keyed by their long name, given flat or in groups. */
  options?: GroupedOrFlat<CmdOptionDef>;
  /** The command's arguments, keyed by their name, given flat or in groups. */
  arguments?: GroupedOrFlat<CmdArgumentDef>;
};

/**
 * The name of a layout a manual section can be displayed in.
 */
export type CmdManualLayoutName =
  'plainText' | 'descriptionInline' | 'descriptionBlock' | 'itemList' | 'columnList' | 'definitionList';

/**
 * The name of a manual section.
 */
export type CmdManualSectionName =
  'error' | 'description' | 'usages' | 'examples' | 'commands' | 'arguments' | 'options' | 'definitions';

/**
 * [MAP] Each section with a choice of layouts, mapped to the layouts it can be displayed in.
 */
export type CmdManualSectionLayouts = {
  description: 'plainText' | 'descriptionBlock';
  commands: 'columnList' | 'definitionList';
  arguments: 'columnList' | 'definitionList';
  options: 'columnList' | 'definitionList';
};

/**
 * The name of a manual template.
 */
export type CmdManualTemplateName = 'help' | 'error';

/**
 * The manual's templates, each the sections it shows, in order.
 */
export type CmdManualTemplates = Partial<Record<CmdManualTemplateName, CmdManualSectionName[]>>;

/**
 * The options of a whole manual log, each the default for every section.
 */
export type CmdManualLogOptions = {
  /** The style every section's title is displayed in. */
  titleStyle?: DocLogStyle;
  /** The style every item's label is displayed in. */
  labelStyle?: DocLogStyle;
};

/**
 * The core settings of a manual log: the spacing between its sections, and the styles and content
 * indent every section starts from.
 */
export type CmdManualSettings = CmdManualLogOptions & {
  /** The blank lines between sections. Defaults to `1`. */
  spacing?: number;
  /** The columns content is pushed right past its title, in every layout that takes one. */
  contentIndent?: number;
};

/**
 * The options of one manual section, overriding the settings of the same name. A section with a
 * choice of layouts also takes its `layout`.
 */
export type CmdManualSectionOptions<
  S extends Exclude<CmdManualSectionName, 'error'> = Exclude<CmdManualSectionName, 'error'>,
> = CmdManualLogOptions & {
  /** The style the section is displayed in. */
  style?: DocLogStyle;
} & (S extends keyof CmdManualSectionLayouts
    ? {
        /** The layout the section is displayed in. */
        layout?: CmdManualSectionLayouts[S];
      }
    : unknown);

/**
 * The options of each manual section that has a section log, keyed by its name.
 */
export type CmdManualSections = { [S in Exclude<CmdManualSectionName, 'error'>]?: CmdManualSectionOptions<S> };

/**
 * The default options of each layout, keyed by its name.
 */
export type CmdManualLayouts = {
  /** Options of the Description Inline layout: its separator, gap, and styles. */
  descriptionInline?: Pick<InlineDefinitionOptions, 'separator' | 'gap'> &
    Pick<CmdManualSectionOptions, 'style' | 'titleStyle'>;
  /** Options of the Description Block layout: the indent of its content, and its styles. */
  descriptionBlock?: Pick<StackedDefinitionOptions, 'contentIndent'> &
    Pick<CmdManualSectionOptions, 'style' | 'titleStyle'>;
  /** Options of the Item List layout: the indent of its items, their marker, and its styles. */
  itemList?: {
    /** The columns the items are pushed right past the title. */
    contentIndent?: number;
  } & Pick<MakeListOptions, 'marker'> &
    Pick<CmdManualSectionOptions, 'style' | 'titleStyle'>;
  /** Options of the Column List layout: the indent of its rows, and its styles. */
  columnList?: {
    /** The columns the rows are pushed right past the title. */
    contentIndent?: number;
  } & Pick<CmdManualSectionOptions, 'style' | 'titleStyle' | 'labelStyle'>;
  /** Options of the Definition List layout: the indents of its items, and its styles. */
  definitionList?: {
    /** The columns the items, labels and content alike, are pushed right past the title. */
    contentIndent?: number;
    /** The columns each item's description is pushed right past its label. */
    descriptionIndent?: number;
  } & Pick<CmdManualSectionOptions, 'style' | 'titleStyle' | 'labelStyle'>;
};
