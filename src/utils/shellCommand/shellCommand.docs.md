---
name: shellCommand
description:
  Command handling — reads the options and arguments a command was called with from `process.argv`, prints its help
  manual on `--help`, and tells how the current run was launched.
labels: ['shell', 'terminal', 'command', 'argv', 'parse', 'manual', 'meta']
version: 1.0.0
updated: 2026-11-02
---

# Shell Command

## Overview

`shellCommand` handles one invoked command, so a script never touches `process.argv` itself. It's a `shell*`-prefixed
util, so it only works in a real terminal/shell context — not portable to a browser or other JS environment.

- **Parse Command** (`parseCommand`) — reads the command's options and arguments from `process.argv` and returns them
  typed by what it declares. With a `manual`, it prints the help manual on `--help` and exits.
- **Manual Log** (`manualLog`) — prints a command's help manual, section by section. `parseCommand` uses it for
  `--help`; it can also be used directly.
- **Env Meta** (`envMeta`) — the facts about the current run: how it was launched, the commands that call it again, and
  runtime and server info. Useful for a one-time command and a long-running server alike.

---

## Parse Command

```ts
import { parseCommand } from '@/utils/shellCommand';

const { options, args, positionals } = parseCommand({
  options: [
    {
      title: 'Container Options',
      items: {
        detach: { type: 'boolean', short: 'd', description: 'Run the container in the background' },
        name: { type: 'string', description: 'Assign a name to the container' },
      },
    },
  ],
  args: {
    image: { type: 'string', position: 0, description: 'The image to run' },
    command: { type: 'string', position: 1, description: 'The command to run in the container' },
  },
  manual: {
    description: 'Create and run a new container from an image.',
    usages: '[OPTIONS] <image> [command]',
    examples: [{ label: 'Detached', example: '-d nginx' }],
  },
});

// `-d --name web nginx sh` gives:
// options      { detach: true, name: 'web' }
// args         { image: 'nginx', command: 'sh' }
// positionals  ['nginx', 'sh']
```

### Params (`CmdParams`)

| Property    | Type                                                                                         | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `options`   | `Record<string, CmdOptionDef>` or `{ title: string; items: Record<string, CmdOptionDef> }[]` | The options, keyed by their long name — flat, or in titled groups for the manual |
| `args`      | `Record<string, CmdArgumentDef>`                                                             | The arguments, keyed by their name                                               |
| `argsStart` | `number`                                                                                     | The index in `process.argv` where parsing begins. Defaults to `2`                |
| `manual`    | `{ description?, command?, usages?, examples?, definitions? }`                               | What the help manual shows, besides the options and arguments                    |

Grouping options only changes the manual: the parsed `options` always come back flat.

### Definitions

An option (`CmdOptionDef`) is Node's `ParseArgsOptionDescriptor` plus a `description`. An argument (`CmdArgumentDef`)
takes the same `type`, `default` and `description`, and reads from the positionals in one of three ways:

| Argument setting             | Reads                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `position`                   | The positional at that zero-based index                                                                               |
| `fromPosition`, `toPosition` | Every positional in that range, as an array. `toPosition` is excluded, and a negative number counts back from the end |
| Neither                      | The next free positional, in the order the arguments are declared                                                     |

A value is a `string` or `boolean` by its `type`, an array when it takes several values, and `undefined` when it's
missing and has no `default`. A range argument's `default` must be an array, and it can't also set `position` — both
throw a `TypeError`.

### Result (`CmdParseResult`)

| Property      | Description                                                              |
| ------------- | ------------------------------------------------------------------------ |
| `options`     | The parsed options, keyed by their long name                             |
| `args`        | The parsed arguments, keyed by their name — only when `args` is declared |
| `positionals` | The raw arguments, in the order they were given                          |

### Help Manual (`--help`)

When the input contains `--help`, `parseCommand` prints the manual and exits with code `0`, with or without `manual`.
The manual's options and arguments come from `options` and `args`, so they are never repeated in `manual`. With no
`manual`, it still shows a generated usage line and the options and arguments.

| `manual` Property | Description                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `description`     | What the command does                                                                                       |
| `command`         | The base command each usage and example is joined to. Defaults to `envMeta.command()`; `false` turns it off |
| `usages`          | The forms of a call: one string, a list, or a list of `{ label, usage }`                                    |
| `examples`        | Sample calls: one string, a list, or a list of `{ label, example }`                                         |
| `definitions`     | Extra blocks, each `{ label, content }`                                                                     |

How `command` and `usages` make the Usages section — the Examples section joins `command` to `examples` the same way,
and is left out when there are no `examples`:

| `command` | `usages` | Usages shown                                                                                       |
| --------- | -------- | -------------------------------------------------------------------------------------------------- |
| None      | Given    | Each usage as it is, a full call                                                                   |
| Given     | Given    | `command`, a space, then each usage                                                                |
| Given     | None     | `command`, then `[ARGUMENTS]` when `args` is declared, then `[OPTIONS]` when `options` is declared |

With `command` left out, the manual follows how the script was launched:

| Launched with                 | Usage shown                                        |
| ----------------------------- | -------------------------------------------------- |
| `pnpm smoke --help`           | `pnpm run smoke [OPTIONS] <image> [command]`       |
| `tsx scripts/smoke.ts --help` | `tsx scripts/smoke.ts [OPTIONS] <image> [command]` |

**Gotcha — npm and options.** `npm run <script> -d` takes `-d` as npm's own flag, so the script never receives it; npm
needs `npm run <script> -- -d`. pnpm passes it through. A generated `npm run …` usage doesn't add the `--`, so set
`command` yourself for npm users who pass options.

---

## Env Meta

```ts
import envMeta from '@/utils/shellCommand/envMeta/envMeta';
import { RunLevel } from '@/utils/shellCommand/envMeta/constants';

if (envMeta.level() === RunLevel.Package) {
  console.log(`Run again with: ${envMeta.command()}`); // pnpm run smoke
}
```

Every function takes no input. Each value is worked out on its function's first call and kept for the rest of the run,
except where noted.

| Function           | Returns                                                                                                          | Example                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `level()`          | `RunLevel.Package` while a `package.json` script runs, `RunLevel.Direct` otherwise                               | `RunLevel.Package`       |
| `runner()`         | The program that really runs the script: `tsx`, `ts-node`, or the name of the Node binary                        | `'tsx'`                  |
| `packageManager()` | The package manager the current folder's `package.json` names, or else the one that launched the run             | `'pnpm'`                 |
| `directCommand()`  | The runner and the script's path, from where the call was made                                                   | `'tsx scripts/smoke.ts'` |
| `packageCommand()` | The package manager, `run` and the running script's name; `undefined` when no script is running                  | `'pnpm run smoke'`       |
| `command()`        | `packageCommand()` at the Package level, `directCommand()` at the Direct level                                   | `'pnpm run smoke'`       |
| `runType()`        | `RunType.Server` while the run listens on a TCP port, `RunType.Job` otherwise                                    | `RunType.Job`            |
| `runtimeInfo()`    | `nodeVersion`, `platform`, `pid`, `hostname`, and `uptime` (seconds) and `memory` (RSS bytes), read on each call | See below                |
| `serverInfo()`     | `ip`, plus `host`, `port`, `tls` and `keepAliveTimeout` (HTTP/HTTPS only) while a server listens                 | See below                |

```ts
envMeta.runtimeInfo();
// { nodeVersion: 'v24.18.1', platform: 'macOS (arm64)', pid: 63597, hostname: 'Mac', uptime: 0.07, memory: 85688320 }

app.listen(3000, () => {
  console.log(envMeta.serverInfo());
  // { ip: '192.168.1.10', host: '::', port: 3000, tls: false, keepAliveTimeout: 5000 }
});
```

### Enums (`envMeta/constants.ts`)

| Enum       | Values                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------- |
| `RunLevel` | `Direct` (`0`) — the script file is run directly; `Package` (`1`) — a package manager runs it |
| `RunType`  | `Job` (`'job'`) — a one-time run; `Server` (`'server'`) — it handles incoming requests        |

### Gotchas

- **Call `runType()` and `serverInfo()` after the server listens.** Their first call is kept, so a call made during
  startup keeps `Job`, and no `host` or `port`, for the whole run.
- **`level()` is set by the package manager's script name.** A process started from inside a package script inherits it,
  so it reports `Package` too. `npx` is counted as `Direct`.
- **`packageCommand()` with `npx`** returns `<package manager> run npx`, since `npx` sets the script name to `npx`. It's
  left as is because `npx` rarely runs a script.
- **`runner()` finds `tsx` and `ts-node` by name** in Node's own flags, so a preloaded file whose path contains `tsx` or
  `ts-node` is reported as that runner.
- **`serverInfo()` reads Node's undocumented `process._getActiveHandles()`**, as Node has no public way to reach its
  servers. A cluster worker or a Unix socket server isn't found, and only the first server is reported.
- **`runType()` relies on `process.getActiveResourcesInfo()`** — the same cluster worker and Unix socket limits apply.
- **Not runnable by plain `node` on the `.ts` source** — the enums need a TypeScript transform, such as `tsx`, or
  `node --experimental-transform-types`.

---

## Exports (`index.ts`)

| Export                | Source                         | Description                                                                    |
| --------------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| `parseCommand`        | `parseCommand/parseCommand.ts` | `<const T extends CmdParams>(params: T) => CmdParseResult<T>` (default export) |
| `manualLog`           | `manualLog/manualLog.ts`       | `(definition: CmdManualDefinition) => { manual, description, usages, … }`      |
| `CmdParams`           | `types/parseCommandTypes.ts`   | Type: `{ options?, args?, argsStart?, manual? }`                               |
| `CmdOptionDef`        | `types/parseCommandTypes.ts`   | Type: the full definition of one option                                        |
| `CmdDefParseOptions`  | `types/parseCommandTypes.ts`   | Type: Node's `ParseArgsOptionDescriptor`, with the argument positions added    |
| `CmdParseResult`      | `types/parseCommandTypes.ts`   | Type: `{ options, positionals, args? }`, typed from the `CmdParams` given      |
| `CmdManualDefinition` | `types/manualLogTypes.ts`      | Type: the full definition of a command's manual                                |
| `CmdManualUsage`      | `types/manualLogTypes.ts`      | Type: `{ label, usage }`                                                       |
| `CmdManualExample`    | `types/manualLogTypes.ts`      | Type: `{ label, example }`                                                     |
| `CmdManualBlockDef`   | `types/manualLogTypes.ts`      | Type: `{ label, content }`                                                     |

`envMeta` isn't re-exported here yet — import it from `envMeta/envMeta.ts`, and its enums from `envMeta/constants.ts`.

---

## Folder Structure

- `index.ts` — public entry point, re-exports `parseCommand`, `manualLog` and their types.
- `types/parseCommandTypes.ts` — Parse Command types: the params, the option and argument definitions, and the result.
- `types/manualLogTypes.ts` — Manual Log types: the manual definition, its sections, layouts and settings.
- `configs/manualLogConfig.ts` — the manual's spacing, styles, layouts and section order.
- `parseCommand/` — the Parse Command component: slices `process.argv`, prints the manual on `--help`, runs `parseArgs`,
  and maps the positionals to the declared arguments.
- `manualLog/` — the Manual Log component: the whole manual, a method per section, and the printing of each layout.
- `envMeta/` — the Env Meta component: the run's level, runner, package manager, commands and run type, the runtime and
  server info, the cache every meta is kept in, and the `RunLevel` and `RunType` enums.
- `common/` — general-purpose helpers not tied to this util, such as a getter that creates its value on the first call.
