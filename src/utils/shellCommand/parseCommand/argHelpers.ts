import type { CmdArgumentDef } from '../types/parseCommandTypes';

/**
 * A value read for one argument, before it is typed by its definition.
 */
type ArgValue = string | boolean | (string | boolean)[] | undefined;

/**
 * The slot an argument reads from: one index, or a `[from, to]` range with `to` excluded.
 */
type ArgSlot = number | [number, number];

/**
 * Resolve a slot against the number of positionals, counting a negative slot back from the end.
 */
const calcPosition = (pos: number, length: number): number => (pos < 0 ? length + pos : pos);

/**
 * Read a raw positional as the given value type.
 */
const parseValue = (raw: string, type: CmdArgumentDef['type']): string | boolean =>
  type === 'boolean' ? raw === 'true' : raw;

/**
 * Map positionals to the declared arguments, keyed by each argument's name.
 */
export const toArgValues = (
  positionals: string[],
  argDefs: Record<string, CmdArgumentDef>
): Record<string, ArgValue> => {
  const claimedPositions = new Set<number>();
  const positionSlots: Record<string, ArgSlot> = {};
  const autoNames: string[] = [];
  const length = positionals.length;

  for (const [name, def] of Object.entries(argDefs)) {
    // [CASE]: Arguments are a range from positions
    if (def.fromPosition !== undefined || def.toPosition !== undefined) {
      if (def.default !== undefined && !Array.isArray(def.default)) {
        throw new TypeError(`Argument "${name}" takes a range of positions, so its \`default\` must be an array.`);
      }
      if (def.position !== undefined) {
        throw new TypeError(`Argument "${name}" takes a range of positions, so it cannot also set \`position\`.`);
      }

      const from = calcPosition(def.fromPosition ?? 0, length);
      const to = def.toPosition === undefined ? length : calcPosition(def.toPosition, length);
      positionSlots[name] = [from, to];
      for (let index = from; index < to; index++) {
        claimedPositions.add(index);
      }
    }
    // [CASE]: The argument is specified a position
    else if (def.position !== undefined) {
      positionSlots[name] = def.position;
      claimedPositions.add(def.position);
    }
    // [CASE]: Auto arrange the position by the input order
    else {
      autoNames.push(name);
    }
  }

  // Handle auto arrange to claimed positions
  let next = 0;
  for (const name of autoNames) {
    while (claimedPositions.has(next)) {
      next++;
    }
    positionSlots[name] = next;
    claimedPositions.add(next);
  }

  const values: Record<string, ArgValue> = {};
  for (const [name, def] of Object.entries(argDefs)) {
    const slot = positionSlots[name]!;

    if (Array.isArray(slot)) {
      const args = positionals.slice(slot[0], slot[1]);
      values[name] = args.length > 0 ? args.map(arg => parseValue(arg, def.type)) : def.default;
    } else {
      const arg = positionals[slot];
      values[name] = arg === undefined ? def.default : parseValue(arg, def.type);
    }
  }

  return values;
};
