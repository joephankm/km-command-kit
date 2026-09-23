import { PLACEHOLDER_PATTERN, TIME_TOKEN_PATTERN } from '../constants/taskLogConstants';

/**
 * Values available for interpolation in a task-log format.
 */
export type FormatValues = Record<string, string | undefined>;

/**
 * Formats a time component as two digits.
 */
const padTime = (value: number): string => String(value).padStart(2, '0');

/**
 * Applies placeholder values to a task-log format.
 */
export const renderFormat = (format: string, values: FormatValues): string =>
  format.replace(PLACEHOLDER_PATTERN, (_, name: string) => values[name] ?? '');

/**
 * Formats a timestamp for task-log output.
 * Supports the `YYYY`, `YY`, `MM`, `DD`, `HH`, `mm`, and `ss` tokens.
 */
export const formatLogTime = (date: Date, format: string): string =>
  format.replace(TIME_TOKEN_PATTERN, token => {
    switch (token) {
      case 'YYYY':
        return String(date.getFullYear());
      case 'YY':
        return padTime(date.getFullYear() % 100);
      case 'MM':
        return padTime(date.getMonth() + 1);
      case 'DD':
        return padTime(date.getDate());
      case 'HH':
        return padTime(date.getHours());
      case 'mm':
        return padTime(date.getMinutes());
      default:
        return padTime(date.getSeconds());
    }
  });

/**
 * Formats an elapsed duration in milliseconds for task-log output.
 */
export const formatDuration = (elapsed: number): string => {
  if (elapsed < 1000) return `${Math.round(elapsed)}ms`;

  const seconds = elapsed / 1000;

  if (seconds < 60) return `${seconds.toFixed(1)}s`;

  const minutes = Math.floor(seconds / 60);

  return `${minutes}m ${Math.round(seconds % 60)}s`;
};
