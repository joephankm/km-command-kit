import type { ParseArgsOptionDescriptor, parseArgs } from 'node:util';

/**
 * The options of a definition passed to `parseArgs`: Node's `ParseArgsOptionDescriptor`.
 */
export type CmdDefParseOptions = ParseArgsOptionDescriptor;

/**
 * The full definition of one option of a command.
 */
export type CmdOptionDef = CmdDefParseOptions;

/**
 * The input `parseCommand` takes, declaring the command's options.
 */
export type CmdParams = {
  /** The command's options, keyed by their long name. */
  options: Record<string, CmdOptionDef>;
  /** The index in `process.argv` where parsing begins. Defaults to `2`. */
  argsStart?: number;
};

/**
 * The config `parseCommand` passes to `parseArgs` for a given `CmdParams`.
 */
export type CmdParseArgsConfig<T extends CmdParams> = {
  args: string[];
  options: T['options'];
  allowPositionals: true;
};

/**
 * The result `parseArgs` returns for a given `CmdParams`.
 */
type CmdParseArgsResult<T extends CmdParams> = ReturnType<typeof parseArgs<CmdParseArgsConfig<T>>>;

/**
 * The result `parseCommand` returns: the parsed options and arguments of the command.
 */
export type CmdParseResult<T extends CmdParams> = {
  /** The parsed options, keyed by their long name. */
  options: CmdParseArgsResult<T>['values'];
  /** The parsed arguments, in the order they were given. */
  args: CmdParseArgsResult<T>['positionals'];
};
