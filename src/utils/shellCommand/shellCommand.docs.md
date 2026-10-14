---
name: shellCommand
description:
  Command handling — reads the options and arguments a command was called with from `process.argv` and returns them in a
  typed, structured shape.
labels: ['shell', 'terminal', 'command', 'argv', 'parse']
version: 0.1.1
updated: 2026-10-14
---

# Shell Command

## Overview

`shellCommand` handles one invoked command, so a script never touches `process.argv` itself. It's a `shell*`-prefixed
util, so it only works in a real terminal/shell context — not portable to a browser or other JS environment.

- **Parse Command** (`parseCommand`) — reads the command's options and arguments from `process.argv` and returns them
  typed by the options it declares.

---

## Parse Command

```ts
import { parseCommand } from '@/utils/shellCommand';

const { options, args } = parseCommand({
  options: {
    level: { type: 'string', short: 'l', default: 'info' },
    verbose: { type: 'boolean', short: 'v' },
    tag: { type: 'string', multiple: true },
  },
});
```

---

## Exports (`index.ts`)

| Export               | Source                         | Description                                                              |
| -------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| `parseCommand`       | `parseCommand/parseCommand.ts` | `<T extends CmdParams>(params: T) => CmdParseResult<T>` (default export) |
| `CmdParams`          | `types/parseCommandTypes.ts`   | Type: `{ options: Record<string, CmdOptionDef>; argsStart?: number }`    |
| `CmdOptionDef`       | `types/parseCommandTypes.ts`   | Type: the full definition of one option — currently `CmdDefParseOptions` |
| `CmdDefParseOptions` | `types/parseCommandTypes.ts`   | Type: Node's `ParseArgsOptionDescriptor`                                 |
| `CmdParseResult`     | `types/parseCommandTypes.ts`   | Type: `{ options, args }`, typed from the `CmdParams` given              |

---

## Folder Structure

- `index.ts` — public entry point, re-exports `parseCommand` and its types.
- `types/parseCommandTypes.ts` — Parse Command types: the params, the option definition, and the result.
- `parseCommand/parseCommand.ts` — Parse Command component: slices `process.argv`, runs `parseArgs`, remaps the result.
