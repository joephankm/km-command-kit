import config from '../configs/styleConfig';
import type { ShellStyleName } from '../configs/styleConfig';
import type { ShellStyleFunc } from '../types/styleTypes';

/**
 * Escape character that begins an ANSI control sequence.
 */
const ESC = '\u001B';

/**
 * Creates a style function that opens with one SGR code and closes with another.
 */
const styleFunc = (openStyle: number | string, closeStyle: number | string): ShellStyleFunc => {
  const openCode = `${ESC}[${openStyle}m`;
  const closeCode = `${ESC}[${closeStyle}m`;

  return (text, close) => {
    if (text === undefined) return openCode;

    if (close) {
      const givenCode = typeof close === 'string' && close.startsWith(ESC) ? close : ESC + '[' + close + 'm';
      return openCode + text + givenCode;
    }

    // [!PERFORMANCE]: Not using template literals for performance reasons
    return openCode + text + closeCode;
  };
};

/**
 * Style functions generated from every named entry in `styleConfig`.
 */
const style: Record<ShellStyleName, ShellStyleFunc> = Object.fromEntries(
  Object.entries(config.style).map(([name, [open, close]]) => [name, styleFunc(open, close)])
) as Record<ShellStyleName, ShellStyleFunc>;

export default style;
