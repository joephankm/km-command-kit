import { TaskLogLevel } from '../constants/taskLogConstants';
import type {
  TaskLogDoingOptions,
  TaskLogDoneOptions,
  TaskLogFailOptions,
  TaskLogOptions,
  TaskLogStartOptions,
  TaskLogSubOptions,
  TaskWideOptions,
} from '../types/taskLogTypes';
import { isDurationTime, resolveDisplayOptions, setTaskWideOptions } from './displayOptions';
import { labelText, printLine, printMessage, stepText } from './printers';
import messageBag, { MessageItem } from './messageBag';

/**
 * Identifies the state associated with a task, action, or operation.
 */
export type StateKey = TaskLogLevel | string;

/**
 * Mutable state maintained for one log level and process.
 */
export type ProcessState = {
  /**
   * Most recently logged step number.
   */
  currStep?: number;

  /**
   * Expected number of steps, used when rendering progress with a total.
   */
  stepTotals?: number;

  /**
   * Monotonic timestamp at which this level began, retained only when duration logging is enabled.
   */
  startTime?: number;
};

/**
 * States for the current task run, indexed by level and optional process key.
 */
let processStates: Partial<Record<StateKey, ProcessState>> = {};

/**
 * Resolves the process identifier for an entry, preferring its explicit key over its display label.
 */
const getProcessKey = (options?: Pick<TaskLogOptions, 'processLabel' | 'processKey'>): string | undefined =>
  options?.processKey ?? options?.processLabel;

/**
 * Produces a state key for a log level and optional process, keeping process state independent.
 */
const stateKeyOf = (level: TaskLogLevel, labelKey?: string): StateKey => (labelKey ? `${level}:${labelKey}` : level);

/**
 * Gets the state for a level and process, creating an empty state when none exists.
 */
const getProcessState = (processKey: StateKey): ProcessState => (processStates[processKey] ??= {});

/**
 * Calculates elapsed durations for active levels up to the requested level.
 */
const getDurations = (level: number, processKey?: string): Record<string, number> => {
  const now = performance.now();
  const durations: Record<string, number> = {};
  const levelStates: [name: string, level: number, stateKey: StateKey][] = [
    ['taskDuration', TaskLogLevel.Task, stateKeyOf(TaskLogLevel.Task)],
    ['actionDuration', TaskLogLevel.Action, stateKeyOf(TaskLogLevel.Action, processKey)],
    ['operationDuration', TaskLogLevel.Operation, stateKeyOf(TaskLogLevel.Operation, processKey)],
  ];

  levelStates.forEach(([name, durationLevel, stateKey]) => {
    const startTime = processStates[stateKey]?.startTime;

    if (durationLevel <= level && startTime !== undefined) durations[name] = now - startTime;
  });

  return durations;
};

/**
 * Queues a success message until the corresponding log level is closed.
 */
const pushMessage = (
  successMessage: string,
  level: TaskLogLevel,
  options?: Pick<TaskLogOptions, 'processKey' | 'processLabel'>
): void => {
  messageBag.add(successMessage, 'success', level, getProcessKey(options));
};

/**
 * Converts an error into its printable message, allowing callers to supply a custom formatter.
 */
const errorMessage = (error: Error, formatError?: TaskLogFailOptions['formatError']): string => {
  if (formatError) {
    const formatted = formatError(error);
    if (typeof formatted === 'string') return formatted;

    error = formatted;
  }

  return `${error.name}: ${error.message}`;
};

/**
 * Supported `done` call signatures: a completion message, options, both, or neither.
 */
type DoneFunc = {
  (message?: string, options?: TaskLogDoneOptions): void;
  (options?: TaskLogDoneOptions): void;
};

/**
 * Logs the lifecycle of a task, including nested actions and operations.
 */
const taskLog = {
  /**
   * Starts a task run, prints its title, and applies task-wide display options to later entries.
   */
  start(task: string, options?: TaskLogStartOptions, taskWideOptions?: Partial<TaskWideOptions>): void {
    setTaskWideOptions(taskWideOptions);

    if (options?.successMessage) pushMessage(options.successMessage, TaskLogLevel.Task, options);

    const printOptions = resolveDisplayOptions('task', options);

    if (printOptions.time === 'duration') getProcessState(stateKeyOf(TaskLogLevel.Task)).startTime = performance.now();

    printLine(task, printOptions);
  },

  /**
   * Starts and prints an action within the active task.
   */
  doing(action: string, options?: TaskLogDoingOptions): void {
    const processKey = getProcessKey(options);

    messageBag
      .popAll({ level: TaskLogLevel.Action, trackId: processKey })
      .forEach(messageItem =>
        printMessage(
          messageItem,
          isDurationTime() ? getDurations(messageItem[2] ?? TaskLogLevel.Action, processKey) : undefined
        )
      );

    const lastOperationKey = stateKeyOf(TaskLogLevel.Operation, processKey);
    if (processStates[lastOperationKey]) delete processStates[lastOperationKey];

    const processState = getProcessState(stateKeyOf(TaskLogLevel.Action, processKey));
    const printOptions = resolveDisplayOptions('action', options);

    if (printOptions.time === 'duration') processState.startTime = performance.now();
    if (options?.successMessage) pushMessage(options?.successMessage, TaskLogLevel.Action, options);

    printLine(action, printOptions, {
      step: options?.step ? stepText(options.step, printOptions, processState, options) : undefined,
      label: options?.processLabel ? labelText(options.processLabel, printOptions) : undefined,
    });
  },

  /**
   * Starts and prints an operation within the current action.
   */
  sub(operation: string, options?: TaskLogSubOptions): void {
    const lastMessageItem = messageBag.pop({ level: TaskLogLevel.Operation, trackId: getProcessKey(options) });
    if (lastMessageItem) {
      const durations = isDurationTime() ? getDurations(TaskLogLevel.Operation, getProcessKey(options)) : undefined;

      printMessage(lastMessageItem, durations);
    }

    const processState = getProcessState(stateKeyOf(TaskLogLevel.Operation, getProcessKey(options)));
    const printOptions = resolveDisplayOptions('operation', options);

    if (printOptions.time === 'duration') processState.startTime = performance.now();
    if (options?.successMessage) pushMessage(options.successMessage, TaskLogLevel.Operation, options);

    printLine(operation, printOptions, {
      step: options?.step ? stepText(options.step, printOptions, processState, options) : undefined,
      label: options?.processLabel ? labelText(options.processLabel, printOptions) : undefined,
    });
  },

  /**
   * Completes the active task or a named process.
   */
  done: ((messageOrOptions?: string | TaskLogDoneOptions, doneOptions?: TaskLogDoneOptions) => {
    const message = typeof messageOrOptions === 'string' ? messageOrOptions : undefined;
    const options = typeof messageOrOptions === 'string' ? doneOptions : messageOrOptions;
    const processKey = getProcessKey(options);

    if (processKey) {
      messageBag
        .popAll({ level: TaskLogLevel.Action, trackId: processKey })
        .forEach(messageItem =>
          printMessage(
            messageItem,
            isDurationTime() ? getDurations(messageItem[2] ?? TaskLogLevel.Task, processKey) : undefined
          )
        );

      delete processStates[stateKeyOf(TaskLogLevel.Action, processKey)];
      delete processStates[stateKeyOf(TaskLogLevel.Operation, processKey)];

      if (Object.keys(processStates).some(processKey => processKey.includes(':'))) return;
    }

    let messageItems: (MessageItem | string)[] = messageBag.popAll();

    if (message) {
      if (options?.success !== undefined) {
        messageItems = [options.success ? ['success', [message], TaskLogLevel.Task] : message];
      } else {
        const taskMessage = messageItems.find(([, , level]) => level === TaskLogLevel.Task);

        if (taskMessage) (taskMessage as MessageItem)[1] = [message];
        else messageItems.unshift(message);
      }
    }

    messageItems.forEach(messageItem =>
      Array.isArray(messageItem)
        ? printMessage(
            messageItem,
            isDurationTime() ? getDurations(messageItem[2]) : undefined,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
            messageItem[2] === TaskLogLevel.Task ? options : undefined
          )
        : console.log(messageItem)
    );

    if (options?.exit) {
      process.exit(0);
    } else {
      processStates = {};
    }
  }) as DoneFunc,

  /**
   * Ends the task log with an error message.
   */
  fail(error: string | Error, options?: TaskLogFailOptions): void {
    const message = typeof error === 'string' ? error : errorMessage(error, options?.formatError);

    printMessage(
      ['error', [message], TaskLogLevel.Task],
      isDurationTime() ? getDurations(TaskLogLevel.Operation) : undefined,
      options
    );

    if (options?.exit ?? true) {
      process.exit(options?.exitCode ?? 1);
    } else {
      messageBag.popAll();
      processStates = {};
    }
  },
};

export default taskLog;
