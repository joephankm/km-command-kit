import type { ShellStyleFunc } from '../../shellStyle/types/styleTypes';

/**
 * [SHARED] Options that describe a task-log entry and its process.
 */
export type TaskLogOptions = {
  /**
   * Success message displayed when this task-log entry completes.
   */
  successMessage?: string;

  /**
   * Progress step for the entry.
   *
   * - `true`: advances the current step counter.
   * - `number`: uses the specified step number.
   */
  step?: number | true;

  /**
   * Total number of progress steps to display with `step`.
   */
  totalSteps?: number;

  /**
   * Display label for the process associated with the entry.
   */
  processLabel?: string;

  /**
   * Identifier for the process associated with the entry.
   * Defaults to `processLabel` and keeps concurrent processes distinct.
   */
  processKey?: string;
};

/**
 * [SHARED] Options that control how a task-log result is handled.
 */
export type TaskResultOptions = {
  /**
   * Whether to exit the process after the result is logged.
   */
  exit?: boolean;
};

/**
 * [SHARED] Options that control task-log output appearance.
 */
export type TaskDisplayOptions<Usage extends OptionUsage = 'perLine'> = {
  /**
   * Format used to render the entry.
   *
   * - `string`: uses a custom format with placeholders.
   * - `true`: uses the predefined format.
   * - `false`: prints the message without a format.
   *
   * For available placeholders, refer to
   * {@link import('../constants/taskLogConstants').TaskLogFormatPlaceholder}
   */
  format?: ConfigurableType<string, Usage, { inConfig: true; taskWide: true; perLine: true }>;

  /**
   * Icon displayed with the entry.
   *
   * - `string`: uses the supplied icon.
   * - `true`: uses the predefined icon.
   * - `false`: hides the icon.
   */
  icon?: ConfigurableType<string, Usage, { inConfig: true; taskWide: true; perLine: true }>;

  /**
   * Format used to render a process label.
   *
   * For available placeholders, refer to
   * {@link import('../constants/taskLogConstants').TaskLogLabelPlaceholder}.
   */
  labelFormat?: ConfigurableType<string, Usage, { inConfig: true }>;

  /**
   * Format used to render a progress step without a total.
   *
   * For available placeholders, refer to
   * {@link import('../constants/taskLogConstants').TaskLogStepPlaceholder}.
   */
  stepFormat?: ConfigurableType<string, Usage, { inConfig: true }>;

  /**
   * Format used to render a progress step with a total.
   *
   * For available placeholders, refer to
   * {@link import('../constants/taskLogConstants').TaskLogStepPlaceholder}.
   */
  stepWithTotalFormat?: ConfigurableType<string, Usage, { inConfig: true }>;

  /**
   * Time information displayed with the entry.
   */
  time?: ConfigurableType<TaskLogTime, Usage, { taskWide: true }, TaskLogTime>;

  /**
   * Wall-clock time format used when `time` is `'logTime'`.
   */
  logTimeFormat?: ConfigurableType<string, Usage, { inConfig: true }>;

  /**
   * Elapsed-duration format used when `time` is `'duration'`.
   *
   * For available placeholders, refer to
   * {@link import('../constants/taskLogConstants').TaskLogDurationPlaceholder}.
   */
  durationFormat?: ConfigurableType<string, Usage, { inConfig: true }>;

  /**
   * Shell style applied to the rendered entry.
   */
  style?: ConfigurableType<ShellStyleFunc, Usage, { inConfig: true }>;
};

/**
 * Resolved display options shared by a task-log run.
 */
export type TaskWideOptions = Pick<TaskDisplayOptions<'taskWide'>, 'icon' | 'format' | 'time'> &
  Pick<
    TaskDisplayOptions<'inConfig'>,
    'labelFormat' | 'stepFormat' | 'stepWithTotalFormat' | 'logTimeFormat' | 'durationFormat'
  >;

/**
 * Resolved display options used to print one task-log entry.
 */
export type PrintOptions = Omit<TaskWideOptions, 'format' | 'icon'> &
  Pick<TaskDisplayOptions<'inConfig'>, 'style'> &
  Pick<TaskDisplayOptions<'perLine'>, 'format' | 'icon'>;

/**
 * Names of the predefined task-log display formats.
 */
export type TaskLogFormatName =
  'task' | 'action' | 'operation' | 'taskSuccess' | 'actionSuccess' | 'operationSuccess' | 'error';

/**
 * Available time display modes for a task-log entry.
 */
export type TaskLogTime = 'logTime' | 'duration';

/**
 * Context in which a display option may be supplied.
 */
type OptionUsage =
  // In configuration, as the default for every task-log run.
  | 'inConfig'
  // On `start()`, for the task and all nested entries.
  | 'taskWide'
  // On one action or operation entry.
  | 'perLine';

/**
 * [UTIL] Resolves an option's allowed type for its usage context.
 */
type ConfigurableType<
  Type,
  Usage extends OptionUsage,
  Rules extends Partial<Record<OptionUsage, boolean>>,
  TaskWideType = boolean,
> = Rules[Usage] extends true
  ? Usage extends 'inConfig'
    ? Type
    : Usage extends 'taskWide'
      ? TaskWideType
      : Type | boolean
  : never;

/**
 * Options for `start()`, which begins a task-log run.
 */
export type TaskLogStartOptions = Pick<TaskLogOptions, 'successMessage' | 'processLabel'> & TaskDisplayOptions;

/**
 * Options for `doing()`, which logs an action.
 */
export type TaskLogDoingOptions = TaskLogOptions & TaskDisplayOptions;

/**
 * Options for `sub()`, which logs an operation.
 */
export type TaskLogSubOptions = TaskLogOptions & TaskDisplayOptions;

/**
 * Options for `done()`, which completes a task or process.
 */
export type TaskLogDoneOptions = TaskResultOptions &
  TaskDisplayOptions &
  Pick<TaskLogOptions, 'processLabel' | 'processKey'> & {
    /**
     * Determines how a message passed directly to `done()` is displayed.
     * When set, `true` uses success formatting and `false` uses plain output.
     */
    success?: boolean;
  };

/**
 * Options for `fail()`, which ends a task-log run with an error.
 */
export type TaskLogFailOptions = TaskResultOptions &
  TaskDisplayOptions & {
    /**
     * Custom formatter for an `Error` passed to `fail()`.
     * Return a string for the displayed message or an `Error` for default formatting.
     */
    formatError?: (error: Error) => string | Error;

    /**
     * Process exit code used when `exit` is enabled.
     *
     * @default 1
     */
    exitCode?: number;
  };
