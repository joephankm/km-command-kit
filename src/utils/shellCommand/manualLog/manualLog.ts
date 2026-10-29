import config from '../configs/manualLogConfig';
import type { CmdManualDefinition, CmdManualSectionName } from '../types/manualLogTypes';
import sectionLog from './sectionLog';

/**
 * The sections the help manual shows, in order, when the config has no `help` template.
 */
const DEFAULT_HELP_TEMPLATE: CmdManualSectionName[] = ['description', 'usages', 'options'];

/**
 * Create a manual log, with a method to print each section of a command's manual, and one to print
 * the whole help manual.
 */
export default (definition: CmdManualDefinition) => {
  const sectionLogs = sectionLog(definition);

  return {
    ...sectionLogs,

    /**
     * Print the help manual: each section of the `help` template, or of the default one, in order.
     */
    manual: () => {
      for (const name of config.template.help ?? DEFAULT_HELP_TEMPLATE) {
        // A section with no section log yet is left out.
        if (!(name in sectionLogs)) continue;

        sectionLogs[name as keyof typeof sectionLogs]();
      }
    },
  };
};
