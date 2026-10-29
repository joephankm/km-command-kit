import type { ParseArgsOptionDescriptor } from 'node:util';
import type { CmdManualDefinition } from './manualLogTypes';

/**
 * The type a value is read as.
 */
export type CmdValueType = 'string' | 'boolean';

/**
 * The parse options of a definition: Node's `ParseArgsOptionDescriptor` with its `type` overridden,
 * plus the positions an argument reads from.
 */
export type CmdDefParseOptions = Omit<ParseArgsOptionDescriptor, 'type'> & {
  /** The type the value is read as. */
  type: CmdValueType;
  /** The argument's zero-based index among the positionals. */
  position?: number;
  /** The first positional slot of an argument taking several values; negative counts from the end. */
  fromPosition?: number;
  /** The slot that argument stops before, like `Array.slice`'s end; negative counts from the end. */
  toPosition?: number;
};

/**
 * The display options of a definition: what the manual shows for it.
 */
export type CmdDefDisplayOptions = {
  /** The description of the argument or option, shown in the manual. */
  description?: string;
};

/**
 * The full definition of one option of a command.
 */
export type CmdOptionDef = Omit<CmdDefParseOptions, 'position' | 'fromPosition' | 'toPosition'> & CmdDefDisplayOptions;

/**
 * The full definition of one argument of a command.
 */
export type CmdArgumentDef = Omit<CmdDefParseOptions, 'multiple' | 'short'> & CmdDefDisplayOptions;

/**
 * A set of items given flat, keyed by name, or as titled groups of such sets.
 */
export type GroupedOrFlat<I> = Record<string, I> | readonly { title: string; items: Record<string, I> }[];

/**
 * A union of types merged into one intersection.
 */
type UnionToIntersection<U> = (U extends unknown ? (value: U) => void : never) extends (value: infer I) => void
  ? I
  : never;

/**
 * A grouped-or-flat set merged into one flat set, keyed by name.
 */
export type FlattenGroups<S> = S extends readonly { items: infer R }[] ? UnionToIntersection<R> : S;

/**
 * The input `parseCommand` takes, declaring the command's options and arguments.
 */
export type CmdParams = {
  /** The command's options, keyed by their long name, given flat or in groups. */
  options?: GroupedOrFlat<CmdOptionDef>;
  /** The command's arguments, keyed by their name. */
  args?: Record<string, CmdArgumentDef>;
  /** The index in `process.argv` where parsing begins. Defaults to `2`. */
  argsStart?: number;
  /** What the manual shows for the command; with no `manual`, the command has no manual. */
  manual?: Pick<CmdManualDefinition, 'description' | 'usages' | 'examples' | 'definitions'>;
};

/**
 * A single value read for a definition, by its `type`.
 */
type CmdValue<D extends CmdOptionDef | CmdArgumentDef> = D['type'] extends 'boolean' ? boolean : string;

/**
 * The value parsed for a definition: an array when it takes several values, and possibly
 * `undefined` when it has no default.
 */
export type CmdParsedValue<D extends CmdOptionDef | CmdArgumentDef> =
  | (D extends { multiple: true } | { fromPosition: number } | { toPosition: number } ? CmdValue<D>[] : CmdValue<D>)
  | (D extends { default: unknown } ? never : undefined);

/**
 * Each definition of a set mapped to its parsed value, keyed by the same name.
 */
type CmdParsedValues<R> = {
  [K in keyof R]: R[K] extends CmdOptionDef | CmdArgumentDef ? CmdParsedValue<R[K]> : never;
};

/**
 * The result `parseCommand` returns: the parsed options and arguments of the command.
 */
export type CmdParseResult<T extends CmdParams> = {
  /** The parsed options, keyed by their long name; empty when no options are declared. */
  options: T extends { options: infer O extends GroupedOrFlat<CmdOptionDef> }
    ? CmdParsedValues<FlattenGroups<O>>
    : Record<string, never>;
  /** The raw arguments, in the order they were given. */
  positionals: string[];
} & (T extends { args: infer A extends Record<string, CmdArgumentDef> }
  ? {
      /** The parsed arguments, keyed by their name. */
      args: CmdParsedValues<A>;
    }
  : unknown);
