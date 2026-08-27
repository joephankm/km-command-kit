import type { ShellTextStyle } from '../types/styleTypes';

/** Log-level style names, mirroring the Levels feature (verbose/info/warn/error). */
export type ShellLogLevelStyleName = 'info' | 'verbose' | 'warn' | 'error' | 'side';

/** Status style names — the outcome/state of something ongoing (task, process, etc.). */
export type ShellStatusStyleName = 'success' | 'warn' | 'error';

/** Action style names for emphasizing or de-emphasizing a specific piece of text. */
export type ShellActionStyleName = 'highlight' | 'emphasize' | 'delete' | 'mute' | 'attach';

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
 * {@link import('../constants/shellStyleCodes').ShellStyleCode}
 */
export const style: Record<ShellStyleName, ShellTextStyle> = {
  info: [34, 0], // blue
  verbose: [35, 0], // magenta
  warn: [33, 0], // yellow
  error: [31, 0], // red
  success: [32, 0], // green
  side: ['2;30', 0], // green
  highlight: ['1;35', 0], // bold magenta
  emphasize: [1, 0], // bold
  delete: ['4;31', 0], // underline red
  mute: ['2;90', 0], // dim gray
  attach: ['2;3', 0], // italic
  label: [2, 0], // dim
  title: [1, 0], // bold
  subtitle: [90, 0], // gray
  heading: ['1;4;36', 0], // bold underline cyan
  reset: [0, 0], // reset all
};

export default { style };
