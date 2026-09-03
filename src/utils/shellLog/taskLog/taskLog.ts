import { style } from '../../shellStyle';
import taskLogConfig from '../configs/taskLogConfig';
import type { TaskLogType } from '../configs/taskLogConfig';
import type {
  TaskLogDoOptions,
  TaskLogFailOptions,
  TaskLogFinishOptions,
  TaskLogFlagMessage,
  TaskLogFlagOptions,
  TaskLogRenderOptions,
  TaskLogStartOptions,
  TaskLogStepOptions,
} from '../types/taskLogTypes';
import logger from '../logger/simpleLogger';

/**
 * The one running Job's state.
 */
type JobState = {
  /** The Job's name, printed by `start()` and used as `succeed()`'s last-resort fallback. */
  job: string;
  /** The Job's own deferred success note, surfaced only by a Job-scoped `succeed()`. */
  pendingJobSuccessMessage?: string;
  /** Job-level warnings queued by `flag()`, flushed by a Job-scoped finish call. */
  pendingJobWarnings: Set<string>;
  /** Job start timestamp, backing the Job's total duration. */
  jobStartedAt: number;
  /** Job-wide icon override; wins over every later call's own `icon` option. */
  jobIcon?: string | false;
  /** Job-wide format override; wins over every later call's own `format` option. */
  jobFormat?: string | boolean;
  /** How Task/Step timing is reported: elapsed time (`true`), wall-clock (`'logTime'`), or none. */
  durationMode: boolean | 'logTime';
  /** `start()`'s `totalSteps`, consumed when the implicit default Task is lazily created. */
  defaultTotalSteps?: number;
};

/**
 * One tracked Task's state, keyed by its `taskId` in `taskStates`.
 */
type TaskState = {
  /** The Task's name, printed by `do()` and used as a Task-scoped fallback message. */
  task: string;
  /** The Task's own deferred success note. */
  pendingTaskSuccessMessage?: string;
  /** The current Step's deferred success note. */
  pendingStepSuccessMessage?: string;
  /** Task-level warnings queued by `flag()`. */
  pendingTaskWarnings: Set<string>;
  /** Step-level warnings queued by `flag()`. */
  pendingStepWarnings: Set<string>;
  /** How many `step()` calls this Task has narrated. */
  stepCount: number;
  /** Expected step count for `Step N / Total` display. */
  totalSteps?: number;
  /** Task start timestamp; unset until `do()` has run for this Task. */
  taskStartedAt?: number;
  /** Current Step's start timestamp; unset until `step()` has run since the last reset. */
  stepStartedAt?: number;
};

/**
 * Key under which the implicit default Task (calls with no `taskId`) is tracked.
 */
const DEFAULT_TASK_ID = '';

/**
 * The one running Job, or `undefined` when no Job has started.
 */
let jobState: JobState | undefined;

/**
 * Every in-flight Task's state, keyed by `taskId`.
 */
const taskStates = new Map<string, TaskState>();

/**
 * Resolves a `taskId` to its `TaskState`, lazily creating a fresh one on first use.
 */
const resolveTask = (taskId: string = DEFAULT_TASK_ID): TaskState => {
  const existing = taskStates.get(taskId);
  if (existing) return existing;

  const created: TaskState = {
    task: taskId === DEFAULT_TASK_ID ? (jobState?.job ?? '') : taskId,
    pendingTaskWarnings: new Set(),
    pendingStepWarnings: new Set(),
    stepCount: 0,
    totalSteps: taskId === DEFAULT_TASK_ID ? jobState?.defaultTotalSteps : undefined,
  };
  taskStates.set(taskId, created);
  return created;
};

/**
 * Renders one printable line for a type from its template, icon, and style.
 */
const renderLine = (type: TaskLogType, message: string, options: TaskLogRenderOptions = {}): string => {
  const config = taskLogConfig[type];
  const format = jobState?.jobFormat ?? options.format;
  if (format === false) return message;

  const iconOption = jobState?.jobIcon ?? options.icon;
  const icon =
    iconOption === false
      ? ''
      : (iconOption ??
        (options.preset !== undefined ? config.variants?.[options.preset]?.icon : undefined) ??
        config.icon);

  const template = typeof format === 'string' ? format : config.template;
  const values: Record<string, string | undefined> = {
    icon,
    message: config.style(message),
    step: options.step ?? '',
    duration: options.duration === undefined ? '' : style.mute(` (${options.duration})`),
  };

  // An empty value also swallows the placeholder's trailing space (e.g. a suppressed `{icon} `).
  return template.replace(/\{(\w+)}( ?)/g, (match, key: string, space: string) => {
    const value = values[key];
    if (value === undefined) return match;
    return value === '' ? '' : value + space;
  });
};

/**
 * Formats an elapsed millisecond span for display, e.g. `320ms` or `4.2s`.
 */
const elapsedText = (since: number): string => {
  const ms = Date.now() - since;
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
};

/**
 * Formats the current wall-clock time for display, e.g. `14:32:05`.
 */
const timeText = (): string => new Date().toTimeString().slice(0, 8);

/**
 * Resolves a Task's/Step's timing text per the Job's duration mode; `undefined` prints nothing.
 */
const segmentTimingText = (startedAt: number | undefined): string | undefined => {
  const mode = jobState?.durationMode ?? true;
  if (mode === false) return undefined;
  if (mode === 'logTime') return timeText();
  return startedAt === undefined ? undefined : elapsedText(startedAt);
};

/**
 * Prints one muted timing line, skipped when there's nothing to show.
 */
const printTimingLine = (text: string | undefined, label?: string): void => {
  if (text === undefined) return;
  console.log(style.mute(label === undefined ? `  ⏱ ${text}` : `  ⏱ ${label}: ${text}`));
};

/**
 * Prints every pending warning in a Set as its own flag-formatted line, then clears the Set.
 */
const flushWarnings = (warnings: Set<string>): boolean => {
  const hadWarnings = warnings.size > 0;
  for (const warning of warnings) console.warn(renderLine('flag', warning));
  warnings.clear();
  return hadWarnings;
};

/**
 * Flushes a level's pending warnings, or — only when there are none — its pending success message.
 */
const flushLevel = (warnings: Set<string>, successMessage: string | undefined): void => {
  if (flushWarnings(warnings)) return;
  if (successMessage !== undefined) console.log(renderLine('succeed', successMessage));
};

/**
 * Flushes one Task's pending warnings, Step level first.
 */
const flushTaskWarnings = (state: TaskState): void => {
  flushWarnings(state.pendingStepWarnings);
  flushWarnings(state.pendingTaskWarnings);
};

/**
 * Flushes every still-open Task's pending warnings (Step then Task), then the Job's own.
 */
const flushAllWarnings = (): void => {
  for (const state of taskStates.values()) flushTaskWarnings(state);
  if (jobState) flushWarnings(jobState.pendingJobWarnings);
};

/**
 * A Task's still-pending success messages, innermost (Step) first.
 */
const pendingTaskMessages = (state: TaskState): string[] =>
  [state.pendingStepSuccessMessage, state.pendingTaskSuccessMessage].filter(
    (message): message is string => message !== undefined
  );

/**
 * Prints each still-open Task's final timing line, then the Job's total elapsed duration.
 */
const printFinalTimings = (): void => {
  if (!jobState || jobState.durationMode === false) return;
  for (const state of taskStates.values()) {
    printTimingLine(segmentTimingText(state.stepStartedAt ?? state.taskStartedAt), state.task);
  }
  printTimingLine(elapsedText(jobState.jobStartedAt), 'Total');
};

/**
 * Task narration logger: one Job per run, nested concurrent Tasks and sequential Steps, with
 * deferred success messages, accumulative warnings, and automatic duration tracking.
 */
const taskLog = {
  /**
   * Begins the one Job: resets all state, prints the Job title line, starts the total timer.
   */
  start: (job: string, options?: TaskLogStartOptions): void => {
    jobState = {
      job,
      pendingJobSuccessMessage: options?.successMessage,
      pendingJobWarnings: new Set(),
      jobStartedAt: Date.now(),
      jobIcon: options?.icon,
      jobFormat: options?.format,
      durationMode: options?.duration ?? true,
      defaultTotalSteps: options?.totalSteps,
    };
    taskStates.clear();
    console.log(renderLine('start', job, { icon: options?.icon, format: options?.format, preset: options?.kind }));
  },

  /**
   * Begins (or restarts) a Task: flushes its previous pending output and timing, prints the new
   * task line, then replaces that Task's state with a fresh one.
   */
  do: (task: string, options?: TaskLogDoOptions): void => {
    const taskId = options?.taskId ?? DEFAULT_TASK_ID;
    const previous = taskStates.get(taskId);

    if (previous) {
      flushLevel(previous.pendingStepWarnings, previous.pendingStepSuccessMessage);
      flushLevel(previous.pendingTaskWarnings, previous.pendingTaskSuccessMessage);
    }
    printTimingLine(segmentTimingText(previous?.taskStartedAt));

    console.log(renderLine('do', task, { icon: options?.icon, format: options?.format }));

    taskStates.set(taskId, {
      task,
      pendingTaskSuccessMessage: options?.successMessage,
      pendingTaskWarnings: new Set(),
      pendingStepWarnings: new Set(),
      stepCount: 0,
      totalSteps: options?.totalSteps,
      taskStartedAt: Date.now(),
    });
  },

  /**
   * Narrates a Task's next numbered Step: flushes the previous Step's pending output and timing,
   * then prints the step line and stores its own deferred success note.
   */
  step: (step: string, options?: TaskLogStepOptions): void => {
    const state = resolveTask(options?.taskId);
    flushLevel(state.pendingStepWarnings, state.pendingStepSuccessMessage);
    printTimingLine(segmentTimingText(state.stepStartedAt));

    state.stepCount += 1;
    const stepText = state.totalSteps === undefined ? `${state.stepCount}` : `${state.stepCount} / ${state.totalSteps}`;
    console.log(renderLine('step', step, { icon: options?.icon, format: options?.format, step: stepText }));

    state.pendingStepSuccessMessage = options?.successMessage;
    state.stepStartedAt = Date.now();
  },

  /**
   * Non-terminal: queues accumulative warnings for the Step/Task/Job levels; prints nothing
   * itself — a queued warning supersedes that level's pending success message at its next flush.
   */
  flag: (message: TaskLogFlagMessage, options?: TaskLogFlagOptions): void => {
    const warnings = typeof message === 'string' ? { step: message } : message;
    const state = resolveTask(options?.taskId);
    if (warnings.step !== undefined) state.pendingStepWarnings.add(warnings.step);
    if (warnings.task !== undefined) state.pendingTaskWarnings.add(warnings.task);
    if (warnings.job !== undefined) jobState?.pendingJobWarnings.add(warnings.job);
  },

  /**
   * Terminal success: with `taskId`, ends just that Task; without, ends the whole Job — flushing
   * pending warnings first, then surfacing pending success messages (or the given `message`),
   * then the relevant duration(s). Exits with code `0` only if `exit: true`.
   */
  succeed: (message?: string, options?: TaskLogFinishOptions): void => {
    const render: TaskLogRenderOptions = { icon: options?.icon, format: options?.format };

    if (options?.taskId !== undefined) {
      const state = resolveTask(options.taskId);
      flushTaskWarnings(state);

      const messages = message !== undefined ? [message] : pendingTaskMessages(state);
      if (messages.length === 0) messages.push(state.task);
      const timing = segmentTimingText(state.stepStartedAt ?? state.taskStartedAt);
      messages.forEach((text, index) => {
        const isLast = index === messages.length - 1;
        console.log(renderLine('succeed', text, { ...render, duration: isLast ? timing : undefined }));
      });
      taskStates.delete(options.taskId);
    } else {
      if (taskStates.size > 1) {
        logger.warn(`task.succeed() was called without a taskId while ${taskStates.size} Tasks are still open`);
      }
      flushAllWarnings();

      const messages: string[] = [];
      if (message !== undefined) {
        messages.push(message);
      } else {
        for (const state of taskStates.values()) messages.push(...pendingTaskMessages(state));
        if (jobState?.pendingJobSuccessMessage !== undefined) {
          messages.push(jobState.pendingJobSuccessMessage);
        }
        if (messages.length === 0 && jobState) messages.push(jobState.job);
      }
      for (const text of messages) console.log(renderLine('succeed', text, render));

      printFinalTimings();
      taskStates.clear();
      jobState = undefined;
    }

    if (options?.exit === true) process.exit(0);
  },

  /**
   * Terminal failure: with `taskId`, ends just that Task; without, ends the whole Job — flushing
   * pending warnings first, then printing `message` (or the Task's/Job's name) with the relevant
   * duration(s); pending success messages are discarded. Exits with code `1` unless `exit: false`.
   */
  fail: (message?: string, options?: TaskLogFailOptions): void => {
    const render: TaskLogRenderOptions = {
      icon: options?.icon,
      format: options?.format,
      preset: options?.type,
    };

    if (options?.taskId !== undefined) {
      const state = resolveTask(options.taskId);
      flushTaskWarnings(state);
      const timing = segmentTimingText(state.stepStartedAt ?? state.taskStartedAt);
      console.error(renderLine('fail', message ?? state.task, { ...render, duration: timing }));
      taskStates.delete(options.taskId);
    } else {
      flushAllWarnings();
      console.error(renderLine('fail', message ?? jobState?.job ?? '', render));
      printFinalTimings();
      taskStates.clear();
      jobState = undefined;
    }

    if (options?.exit !== false) process.exit(1);
  },

  /**
   * Terminal neutral finish: with `taskId`, ends just that Task; without, ends the whole Job —
   * flushing pending warnings first, printing `message` only if given, never any duration;
   * pending success messages are discarded. Exits with code `0` only if `exit: true`.
   */
  done: (message?: string, options?: TaskLogFinishOptions): void => {
    const render: TaskLogRenderOptions = { icon: options?.icon, format: options?.format };

    if (options?.taskId !== undefined) {
      const state = resolveTask(options.taskId);
      flushTaskWarnings(state);
      if (message !== undefined) console.log(renderLine('done', message, render));
      taskStates.delete(options.taskId);
    } else {
      flushAllWarnings();
      if (message !== undefined) console.log(renderLine('done', message, render));
      taskStates.clear();
      jobState = undefined;
    }

    if (options?.exit === true) process.exit(0);
  },
};

export default taskLog;
