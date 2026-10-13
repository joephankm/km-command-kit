import { parseArgs } from 'node:util';
import type { CmdParams, CmdParseArgsConfig, CmdParseResult } from '../types/parseCommandTypes';

/**
 * Parse the command's input from `process.argv` into its options and arguments.
 */
const parseCommand = <T extends CmdParams>({ options, argsStart = 2 }: T): CmdParseResult<T> => {
  const { values, positionals } = parseArgs<CmdParseArgsConfig<T>>({
    args: process.argv.slice(argsStart),
    options,
    allowPositionals: true,
  });

  return { options: values, args: positionals };
};

export default parseCommand;
