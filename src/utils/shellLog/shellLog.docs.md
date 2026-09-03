---
name: shellLog
description:
  Leveled terminal logging — styled per-level labels, aligned columns, an optional detail line, and a verbose mode
  hidden by default.
labels: ['shell', 'terminal', 'log']
version: 1.1.0
updated: 2026-08-27
---

# Shell Log

## Overview

`shellLog` is a leveled logger for short tasks/jobs. It's a `shell*`-prefixed util, so it only works in a real
terminal/shell context — not portable to a browser or other JS environment.

- Four levels: `verbose`, `info`, `warn`, `error` — each printed via the matching `console.*` method and prefixed with a
  styled `[LEVEL]` label (via `shellStyle`).
- `verbose` is hidden by default; enable it at runtime with `configureLogger({ verbose: true })`.
- Every log call takes an optional second `detail` argument. `detail` only prints while verbose mode is on, regardless
  of level — it's for the extra context you only want when actively tracking down a problem.
- Labels line up in a fixed-width column so message text starts at the same position across levels; the column widens
  once verbose mode is on to also fit `[VERBOSE]`.
- `error` styles the entire message (and detail) in the error color, not just the label.

---

## Usage

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

## Exports (`index.ts`)

| Export            | Source                   | Description                                                                        |
| ----------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `logger`          | `logger/simpleLogger.ts` | `Record<ShellLogLevel, ShellLogFunc>` (default export) — leveled logging functions |
| `configureLogger` | `logger/simpleLogger.ts` | `(config: Partial<{ verbose: boolean }>) => void` — updates runtime config         |
| `ShellLogLevel`   | `types/logTypes.ts`      | Type: `'verbose' \| 'info' \| 'warn' \| 'error'`                                   |
| `ShellLogFunc`    | `types/logTypes.ts`      | Type: `(message: string, detail?: string) => void`                                 |

## Folder structure

- `index.ts` — public entry point, re-exports `logger`, `configureLogger`, and the shared types.
- `types/logTypes.ts` — shared types: `ShellLogLevel`, `ShellLogFunc`.
- `logger/simpleLogger.ts` — Logger component: builds the leveled `logger` (default export) and `configureLogger`, using
  `shellStyle` for label, message, and detail styling.
