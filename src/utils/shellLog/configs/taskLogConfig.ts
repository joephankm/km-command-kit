import { style } from '../../shellStyle';
import type { TaskDisplayOptions, TaskLogFormatName } from '../types/taskLogTypes';

/**
 * The display every run starts from, before `start` or an individual call overrides anything.
 */
const taskLogSettings: TaskDisplayOptions<'taskWide'> = {
  icon: true,
  format: true,
  time: 'duration',
};

/**
 * The base display for each of the seven formats — the level every other level falls back to.
 */
const taskLogFormats: Record<'base' | TaskLogFormatName, TaskDisplayOptions<'inConfig'>> = {
  /** Used as the default for every other format below, which only override what differs. */
  base: {
    labelFormat: '[{label}] ',
    stepFormat: 'Step {step}: ',
    stepWithTotalFormat: 'Step {step} / {totalSteps}: ',
    logTimeFormat: 'HH:mm:ss ',
    durationFormat: style.reset() + '  ⏰ {taskDuration}',
  },
  task: {
    format: '{logTime}{icon} {message}',
    icon: '🚀',
    style: style.title,
  },
  action: {
    format: '{logTime}{icon} {step}{label}{message}',
    icon: '🎯',
    style: style.heading,
  },
  operation: {
    format: '  {logTime}{icon} {step}{label}{message} ',
    icon: '🔹',
    stepFormat: '[ {step} ] ',
    stepWithTotalFormat: '[ {step} / {totalSteps} ] ',
    style: style.subtle,
  },
  taskSuccess: {
    format: '{logTime}{icon} [SUCCESS] {message} {duration}',
    icon: '✅',
    style: style.success,
  },
  actionSuccess: {
    format: '{logTime}{icon} {message} {duration}\n',
    icon: '🟢',
    durationFormat: style.reset() + '(in {actionDuration})   ⏰ {taskDuration}',
    style: style.success,
  },
  operationSuccess: {
    format: '  {icon} {message} {duration}',
    icon: '☑️',
    durationFormat: style.reset() + '({operationDuration})',
    style: style.success,
  },
  error: {
    format: '{icon} [FAILED] {message} {duration}{logTime}',
    icon: '❌',
    style: style.error,
  },
};

export default {
  settings: taskLogSettings,
  formats: taskLogFormats,
};
