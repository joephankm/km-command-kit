import { style } from '../../shellStyle';
import type { ShellStyleFunc } from '../../shellStyle/types/styleTypes';

/**
 * Line types the Task Log component can print, one per `taskLog` function.
 */
export type TaskLogType = 'start' | 'do' | 'step' | 'succeed' | 'fail' | 'done' | 'flag';

/**
 * A named icon preset for a Task Log type.
 */
export type TaskLogVariant = {
  /** Emoji replacing the type's default icon. */
  icon: string;
};

/**
 * A Task Log type's full display configuration.
 */
export type TaskLogTypeConfig = {
  /** Default emoji printed as the line's prefix. */
  icon: string;
  /** Style wrapping the `{message}` placeholder. */
  style: ShellStyleFunc;
  /** The printed line's shape, built from `{icon}`/`{message}`/`{step}`/`{duration}` placeholders. */
  template: string;
  /** Named icon presets selectable per call. */
  variants?: Record<string, TaskLogVariant>;
};

/**
 * [CONFIG]: Task Log display configuration — icon, style, and line template per line type.
 */
const taskLogConfig: Record<TaskLogType, TaskLogTypeConfig> = {
  start: {
    icon: '🚀',
    style: style.title,
    template: '{icon} {message}',
    variants: { create: { icon: '➕' }, delete: { icon: '☠️' } },
  },
  do: { icon: '🔧', style: style.label, template: '{icon} {message}' },
  step: { icon: '🔹', style: style.label, template: '  {icon} Step {step}: {message}' },
  succeed: { icon: '✅', style: style.success, template: '{icon} {message}{duration}' },
  fail: {
    icon: '❌',
    style: style.error,
    template: '{icon} {message}{duration}',
    variants: { validation: { icon: '⚠️' }, notFound: { icon: '🔍' } },
  },
  done: { icon: '🏁', style: style.label, template: '{icon} {message}' },
  flag: { icon: '⚠️', style: style.warn, template: '{icon} {message}' },
};

export default taskLogConfig;
