import { TaskLogLevel } from '../constants/taskLogConstants';
import type { PrintOptions, TaskDisplayOptions, TaskLogFormatName, TaskLogOptions } from '../types/taskLogTypes';
import { resolveDisplayOptions } from './displayOptions';
import { formatDuration, formatLogTime, renderFormat, type FormatValues } from './formatters';
import type { MessageItem } from './messageBag';
import type { ProcessState } from './taskLog';

/**
 * Formats a process label for task-log output.
 */
export const labelText = (label: string, printOptions: PrintOptions): string | undefined => {
  if (!printOptions.labelFormat) return label;

  return renderFormat(printOptions.labelFormat, { label });
};

/**
 * Formats and tracks a progress step for task-log output.
 */
export const stepText = (
  step: number | true,
  printOptions: PrintOptions,
  processState: ProcessState,
  options?: Pick<TaskLogOptions, 'totalSteps'>
): string | undefined => {
  if (typeof step === 'boolean') step = (processState.currStep ?? 0) + 1;
  processState.currStep = step;

  if (options?.totalSteps) processState.stepTotals = options.totalSteps;
  const stepTotals = processState.stepTotals;

  const format = stepTotals === undefined ? printOptions.stepFormat : printOptions.stepWithTotalFormat;
  if (!format) return String(step);

  return renderFormat(format, {
    step: String(step),
    totalSteps: stepTotals === undefined ? undefined : String(stepTotals),
  });
};

/**
 * Provides time-related format values for a task-log entry.
 */
const timeValues = (printOptions: PrintOptions, durations?: Record<string, number>): FormatValues => {
  if (printOptions.time === 'logTime') {
    return { logTime: formatLogTime(new Date(), printOptions.logTimeFormat ?? '') };
  }

  if (printOptions.time === 'duration' && durations) {
    const durationValues = Object.entries(durations).reduce<FormatValues>((values, [name, duration]) => {
      values[name] = formatDuration(duration);
      return values;
    }, {});

    return { duration: renderFormat(printOptions.durationFormat ?? '', durationValues) };
  }

  return {};
};

/**
 * Prints a formatted task-log entry.
 */
export const printLine = (
  message: string,
  printOptions: PrintOptions,
  parts: { step?: string; label?: string; durations?: Record<string, number> } = {}
): void => {
  const format = typeof printOptions.format === 'string' ? printOptions.format : '{message}';
  const icon = typeof printOptions.icon === 'string' ? printOptions.icon : undefined;

  const line = renderFormat(format, {
    icon,
    message,
    step: parts.step,
    label: parts.label,
    ...timeValues(printOptions, parts.durations),
  });

  console.log(printOptions.style ? printOptions.style(line) : line);
};

/**
 * Success display formats by task-log level.
 */
export const SUCCESS_FORMATS: Record<number, TaskLogFormatName> = {
  [TaskLogLevel.Task]: 'taskSuccess',
  [TaskLogLevel.Action]: 'actionSuccess',
  [TaskLogLevel.Operation]: 'operationSuccess',
};

/**
 * Prints collected task-log messages using their matching display formats.
 */
export const printMessage = (
  [type, messages, level = TaskLogLevel.Task]: MessageItem,
  durations?: Record<string, number>,
  options?: TaskDisplayOptions
): void => {
  const format = type === 'success' ? (SUCCESS_FORMATS[level] ?? 'taskSuccess') : 'error';
  const printOptions = resolveDisplayOptions(format, options);

  messages.forEach(message => printLine(message, printOptions, { durations }));
};
