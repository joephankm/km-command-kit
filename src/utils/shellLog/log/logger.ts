import { style } from '../../shellStyle';
import type { ShellLogLevel, ShellLogFunc } from '../types/logTypes';

type LogConfigState = {
  verbose: boolean;
};

/**
 * Logger config state
 */
const logState: LogConfigState = {
  verbose: false,
};

/**
 * Updates the logger's runtime configuration.
 */
export const configureLogger = (config: Partial<LogConfigState>): void => {
  Object.assign(logState, config);
};

/**
 * Level and console method mapping.
 */
const CONSOLE_METHOD_MAP: Record<ShellLogLevel, typeof console.debug> = {
  verbose: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

/**
 * Label widths
 */
const LABEL_WIDTHS = {
  normal: 7,
  verbose: 9,
};

/**
 * Create a level's log function.
 */
const logFunc = (level: ShellLogLevel): ShellLogFunc => {
  const upperLevel = `[${level.toUpperCase()}]`;
  const textStyle = style[level];
  const log = CONSOLE_METHOD_MAP[level];

  const isVerbose = level === 'verbose';
  const isError = level === 'error';

  // Performance Cache Variables
  let cachedVerbose: boolean;
  let cachedLabel = '';
  let cachedSpaces = '';

  return (message, detail) => {
    if (isVerbose && !logState.verbose) return;

    // [!PERFORMANCE]: Only pad/style string if labelWidth dynamically changes
    if (cachedVerbose !== logState.verbose) {
      cachedVerbose = logState.verbose;

      const width = logState.verbose ? LABEL_WIDTHS.verbose : LABEL_WIDTHS.normal;
      cachedLabel = textStyle(upperLevel.padEnd(width));
      cachedSpaces = ''.padEnd(width);
    }

    log(cachedLabel, isError ? style.error(message) : message);

    if (detail != null && logState.verbose) {
      console.debug(cachedSpaces, style.attach(isError ? style.error(detail) : style.side(detail)));
    }
  };
};

/**
 * Leveled logger for terminal logging.
 */
const logger: Record<ShellLogLevel, ShellLogFunc> = {
  verbose: logFunc('verbose'),
  info: logFunc('info'),
  warn: logFunc('warn'),
  error: logFunc('error'),
};

export default logger;
