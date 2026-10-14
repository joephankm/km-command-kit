import { parseArgs } from 'node:util';
import type { CmdParams, CmdParseResult } from '../types/parseCommandTypes';
import { toArgValues } from './argHelpers';

/**
 * Parse the command's input from `process.argv` into its options and arguments.
 */
export default <T extends CmdParams>({ options, args, argsStart = 2 }: T): CmdParseResult<T> => {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(argsStart),
    options,
    allowPositionals: true,
  });

  const result = args
    ? { options: values, positionals, args: toArgValues(positionals, args) }
    : { options: values, positionals };

  return result as CmdParseResult<T>;
};
