import type { ShellPresetStyleName } from '../configs/styleConfig';
import type { ShellNatureStyleName, ShellStyleCode } from '../constants/shellStyleCodes';

/**
 * Every style name a style function exists for: the configured presets, plus the nature styles.
 */
export type ShellStyleName = ShellPresetStyleName | ShellNatureStyleName;

/**
 * A function that takes plain text and returns the text wrapped with a style's ANSI codes.
 */
export type ShellStyleFunc = (text?: string, close?: ShellStyleCode) => string;

export type ShellTextStyle = [open: ShellStyleCode, close: ShellStyleCode];
