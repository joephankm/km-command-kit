import config from '../configs/styleConfig';
import type { ShellStyleName } from '../configs/styleConfig';
import type { ShellStyleFunc } from '../types/styleTypes';

/**
 * Creates a ShellStyleFunc that wraps text between a fixed start code and end code.
 */
const styleFunc = (open: number | string, close: number | string): ShellStyleFunc => {
  const openCode = `\u001B[${open}m`;
  const closeCode = `\u001B[${close}m`;

  // [!PERFORMANCE]: Not using template literals for performance reasons
  return text => openCode + text + closeCode;
};

/**
 * Precomputed style function for every named style in styleConfig.
 */
const style: Record<ShellStyleName, ShellStyleFunc> = Object.fromEntries(
  Object.entries(config.style).map(([name, [open, close]]) => [name, styleFunc(open, close)])
) as Record<ShellStyleName, ShellStyleFunc>;

export default style;
