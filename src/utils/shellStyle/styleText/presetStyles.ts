import config from '../configs/styleConfig';
import { NATURE_STYLES } from '../constants/shellStyleCodes';
import type { ShellStyleFunc, ShellStyleName } from '../types/styleTypes';
import { styleFunc } from './styleFunc';

/**
 * Style functions generated from every named entry in `styleConfig`, plus every nature style.
 */
const style: Record<ShellStyleName, ShellStyleFunc> = Object.fromEntries(
  Object.entries({ ...config.style, ...NATURE_STYLES }).map(([name, [open, close]]) => [name, styleFunc(open, close)])
) as Record<ShellStyleName, ShellStyleFunc>;

export default style;
