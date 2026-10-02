import type { ShellPresetStyleName } from '../configs/styleConfig';
import type {
  ShellBackground,
  ShellColor,
  ShellDecoration,
  ShellNatureStyleName,
  ShellReset,
  ShellStyleCode,
} from '../constants/shellStyleCodes';

/**
 * A supported name that resolves to an ANSI SGR parameter for a color, background, decoration, or
 * reset.
 */
export type ShellStyleCodeName =
  | Uncapitalize<keyof typeof ShellColor | keyof typeof ShellDecoration>
  | `bg${keyof typeof ShellBackground}`
  | `reset${keyof typeof ShellReset}`;

/**
 * A style code name that starts a color, background, or decoration — every name except a reset.
 */
export type ShellStyleStartCodeName = Exclude<ShellStyleCodeName, `reset${string}`>;

/**
 * Every style name a style function exists for: the configured presets, plus the nature styles.
 */
export type ShellStyleName = ShellPresetStyleName | ShellNatureStyleName;

/**
 * A function that takes plain text and returns the text wrapped with a style's ANSI codes.
 */
export type ShellStyleFunc = (text?: string, close?: ShellStyleCode) => string;

/**
 * The two codes a style is made of: the one that opens it, and the one that closes it.
 */
export type ShellStyleCodes = [open: ShellStyleCode, close: ShellStyleCode];
