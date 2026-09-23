---
name: shellLog
description:
  Terminal logging — a leveled logger with styled labels and an optional detail line, plus a task logger that narrates a
  run as nested actions and operations.
labels: ['shell', 'terminal', 'log', 'task']
version: 1.1.1
updated: 2026-09-23
---

# Shell Log

## Overview

`shellLog` holds two components for terminal output. It's a `shell*`-prefixed util, so it only works in a real
terminal/shell context — not portable to a browser or other JS environment.

- **Logger** (`logger`) — leveled one-off logging: `verbose`, `info`, `warn`, `error`.
- **Task Log** (`task`) — narrates one run from start to finish, with actions and operations under it, step numbers,
  held success messages, and elapsed times.

---

## Logger

- Four levels: `verbose`, `info`, `warn`, `error` — each printed via the matching `console.*` method and prefixed with a
  styled `[LEVEL]` label (via `shellStyle`).
- `verbose` is hidden by default; enable it at runtime with `configureLogger({ verbose: true })`.
- Every log call takes an optional second `detail` argument. `detail` only prints while verbose mode is on, regardless
  of level — it's for the extra context you only want when actively tracking down a problem.
- Labels line up in a fixed-width column so message text starts at the same position across levels; the column widens
  once verbose mode is on to also fit `[VERBOSE]`.
- `error` styles the entire message (and detail) in the error color, not just the label.

```ts
import { logger, configureLogger } from '@/utils/shellLog';

logger.info('Starting build');
logger.warn('Config file missing, using defaults');
logger.error('Build failed', err.message);

logger.verbose('Resolved 12 packages'); // prints nothing — verbose is off by default

configureLogger({ verbose: true });
logger.verbose('Resolved 12 packages', 'lockfile: pnpm-lock.yaml'); // now prints, detail on its own line
```

---

## Task Log

### Levels

A run nests three levels deep, each with its own line format:

| Level     | Method    | Stands for                                          |
| --------- | --------- | --------------------------------------------------- |
| Task      | `start`   | The whole run. Exactly one per run                  |
| Action    | `doing`   | A unit of work within the run — one per command     |
| Operation | `sub`     | A unit of work within an action                     |
| —         | `done`    | Ends the run, or one named process within it        |
| —         | `fail`    | Ends the run with an error, exiting the process     |

### Usage

```ts
import { task } from '@/utils/shellLog';

task.start('Release the toolkit', { successMessage: 'Toolkit released' });

task.doing('Build the bundle', { step: true, successMessage: 'Bundle built' });
task.sub('Compile the sources', { step: true, successMessage: 'Sources compiled' });
task.sub('Write the manifest', { step: true });

task.doing('Upload the bundle', { step: true, successMessage: 'Bundle uploaded' });

task.done();
```

Each call opens its level and closes the one before it: a `sub` prints the previous operation's success message, a
`doing` prints the previous action's — along with any operation still open under it — and `done` prints whatever is
left, deepest level first. A call without a `successMessage` closes silently.

### Success messages

`successMessage` is declared when a level **opens** and printed when it **closes**, in that level's success format, so
the narration reads as "doing X" first and "X succeeded" once it's actually over.

### Steps

`step: true` advances that level's counter; a number sets it explicitly. `totalSteps` sticks to the counter once given,
so `Step 2 / 5` keeps its total without repeating it. Operation counters restart with each new action.

### Concurrent processes

`processLabel` names a process on the line, and `processKey` keys its state separately (defaulting to `processLabel`) —
so two processes running at once keep their own step counters and their own held messages:

```ts
task.doing('Build the bundle', { processLabel: 'web', successMessage: 'web bundle built' });
task.doing('Build the bundle', { processLabel: 'api', successMessage: 'api bundle built' });

task.done({ processLabel: 'web' }); // ends web only, the run stays open
task.done({ processLabel: 'api' }); // last process — the run closes too
```

### Ending a run

`done` takes a message, options, both, or neither:

- `done()` — prints every held message in its level's success format.
- `done('Released 3 packages')` — the message takes the task's place. It prints in the task success format when the task
  declared a `successMessage`, and on its own, unformatted, when it didn't.
- `done(message, { success })` — settles that outright: `true` always uses the success format, `false` never does.
- `done({ exit: true })` — exits with code `0` after printing.

`fail` takes a string or an `Error`, prints it in the error format, and exits with code `1` by default:

```ts
task.fail('The bundle did not build');
task.fail(err, { exit: false }); // prints `TypeError: …`, keeps the process alive
task.fail(err, { formatError: error => `the build broke: ${error.message}`, exitCode: 2 });
```

`formatError` receives the `Error`; return a string to use as the message, or another `Error` to render with the default
`name: message` form.

### Display

Every line resolves its display in three layers — the predefined format for its level, the task-wide options, then the
call's own:

```ts
task.start('Release the toolkit', { icon: '📦' }, { time: 'logTime', icon: false });
//                                 ^ this line only   ^ the whole run
```

`start`'s third argument sets the run's options (`icon`, `format`, `time`, and the label/step/time formats) — the slot a
CLI fills from its own flags. Per call, only `format` and `icon` can be overridden: a string replaces it, `false`
switches it off, and `format: false` prints the message alone.

`time` decides what each line carries: `'logTime'` for a wall-clock timestamp, `'duration'` for elapsed time. Durations
are measured from when each level opened, and a level's line can show its own, its parent action's, and the task's.

---

## Exports (`index.ts`)

| Export            | Source                   | Description                                                                        |
| ----------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `logger`          | `logger/simpleLogger.ts` | `Record<ShellLogLevel, ShellLogFunc>` (default export) — leveled logging functions |
| `configureLogger` | `logger/simpleLogger.ts` | `(config: Partial<{ verbose: boolean }>) => void` — updates runtime config         |
| `task`            | `taskLog/taskLog.ts`     | Task logger (default export) — `start`, `doing`, `sub`, `done`, `fail`             |
| `ShellLogLevel`   | `types/logTypes.ts`      | Type: `'verbose' \| 'info' \| 'warn' \| 'error'`                                   |
| `ShellLogFunc`    | `types/logTypes.ts`      | Type: `(message: string, detail?: string) => void`                                 |

## Configuration

`configs/taskLogConfig.ts` is the file to edit after copying this util out. It exports one default object with two
parts:

- `settings` — what every run starts from: `icon`, `format`, `time`.
- `formats` — the display of each line type: `base` (the fallback for all of them), `task`, `action`, `operation`,
  `taskSuccess`, `actionSuccess`, `operationSuccess`, `error`. Each names its `format`, `icon`, `style`, and the
  sub-formats it needs.

Formats are written with `{placeholder}` tokens — `{icon}`, `{message}`, `{step}`, `{label}`, `{logTime}`, `{duration}`
on a line; `{step}`/`{totalSteps}` inside a step format; `{taskDuration}`, `{actionDuration}`, `{operationDuration}`
inside a duration format. Every name is listed as an enum in `constants/taskLogConstants.ts`.

## Folder structure

- `index.ts` — public entry point, re-exports `logger`, `configureLogger`, `task`, and the logger types.
- `types/logTypes.ts` — logger types: `ShellLogLevel`, `ShellLogFunc`.
- `types/taskLogTypes.ts` — task log types: the option shapes of each method, and the display options behind them.
- `constants/taskLogConstants.ts` — the level enum, the format/step/label/duration placeholder enums, and the patterns
  used to match them.
- `configs/taskLogConfig.ts` — the settings and line formats described above.
- `logger/simpleLogger.ts` — Logger component: builds the leveled `logger` (default export) and `configureLogger`, using
  `shellStyle` for label, message, and detail styling.
- `taskLog/taskLog.ts` — Task Log component: the five methods, the per-level state behind step counters and durations.
- `taskLog/displayOptions.ts` — holds the run's options and collapses the display cascade for one line.
- `taskLog/printers.ts` — renders and prints a line: its step, its label, and the message a closing level held.
- `taskLog/formatters.ts` — fills a format's placeholders, and renders wall-clock times and durations.
- `taskLog/messageBag.ts` — holds each level's declared message until the call that closes that level takes it back out.
