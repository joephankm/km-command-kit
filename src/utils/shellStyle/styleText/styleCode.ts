import { ShellBackground, ShellColor, ShellDecoration, ShellReset } from '../constants/shellStyleCodes';

/**
 * Any style name resolvable to an ANSI SGR code, across colors, backgrounds, decorations, and
 * resets.
 */
export type ShellStyleName =
  | Uncapitalize<keyof typeof ShellColor | `${keyof typeof ShellBackground}Bg` | keyof typeof ShellDecoration>
  | `reset${keyof typeof ShellReset}`;

/**
 * Lowercases only the first character of a key, e.g. `Red` becomes `red`.
 */
const unCapitalize = (key: string): string => `${key.charAt(0).toLowerCase()}${key.slice(1)}`;

/**
 * Builds a code map from an SGR enum, keyed by each enum key run through `mapKey` (default:
 * lowercase the first character only) so callers can prefix or suffix the key as needed.
 */
const toCodeMap = (
  enumObject: Record<string, number | string>,
  mapKey: (key: string) => string = unCapitalize
): Record<string, number> =>
  Object.fromEntries(
    Object.entries(enumObject)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
      .map(([key, value]) => [mapKey(key), value])
  );

/**
 * Style name to ANSI code mapping
 */
const STYLE_CODE_MAP: Record<ShellStyleName, number> = {
  ...toCodeMap(ShellColor),
  ...toCodeMap(ShellBackground, key => `${unCapitalize(key)}Bg`),
  ...toCodeMap(ShellDecoration),
  ...toCodeMap(ShellReset, key => `reset${key}`),
} as Record<ShellStyleName, number>;

/**
 * [TRAN] Transforms multiple style names into a single ANSI SGR code, joined by `;`.
 */
export const styleCode = (...names: ShellStyleName[]): string => names.map(name => STYLE_CODE_MAP[name]).join(';');
