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
  labelStyle: 'label',
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
    // titleStyle: 'emphasize',
    labelStyle: 'emphasize',
    style: ['brightGreen'],
  },
  options: {
    layout: 'columnList',
    // titleStyle: 'heading',
    // labelStyle: 'emphasize',
    // style: 'subtle',
  },
  arguments: {
    layout: 'definitionList',
    // titleStyle: 'heading',
    // labelStyle: 'emphasize',
    // style: 'subtle',
  },
  definitions: {
    // titleStyle: 'heading',
    // labelStyle: 'emphasize',
    // style: 'subtle',
  },
};

export default {
  settings: manualLogSettings,
  template: manualLogTemplate,
  layouts: manualLogLayouts,
  sections: manualLogSections,
};
