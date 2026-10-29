---
name: shellLog
description:
  Terminal logging — a leveled logger with styled labels and an optional detail line, a task logger that narrates a run
  as nested actions and operations, and a doc logger that prints titles, text, lists, columns and definition lists.
labels: ['shell', 'terminal', 'log', 'task', 'doc']
version: 1.3.1
updated: 2026-10-29
---

# Shell Log

## Overview

`shellLog` holds three components for terminal output. It's a `shell*`-prefixed util, so it only works in a real
terminal/shell context — not portable to a browser or other JS environment.

- **Logger** (`logger`) — leveled one-off logging: `verbose`, `info`, `warn`, `error`.
- **Task Log** (`task`) — narrates one run from start to finish, with actions and operations under it, step numbers,
  held success messages, and elapsed times.
- **Doc Log** (`docLog`) — document-style output: titles, body text, nested lists, columns, definition lists, and
  dividers, laid out within a width.

**Dependencies**

- `shellStyle` — every label, message, and border this util prints is styled through it.

Copy both folders as siblings, so the relative imports between them keep working:

```sh
cp -R src/utils/shellLog src/utils/shellStyle <target-project>/src/utils/
```

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

### Success Messages

`successMessage` is declared when a level **opens** and printed when it **closes**, in that level's success format, so
the narration reads as "doing X" first and "X succeeded" once it's actually over.

### Steps

`step: true` advances that level's counter; a number sets it explicitly. `totalSteps` sticks to the counter once given,
so `Step 2 / 5` keeps its total without repeating it. Operation counters restart with each new action.

### Concurrent Processes

`processLabel` names a process on the line, and `processKey` keys its state separately (defaulting to `processLabel`) —
so two processes running at once keep their own step counters and their own held messages:

```ts
task.doing('Build the bundle', { processLabel: 'web', successMessage: 'web bundle built' });
task.doing('Build the bundle', { processLabel: 'api', successMessage: 'api bundle built' });

task.done({ processLabel: 'web' }); // ends web only, the run stays open
task.done({ processLabel: 'api' }); // last process — the run closes too
```

### Ending a Run

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

## Doc Log

`docLog` creates an instance that prints document-style terminal output: titles, body paragraphs, nested lists,
columns, definition lists, and dividers. Instance options override the configured defaults; method options customize individual blocks. The methods
print directly with `console.log` and return no formatted text.

```ts
import { docLog } from '@/utils/shellLog';

const doc = docLog({ width: 40 });

doc.title('Command Kit', 'docTitle');
doc.title('Install', { variant: 'title', numbered: true });
doc.body('Download the kit, then run it from the root of your project.');
doc.list(['Download', { text: 'Configure', items: ['Set the token', 'Pick a region'] }, 'Run']);
doc.title('Usage', { variant: 'title', numbered: true, dividerBefore: true });
doc.list(['Build', 'Test', 'Release'], { numbered: true });
```

```
Command Kit

I. Install
────────────────────────────────────────

Download the kit, then run it from the
root of your project.

• Download
• Configure
  ◦ Set the token
  ◦ Pick a region
• Run

────────────────────────────────────────

II. Usage
────────────────────────────────────────

1. Build
2. Test
3. Release
```

`docLog()` uses the configured defaults. The default width is `80` columns, with one blank line between blocks. Instance
options replace their matching top-level settings; `styles` is merged by name, while supplying `titles` replaces the
title-variant map.

### Methods

| Method                        | Description                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `title(text, variant)`        | Prints a title variant; pass its name or an options object with `variant`      |
| `body(text, options?)`        | Prints text wrapped to the width; line breaks in the input separate paragraphs |
| `list(items, options?)`       | Prints a bulleted or numbered list, including nested items                     |
| `columns(contents, options?)` | Prints content in columns without borders, sharing the configured width        |
| `definitions(items, options?)`| Prints a definition list: every label shown with its content                   |
| `divider(options?)`           | Prints a divider across the configured width                                   |

**Titles.** Each entry in `titles` sets a variant's style and may set a `numberMarker` such as `['upperRoman', '.']`,
`underline`, and `lineFill`. Numbering is off unless the call sets `numbered: true`; numbering requires a marker, and
each variant keeps its own counter. `underline` on the call overrides the variant setting. An underline is printed
only when `width` is set.

**Lists.** An item can be a string or an object with `text`, nested `items`, or both. Each level gets its marker from
`bulletListType` or `numberedListType`, and its indentation from `listIndents`. Markers and numbering patterns repeat
when nesting goes deeper than the configured pattern. A top-level item can set `level` to continue at a chosen depth
after other content:

```ts
doc.list(['Install', { text: 'Configure', items: ['Set the token'] }]);
doc.body('A note between.');
doc.list([{ text: 'Pick a region', level: 2 }, 'Run']);
```

Numbers are right-aligned to the widest number at their level. Each list level starts counting from `1`.

**Columns.** `contents` is one row as a `string[]`, or a block of rows as a `string[][]`; `null` is an empty cell. The
columns share the instance's `width`: every column but the last is as wide as its widest content, and the last takes
what remains, wrapping a cell that is wider. `columnGap` sets the blank columns between every two columns, `2` by
default; a call's `gap` takes its place. A call's `width` sets each column's width by position instead, and `ellipsis`
cuts a wide cell instead of wrapping it:

```ts
doc.columns([
  ['-o', '--output', 'Write the result to the given file path'],
  [null, '--verbose', 'Show more detail'],
]);
```

```
-o  --output   Write the result to the
               given file path
    --verbose  Show more detail
```

**Definitions.** Each item is `{ label, content }`, where `content` is one paragraph or an array of them. `layout` picks
how each label sits with its content: `'stacked'`, the label on its own line with its content below; `'aligned'`, the
label in a column with its content beside it; or `'inline'`, the label and its content on one line. `marker` leads each
item, as a mark such as `'•'` or a `[numberType, marker]` pair to number them:

```ts
doc.definitions([
  { label: 'output', content: 'Write the result to the given file path' },
  { label: 'verbose', content: ['Show more detail.', 'Repeat it for more.'] },
]);
doc.definitions([{ label: 'Usage', content: 'kit build [--watch]' }], { layout: 'inline' });
```

```
output
  Write the result to the given file
  path

verbose
  Show more detail.
  Repeat it for more.

Usage — kit build [--watch]
```

`definitionLayouts` holds the layout used when a call gives none, as `default`, and every option of each layout:
`stacked`, `aligned`, and `inline`. A call's `stackedOptions`, `alignedOptions`, or `inlineOptions` is laid over its
layout's entry option by option, so a call gives only what it changes and takes the rest from the instance:

```ts
doc.definitions(items, { stackedOptions: { labelSuffix: ':' } }); // keeps the configured `contentIndent`
```

The `'aligned'` layout does not yet apply `marker`, `width`, `indent`, or `rightIndent`: its content shows as it is,
without wrapping.

### Spacing

`spacing` sets the blank lines between blocks and defaults to `1`. A block's `spaceBefore` or `spaceAfter` overrides the
spacing on that side. Body paragraphs are separated by one blank line. `spaceAfter` is supported by body, list,
columns, definitions, and divider; titles only accept `spaceBefore`.

### Styles

`styles` maps names to a preset name or a list of style code names. `default` is applied to body text. `divider` styles
dividers, falling back to `default` when it is absent. Titles use the style configured on their variant:

```ts
const doc = docLog({ styles: { default: 'mute', note: ['italic'] } });

doc.body('Muted text.');
doc.body('An aside.', { style: 'note' });
```

Configured styles are prepared when the instance is created. `body`, `columns`, `definitions`, and `divider` calls accept
`style` to override their configured style with a preset name or an array of style code names. `columns` and
`definitions` use `default` otherwise.

### Options

| Option             | Type                                         | Used by                            | Description                                                        |
| ------------------ |----------------------------------------------| ---------------------------------- |--------------------------------------------------------------------|
| `width`            | number                                       | `docLog`                           | Width used to wrap content and draw dividers                       |
| `padding`          | `'left'`, `'right'` or `true`                | `docLog`                           | Adds spaces outside content on the selected side(s)                |
| `paddingSize`      | number                                       | `docLog`                           | Number of padding spaces; defaults to `1`                          |
| `justifyContent`   | boolean                                      | `docLog`                           | Justifies blocks unless a call sets `align`; defaults to `false`   |
| `spacing`          | number                                       | `docLog`                           | Blank lines between blocks; defaults to `1`                        |
| `styles`           | record of name to style                      | `docLog`                           | Named styles, merged over the configured styles                    |
| `titles`           | record of variant to title settings          | `docLog`                           | Style, numbering, and underline settings for each title variant    |
| `bulletListType`   | `'disc'` or `'geometric'`                    | `docLog`                           | Bulleted marker pattern by nesting level                           |
| `numberedListType` | `'decimal'` or `'outline'`                   | `docLog`                           | Number format and marker pattern by nesting level                  |
| `listIndents`      | number[]                                     | `docLog`                           | Starting column for each level; deeper levels reuse the last value |
| `dividerFill`      | string                                       | `docLog`                           | Character repeated across dividers; defaults to `'─'`              |
| `columnGap`        | number                                       | `docLog`                           | Blank columns between every two columns; defaults to `2`           |
| `definitionLayouts` | `default` layout, and `stacked`, `aligned`, `inline` options | `docLog`         | The layout used when a call gives none, and each layout's options  |
| `numbered`         | boolean                                      | `title`, `list`                    | Numbers titles or list items                                       |
| `dividerBefore`    | boolean                                      | `title`                            | Prints a divider before the title                                  |
| `underline`        | boolean                                      | `title`                            | Overrides the variant underline setting                            |
| `align`            | `'left'`, `'center'`, `'right'`, `'justify'` | `title`, `body`, `list`, `definitions` | Alignment within the configured width                          |
| `align`            | one alignment, or a record by column position | `columns`                         | Alignment of every column, or of each column by position           |
| `width`            | record of column position to `ColumnWidth`   | `columns`                          | Each column's exact width or `{ min, max }`, in place of `width`   |
| `gap`              | number, or a record by column position       | `columns`                          | Blank columns after each column, overriding `columnGap`            |
| `ellipsis`         | string or `true`                             | `columns`                          | Cuts a cell wider than its column instead of wrapping it           |
| `layout`           | `'stacked'`, `'aligned'` or `'inline'`       | `definitions`                      | Layout of this list, overriding `definitionLayouts.default`        |
| `marker`           | string, or `[numberType, marker]`            | `definitions`                      | Mark or number leading each item                                   |
| `stackedOptions`   | stacked layout options                       | `definitions`                      | Laid over `definitionLayouts.stacked`, option by option            |
| `alignedOptions`   | aligned layout options                       | `definitions`                      | Laid over `definitionLayouts.aligned`, option by option            |
| `inlineOptions`    | inline layout options                        | `definitions`                      | Laid over `definitionLayouts.inline`, option by option             |
| `style`            | style name or code names                     | `body`, `columns`, `definitions`, `divider` | Per-call style override                                   |
| `spaceBefore`      | number                                       | every method                       | Blank lines before this block, overriding `spacing`                |
| `spaceAfter`       | number                                       | every method but `title`           | Blank lines after this block, overriding `spacing`                 |
| `fill`             | string                                       | `divider`                          | Character used for this divider, overriding `dividerFill`          |

**Width matters for lists:** list markers and indentation are added by the markup formatter only when an instance has a
`width`. Keep a width configured if you want formatted list output.

---

## Exports (`index.ts`)

| Export            | Source                   | Description                                                                        |
| ----------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `logger`          | `logger/simpleLogger.ts` | `Record<ShellLogLevel, ShellLogFunc>` (default export) — leveled logging functions |
| `configureLogger` | `logger/simpleLogger.ts` | `(config: Partial<{ verbose: boolean }>) => void` — updates runtime config         |
| `task`            | `taskLog/taskLog.ts`     | Task logger (default export) — `start`, `doing`, `sub`, `done`, `fail`             |
| `docLog`          | `docLog/docLog.ts`       | Doc logger factory (default export) — returns `title`, `body`, `list`, `columns`, `definitions`, `divider` |
| `ShellLogLevel`   | `types/logTypes.ts`      | Type: `'verbose' \| 'info' \| 'warn' \| 'error'`                                   |
| `ShellLogFunc`    | `types/logTypes.ts`      | Type: `(message: string, detail?: string) => void`                                 |

---

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

`configs/docLogConfig.ts` holds the Doc Log's three parts:

- `settings` — what every doc log instance starts from: every option in the Doc Log's options table above.
- `bulletListStyles` — each bulleted list style's markers by level (`disc`, `geometric`), repeated from the first past
  the last. A new set is added here, and its name to `BulletListType` in the same file.
- `numberedListStyles` — each numbered list style's `[numberType, marker]` pairs by level (`decimal`, `outline`),
  repeated the same way, with its name in `NumberedListType`.

---

## Folder Structure

- `index.ts` — public entry point, re-exports `logger`, `configureLogger`, `task`, `docLog`, and the logger types.
- `types/logTypes.ts` — logger types: `ShellLogLevel`, `ShellLogFunc`.
- `types/taskLogTypes.ts` — task log types: the option shapes of each method, and the display options behind them.
- `types/docLogTypes.ts` — doc log types: its settings, each method's options, title variants and list items.
- `constants/taskLogConstants.ts` — the level enum, the format/step/label/duration placeholder enums, and the patterns
  used to match them.
- `constants/docLogConstants.ts` — list markers and number types for each list level.
- `configs/taskLogConfig.ts` — the settings and line formats described above.
- `configs/docLogConfig.ts` — the Doc Log's settings and its bulleted and numbered list styles.
- `logger/` — the Logger component: the leveled `logger` and `configureLogger`.
- `taskLog/` — the Task Log component: one run narrated as nested actions and operations, with the display options,
  printing and formatting behind each line.
- `docLog/` — the Doc Log component: `docLog.ts` creates an instance, and each `build*.ts` file builds one of its
  methods.
- `common/` — general-purpose helpers not tied to this util, such as reading an argument given as a value or as a full
  params object.

---

## Todo List

- **Component:** Template Logger **[🟢 High]**\
  _(Builds a logger from a template, so a project generates the logger its own output needs instead of writing one)_
- **Component:** Debugger Log **[🔹 Low]**\
  _(Logging meant for development only, never for what a command prints in normal use)_
