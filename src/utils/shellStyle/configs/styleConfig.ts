import type { ShellStyleCodes } from '../types/styleTypes';

/** Styles for informational, verbose, warning, error, and secondary log messages. */
type ShellLogLevelStyleName = 'info' | 'verbose' | 'warn' | 'error' | 'side';

/** Styles for success, warning, and error statuses. */
type ShellStatusStyleName = 'success' | 'warn' | 'error';

/** Styles for highlighting, emphasizing, removing, muting, or attaching text. */
type ShellActionStyleName = 'highlight' | 'emphasize' | 'delete' | 'mute' | 'attach';

/** Styles for titles, headings, labels, and other levels of text prominence. */
type ShellTitleStyleName =
  // Primary title.
  | 'title'
  // Secondary title or description.
  | 'subtitle'
  // Section, article, or table heading.
  | 'heading'
  // Input label or primary table column.
  | 'label'
  // Low-prominence heading.
  | 'subtle';

/** Styles used for structural elements such as borders. */
type ShellStructureStyleName = 'border';

/**
 * All semantic style names supported by this configuration.
 */
export type ShellPresetStyleName =
  ShellLogLevelStyleName | ShellStatusStyleName | ShellActionStyleName | ShellTitleStyleName | ShellStructureStyleName;

/**
 * ANSI opening and closing codes for each named terminal text style.
 *
 * For available terminal text style codes and syntax, refer to
 * {@link import('../constants/shellStyleCodes').ShellStyleCode}
 */
export const style: Record<ShellPresetStyleName, ShellStyleCodes> = {
  // Log messages and status states.
  info: [34, 39], // blue
  verbose: [35, 39], // magenta
  warn: ['3;93', '23;39'], // italic bright yellow
  error: ['3;91', '23;39'], // italic bright red
  success: ['3;92', '23;39'], // italic bright green
  side: ['2;30', '22;39'], // dim black

  // Text emphasis and actions.
  highlight: ['1;35', '22;39'], // bold magenta
  emphasize: [1, 22], // bold
  delete: ['4;31', '24;39'], // underline red
  mute: ['2;90', '22;39'], // dim gray
  attach: ['2;3', '22;23'], // dim italic

  // Titles and text hierarchy.
  title: ['1;33', '22;39'], // bold yellow
  subtitle: [90, 39], // gray
  heading: ['1;94', '22;39'], // bold bright blue
  label: [2, 22], // dim
  subtle: ['2;94', '22;39'], // dim bright blue

  // Structural elements.
  border: [36, 39], // cyan
};

export default { style };
