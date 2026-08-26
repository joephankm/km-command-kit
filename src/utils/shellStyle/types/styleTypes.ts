import type { ShellStyleCode } from '../constants/shellStyleCodes';

/**
 * A function that takes plain text and returns the text wrapped with a style's ANSI codes.
 */
export type ShellStyleFunc = (text: string) => string;

export type ShellTextStyle = [open: ShellStyleCode, close: ShellStyleCode];
