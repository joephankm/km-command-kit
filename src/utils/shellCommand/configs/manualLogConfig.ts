import type {
  CmdManualLayouts,
  CmdManualSections,
  CmdManualSettings,
  CmdManualTemplates,
} from '../types/manualLogTypes';

/**
 * The settings every manual log starts from, before the options given to it override any of them.
 */
const manualLogSettings: CmdManualSettings = {
  spacing: 2,
  titleStyle: 'heading',
  labelStyle: 'emphasize',
  contentIndent: 2,
};

/**
 * The sections each manual template shows, in the order they are shown.
 */
const manualLogTemplate: CmdManualTemplates = {
  help: ['description', 'usages', 'examples', 'commands', 'arguments', 'options'],
  error: ['error', 'usages', 'examples'],
};

/**
 * The default options of each layout, taken by every section displayed in it.
 */
const manualLogLayouts: CmdManualLayouts = {
  descriptionInline: {
    separator: ':',
    gap: 2,
  },
  // descriptionBlock: {
  //   contentIndent: 1,
  // },
  // itemList: {
  //   contentIndent: 1,
  //   marker: '-',
  // },
  // columnList: {
  //   contentIndent: 1,
  // },
  definitionList: {
    // contentIndent: 1,
    descriptionIndent: 4,
  },
};

/**
 * The options each section is displayed with, overriding the settings of the same name.
 */
const manualLogSections: CmdManualSections = {
  // description: {},
  // usages: {},
  // commands: {},
  examples: {
    // style: 'label',
    // titleStyle: 'heading',
    // labelStyle: 'heading',
  },
  options: {
    layout: 'columnList',
    // style: 'subtle',
    // titleStyle: 'heading',
    // labelStyle: 'emphasize',
  },
  arguments: {
    layout: 'definitionList',
    // style: 'subtle',
    // titleStyle: 'heading',
    // labelStyle: 'emphasize',
  },
  definitions: {
    // style: 'subtle',
    // titleStyle: 'heading',
    // labelStyle: 'emphasize',
  },
};

export default {
  settings: manualLogSettings,
  template: manualLogTemplate,
  layouts: manualLogLayouts,
  sections: manualLogSections,
};
