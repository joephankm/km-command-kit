/**
 * Hierarchical levels used by task logging.
 */
export enum TaskLogLevel {
  /** The task started with `start()`. */
  Task = 1,
  /** An action within a task. */
  Action = 2,
  /** An operation within an action. */
  Operation = 3,
}

/**
 * Matches placeholders in a task-log format.
 */
export const PLACEHOLDER_PATTERN = /\{(\w+)}/g;

/**
 * Matches supported tokens in a wall-clock time format.
 */
export const TIME_TOKEN_PATTERN = /YYYY|YY|MM|DD|HH|mm|ss/g;

/**
 * Placeholders available in a task-log entry format.
 */
export enum TaskLogFormatPlaceholder {
  /** Icon for the entry. */
  Icon = '{icon}',
  /** Entry message. */
  Message = '{message}',
  /** Formatted progress step. */
  Step = '{step}',
  /** Process label. */
  Label = '{label}',
  /** Wall-clock time when `time` is `'logTime'`. */
  LogTime = '{logTime}',
  /** Elapsed duration when `time` is `'duration'`. */
  Duration = '{duration}',
}

/**
 * Placeholders available in a progress-step format.
 */
export enum TaskLogStepPlaceholder {
  /** Current progress-step number. */
  Step = '{step}',
  /** Total number of progress steps. */
  TotalSteps = '{totalSteps}',
}

/**
 * Placeholders available in a process-label format.
 */
export enum TaskLogLabelPlaceholder {
  /** Process label text. */
  Label = '{label}',
}

/**
 * Placeholders available in an elapsed-duration format.
 */
export enum TaskLogDurationPlaceholder {
  /** Elapsed time for the active task. */
  TaskDuration = '{taskDuration}',
  /** Elapsed time for the active action. */
  ActionDuration = '{actionDuration}',
  /** Elapsed time for the active operation. */
  OperationDuration = '{operationDuration}',
}
