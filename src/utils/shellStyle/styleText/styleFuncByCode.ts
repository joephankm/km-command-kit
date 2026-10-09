import { capitalize } from '../common/textCases';
import { ShellDecoration, ShellReset } from '../constants/shellStyleCodes';
import type { ShellTextStyle } from '../types/markupTypes';
import type { ShellStyleCodeName, ShellStyleFunc, ShellStyleStartCodeName } from '../types/styleTypes';
import style from './presetStyles';
import { STYLE_CODE_MAP, styleCode } from './styleCode';
import { styleFunc } from './styleFunc';

/**
 * Maps each start code name to the SGR parameter that turns it off.
 */
export const CLOSE_CODE_MAP: Record<ShellStyleStartCodeName, ShellStyleCodeName> = Object.fromEntries(
  Object.entries(STYLE_CODE_MAP)
    .filter(([key]) => !key.startsWith('reset'))
    .map(([key]) => {
      if (key.startsWith('bg')) return [key, ShellReset.Background];

      const capitalizedKey = capitalize(key);
      if (capitalizedKey in ShellDecoration)
        return [
          key,
          // @ts-expect-error -- difficult to satisfy capitalizedKey as string to key of ShellReset
          ['bold', 'dim'].includes(key) ? ShellReset.BoldOrDim : ShellReset[capitalizedKey],
        ];
      return [key, ShellReset.Color];
    })
) as Record<ShellStyleStartCodeName, ShellStyleCodeName>;

/**
 * Converts start code names into the SGR parameter string that turns them off, joining their
 * closing codes with semicolons.
 */
export const closeCode = (names: readonly ShellStyleStartCodeName[]): string =>
  names.map(name => CLOSE_CODE_MAP[name]).join(';');

/**
 * Creates a style function from start code names, opening with all their codes and closing with
 * the codes that turn each of them off.
 */
export const styleFuncByCode = (names: readonly ShellStyleStartCodeName[]): ShellStyleFunc =>
  styleFunc(styleCode(names), closeCode(names));

/**
 * Get the style function of a text style: the preset style of that name, or one created from the
 * start code names.
 */
export const textStyleFunc = (textStyle: ShellTextStyle): ShellStyleFunc =>
  typeof textStyle === 'string' ? style[textStyle] : styleFuncByCode(textStyle);

/**
 * Map each named text style to its style function: the preset style of that name, or one created
 * from the start code names.
 */
export const createStyleFuncMap = <Name extends string>(
  styles: Record<Name, ShellTextStyle>
): Record<Name, ShellStyleFunc> => {
  const styleFuncMap = {} as Record<Name, ShellStyleFunc>;

  for (const name in styles) {
    styleFuncMap[name] = textStyleFunc(styles[name]);
  }

  return styleFuncMap;
};
