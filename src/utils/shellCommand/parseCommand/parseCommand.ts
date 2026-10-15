import { parseArgs } from 'node:util';
import { docLog } from '../../shellLog';
import type {
  CmdManualParams,
  CmdOptionDef,
  CmdParams,
  CmdParseResult,
  GroupedOrFlat,
} from '../types/parseCommandTypes';
import { toArgValues } from './argHelpers';

/**
 * Merge options given in groups into one flat set, keyed by their long name.
 */
const flattenDefs = (options: GroupedOrFlat<CmdOptionDef> | undefined): Record<string, CmdOptionDef> | undefined => {
  if (Array.isArray(options)) {
    return Object.fromEntries(
      options.flatMap((group: { items: Record<string, CmdOptionDef> }) => Object.entries(group.items))
    );
  }

  return options as Record<string, CmdOptionDef> | undefined;
};

/**
 * Print the command's manual and end the process.
 */
const printManual = ({ description }: CmdManualParams): never => {
  if (description) {
    docLog().body(description);
  }

  process.exit(0);
};

/**
 * Parse the command's input from `process.argv` into its options and arguments.
 */
export default <const T extends CmdParams>({ options, args, argsStart = 2, manual }: T): CmdParseResult<T> => {
  const inputArgs = process.argv.slice(argsStart);

  if (manual && inputArgs.includes('--help')) {
    printManual(manual);
  }

  const { values, positionals } = parseArgs({
    args: inputArgs,
    options: flattenDefs(options),
    allowPositionals: true,
  });

  const result = args
    ? { options: values, positionals, args: toArgValues(positionals, args) }
    : { options: values, positionals };

  return result as CmdParseResult<T>;
};
