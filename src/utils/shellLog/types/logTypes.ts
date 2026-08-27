/**
 * Log levels supported by the Logger component.
 */
export type ShellLogLevel = 'verbose' | 'info' | 'warn' | 'error';

/**
 * A shell log function.
 */
export type ShellLogFunc = (message: string, detail?: string) => void;
