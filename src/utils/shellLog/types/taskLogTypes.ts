/**
 * Every option any Task Log function accepts; each function's own options type picks the subset
 * it supports, so a shared option is declared and documented exactly once.
 */
export type TaskLogOptions = {
  /**
   * Which concurrent Task this call targets. This should be
   */
  taskId?: string;

  /**
   * Deferred success note for the level this call opens, flushed at that level's next boundary.
   */
  successMessage?: string;

  /**
   * Expected step count for the targeted Task's `Step N / Total` display.
   */
  totalSteps?: number;

  /**
   * Whether this call terminates the process after printing.
   */
  exit?: boolean;

  /**
   * Raw icon override: a custom emoji to use as-is, or `false` to suppress the icon.
   */
  icon?: string | false;

  /**
   * Template override: a custom template string, or `false` to print the raw text only.
   */
  format?: string | boolean;

  /**
   * Job-wide timing mode: elapsed time (`true`, default), none (`false`), or `'logTime'`.
   */
  duration?: boolean | 'logTime';
};

/**
 * Options for `start()`, whose `totalSteps` and `duration` apply Job-wide.
 */
export type TaskLogStartOptions = Pick<
  TaskLogOptions,
  'icon' | 'format' | 'successMessage' | 'totalSteps' | 'duration'
> & {
  /** Named icon preset from `taskLogConfig.start.variants`. */
  kind?: 'create' | 'delete';
};

/**
 * Options for `do()`.
 */
export type TaskLogDoOptions = Pick<TaskLogOptions, 'icon' | 'format' | 'successMessage' | 'totalSteps' | 'taskId'>;

/**
 * Options for `step()`.
 */
export type TaskLogStepOptions = Pick<TaskLogOptions, 'icon' | 'format' | 'successMessage' | 'taskId'>;

/**
 * Warning messages for up to three levels at once; a plain string targets the Step level only.
 */
export type TaskLogFlagMessage = string | { step?: string; task?: string; job?: string };

/**
 * Options for `flag()`, which only needs to know which Task it queues against.
 */
export type TaskLogFlagOptions = Pick<TaskLogOptions, 'taskId'>;

/**
 * Options shared by the three finish functions.
 */
export type TaskLogFinishOptions = Pick<TaskLogOptions, 'icon' | 'format' | 'taskId' | 'exit'>;

/**
 * Options for `fail()`.
 */
export type TaskLogFailOptions = TaskLogFinishOptions & {
  /** Named icon preset from `taskLogConfig.fail.variants`. */
  type?: 'validation' | 'notFound';
};

/**
 * Per-call inputs the line renderer resolves against the Job-wide overrides and the config.
 */
export type TaskLogRenderOptions = Pick<TaskLogOptions, 'icon' | 'format'> & {
  /** Named icon preset (`kind`/`type`) from the call. */
  preset?: string;
  /** Pre-computed `{step}` display text. */
  step?: string;
  /** Pre-computed `{duration}` display text — unlike the option of the same name, already resolved. */
  duration?: string;
};
