---
name: shellStyle
description:
  Terminal text styling via ANSI escape codes — semantic style presets plus a low-level
  color/decoration/background/reset code composer.
labels: ['shell', 'ansi', 'terminal', 'style']
version: 1.0.0
updated: 2026-08-26
---

# Shell Style

## Overview

`shellStyle` wraps plain text in ANSI SGR escape codes for terminal output. It's a `shell*`-prefixed util, so it only
works in a real terminal/shell context — not portable to a browser or other JS environment.

It exposes two independent ways to style text:

- `style` — a precomputed set of **semantic** style functions (`info`, `error`, `heading`, ...).
- `styleCode` — a **raw** ANSI code composer, for building a custom SGR code from color/background/ decoration/reset
  names directly.

---

## Usage

```ts
import { style, styleCode } from '@/utils/shellStyle';

// Semantic presets — each returns text wrapped in its ANSI codes
console.log(style.info('Info message'));
console.log(style.error('Something failed'));
console.log(style.heading('Section Heading'));

// Raw code composition — joins multiple names into one SGR code string
const code = styleCode('bold', 'underline', 'cyan'); // '1;4;36'
console.log(`\u001B[${code}m` + 'custom styled text' + '\u001B[0m');
```

---

## Exports (`index.ts`)

| Export      | Source                     | Description                                                        |
| ----------- | -------------------------- | ------------------------------------------------------------------ |
| `style`     | `styleText/simpleStyle.ts` | `Record<ShellStyleName, ShellStyleFunc>` of semantic style presets |
| `styleCode` | `styleText/styleCode.ts`   | `(...names: ShellStyleName[]) => string` raw SGR code composer     |

## Folder structure

- `index.ts` — public entry point, re-exports `style` and `styleCode`.
- `configs/styleConfig.ts` — semantic style name → `[open, close]` ANSI code pairs.
- `constants/shellStyleCodes.ts` — raw ANSI SGR code enums: `ShellColor`, `ShellBackground`, `ShellDecoration`,
  `ShellReset`.
- `types/styleTypes.ts` — shared types: `ShellStyleFunc`, `ShellTextStyle`.
- `styleText/simpleStyle.ts` — builds the precomputed `style` functions from `styleConfig`.
- `styleText/styleCode.ts` — builds `STYLE_CODE_MAP` from the enums and exposes `styleCode`.
