import { ShellBackground, ShellColor, ShellDecoration, ShellReset } from '../constants/shellStyleCodes';

/**
 * A supported name that resolves to an ANSI SGR parameter for a color, background, decoration, or
 * reset.
 */
export type ShellStyleCodeName =
  | Uncapitalize<keyof typeof ShellColor | keyof typeof ShellDecoration>
  | `bg${keyof typeof ShellBackground}`
  | `reset${keyof typeof ShellReset}`;

/**
 * Converts an enum key to camel-style casing by lowercasing its first character (`Red` → `red`).
 */
const unCapitalize = (key: string): string => `${key.charAt(0).toLowerCase()}${key.slice(1)}`;

/**
 * Builds a lookup from an SGR enum, transforming each key with `mapKey` before storing its numeric
 * code. By default, only the first character is lowercased; callers can provide a mapper to add a
 * prefix or otherwise rename keys.
 */
const toCodeMap = (
  enumMap: Record<string, number | string>,
  mapKey: (key: string) => string = unCapitalize
): Record<string, number> =>
  Object.fromEntries(
    Object.entries(enumMap)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
      .map(([key, value]) => [mapKey(key), value])
  );

/**
 * Maps each supported style name to its numeric ANSI SGR parameter.
 */
const STYLE_CODE_MAP: Record<ShellStyleCodeName, number> = {
  ...toCodeMap(ShellColor),
  ...toCodeMap(ShellBackground, key => `bg${key}`),
  ...toCodeMap(ShellDecoration),
  ...toCodeMap(ShellReset, key => `reset${key}`),
} as Record<ShellStyleCodeName, number>;

/**
 * Converts style names into an SGR parameter string, joining their numeric codes with semicolons.
 */
export const styleCode = (...names: ShellStyleCodeName[]): string => names.map(name => STYLE_CODE_MAP[name]).join(';');
