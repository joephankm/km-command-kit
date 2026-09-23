/**
 * Severity of a task-log message.
 */
export type MessageType = 'success' | 'warning' | 'error';

/**
 * Identifier for a group of pending task-log messages.
 */
type MessageKey = number | string;

/**
 * Pending messages grouped by severity.
 */
type MessagesObj = Partial<Record<MessageType, Set<string>>>;

/**
 * Pending messages for the current task log.
 */
const messagesState = new Map<MessageKey, MessagesObj>();

/**
 * Default grouping identifier for messages without an assigned level.
 */
let autoLevel = 0;

/**
 * Creates the identifier used to group pending messages.
 */
const keyOf = (level: number, trackId?: string): MessageKey => (trackId ? `${level}:${trackId ?? ''}` : level);

/**
 * Retrieves grouping information from a message identifier.
 */
const keySplit = (key: MessageKey): [level: number, traceId?: string] => {
  if (typeof key === 'number') {
    return [key];
  }

  const [level, tractId] = key.split(':');
  return [Number(level), tractId];
};

/**
 * A collected task-log message group.
 */
export type MessageItem = [type: MessageType, messages: string[], level: number];

/**
 * Selection preference for collected messages.
 *
 * - `MessageType`: selects messages with that exact severity.
 * - `'errorFirst'`: selects one severity only, preferring errors, then warnings, then successes.
 */
export type TakeStrategy = MessageType | 'errorFirst';

/**
 * Criteria used to select pending task-log messages.
 */
export type PopOptions = {
  /** Task-log level to select. */
  level?: number;
  /** Optional process identifier to select. */
  trackId?: string;
  /** Preferred message severity to select. */
  take?: TakeStrategy;
};

/**
 * Severity order used by the default selection preference.
 */
const ERROR_FIRST_ORDER: MessageType[] = ['error', 'warning', 'success'];

/**
 * Collects pending messages for one group.
 */
const takeMessage = (key: MessageKey, strategy: TakeStrategy = 'errorFirst'): MessageItem | undefined => {
  const messagesObj = messagesState.get(key);

  if (messagesObj) messagesState.delete(key);
  if (messagesState.size === 0) autoLevel = 0;
  if (messagesObj === undefined) return undefined;

  const messageType = strategy === 'errorFirst' ? ERROR_FIRST_ORDER.find(type => messagesObj[type]?.size) : strategy;

  if (messageType === undefined) return undefined;

  const [level] = keySplit(key);
  const typeMessages = messagesObj[messageType];

  return typeMessages?.size ? [messageType, [...typeMessages], level] : undefined;
};

/**
 * Stores pending task-log messages until they are collected for output.
 */
export default {
  /**
   * Adds a message to the pending task log.
   */
  add(message: string, messageType: MessageType, level?: number, trackId?: string): void {
    const key = keyOf(level ?? autoLevel++, trackId);
    const levelMessages = messagesState.get(key) ?? {};

    levelMessages[messageType] = (levelMessages[messageType] ?? new Set()).add(message);
    messagesState.set(key, levelMessages);
  },

  /**
   * Collects one pending message group.
   */
  pop(levelOrOptions: number | PopOptions = {}): MessageItem | undefined {
    const { level, trackId, take } = typeof levelOrOptions === 'number' ? { level: levelOrOptions } : levelOrOptions;
    const key = level !== undefined ? keyOf(level, trackId) : [...messagesState.keys()].pop();

    return key === undefined ? undefined : takeMessage(key, take);
  },

  /**
   * Collects all pending message groups matching the supplied criteria.
   */
  popAll(options: number | PopOptions = {}): MessageItem[] {
    const { level = 0, trackId, take } = typeof options === 'number' ? { level: options } : options;
    const returnMessages: MessageItem[] = [];

    messagesState.forEach((message, key) => {
      const [keyLevel, keyTraceId] = keySplit(key);
      if (keyLevel >= level && keyTraceId === trackId) {
        const popped = takeMessage(key, take);

        if (popped) returnMessages.push(popped);
      }
    });

    return returnMessages.reverse();
  },
};
