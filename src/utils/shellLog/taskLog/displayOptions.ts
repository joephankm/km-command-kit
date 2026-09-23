import config from '../configs/taskLogConfig';
import type { PrintOptions, TaskDisplayOptions, TaskLogFormatName, TaskWideOptions } from '../types/taskLogTypes';

/**
 * Shared display options for the active task-log run.
 */
let taskWideOptions: TaskWideOptions = {};

/**
 * Configures shared display options for a task-log run.
 */
export const setTaskWideOptions = (overrideOptions: Partial<TaskWideOptions> = {}): void => {
  const { settings, formats } = config;
  const base = formats.base;

  taskWideOptions = {
    format: overrideOptions.format ?? settings.format !== false,
    icon: overrideOptions.icon ?? settings.icon !== false,
    time: overrideOptions.time ?? (typeof settings.time === 'string' ? settings.time : undefined),
    labelFormat: overrideOptions.labelFormat ?? base.labelFormat ?? '',
    stepFormat: overrideOptions.stepFormat ?? base.stepFormat ?? '',
    stepWithTotalFormat: overrideOptions.stepWithTotalFormat ?? base.stepWithTotalFormat ?? '',
    logTimeFormat: overrideOptions.logTimeFormat ?? base.logTimeFormat ?? '',
    durationFormat: overrideOptions.durationFormat ?? base.durationFormat ?? '',
  };
};

/**
 * Indicates whether the active task-log run displays elapsed durations.
 */
export const isDurationTime = (): boolean => taskWideOptions.time === 'duration';

/**
 * Resolves the display options for a task-log entry.
 */
export const resolveDisplayOptions = (
  name: TaskLogFormatName,
  overrideOptions: TaskDisplayOptions<'perLine'> = {}
): PrintOptions => {
  const { format, icon, ...taskOptions } = taskWideOptions;
  const predefinedOptions = config.formats[name];

  if (format === false || overrideOptions.format === false) return { format: false, style: predefinedOptions.style };

  if (icon === false) overrideOptions.icon = false;

  return Object.assign(taskOptions, predefinedOptions, overrideOptions);
};
