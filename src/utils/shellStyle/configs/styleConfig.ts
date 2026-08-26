import type { ShellTextStyle } from '../types/styleTypes';

/** Log-level style names, mirroring the Levels feature (debug/info/warn/error). */
export type ShellLogLevelStyleName = 'info' | 'debug' | 'warn' | 'error';

/** Status style names — the outcome/state of something ongoing (task, process, etc.). */
export type ShellStatusStyleName = 'success' | 'warn' | 'error';

/** Action style names for emphasizing or de-emphasizing a specific piece of text. */
export type ShellActionStyleName = 'highlight' | 'emphasize' | 'delete' | 'muted';

/** Title-level style names for section headings of varying prominence. */
export type ShellTitleStyleName = 'label' | 'title' | 'subtitle' | 'heading';

/** Style names based on inherent nature rather than purpose, e.g. resetting all styling. */
export type ShellNatureStyleName = 'reset';

/**
 * Define style names
 */
export type ShellStyleName =
  ShellLogLevelStyleName | ShellStatusStyleName | ShellActionStyleName | ShellTitleStyleName | ShellNatureStyleName;

/**
 * [CONFIG]: Terminal text styles
 *
 * For available terminal text style codes and syntax, refer to
 * {@link import('../constants/shellStyleCodes').ShellStyleCode Shell Style Rules}
 */
export const style: Record<ShellStyleName, ShellTextStyle> = {
  info: [36, 0], // cyan
  debug: [90, 0], // gray
  warn: [33, 0], // yellow
  error: [31, 0], // red
  success: [32, 0], // green
  highlight: ['1;35', 0], // bold magenta
  emphasize: [1, 0], // bold
  delete: ['4;31', 0], // underline red
  muted: ['2;90', 0], // dim gray
  label: [2, 0], // dim
  title: [1, 0], // bold
  subtitle: [90, 0], // gray
  heading: ['1;4;36', 0], // bold underline cyan
  reset: [0, 0], // reset all
};

export default { style };
