import { unCapitalize } from '../common/textCases';
import { ShellBackground, ShellColor, ShellDecoration, ShellReset } from '../constants/shellStyleCodes';
import type { ShellStyleCodeName } from '../types/styleTypes';

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
export const STYLE_CODE_MAP: Record<ShellStyleCodeName, number> = {
  ...toCodeMap(ShellColor),
  ...toCodeMap(ShellBackground, key => `bg${key}`),
  ...toCodeMap(ShellDecoration),
  ...toCodeMap(ShellReset, key => `reset${key}`),
} as Record<ShellStyleCodeName, number>;

/**
 * Converts style names into an SGR parameter string, joining their numeric codes with semicolons.
 */
export const styleCode = (names: readonly ShellStyleCodeName[]): string =>
  names.map(name => STYLE_CODE_MAP[name]).join(';');
